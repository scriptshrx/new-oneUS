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
    scheduledStartTime,
    scheduledEndTime,
    homeAddress,
  } = updateData;

  const updatePayload = {};

  if (status) updatePayload.status = status;
  if (assignedNurseId) updatePayload.assignedNurseId = assignedNurseId;
  if (scheduledStartTime) updatePayload.scheduledStartTime = new Date(scheduledStartTime);
  if (scheduledEndTime) updatePayload.scheduledEndTime = new Date(scheduledEndTime);
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

const getAvailableTimeSlots = async (clinicId, date, durationMinutes = 60) => {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  // Get all appointments for the clinic on that day
  const appointments = await prisma.appointment.findMany({
    where: {
      clinicId,
      scheduledDate: {
        gte: startOfDay,
        lte: endOfDay,
      },
      status: {
        not: 'CANCELLED',
      },
    },
    select: {
      scheduledStartTime: true,
      scheduledEndTime: true,
    },
  });

  // Default clinic hours: 8 AM to 5 PM
  const clinicOpenTime = 8;
  const clinicCloseTime = 17;
  const slotDuration = durationMinutes;

  const slots = [];
  const bookedTimes = appointments.map(apt => ({
    start: new Date(apt.scheduledStartTime),
    end: apt.scheduledEndTime ? new Date(apt.scheduledEndTime) : null,
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

      // Check if slot conflicts with existing appointments
      let isAvailable = true;
      for (const bookedSlot of bookedTimes) {
        if (slotStart < bookedSlot.end && slotEnd > bookedSlot.start) {
          isAvailable = false;
          break;
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
