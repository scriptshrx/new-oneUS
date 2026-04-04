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
    console.log('📋 [REFERRALS] POST /referrals endpoint called');
    const { clinicId, ...referralData } = req.body;
    console.log('📤 [REFERRALS] Request body:', { clinicId, ...referralData });
    
    if (!clinicId) {
      console.error('❌ [REFERRALS] Missing clinicId in request');
      return res.status(400).json({ error: 'Target clinicId is required' });
    }

    // Pass hospitalId from authenticated user when available
    const result = await createReferral(req.body, req.user.hospitalId);
    console.log('✅ [REFERRALS] Referral created successfully:', result.id);
    res.status(201).json(result);
  } catch (error) {
    console.error('💥 [REFERRALS] Error creating referral:', error);
    next(error);
  }
});

// GET /referrals - List referrals for clinic
router.get('/', authMiddleware, async (req, res, next) => {
  console.log('Started to fetch referrals')
  try {
    // Support filtering by clinicId or hospitalId provided in query or via authenticated user
    const queryClinicId = req.query.clinicId;
    const queryHospitalId = req.query.hospitalId;

    const clinicId = queryClinicId || req.user.clinicId || null;
    const hospitalId = queryHospitalId || req.user.hospitalId || null;

    console.log('📋 [REFERRALS] GET /referrals endpoint called');
    console.log(req.user);
    console.log('👤 [REFERRALS] User:', { userId: req.user.userId, clinicId, hospitalId, role: req.user.role });

    if (!clinicId && !hospitalId) {
      console.error('❌ [REFERRALS] No clinic or hospital ID found for user/request');
      return res.status(400).json({ error: 'User must be associated with a clinic or hospital to view referrals' });
    }

    const referrals = await getReferrals(clinicId, hospitalId);

    console.log('✅ [REFERRALS] Successfully fetched referrals count:', referrals.length);
    console.log('📦 [REFERRALS] Response:', referrals);
    
    res.json(referrals);
  } catch (error) {
    console.error('💥 [REFERRALS] Error fetching referrals:', error);
    next(error);
  }
});

// GET /referrals/:referralId - Get single referral
router.get('/:referralId', authMiddleware, async (req, res, next) => {
  try {
    console.log('📋 [REFERRALS] GET /referrals/:referralId endpoint called');
    console.log('🔍 [REFERRALS] Referral ID:', req.params.referralId);
    
    const referral = await getReferralById(req.params.referralId, req.user.clinicId);
    console.log('✅ [REFERRALS] Referral found:', referral?.id);
    res.json(referral);
  } catch (error) {
    console.error('💥 [REFERRALS] Error fetching referral:', error);
    next(error);
  }
});

// PATCH /referrals/:referralId/status - Update referral status
router.patch('/:referralId/status', authMiddleware, async (req, res, next) => {
  try {
    console.log('📋 [REFERRALS] PATCH /referrals/:referralId/status endpoint called');
    console.log('🔍 [REFERRALS] Referral ID:', req.params.referralId);
    const { status } = req.body;
    console.log('📤 [REFERRALS] New status:', status);
    
    if (!status) {
      console.error('❌ [REFERRALS] Missing status in request');
      return res.status(400).json({ error: 'Status is required' });
    }

    const referral = await updateReferralStatus(
      req.params.referralId,
      status,
      req.user.clinicId
    );

    console.log('✅ [REFERRALS] Status updated successfully');
    res.json(referral);
  } catch (error) {
    console.error('💥 [REFERRALS] Error updating referral status:', error);
    next(error);
  }
});

module.exports = router;
