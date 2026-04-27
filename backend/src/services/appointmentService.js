const prisma = require('../db/client');

const createAppointment = async (appointmentData) => {
  const {
    patientId,
    clinicId,
    chairId,
    appointmentType = 'IN_CLINIC',
    scheduledDate,
    scheduledStartTime,
    scheduledEndTime,
    treatmentType,
    drug = null,
    dose = null,
  } = appointmentData;

  // Validate required fields
  if (!patientId || !clinicId || !scheduledDate || !scheduledStartTime) {
    throw new Error('Missing required appointment fields: patientId, clinicId, scheduledDate, scheduledStartTime');
  }

  // Validate that patient exists and belongs to clinic
  const patient = await prisma.patient.findUnique({
    where: { id: patientId },
  });

  if (!patient || patient.clinicId !== clinicId) {
    throw new Error('Patient not found or does not belong to this clinic');
  }

  // Validate chair belongs to clinic (if provided)
  if (chairId) {
    const chair = await prisma.infusionChair.findUnique({
      where: { id: chairId },
    });

    if (!chair || chair.clinicId !== clinicId) {
      throw new Error('Chair not found or does not belong to this clinic');
    }

    // Validate chair is not already booked at this time
    const conflictingAppointment = await prisma.appointment.findFirst({
      where: {
        clinicId,
        assignedChair: chairId,
        status: {
          not: 'CANCELLED',
        },
        AND: [
          {
            scheduledStartTime: {
              lt: new Date(scheduledEndTime || new Date(new Date(scheduledStartTime).getTime() + 60 * 60000)),
            },
          },
          {
            scheduledEndTime: {
              gt: new Date(scheduledStartTime),
            },
          },
        ],
      },
    });

    if (conflictingAppointment) {
      throw new Error('This chair is already booked for the requested time');
    }
  }

  // Create appointment
  const appointment = await prisma.appointment.create({
    data: {
      patientId,
      clinicId,
      appointmentType,
      scheduledDate: new Date(scheduledDate),
      scheduledStartTime: new Date(scheduledStartTime),
      scheduledEndTime: scheduledEndTime ? new Date(scheduledEndTime) : null,
      treatmentType,
      drug,
      dose,
      assignedChair: chairId || null,
      status: 'SCHEDULED',
    },
    include: {
      patient: true,
      clinic: true,
    },
  });

  return appointment;
};

const getAppointment = async (appointmentId) => {
  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: {
      patient: true,
      clinic: true,
      assignedNurse: true,
    },
  });

  if (!appointment) {
    throw new Error('Appointment not found');
  }

  return appointment;
};

const getAppointmentsByPatient = async (patientId) => {
  const appointments = await prisma.appointment.findMany({
    where: { patientId },
    include: {
      patient: true,
      clinic: true,
      assignedNurse: true,
    },
    orderBy: { scheduledDate: 'desc' },
  });

  return appointments;
};

const getAppointmentsByClinic = async (clinicId, filters = {}) => {
  const where = { clinicId };

  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.startDate || filters.endDate) {
    where.scheduledDate = {};
    if (filters.startDate) {
      where.scheduledDate.gte = new Date(filters.startDate);
    }
    if (filters.endDate) {
      where.scheduledDate.lte = new Date(filters.endDate);
    }
  }

  const appointments = await prisma.appointment.findMany({
    where,
    include: {
      patient: true,
      assignedNurse: true,
    },
    orderBy: { scheduledDate: 'asc' },
  });

  return appointments;
};

const updateAppointment = async (appointmentId, updateData) => {
  const {
    status,
    assignedNurseId,
    scheduledDate,
    scheduledStartTime,
    scheduledEndTime,
    assignedChair,
    homeAddress,
  } = updateData;

  // Fetch existing appointment
  const existingAppointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
  });

  if (!existingAppointment) {
    throw new Error('Appointment not found');
  }

  // If updating chair or time, validate no conflicts
  if (assignedChair || scheduledStartTime) {
    const chairToCheck = assignedChair || existingAppointment.assignedChair;
    const startTime = scheduledStartTime ? new Date(scheduledStartTime) : existingAppointment.scheduledStartTime;
    const endTime = scheduledEndTime ? new Date(scheduledEndTime) : existingAppointment.scheduledEndTime;

    if (chairToCheck) {
      const conflictingAppointment = await prisma.appointment.findFirst({
        where: {
          id: {
            not: appointmentId, // Exclude current appointment
          },
          clinicId: existingAppointment.clinicId,
          assignedChair: chairToCheck,
          status: {
            not: 'CANCELLED',
          },
          AND: [
            {
              scheduledStartTime: {
                lt: endTime,
              },
            },
            {
              scheduledEndTime: {
                gt: startTime,
              },
            },
          ],
        },
      });

      if (conflictingAppointment) {
        throw new Error('This chair is already booked for the requested time');
      }
    }
  }

  // Build update payload
  const updatePayload = {};

  if (status) updatePayload.status = status;
  if (assignedNurseId) updatePayload.assignedNurseId = assignedNurseId;
  if (scheduledDate) updatePayload.scheduledDate = new Date(scheduledDate);
  if (scheduledStartTime) updatePayload.scheduledStartTime = new Date(scheduledStartTime);
  if (scheduledEndTime) updatePayload.scheduledEndTime = new Date(scheduledEndTime);
  if (assignedChair !== undefined) updatePayload.assignedChair = assignedChair;
  if (homeAddress) updatePayload.homeAddress = homeAddress;

  const appointment = await prisma.appointment.update({
    where: { id: appointmentId },
    data: updatePayload,
    include: {
      patient: true,
      clinic: true,
      assignedNurse: true,
    },
  });

  return appointment;
};

const cancelAppointment = async (appointmentId) => {
  const appointment = await prisma.appointment.update({
    where: { id: appointmentId },
    data: { status: 'CANCELLED' },
    include: {
      patient: true,
      clinic: true,
    },
  });

  return appointment;
};

const getAvailableTimeSlots = async (clinicId, date, durationMinutes = 60, chairId = null) => {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  // Get appointments for the clinic on that day
  // If chairId is provided, only get appointments for that specific chair
  const where = {
    clinicId,
    scheduledDate: {
      gte: startOfDay,
      lte: endOfDay,
    },
    status: {
      not: 'CANCELLED',
    },
  };

  // Only filter by chair if chairId is provided
  if (chairId) {
    where.assignedChair = chairId;
  }

  const appointments = await prisma.appointment.findMany({
    where,
    select: {
      scheduledStartTime: true,
      scheduledEndTime: true,
      assignedChair: true,
    },
  });

  // Default clinic hours: 8 AM to 5 PM
  const clinicOpenTime = 8;
  const clinicCloseTime = 17;
  const slotDuration = durationMinutes;

  const slots = [];
  
  // Build booked times - if chairId is specified, only track that chair's bookings
  // If no chairId, we still need to know which times are booked but allow same times on different chairs
  const bookedTimes = appointments.map(apt => ({
    start: new Date(apt.scheduledStartTime),
    end: apt.scheduledEndTime ? new Date(apt.scheduledEndTime) : null,
    chair: apt.assignedChair,
  }));

  for (let hour = clinicOpenTime; hour < clinicCloseTime; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const slotStart = new Date(date);
      slotStart.setHours(hour, minute, 0, 0);
      const slotEnd = new Date(slotStart);
      slotEnd.setMinutes(slotStart.getMinutes() + slotDuration);

      // Check if slot is within clinic hours
      if (slotEnd.getHours() > clinicCloseTime) {
        continue;
      }

      // Check if slot conflicts with existing appointments in the same chair
      let isAvailable = true;
      for (const bookedSlot of bookedTimes) {
        if (slotStart < bookedSlot.end && slotEnd > bookedSlot.start) {
          // Only block if no chairId specified (general availability check)
          // or if checking for a specific chair and it's the same chair
          if (!chairId || bookedSlot.chair === chairId) {
            isAvailable = false;
            break;
          }
        }
      }

      if (isAvailable) {
        slots.push({
          startTime: slotStart.toISOString(),
          endTime: slotEnd.toISOString(),
          display: `${slotStart.getHours().toString().padStart(2, '0')}:${slotStart.getMinutes().toString().padStart(2, '0')}`,
        });
      }
    }
  }

  return slots;
};

module.exports = {
  createAppointment,
  getAppointment,
  getAppointmentsByPatient,
  getAppointmentsByClinic,
  updateAppointment,
  cancelAppointment,
  getAvailableTimeSlots,
};
