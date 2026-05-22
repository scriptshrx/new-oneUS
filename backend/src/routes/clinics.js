const { Router } = require('express');
const { authMiddleware } = require('../middleware/auth');
const prisma = require('../db/client');
const { NotFoundError, ValidationError } = require('../middleware/errorHandler');

const router = Router();

// GET /clinics - Fetch all clinics
router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const clinics = await prisma.clinic.findMany({
      select: {
        id: true,
        name: true,
        clinicType: true,
        npiNumber: true,
        streetAddress: true,
        city: true,
        state: true,
        zipCode: true,
        primaryPhone: true,
        workEmail: true,
        infusionChairCount: true,
        treatmentTypesOffered: true,
        status: true,
        createdAt: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    res.json(clinics);
  } catch (error) {
    next(error);
  }
});

// GET /clinics/:clinicId
router.get('/:clinicId', authMiddleware, async (req, res, next) => {
  try {
    const { clinicId } = req.params;

    // Verify user has access to this clinic
    if (req.user.clinicId !== clinicId && req.user.role !== 'PLATFORM_ADMIN') {
      res.status(403).json({ error: 'Unauthorized access to clinic' });
      return;
    }

    const clinic = await prisma.clinic.findUnique({
      where: { id: clinicId },
    });

    if (!clinic) {
      throw new NotFoundError('Clinic not found');
    }

    res.json(clinic);
  } catch (error) {
    next(error);
  }
});

// PUT /clinics/:clinicId
router.put('/:clinicId', authMiddleware, async (req, res, next) => {
  try {
    const { clinicId } = req.params;

    // Verify user is clinic admin
    if (req.user.clinicId !== clinicId && req.user.role !== 'PLATFORM_ADMIN') {
      res.status(403).json({ error: 'Only clinic admin can update clinic info' });
      return;
    }

    const allowedFields = [
      'name',
      'primaryPhone',
      'streetAddress',
      'city',
      'state',
      'zipCode',
      'infusionChairCount',
      'treatmentTypesOffered',
      'serviceArea',
    ];

    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      throw new ValidationError('No valid fields to update');
    }

    const clinic = await prisma.clinic.update({
      where: { id: clinicId },
      data: updates,
    });

    res.json(clinic);
  } catch (error) {
    next(error);
  }
});

// GET /clinics/:clinicId/staff
router.get('/:clinicId/staff', authMiddleware, async (req, res, next) => {
  try {
    const { clinicId } = req.params;

    if (req.user.clinicId !== clinicId && req.user.role !== 'PLATFORM_ADMIN') {
      res.status(403).json({ error: 'Unauthorized' });
      return;
    }

    const staff = await prisma.user.findMany({
      where: { clinicId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
        createdAt: true,
        lastLogin:true
      },
    });

    res.json(staff);
  } catch (error) {
    next(error);
  }
});

// POST /clinics/:clinicId/staff
router.post('/:clinicId/staff', authMiddleware, async (req, res, next) => {
  try {
    const { clinicId } = req.params;
    const { email, firstName, lastName, role } = req.body;

    if (req.user.clinicId !== clinicId && req.user.role !== 'PLATFORM_ADMIN') {
      res.status(403).json({ error: 'Unauthorized' });
      return;
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      res.status(409).json({ error: 'User with this email already exists' });
      return;
    }

    // Create new staff user with temporary password
    const temporaryPassword = Math.random().toString(36).slice(2, 12);
    const user = await prisma.user.create({
      data: {
        email,
        firstName,
        lastName,
        role: role || 'CLINIC_STAFF',
        status: 'ACTIVE',
        clinicId,
        passwordHash: temporaryPassword,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
      },
    });

    res.status(201).json(user);
  } catch (error) {
    next(error);
  }
});

// DELETE /clinics/:clinicId/staff/:userId — soft-delete staff member
router.delete('/:clinicId/staff/:userId', authMiddleware, async (req, res, next) => {
  try {
    const { clinicId, userId } = req.params;

    if (req.user.clinicId !== clinicId && req.user.role !== 'PLATFORM_ADMIN') {
      res.status(403).json({ error: 'Unauthorized' });
      return;
    }

    if (req.user.userId === userId) {
      res.status(400).json({ error: 'You cannot remove your own account' });
      return;
    }

    const staffMember = await prisma.user.findFirst({
      where: { id: userId, clinicId },
    });

    if (!staffMember) {
      res.status(404).json({ error: 'Staff member not found' });
      return;
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { status: 'DELETED' },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
      },
    });

    res.json({
      success: true,
      message: 'Staff member removed',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
