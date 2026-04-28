const { Router } = require('express');
const { authMiddleware, temporaryTokenMiddleware, refreshTokenMiddleware } = require('../middleware/auth');
const {
  registerClinic,
  registerHospital,
  verifyEmail,
  signBAA,
  login,
  forgotPassword,
  resetPassword,
  logout,
  refreshAccessToken,
  resendVerification
} = require('../services/authService');
const { sendSMS } = require('../utils/sms');

const router = Router();

// POST /auth/register/clinic
router.post('/register/clinic', async (req, res, next) => {
  try {
    const input = req.body;
    const result = await registerClinic(input);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

router.post('/register/resend-verification',async(req,res)=>{
  console.log('starting to resend verification',req.body);
  try{
  const response = await resendVerification(req.body);
  
  res.status(201).json(response)
  }
  catch(e){console.log('Error sending OTP',e)}
 
  

})

// POST /auth/register/hospital
router.post('/register/hospital', async (req, res, next) => {
  try {
    const input = req.body;
    const result = await registerHospital(input);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

// POST /auth/register/verify-email
router.post('/register/verify-email', temporaryTokenMiddleware, async (req, res, next) => {
  try {
    const input = req.body;
    const result = await verifyEmail(input);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// POST /auth/register/sign-baa
router.post('/register/sign-baa', temporaryTokenMiddleware, async (req, res, next) => {
  try {
    const input = req.body;
    const result = await signBAA(input);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// POST /auth/login
router.post('/login', async (req, res, next) => {
  try {
    const input = req.body;
    const result = await login(input);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// POST /auth/password/forgot
router.post('/password/forgot', async (req, res, next) => {
  try {
    const input = req.body;
    const result = await forgotPassword(input);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// POST /auth/password/reset
router.post('/password/reset', async (req, res, next) => {
  try {
    const input = req.body;
    const result = await resetPassword(input);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// POST /auth/logout
router.post('/logout', authMiddleware, async (req, res, next) => {
  try {
    const result = await logout(req.user.userId);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// GET /auth/me
router.get('/me', authMiddleware, async (req, res, next) => {
  try {
    const prisma = require('../db/client');
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
        clinicId: true,
      },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json(user);
  } catch (error) {
    next(error);
  }
});

// POST /auth/refresh - Refresh access token
router.post('/refresh', refreshTokenMiddleware, async (req, res, next) => {
  try {
    const result = await refreshAccessToken(req.user);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
