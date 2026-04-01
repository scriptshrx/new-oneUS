const { Router } = require('express');
const { authMiddleware } = require('../middleware/auth');
const {
  createReferral,
  getReferrals,
  getReferralById,
  updateReferralStatus,
} = require('../services/referralService');

const router = Router();

// POST /referrals - Create new referral and patient
router.post('/', authMiddleware, async (req, res, next) => {
  try {
    const { clinicId, ...referralData } = req.body;
    
    if (!clinicId) {
      return res.status(400).json({ error: 'Target clinicId is required' });
    }

    const result = await createReferral({ ...referralData, clinicId }, req.user.clinicId || req.user.hospitalId);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

// GET /referrals - List referrals for clinic
router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const { status, search, skip, take } = req.query;
    
    const referrals = await getReferrals(req.user.clinicId, {
      status,
      search,
      skip: skip ? parseInt(skip) : 0,
      take: take ? parseInt(take) : 50,
    });

    res.json(referrals);
  } catch (error) {
    next(error);
  }
});

// GET /referrals/:referralId - Get single referral
router.get('/:referralId', authMiddleware, async (req, res, next) => {
  try {
    const referral = await getReferralById(req.params.referralId, req.user.clinicId);
    res.json(referral);
  } catch (error) {
    next(error);
  }
});

// PATCH /referrals/:referralId/status - Update referral status
router.patch('/:referralId/status', authMiddleware, async (req, res, next) => {
  try {
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const referral = await updateReferralStatus(
      req.params.referralId,
      status,
      req.user.clinicId
    );

    res.json(referral);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
