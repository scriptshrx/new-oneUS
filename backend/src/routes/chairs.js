const express = require('express');
const router = express.Router();
const ChairService = require('../services/chairService');
const { authenticateToken } = require('../middleware/auth');

// Middleware to verify clinic ownership
const verifyClinicOwnership = async (req, res, next) => {
  try {
    const clinicId = req.params.clinicId;
    const userId = req.user.id;

    // Verify the user belongs to the clinic
    // This would need to be implemented based on your User/Clinic relationship
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Unauthorized' });
  }
};

// Get all infusion chairs for a clinic
router.get('/chairs/:clinicId', authenticateToken, verifyClinicOwnership, async (req, res) => {
  try {
    const { clinicId } = req.params;

    const chairs = await ChairService.getChairsByClinic(clinicId);

    res.json({
      success: true,
      data: chairs,
    });
  } catch (error) {
    console.error('Error fetching chairs:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Get infusion chairs with patients
router.get('/chairs/:clinicId/with-patients', authenticateToken, verifyClinicOwnership, async (req, res) => {
  try {
    const { clinicId } = req.params;

    const chairs = await ChairService.getChairsWithPatients(clinicId);

    res.json({
      success: true,
      data: chairs,
    });
  } catch (error) {
    console.error('Error fetching chairs with patients:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Get a single infusion chair
router.get('/chair/:chairId', authenticateToken, async (req, res) => {
  try {
    const { chairId } = req.params;

    const chair = await ChairService.getChairById(chairId);

    res.json({
      success: true,
      data: chair,
    });
  } catch (error) {
    console.error('Error fetching chair:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Create a new infusion chair
router.post('/chairs/:clinicId', authenticateToken, verifyClinicOwnership, async (req, res) => {
  try {
    const { clinicId } = req.params;
    const chairData = req.body;

    const chair = await ChairService.createChair(clinicId, chairData);

    res.status(201).json({
      success: true,
      data: chair,
      message: 'Infusion chair created successfully',
    });
  } catch (error) {
    console.error('Error creating chair:', error);
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

// Update an infusion chair
router.put('/chair/:chairId', authenticateToken, async (req, res) => {
  try {
    const { chairId } = req.params;
    const updateData = req.body;

    const chair = await ChairService.updateChair(chairId, updateData);

    res.json({
      success: true,
      data: chair,
      message: 'Infusion chair updated successfully',
    });
  } catch (error) {
    console.error('Error updating chair:', error);
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

// Delete an infusion chair (hard delete)
router.delete('/chair/:chairId', authenticateToken, async (req, res) => {
  try {
    const { chairId } = req.params;

    const chair = await ChairService.deleteChair(chairId);

    res.json({
      success: true,
      data: chair,
      message: 'Infusion chair deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting chair:', error);
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

// Archive an infusion chair (soft delete)
router.patch('/chair/:chairId/archive', authenticateToken, async (req, res) => {
  try {
    const { chairId } = req.params;

    const chair = await ChairService.archiveChair(chairId);

    res.json({
      success: true,
      data: chair,
      message: 'Infusion chair archived successfully',
    });
  } catch (error) {
    console.error('Error archiving chair:', error);
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

module.exports = router;
