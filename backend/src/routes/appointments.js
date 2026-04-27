const { Router } = require('express');
const { authMiddleware } = require('../middleware/auth');
const {
  createAppointment,
  getAppointment,
  getAppointmentsByPatient,
  getAppointmentsByClinic,
  updateAppointment,
  cancelAppointment,
  getAvailableTimeSlots,
} = require('../services/appointmentService');

const router = Router();

// Get available time slots for a date (must be before :appointmentId route)
router.get('/availability/:clinicId/:date', authMiddleware, async (req, res) => {
  try {
    const { clinicId, date } = req.params;
    const { durationMinutes = 60 } = req.query;

    const slots = await getAvailableTimeSlots(clinicId, new Date(date), parseInt(durationMinutes));

    return res.json({
      success: true,
      data: slots,
    });
  } catch (err) {
    console.error('Error fetching available slots:', err);
    return res.status(500).json({ error: err.message });
  }
});

// Create appointment
router.post('/', authMiddleware, async (req, res) => {
  try {
    const {
      patientId,
      clinicId,
      chairId,
      appointmentType,
      scheduledDate,
      scheduledStartTime,
      scheduledEndTime,
      treatmentType,
      drug,
      dose,
    } = req.body;

    const appointment = await createAppointment({
      patientId,
      clinicId,
      chairId,
      appointmentType,
      scheduledDate,
      scheduledStartTime,
      scheduledEndTime,
      treatmentType,
      drug,
      dose,
    });

    return res.status(201).json({
      success: true,
      message: 'Appointment created successfully',
      data: appointment,
    });
  } catch (err) {
    console.error('Error creating appointment:', err);
    return res.status(400).json({ error: err.message });
  }
});

// Get appointment by ID
router.get('/:appointmentId', authMiddleware, async (req, res) => {
  try {
    const { appointmentId } = req.params;

    const appointment = await getAppointment(appointmentId);

    return res.json({
      success: true,
      data: appointment,
    });
  } catch (err) {
    console.error('Error fetching appointment:', err);
    return res.status(404).json({ error: err.message });
  }
});

// Get appointments by patient
router.get('/patient/:patientId', authMiddleware, async (req, res) => {
  try {
    const { patientId } = req.params;

    const appointments = await getAppointmentsByPatient(patientId);

    return res.json({
      success: true,
      data: appointments,
    });
  } catch (err) {
    console.error('Error fetching patient appointments:', err);
    return res.status(500).json({ error: err.message });
  }
});

// Get appointments by clinic
router.get('/clinic/:clinicId', authMiddleware, async (req, res) => {
  try {
    const { clinicId } = req.params;
    const { status, startDate, endDate } = req.query;

    const appointments = await getAppointmentsByClinic(clinicId, {
      status,
      startDate,
      endDate,
    });

    return res.json({
      success: true,
      data: appointments,
    });
  } catch (err) {
    console.error('Error fetching clinic appointments:', err);
    return res.status(500).json({ error: err.message });
  }
});

// Update appointment
router.patch('/:appointmentId', authMiddleware, async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { status, assignedNurseId, scheduledStartTime, scheduledEndTime, homeAddress } = req.body;

    const appointment = await updateAppointment(appointmentId, {
      status,
      assignedNurseId,
      scheduledStartTime,
      scheduledEndTime,
      homeAddress,
    });

    return res.json({
      success: true,
      message: 'Appointment updated successfully',
      data: appointment,
    });
  } catch (err) {
    console.error('Error updating appointment:', err);
    return res.status(400).json({ error: err.message });
  }
});

// Cancel appointment
router.delete('/:appointmentId', authMiddleware, async (req, res) => {
  try {
    const { appointmentId } = req.params;

    const appointment = await cancelAppointment(appointmentId);

    return res.json({
      success: true,
      message: 'Appointment cancelled successfully',
      data: appointment,
    });
  } catch (err) {
    console.error('Error cancelling appointment:', err);
    return res.status(400).json({ error: err.message });
  }
});

module.exports = router;
