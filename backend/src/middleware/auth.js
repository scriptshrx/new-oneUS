const { verifyAccessToken, verifyTemporaryToken, verifyRefreshToken } = require('../utils/jwt');
//define auth middlewares
const authMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      console.error('❌ [authMiddleware] Missing authorization token');
      res.status(401).json({ error: 'Missing authorization token' });
      return;
    }

    console.log('🔍 [authMiddleware] Verifying token:', {
      tokenPreview: token.substring(0, 30) + '...',
      secretLoaded: !!process.env.JWT_SECRET
    });

    const payload = verifyAccessToken(token);
    if (!payload) {
      console.error('❌ [authMiddleware] Token verification returned null');
      res.status(401).json({ error: 'Invalid or expired token' });
      return;
    }

    console.log('✅ [authMiddleware] Token verified for user:', payload.userId);
    req.user = payload;
    next();
  } catch (error) {
    console.error('❌ [authMiddleware] Exception during verification:', error.message);
    res.status(401).json({ error: 'Authentication failed' });
  }
};

const temporaryTokenMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      res.status(401).json({ error: 'Missing authorization token' });
      return;
    }

    const payload = verifyTemporaryToken(token);
    if (!payload) {
      res.status(401).json({ error: 'Invalid or expired token' });
      return;
    }

    req.user = payload;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Authentication failed' });
  }
};

const refreshTokenMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      res.status(401).json({ error: 'Missing refresh token' });
      return;
    }

    const payload = verifyRefreshToken(token);
    if (!payload) {
      res.status(401).json({ error: 'Invalid or expired refresh token' });
      return;
    }

    req.user = payload;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token refresh failed' });
  }
};

module.exports = {
  authMiddleware,
  temporaryTokenMiddleware,
  refreshTokenMiddleware,
};
