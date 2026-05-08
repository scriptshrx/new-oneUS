const verificationTokens = new Map();
const passwordResetTokens = new Map();

const TOKEN_EXPIRY_MS = 30 * 60 * 2000; // 10 minutes
const RESET_TOKEN_EXPIRY_MS = 60 * 60 * 1000; // 1 hour

const storeVerificationToken = (email, code) => {
  verificationTokens.set(email, {
    code,
    expiresAt: Date.now() + TOKEN_EXPIRY_MS,
  });
};

const verifyVerificationToken = (email, code) => {
  const token = verificationTokens.get(email);

  if (!token) return false;
  if (Date.now() > token.expiresAt) {
    verificationTokens.delete(email);
    return false;
  }
  if (token.code !== code) return false;

  verificationTokens.delete(email);
  return true;
};

const storePasswordResetToken = (email, token) => {
  passwordResetTokens.set(token, {
    code: email,
    expiresAt: Date.now() + RESET_TOKEN_EXPIRY_MS,
  });
};

const verifyPasswordResetToken = (token) => {
  const stored = passwordResetTokens.get(token);

  if (!stored) return null;
  if (Date.now() > stored.expiresAt) {
    passwordResetTokens.delete(token);
    return null;
  }

  return stored.code; // Returns email
};

const deletePasswordResetToken = (token) => {
  passwordResetTokens.delete(token);
};

module.exports = {
  storeVerificationToken,
  verifyVerificationToken,
  storePasswordResetToken,
  verifyPasswordResetToken,
  deletePasswordResetToken,
};
