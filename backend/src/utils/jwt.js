const jwt = require('jsonwebtoken');

const generateAccessToken = (payload) => {
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRATION || '3600',
  });
  console.log('🔐 [JWT] Generated access token:', {
    userId: payload.userId,
    expiresIn: process.env.JWT_EXPIRATION || '3600',
    secret: process.env.JWT_SECRET ? '***set***' : '***NOT SET***'
  });
  return token;
};

const generateRefreshToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRATION || '604800',
  });
};

const generateTemporaryToken = (payload, expiresIn = '600') => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn,
  });
};

const verifyAccessToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('✅ [JWT] Access token verified successfully:', {
      userId: decoded.userId,
      exp: new Date(decoded.exp * 1000).toISOString(),
      iat: new Date(decoded.iat * 1000).toISOString(),
      nowUTC: new Date().toISOString(),
      expiresInSeconds: decoded.exp - Math.floor(Date.now() / 1000)
    });
    return decoded;
  } catch (error) {
    console.error('❌ [JWT] Access token verification failed:', {
      errorName: error.name,
      errorMessage: error.message,
      tokenPreview: token ? token.substring(0, 50) + '...' : 'none',
      secretSet: !!process.env.JWT_SECRET,
      secretPreview: process.env.JWT_SECRET ? process.env.JWT_SECRET.substring(0, 10) + '...' : 'NOT SET'
    });
    return null;
  }
};

const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch {
    return null;
  }
};

const verifyTemporaryToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return null;
  }
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  generateTemporaryToken,
  verifyAccessToken,
  verifyRefreshToken,
  verifyTemporaryToken,
};
