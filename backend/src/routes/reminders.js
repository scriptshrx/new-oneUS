const { Router } = require('express');
const { authMiddleware } = require('../middleware/auth');
const {
  createRemindersForAppointment,
  getRemindersByPatient,
  getRemindersByAppointment,
  cancelReminder,
} = require('../services/reminderService');

const router = Router();

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { patientId, appointmentId, types } = req.body;

    if (!patientId || !appointmentId || !Array.isArray(types) || types.length === 0) {
      return res.status(400).json({ error: 'patientId, appointmentId, and types[] are required' });
    }

    const reminders = await createRemindersForAppointment(patientId, appointmentId, types);

    return res.status(201).json({
      success: true,
      message: 'Reminders scheduled successfully',
      data: reminders,
    });
  } catch (err) {
    console.error('Error creating reminders:', err);
    return res.status(400).json({ error: err.message });
  }
});

router.get('/patient/:patientId', authMiddleware, async (req, res) => {
  try {
    const { patientId } = req.params;
    const reminders = await getRemindersByPatient(patientId);

    return res.json({ success: true, data: reminders });
  } catch (err) {
    console.error('Error fetching patient reminders:', err);
    return res.status(500).json({ error: err.message });
  }
});

router.get('/appointment/:appointmentId', authMiddleware, async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const reminders = await getRemindersByAppointment(appointmentId);

    return res.json({ success: true, data: reminders });
  } catch (err) {
    console.error('Error fetching appointment reminders:', err);
    return res.status(500).json({ error: err.message });
  }
});

router.delete('/:reminderId', authMiddleware, async (req, res) => {
  try {
    const { reminderId } = req.params;
    const reminder = await cancelReminder(reminderId);

    return res.json({
      success: true,
      message: 'Reminder cancelled',
      data: reminder,
    });
  } catch (err) {
    console.error('Error cancelling reminder:', err);
    return res.status(400).json({ error: err.message });
  }
});

module.exports = router;
