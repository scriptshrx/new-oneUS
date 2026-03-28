const prisma = require('../db/client');
const { hashPassword, comparePasswords, generateVerificationCode } = require('../utils/password');
const {
  generateAccessToken,
  generateRefreshToken,
  generateTemporaryToken,
} = require('../utils/jwt');
const {
  sendVerificationEmail,
  sendPasswordResetEmail,
} = require('../utils/email');
const {
  storeVerificationToken,
  verifyVerificationToken,
  storePasswordResetToken,
  verifyPasswordResetToken,
  deletePasswordResetToken,
} = require('../utils/tokenStorage');
const {
  ValidationError,
  ConflictError,
  NotFoundError,
  UnauthorizedError,
} = require('../middleware/errorHandler');

const registerClinic = async (input) => {
  // Check if clinic already exists
  const existingClinic = await prisma.clinic.findFirst({
    where: {
      OR: [
        { npiNumber: input.clinic.npiNumber },
        { workEmail: input.clinic.workEmail },
      ],
    },
  });

  if (existingClinic) {
    throw new ConflictError('Clinic with this NPI number or email already exists');
  }

  // Create clinic
  const clinic = await prisma.clinic.create({
    data: {
      name: input.clinic.name,
      npiNumber: input.clinic.npiNumber,
      taxId: input.clinic.taxId,
      stateLicenseNumber: input.clinic.stateLicenseNumber,
      streetAddress: input.clinic.address,
      city: input.clinic.city,
      state: input.clinic.state,
      zipCode: input.clinic.zipCode,
      primaryPhone: input.clinic.primaryPhone,
      workEmail: input.clinic.workEmail,
      infusionChairCount: input.clinic.infusionChairCount,
      treatmentTypesOffered: input.clinic.treatmentTypesOffered,
      clinicType: input.eligibilityGate.clinicType,
      status: 'REGISTERED',
    },
  });

  // Create admin user if provided
  let user = null;
  if (input.admin) {
    const existingUser = await prisma.user.findUnique({
      where: { email: input.clinic.workEmail },
    });

    if (existingUser) {
      throw new ConflictError('User with this email already exists');
    }

    const passwordHash = await hashPassword(input.admin.password);

    user = await prisma.user.create({
      data: {
        email: input.clinic.workEmail,
        passwordHash,
        firstName: input.admin.firstName,
        lastName: input.admin.lastName,
        role: 'CLINIC_ADMIN',
        status: 'PENDING_EMAIL_VERIFICATION',
        clinicId: clinic.id,

      },
    });

    // Send verification email
    const verificationCode = generateVerificationCode();
    storeVerificationToken(input.clinic.workEmail, verificationCode);
    await sendVerificationEmail(input.clinic.workEmail, verificationCode);
  }

  const tokenPayload = {
    userId: user?.id || '',
    clinicId: clinic.id,
    email: input.clinic.workEmail,
    role: 'CLINIC_ADMIN',
  };

  const temporaryToken = generateTemporaryToken(tokenPayload, '600'); // 10 minutes

  return {
    clinicId: clinic.id,
    temporaryToken,
    nextStep: user ? 'VERIFY_EMAIL' : 'EMAIL_VERIFICATION_OPTIONAL',
    userId: user?.id,
  };
};

const verifyEmail = async (input) => {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (!user) {
    throw new NotFoundError('User not found');
  }

  // Verify the code
  if (!verifyVerificationToken(input.email, input.verificationCode)) {
    throw new ValidationError('Invalid or expired verification code');
  }

  // Update user status
  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: {
      status: 'PENDING_BAA_SIGNATURE',
    },
    include: { clinic: true },
  });

  return {
    clinicId: updatedUser.clinicId,
    status: 'EMAIL_VERIFIED',
    nextStep: 'SIGN_BAA',
  };
};

const signBAA = async (input) => {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
    include: { clinic: true },
  });

  if (!user || !user.clinic) {
    throw new NotFoundError('User or clinic not found');
  }

  // Update clinic status
  const clinic = await prisma.clinic.update({
    where: { id: user.clinicId },
    data: {
      status: 'ACTIVE',
      baaSignedAt: new Date(),
      baaSignedBy: input.adminName,
      activatedAt: new Date(),
    },
  });

  // Update user status
  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: {
      status: 'ACTIVE',
    },
  });

  const tokenPayload = {
    userId: updatedUser.id,
    clinicId: clinic.id,
    email: updatedUser.email,
    role: updatedUser.role,
  };

  const accessToken = generateAccessToken(tokenPayload);
  const refreshToken = generateRefreshToken(tokenPayload);

  return {
    clinicId: clinic.id,
    status: 'ACTIVE',
    accessToken,
    refreshToken,
    user: {
      id: updatedUser.id,
      email: updatedUser.email,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      role: updatedUser.role,
    },
  };
};

const login = async (input) => {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
    include: { clinic: true },
  });

  if (!user) {
    throw new UnauthorizedError('Invalid email or password');
  }

  const isPasswordValid = await comparePasswords(input.password, user.passwordHash);
  if (!isPasswordValid) {
    throw new UnauthorizedError('Invalid email or password');
  }

  if (user.status !== 'ACTIVE') {
    throw new UnauthorizedError(
      `Account is ${user.status}. Please complete registration.`
    );
  }

  // Update last login
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLogin: new Date() },
  });

  const tokenPayload = {
    userId: user.id,
    clinicId: user.clinicId || '',
    email: user.email,
    role: user.role,
  };

  const accessToken = generateAccessToken(tokenPayload);
  const refreshToken = generateRefreshToken(tokenPayload);

  return {
    userId: user.id,
    clinicId: user.clinicId,
    role: user.role,
    accessToken,
    refreshToken,
    expiresIn: 3600,
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    },
  };
};

const forgotPassword = async (input) => {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (!user) {
    // For security, don't reveal if user exists
    return { message: 'If email exists, reset link has been sent' };
  }

  // Generate reset token
  const resetToken = generateTemporaryToken(
    {
      userId: user.id,
      email: user.email,
      role: user.role,
    },
    '3600' // 1 hour
  );

  // Store reset token
  storePasswordResetToken(user.email, resetToken);

  // Send password reset email
  await sendPasswordResetEmail(user.email, resetToken);

  return { message: 'Password reset link sent to email' };
};

const resetPassword = async (input) => {
  // Verify the reset token
  const email = verifyPasswordResetToken(input.resetToken);
  if (!email) {
    throw new UnauthorizedError('Invalid or expired reset token');
  }

  // Find user
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new NotFoundError('User not found');
  }

  // Hash new password
  const passwordHash = await hashPassword(input.newPassword);

  // Update password
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash },
  });

  // Delete reset token
  deletePasswordResetToken(input.resetToken);

  return { message: 'Password reset successful' };
};

const registerHospital = async (input) => {
  // Check if hospital already exists
  const existingHospital = await prisma.hospital.findFirst({
    where: {
      OR: [
        { npiNumber: input.hospital.npiNumber },
        { workEmail: input.hospital.workEmail },
      ],
    },
  });

  if (existingHospital) {
    throw new ConflictError('Hospital with this NPI number or email already exists');
  }

  // Create hospital
  const hospital = await prisma.hospital.create({
    data: {
      name: input.hospital.name,
      npiNumber: input.hospital.npiNumber,
      taxId: input.hospital.taxId,
      stateLicenseNumber: input.hospital.stateLicenseNumber,
      primaryOfficeAddress: input.hospital.address,
      city: input.hospital.city,
      state: input.hospital.state,
      zipCode: input.hospital.zipCode,
      primaryPhone: input.hospital.primaryPhone,
      workEmail: input.hospital.workEmail,
      contactPersonFirstName: input.admin.firstName,
      contactPersonLastName: input.admin.lastName,
      contactPersonTitle: input.admin.title,
      status: 'REGISTERED',
    },
  });

  // Create admin user for authentication
  let user = null;
  if (input.admin) {
    const existingUser = await prisma.user.findUnique({
      where: { email: input.hospital.workEmail },
    });

    if (existingUser) {
      throw new ConflictError('User with this email already exists');
    }

    const passwordHash = await hashPassword(input.admin.password);

    user = await prisma.user.create({
      data: {
        email: input.hospital.workEmail,
        passwordHash,
        firstName: input.admin.firstName,
        lastName: input.admin.lastName,
        role: 'CLINIC_ADMIN',
        status: 'PENDING_EMAIL_VERIFICATION',
      },
    });

    // Send verification email
    const verificationCode = generateVerificationCode();
    storeVerificationToken(input.hospital.workEmail, verificationCode);
    await sendVerificationEmail(input.hospital.workEmail, verificationCode);
  }

  const tokenPayload = {
    userId: user?.id || '',
    hospitalId: hospital.id,
    email: input.hospital.workEmail,
    role: 'CLINIC_ADMIN',
  };

  const temporaryToken = generateTemporaryToken(tokenPayload, '600'); // 10 minutes

  return {
    hospitalId: hospital.id,
    temporaryToken,
    nextStep: user ? 'VERIFY_EMAIL' : 'EMAIL_VERIFICATION_OPTIONAL',
    userId: user?.id,
  };
};

const logout = async (userId) => {
  return { message: 'Logged out successfully' };
};

module.exports = {
  registerClinic,
  registerHospital,
  verifyEmail,
  signBAA,
  login,
  forgotPassword,
  resetPassword,
  logout,
};
