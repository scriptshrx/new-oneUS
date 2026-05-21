const prisma = require('../db/client');
const { sendSMS } = require('../utils/sms');
const { getTimezoneForState } = require('../utils/timezone');

const REMINDER_OFFSETS = {
  BEFORE_INFUSION_72H: { hours: -72, fromEnd: false },
  BEFORE_INFUSION_24H: { hours: -24, fromEnd: false },
  AFTER_TREATMENT_2H: { hours: 2, fromEnd: true },
};

const formatAppointmentDateTime = (utcDate, timezone) => {
  const date = new Date(utcDate);
  const dateStr = date.toLocaleDateString('en-US', {
    timeZone: timezone,
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const timeStr = date.toLocaleTimeString('en-US', {
    timeZone: timezone,
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
  return { dateStr, timeStr };
};

const computeScheduledFor = (type, appointment) => {
  const config = REMINDER_OFFSETS[type];
  const base = config.fromEnd
    ? (appointment.scheduledEndTime || new Date(appointment.scheduledStartTime.getTime() + 60 * 60 * 1000))
    : appointment.scheduledStartTime;
  return new Date(base.getTime() + config.hours * 60 * 60 * 1000);
};

const buildReminderMessage = (reminder, patient, appointment) => {
  const clinicName = appointment.clinic?.name || 'your clinic';
  let timezone = 'America/New_York';
  try {
    if (appointment.clinic?.state) {
      timezone = getTimezoneForState(appointment.clinic.state);
    }
  } catch {
    // fallback to Eastern if state unmapped
  }
  const { dateStr, timeStr } = formatAppointmentDateTime(
    appointment.scheduledStartTime,
    timezone
  );

  switch (reminder.type) {
    case 'BEFORE_INFUSION_72H':
      return `Hi ${patient.firstName}, this is ${clinicName}. Reminder: your infusion is scheduled for ${dateStr} at ${timeStr}.`;
    case 'BEFORE_INFUSION_24H':
      return `Hi ${patient.firstName}, this is ${clinicName}. Your infusion is tomorrow (${dateStr}) at ${timeStr}. Please arrive on time.`;
    case 'AFTER_TREATMENT_2H':
      return `Hi ${patient.firstName}, this is ${clinicName}. We hope your infusion on ${dateStr} went well. Please reach out if you have any questions after your treatment.`;
    default:
      return `Hi ${patient.firstName}, this is ${clinicName}. Reminder: your infusion is scheduled for ${dateStr} at ${timeStr}.`;
  }
};

const createRemindersForAppointment = async (patientId, appointmentId, types = []) => {
  if (!types.length) return [];

  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: { clinic: { select: { name: true, state: true } } },
  });

  if (!appointment || appointment.patientId !== patientId) {
    throw new Error('Appointment not found for this patient');
  }

  if (['CANCELLED'].includes(appointment.status)) {
    throw new Error('Cannot schedule reminders for a cancelled appointment');
  }

  const created = [];
  const skipped = [];
  const now = new Date();

  for (const type of types) {
    if (!REMINDER_OFFSETS[type]) continue;

    const scheduledFor = computeScheduledFor(type, appointment);

    // Don't schedule reminders whose send time has already passed
    // (e.g. 72h reminder for an appointment booked less than 72 hours out)
    if (scheduledFor <= now) {
      skipped.push({ type, reason: 'send_time_already_passed', scheduledFor });
      continue;
    }

    const reminder = await prisma.reminder.upsert({
      where: {
        appointmentId_type: { appointmentId, type },
      },
      create: {
        patientId,
        appointmentId,
        type,
        scheduledFor,
        status: 'PENDING',
      },
      update: {
        scheduledFor,
        status: 'PENDING',
        sentAt: null,
      },
    });

    created.push(reminder);
  }

  return { created, skipped };
};

const getRemindersByPatient = async (patientId) => {
  return prisma.reminder.findMany({
    where: { patientId },
    include: {
      appointment: {
        select: {
          id: true,
          scheduledStartTime: true,
          scheduledEndTime: true,
          status: true,
        },
      },
    },
    orderBy: { scheduledFor: 'asc' },
  });
};

const getRemindersByAppointment = async (appointmentId) => {
  return prisma.reminder.findMany({
    where: { appointmentId },
    orderBy: { scheduledFor: 'asc' },
  });
};

const cancelReminder = async (reminderId) => {
  return prisma.reminder.update({
    where: { id: reminderId },
    data: { status: 'CANCELLED' },
  });
};

const processDueReminders = async () => {
  const now = new Date();

  const dueReminders = await prisma.reminder.findMany({
    where: {
      status: 'PENDING',
      scheduledFor: { lte: now },
      appointment: {
        status: { notIn: ['CANCELLED'] },
      },
    },
    include: {
      patient: true,
      appointment: {
        include: { clinic: { select: { name: true, state: true } } },
      },
    },
    take: 100,
  });

  const results = { processed: 0, sent: 0, failed: 0 };

  for (const reminder of dueReminders) {
    results.processed += 1;

    try {
      const message = buildReminderMessage(reminder, reminder.patient, reminder.appointment);
      await sendSMS(reminder.patient.phoneNumber, message);

      await prisma.reminder.update({
        where: { id: reminder.id },
        data: { status: 'SENT', sentAt: new Date() },
      });

      results.sent += 1;
    } catch (err) {
      console.error(`Failed to send reminder ${reminder.id}:`, err.message);
      results.failed += 1;
    }
  }

  if (results.processed > 0) {
    console.log(`Reminder job: processed=${results.processed} sent=${results.sent} failed=${results.failed}`);
  }

  return results;
};

module.exports = {
  createRemindersForAppointment,
  getRemindersByPatient,
  getRemindersByAppointment,
  cancelReminder,
  processDueReminders,
  REMINDER_OFFSETS,
};
