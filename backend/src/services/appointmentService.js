const prisma = require('../db/client');
const {
  getTimezoneForState,
  convertClinicTimeToUTC,
  convertUTCToClinicTime,
  getClinicHoursUTC,
  formatClinicLocalTime,
} = require('../utils/timezone');

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

  // Fetch clinic to get timezone information
  const clinic = await prisma.clinic.findUnique({
    where: { id: clinicId },
    select: { state: true },
  });

  if (!clinic) {
    throw new Error('Clinic not found');
  }

  const clinicTimezone = getTimezoneForState(clinic.state);

  // Validate that patient exists and belongs to clinic
  const patient = await prisma.patient.findUnique({
    where: { id: patientId },
  });

  if (!patient || patient.clinicId !== clinicId) {
    throw new Error('Patient not found or does not belong to this clinic');
  }

  // Convert local clinic times to UTC for storage
  const scheduledStartTimeUTC = convertClinicTimeToUTC(scheduledStartTime, clinicTimezone);
  
  // If scheduledEndTime not provided, calculate it as 1 hour after start time
  let scheduledEndTimeUTC;
  if (scheduledEndTime) {
    scheduledEndTimeUTC = convertClinicTimeToUTC(scheduledEndTime, clinicTimezone);
  } else {
    // Calculate end time as 1 hour after start in clinic local time
    const [datePart, timePart] = scheduledStartTime.split('T');
    const [hours, minutes, seconds = '00'] = timePart.split(':');
    const newHours = (parseInt(hours) + 1).toString().padStart(2, '0');
    const calculatedEndTime = `${datePart}T${newHours}:${minutes}:${seconds}`;
    scheduledEndTimeUTC = convertClinicTimeToUTC(calculatedEndTime, clinicTimezone);
  }

  // Validate chair belongs to clinic (if provided)
  let chair;
  if (chairId) {
    chair = await prisma.infusionChair.findUnique({
      where: {id: chairId },
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
              lt: scheduledEndTimeUTC || new Date(scheduledStartTimeUTC.getTime() + 60 * 60000),
            },
          },
          {
            scheduledEndTime: {
              gt: scheduledStartTimeUTC,
            },
          },
        ],
      },
    });

    if (conflictingAppointment) {
      throw new Error('This chair is already booked for the requested time');
    }
  }

  // Create appointment with UTC times
  const appointment = await prisma.appointment.create({
    data: {
      patientId,
      clinicId,
      appointmentType,
      scheduledDate: new Date(scheduledDate),
      scheduledStartTime: scheduledStartTimeUTC,
      scheduledEndTime: scheduledEndTimeUTC,
      treatmentType,
      drug,
      dose,
      assignedChair: chair.chairNumber || null,
      status: 'SCHEDULED',
    },
    include: {
      patient: true,
      clinic: true,
    },
  });

  // Convert returned times back to clinic timezone for display
  return {
    ...appointment,
    scheduledStartTime: convertUTCToClinicTime(appointment.scheduledStartTime, clinicTimezone),
    scheduledEndTime: appointment.scheduledEndTime
      ? convertUTCToClinicTime(appointment.scheduledEndTime, clinicTimezone)
      : null,
  };
};

const getAppointment = async (appointmentId) => {
  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: {
      patient: true,
      clinic: { select: { state: true } },
      assignedNurse: true,
    },
  });

  if (!appointment) {
    throw new Error('Appointment not found');
  }

  const clinicTimezone = getTimezoneForState(appointment.clinic.state);

  // Convert times back to clinic timezone for display
  return {
    ...appointment,
    scheduledStartTime: convertUTCToClinicTime(appointment.scheduledStartTime, clinicTimezone),
    scheduledEndTime: appointment.scheduledEndTime
      ? convertUTCToClinicTime(appointment.scheduledEndTime, clinicTimezone)
      : null,
  };
};

const getAppointmentsByPatient = async (patientId) => {
  const appointments = await prisma.appointment.findMany({
    where: { patientId },
    include: {
      patient: true,
      clinic: { select: { state: true } },
      assignedNurse: true,
    },
    orderBy: { scheduledStartTime: 'desc' },
  });

  // Convert times back to clinic timezone for display
  return appointments.map(apt => {
    const clinicTimezone = getTimezoneForState(apt.clinic.state);
    return {
      ...apt,
      scheduledStartTime: convertUTCToClinicTime(apt.scheduledStartTime, clinicTimezone),
      scheduledEndTime: apt.scheduledEndTime
        ? convertUTCToClinicTime(apt.scheduledEndTime, clinicTimezone)
        : null,
    };
  });
};

const getAppointmentsByClinic = async (clinicId, filters = {}) => {
  // Fetch clinic for timezone info
  const clinic = await prisma.clinic.findUnique({
    where: { id: clinicId },
    select: { state: true },
  });

  if (!clinic) {
    throw new Error('Clinic not found');
  }

  const clinicTimezone = getTimezoneForState(clinic.state);
  const where = { clinicId };

  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.startDate || filters.endDate) {
    where.scheduledStartTime = {};
    if (filters.startDate) {
      // Convert clinic timezone date to UTC for query
      const startDateUTC = convertClinicTimeToUTC(new Date(filters.startDate), clinicTimezone);
      where.scheduledStartTime.gte = startDateUTC;
    }
    if (filters.endDate) {
      // Convert clinic timezone date to UTC for query
      const endDateUTC = convertClinicTimeToUTC(new Date(filters.endDate), clinicTimezone);
      where.scheduledStartTime.lte = endDateUTC;
    }
  }

  const appointments = await prisma.appointment.findMany({
    where,
    include: {
      patient: true,
      assignedNurse: true,
    },
    orderBy: { scheduledStartTime: 'asc' },
  });

  // Convert times back to clinic timezone for display
  return appointments.map(apt => ({
    ...apt,
    scheduledStartTime: convertUTCToClinicTime(apt.scheduledStartTime, clinicTimezone),
    scheduledEndTime: apt.scheduledEndTime
      ? convertUTCToClinicTime(apt.scheduledEndTime, clinicTimezone)
      : null,
  }));
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

  // Fetch existing appointment with clinic info
  const existingAppointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: { clinic: { select: { state: true } } },
  });

  if (!existingAppointment) {
    throw new Error('Appointment not found');
  }

  const clinicTimezone = getTimezoneForState(existingAppointment.clinic.state);

  // If updating chair or time, validate no conflicts
  if (assignedChair || scheduledStartTime) {
    const chairToCheck = assignedChair || existingAppointment.assignedChair;
    const startTime = scheduledStartTime
      ? convertClinicTimeToUTC(scheduledStartTime, clinicTimezone)
      : existingAppointment.scheduledStartTime;
    const endTime = scheduledEndTime
      ? convertClinicTimeToUTC(scheduledEndTime, clinicTimezone)
      : existingAppointment.scheduledEndTime;

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

  // Build update payload with UTC times
  const updatePayload = {};

  if (status) updatePayload.status = status;
  if (assignedNurseId) updatePayload.assignedNurseId = assignedNurseId;
  if (scheduledDate) updatePayload.scheduledDate = new Date(scheduledDate);
  if (scheduledStartTime) updatePayload.scheduledStartTime = convertClinicTimeToUTC(scheduledStartTime, clinicTimezone);
  if (scheduledEndTime) {
    updatePayload.scheduledEndTime = convertClinicTimeToUTC(scheduledEndTime, clinicTimezone);
  } else if (scheduledStartTime) {
    // If updating start time but no end time provided, calculate end as 1 hour after start
    const [datePart, timePart] = scheduledStartTime.split('T');
    const [hours, minutes, seconds = '00'] = timePart.split(':');
    const newHours = (parseInt(hours) + 1).toString().padStart(2, '0');
    const calculatedEndTime = `${datePart}T${newHours}:${minutes}:${seconds}`;
    updatePayload.scheduledEndTime = convertClinicTimeToUTC(calculatedEndTime, clinicTimezone);
  }
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

  // Convert times back to clinic timezone for display
  return {
    ...appointment,
    scheduledStartTime: convertUTCToClinicTime(appointment.scheduledStartTime, clinicTimezone),
    scheduledEndTime: appointment.scheduledEndTime
      ? convertUTCToClinicTime(appointment.scheduledEndTime, clinicTimezone)
      : null,
  };
};

const cancelAppointment = async (appointmentId) => {
  const appointment = await prisma.appointment.update({
    where: { id: appointmentId },
    data: { status: 'CANCELLED' },
    include: {
      patient: true,
      clinic: { select: { state: true } },
    },
  });

  const clinicTimezone = getTimezoneForState(appointment.clinic.state);

  // Convert times back to clinic timezone for display
  return {
    ...appointment,
    scheduledStartTime: convertUTCToClinicTime(appointment.scheduledStartTime, clinicTimezone),
    scheduledEndTime: appointment.scheduledEndTime
      ? convertUTCToClinicTime(appointment.scheduledEndTime, clinicTimezone)
      : null,
  };
};

const parseClinicTimeHHMM = (timeStr, fallbackHour, fallbackMinute = 0) => {
  if (!timeStr || typeof timeStr !== 'string') {
    return { hour: fallbackHour, minute: fallbackMinute };
  }
  const [hourPart, minutePart] = timeStr.split(':');
  const hour = parseInt(hourPart, 10);
  const minute = parseInt(minutePart, 10);
  return {
    hour: Number.isFinite(hour) ? hour : fallbackHour,
    minute: Number.isFinite(minute) ? minute : fallbackMinute,
  };
};

const getAvailableTimeSlots = async (
  clinicId,
  date,
  durationMinutes = 60,
  chairId = null,
  openTime = '08:00',
  closeTime = '20:30',
) => {
  // Fetch clinic to get timezone
  const clinic = await prisma.clinic.findUnique({
    where: { id: clinicId },
    select: { state: true },
  });

  if (!clinic) {
    throw new Error('Clinic not found');
  }

  const clinicTimezone = getTimezoneForState(clinic.state);

  const { hour: clinicOpenTime, minute: clinicOpenMinute } = parseClinicTimeHHMM(openTime, 8, 0);
  const { hour: clinicCloseHour, minute: clinicCloseMinute } = parseClinicTimeHHMM(closeTime, 20, 30);

  // Get clinic hours in UTC
  const { startOfDay, endOfDay } = getClinicHoursUTC(
    date,
    clinicTimezone,
    clinicOpenTime,
    clinicCloseHour,
    clinicCloseMinute,
  );

  // Get appointments for the clinic on that day
  // If chairId is provided, only get appointments for that specific chair
  const where = {
    clinicId,
    scheduledStartTime: {
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

  const slotDuration = durationMinutes;
  const openMinutes = clinicOpenTime * 60 + clinicOpenMinute;
  const closeMinutes = clinicCloseHour * 60 + clinicCloseMinute;

  const slots = [];
  
  // Build booked times - if chairId is specified, only track that chair's bookings
  // If no chairId, we still need to know which times are booked but allow same times on different chairs
  const bookedTimes = appointments.map(apt => ({
    start: new Date(apt.scheduledStartTime),
    end: apt.scheduledEndTime ? new Date(apt.scheduledEndTime) : null,
    chair: apt.assignedChair,
  }));

  // Generate 30-minute start slots in clinic's local timezone (last slot may end at close time)
  for (let totalMinutes = openMinutes; totalMinutes < closeMinutes; totalMinutes += 30) {
      const hour = Math.floor(totalMinutes / 60);
      const minute = totalMinutes % 60;
      // Create slot time in clinic's local timezone
      const slotStartLocal = new Date(date);
      slotStartLocal.setHours(hour, minute, 0, 0);
      const slotEndLocal = new Date(slotStartLocal);
      slotEndLocal.setMinutes(slotStartLocal.getMinutes() + slotDuration);

      const slotEndTotalMinutes = totalMinutes + slotDuration;
      if (slotEndTotalMinutes > closeMinutes) {
        continue;
      }

      // Convert to UTC for conflict checking
      const slotStartUTC = convertClinicTimeToUTC(slotStartLocal, clinicTimezone);
      const slotEndUTC = convertClinicTimeToUTC(slotEndLocal, clinicTimezone);

      // Check if slot conflicts with existing appointments in the same chair
      let isAvailable = true;
      for (const bookedSlot of bookedTimes) {
        if (slotStartUTC < bookedSlot.end && slotEndUTC > bookedSlot.start) {
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
          startTime: slotStartUTC.toISOString(),
          endTime: slotEndUTC.toISOString(),
          display: `${slotStartLocal.getHours().toString().padStart(2, '0')}:${slotStartLocal.getMinutes().toString().padStart(2, '0')}`,
          clinicLocalTime: formatClinicLocalTime(slotStartLocal),  // Send as local time without UTC conversion
        });
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
