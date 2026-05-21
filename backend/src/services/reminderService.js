const prisma = require('../db/client');
const { sendSMS } = require('../utils/sms');
const dayjs = require('dayjs');

const REMINDER_OFFSETS = {
  BEFORE_INFUSION_72H: { hours: -72, label: '72 hours before your infusion' },
  BEFORE_INFUSION_24H: { hours: -24, label: '24 hours before your infusion' },
  AFTER_TREATMENT_2H: { hours: 2, label: '2 hours after your treatment', fromEnd: true },
};

const computeScheduledFor = (type, appointment) => {
  const config = REMINDER_OFFSETS[type];
  const base = config.fromEnd
    ? (appointment.scheduledEndTime || new Date(appointment.scheduledStartTime.getTime() + 60 * 60 * 1000))
    : appointment.scheduledStartTime;
  return new Date(base.getTime() + config.hours * 60 * 60 * 1000);
};

const buildReminderMessage = (reminder, patient, appointment) => {
  const config = REMINDER_OFFSETS[reminder.type];
  const start = appointment.scheduledStartTime;
  const dateStr = dayjs(start).format('MMM D, YYYY');
  const timeStr = dayjs(start).format('h:mm A');
  const clinicName = appointment.clinic?.name || 'your clinic';

  if (reminder.type === 'AFTER_TREATMENT_2H') {
    return `Hi ${patient.firstName}, this is ${clinicName}. We hope your infusion on ${dateStr} went well. Please reach out if you have any questions or concerns after your treatment.`;
  }

  return `Hi ${patient.firstName}, this is ${clinicName}. Reminder: your infusion is scheduled for ${dateStr} at ${timeStr} (${config.label}). Reply STOP to opt out.`;
};

const createRemindersForAppointment = async (patientId, appointmentId, types = []) => {
  if (!types.length) return [];

  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: { clinic: { select: { name: true } } },
  });

  if (!appointment || appointment.patientId !== patientId) {
    throw new Error('Appointment not found for this patient');
  }

  if (['CANCELLED'].includes(appointment.status)) {
    throw new Error('Cannot schedule reminders for a cancelled appointment');
  }

  const created = [];

  for (const type of types) {
    if (!REMINDER_OFFSETS[type]) continue;

    const scheduledFor = computeScheduledFor(type, appointment);

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

  return created;
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
        include: { clinic: { select: { name: true } } },
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
