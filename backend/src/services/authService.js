const prisma = require('../db/client');
const sendSMS = require('../utils/sms')
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
  console.log('\x1b[1m📋 [REGISTER_CLINIC] START - Clinic registration initiated\x1b[0m', { email: input?.clinic?.workEmail });
  // Check if clinic already exists
  if (!prisma || !prisma.clinic) {
    console.error('Prisma client or prisma.clinic is undefined', { prismaKeys: prisma && Object.keys(prisma) });
    throw new Error('Prisma client not initialized (prisma.clinic is undefined)');
  }

  console.log('\x1b[1m🔍 [REGISTER_CLINIC] Checking for existing clinic...\x1b[0m');
  const existingClinic = await prisma.clinic.findFirst({
    where: {
      OR: [
        { npiNumber: input.clinic.npiNumber },
        { workEmail: input.clinic.workEmail },
      ],
    },
  });

  if (existingClinic) {
    console.log('\x1b[1m❌ [REGISTER_CLINIC] Clinic already exists\x1b[0m', { clinicId: existingClinic.id });
    throw new ConflictError('Clinic with this NPI number or email already exists');
  }
  console.log('\x1b[1m✓ [REGISTER_CLINIC] No existing clinic found, proceeding...\x1b[0m');

  // Create clinic
  console.log('\x1b[1m🏥 [REGISTER_CLINIC] Creating new clinic...\x1b[0m');
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
  console.log('\x1b[1m✅ [REGISTER_CLINIC] Clinic created successfully\x1b[0m', { clinicId: clinic.id });

  const subscription = await prisma.subscription.create({
    data:{
      clinicId:clinic.id,
      plan:'FREE',

    }
  });

  console.log('\x1b[1m💳 [REGISTER_CLINIC] Subscription created successfully\x1b[0m', { subscriptionId: subscription.id, plan: subscription.plan });

  // Create admin user if provided
  let user = null;
  if (input.admin) {
    console.log('\x1b[1m👤 [REGISTER_CLINIC] Creating admin user...\x1b[0m', { adminEmail: input.clinic.workEmail });
    const existingUser = await prisma.user.findUnique({
      where: { email: input.clinic.workEmail },
    });

    if (existingUser) {
      console.log('\x1b[1m❌ [REGISTER_CLINIC] User already exists\x1b[0m', { userId: existingUser.id });
      throw new ConflictError('User with this email already exists');
    }
    console.log('\x1b[1m✓ [REGISTER_CLINIC] No existing user found, proceeding...\x1b[0m');

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
    console.log('\x1b[1m✅ [REGISTER_CLINIC] Admin user created successfully\x1b[0m', { userId: user.id });

    // Send verification email
    const verificationCode = generateVerificationCode();
    console.log('\x1b[1m📧 [REGISTER_CLINIC] Verification code generated and stored\x1b[0m');
    storeVerificationToken(input.clinic.workEmail, verificationCode);
    const to = input.clinic.primaryPhone;
    const OTPMessage = `Your clinic account verificcation OTP: ${verificationCode}`
    const smsResponse = await sendSMS(to, OTPMessage);
    console.log('\x1b[32m Registering clinic successfully notified with OTP\x1b[0m',smsResponse)
    //await sendVerificationEmail(input.clinic.workEmail, verificationCode);
  }

  const tokenPayload = {
    userId: user?.id || '',
    clinicId: clinic.id,
    
    email: input.clinic.workEmail,
    role: 'CLINIC_ADMIN',
  };

  const temporaryToken = generateTemporaryToken(tokenPayload,'10m'); // 10 minutes
  console.log('\x1b[1m🎟️ [REGISTER_CLINIC] Temporary token generated\x1b[0m');
  const accessToken = generateAccessToken(tokenPayload,'1hr')
  console.log('\x1b[1m✅ [REGISTER_CLINIC] Access token generated, registration complete\x1b[0m');
  return {
    clinicId: clinic.id,
    accessToken,
    email:user.email,
    temporaryToken,
    nextStep: user ? 'VERIFY_EMAIL' : 'EMAIL_VERIFICATION_OPTIONAL',
    userId: user?.id,
  };
};

const verifyEmail = async (input) => {
  console.log('\x1b[1m📧 [VERIFY_EMAIL] START - Email verification initiated\x1b[0m', { email: input.email });
  const user = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (!user) {
    console.log('\x1b[1m❌ [VERIFY_EMAIL] User not found\x1b[0m', { email: input.email });
    throw new NotFoundError('User not found');
  }
  console.log('\x1b[1m✓ [VERIFY_EMAIL] User found\x1b[0m', { userId: user.id });

  // Verify the code
  console.log('\x1b[1m🔍 [VERIFY_EMAIL] Verifying verification code...\x1b[0m');
  if (!verifyVerificationToken(input.email, input.verificationCode)) {
    console.log('\x1b[1m❌ [VERIFY_EMAIL] Invalid or expired verification code\x1b[0m');
    throw new ValidationError('Invalid or expired verification code');
  }
  console.log('\x1b[1m✅ [VERIFY_EMAIL] Verification code valid\x1b[0m');

  // Update user status
  console.log('\x1b[1m🔄 [VERIFY_EMAIL] Updating user status...\x1b[0m');
  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: {
      status: 'PENDING_BAA_SIGNATURE',
    },
  });

  // Check if this email is associated with a Hospital (by workEmail)
  console.log('\x1b[1m🏥 [VERIFY_EMAIL] Checking if email is hospital admin...\x1b[0m');
  let hospital = null;
  // try {
  //   hospital = await prisma.hospital.findUnique({ where: { workEmail: input.email } });
  // } catch (e) {
  //   // ignore -- hospital may not exist now
  // }
  console.log('\x1b[1m✅ [VERIFY_EMAIL] Email verification complete\x1b[0m', { nextStep: hospital ? 'HOSPITAL_FLOW' : 'CLINIC_FLOW' });

  return {
    clinicId: updatedUser.clinicId || null,
    hospitalId: updatedUser.hospitalId ||  null,
    status: 'EMAIL_VERIFIED',
    nextStep: 'SIGN_BAA',
  };
};

const signBAA = async (input) => {
  console.log('\x1b[1m📝 [SIGN_BAA] START - BAA signing initiated\x1b[0m', { email: input.email });
  const user = await prisma.user.findUnique({
    where: { email: input.email },
    include: { clinic: true },
  });

  if (!user || !user.clinic) {
    console.log('\x1b[1m❌ [SIGN_BAA] User or clinic not found\x1b[0m', { email: input.email });
    throw new NotFoundError('User or clinic not found');
  }
  console.log('\x1b[1m✓ [SIGN_BAA] User and clinic found\x1b[0m', { userId: user.id, clinicId: user.clinicId });

  // Update clinic status
  console.log('\x1b[1m🔄 [SIGN_BAA] Updating clinic status to ACTIVE...\x1b[0m');
  const clinic = await prisma.clinic.update({
    where: { id: user.clinicId },
    data: {
      status: 'ACTIVE',
      baaSignedAt: new Date(),
      baaSignedBy: input.adminName,
      activatedAt: new Date(),
    },
  });
  console.log('\x1b[1m✅ [SIGN_BAA] Clinic status updated\x1b[0m', { clinicId: clinic.id, status: clinic.status });

  // Update user status
  console.log('\x1b[1m🔄 [SIGN_BAA] Updating user status to ACTIVE...\x1b[0m');
  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: {
      status: 'ACTIVE',
    },
  });
  console.log('\x1b[1m✅ [SIGN_BAA] User status updated\x1b[0m', { userId: updatedUser.id, status: updatedUser.status });

  const tokenPayload = {
    userId: updatedUser.id,
    clinicId: clinic.id,
    email: updatedUser.email,
    role: updatedUser.role,
  };

  const accessToken = generateAccessToken(tokenPayload);
  const refreshToken = generateRefreshToken(tokenPayload);
  console.log('\x1b[1m🎟️ [SIGN_BAA] Tokens generated, BAA signing complete\x1b[0m');

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
  console.log('\x1b[1m🔑 [LOGIN] START - Login attempt\x1b[0m', { email: input?.email });
  // First check if the email belongs to an infusion chair
  try {
    if (input && input.email) {
      console.log('\x1b[1m🪑 [LOGIN] Checking if email belongs to infusion chair...\x1b[0m');
      // prisma.findUnique requires a unique identifier (id). Use findFirst when querying by non-unique fields like email.
      const chair = await prisma.infusionChair.findFirst({ where: { email: input.email } });
      if (chair) {
        console.log('\x1b[1m✓ [LOGIN] Infusion chair found, verifying password...\x1b[0m', { chairId: chair.id });
        // Verify password supplied by frontend against stored plain chairPassword
        if (!input.password || input.password !== chair.chairPassword) {
          // Invalid password for chair
          console.log('\x1b[1m❌ [LOGIN] Invalid password for infusion chair\x1b[0m');
          throw new UnauthorizedError('Invalid email or password');
        }
        console.log('\x1b[1m✅ [LOGIN] Infusion chair password verified\x1b[0m');

        const chairData = {
          id: chair.id,
          name: chair.name,
          email: chair.email,
          clinicId: chair.clinicId,
          status: chair.status,
          createdAt: chair.createdAt,
          updatedAt: chair.updatedAt,
        };

        console.log('\x1b[1m✅ [LOGIN] Infusion chair login successful\x1b[0m', { chairId: chair.id });
        return { from: 'infusionChair', data: chairData };
      }
    }
  } catch (e) {
    // If it's an UnauthorizedError, rethrow so login route returns 401
    if (e instanceof UnauthorizedError) throw e;
    console.error('Error checking infusionChair during login:', e);
    // continue to normal login flow on other errors
  }

  console.log('\x1b[1m🔍 [LOGIN] Looking up user...\x1b[0m');
  const user = await prisma.user.findUnique({
    where: { email: input.email },
    include: { clinic: true, hospital: true },
  });

  if (!user) {
    console.log('\x1b[1m❌ [LOGIN] User not found\x1b[0m', { email: input.email });
    throw new UnauthorizedError('Invalid email or password');
  }
  console.log('\x1b[1m✓ [LOGIN] User found\x1b[0m', { userId: user.id, role: user.role });

  console.log('\x1b[1m🔐 [LOGIN] Verifying password...\x1b[0m');
  const isPasswordValid = await comparePasswords(input.password, user.passwordHash);
  if (!isPasswordValid) {
    console.log('\x1b[1m❌ [LOGIN] Invalid password\x1b[0m');
    throw new UnauthorizedError('Invalid email or password');
  }
  console.log('\x1b[1m✅ [LOGIN] Password verified\x1b[0m');

  //Disabled until zeptomail is active
  /*if (user.status !== 'ACTIVE') {
    throw new UnauthorizedError(
      `Account is ${user.status}. Please complete registration.`
    );
  }*/

  // Update last login
  console.log('\x1b[1m⏱️ [LOGIN] Updating last login timestamp...\x1b[0m');
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLogin: new Date() },
  });
  console.log('\x1b[1m✓ [LOGIN] Last login updated\x1b[0m');

  // Determine if user is clinic or hospital staff
  console.log('\x1b[1m🏢 [LOGIN] Determining user organization type...\x1b[0m');
  const isClinincUser = !!user.clinicId;
  const isHospitalUser = !!user.hospitalId;
  console.log('\x1b[1m✓ [LOGIN] Organization type determined\x1b[0m', { isClinincUser, isHospitalUser });

  let tokenPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
  };

  let responseData = {
    userId: user.id,
    org:null,
    role: user.role,
    accessToken: null,
    refreshToken: null,
    expiresIn: 3600,
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    },
  };

  // Build response based on tenant type
  if (isClinincUser) {
    const clinic = await prisma.clinic.findFirst({
      where:{id:user.clinicId}
    });

    tokenPayload.clinicId = user.clinicId;
    responseData.clinicId = user.clinicId;
   let {org,...rest} = responseData;
   org=clinic;
   responseData = {org,...rest};
    if (user.clinic) {
      responseData.clinic = user.clinic;
    }
  } else if (isHospitalUser) {
    const hospital = await prisma.hospital.findFirst({
      where:{id:user.hospitalId}
    });
    let {org,...rest} = responseData;
    org=hospital;
    responseData = {org, ...rest}
    tokenPayload.hospitalId = user.hospitalId;
    responseData.hospitalId = user.hospitalId;
    if (user.hospital) {
      responseData.hospital = user.hospital;
    }
  }

  const accessToken = generateAccessToken(tokenPayload);
  const refreshToken = generateRefreshToken(tokenPayload);

  console.log('\x1b[1m🎟️ [LOGIN] Tokens generated for user\x1b[0m', {
    userId: tokenPayload.userId,
    email: tokenPayload.email
  });

  responseData.accessToken = accessToken;
  responseData.refreshToken = refreshToken;
  console.log('\x1b[1m✅ [LOGIN] Login successful, returning user data\x1b[0m', { userId: user.id, role: user.role });

  return responseData;
};

const forgotPassword = async (input) => {
  console.log('\x1b[1m🔐 [FORGOT_PASSWORD] START - Password reset requested\x1b[0m', { email: input.email });
  const user = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (!user) {
    console.log('\x1b[1m⚠️ [FORGOT_PASSWORD] User not found (security: no email sent)\x1b[0m', { email: input.email });
    // For security, don't reveal if user exists
    return { message: 'If email exists, reset link has been sent' };
  }

  // Generate reset token
  console.log('\x1b[1m🎟️ [FORGOT_PASSWORD] Generating password reset token...\x1b[0m');
  const resetToken = generateTemporaryToken(
    {
      userId: user.id,
      email: user.email,
      role: user.role,
    },
    '1h' // 1 hour
  );
  console.log('\x1b[1m✓ [FORGOT_PASSWORD] Reset token generated\x1b[0m');

  // Store reset token
  console.log('\x1b[1m💾 [FORGOT_PASSWORD] Storing reset token...\x1b[0m');
  storePasswordResetToken(user.email, resetToken);
  console.log('\x1b[1m✓ [FORGOT_PASSWORD] Reset token stored\x1b[0m');

  // Send password reset email
  console.log('\x1b[1m📧 [FORGOT_PASSWORD] Sending password reset email...\x1b[0m');
  await sendPasswordResetEmail(user.email, resetToken);
  console.log('\x1b[1m✅ [FORGOT_PASSWORD] Password reset email sent\x1b[0m');

  return { message: 'Password reset link sent to email' };
};

const resetPassword = async (input) => {
  console.log('\x1b[1m🔐 [RESET_PASSWORD] START - Password reset initiated\x1b[0m');
  // Verify the reset token
  console.log('\x1b[1m🔍 [RESET_PASSWORD] Verifying reset token...\x1b[0m');
  const email = verifyPasswordResetToken(input.resetToken);
  if (!email) {
    console.log('\x1b[1m❌ [RESET_PASSWORD] Invalid or expired reset token\x1b[0m');
    throw new UnauthorizedError('Invalid or expired reset token');
  }
  console.log('\x1b[1m✅ [RESET_PASSWORD] Reset token verified\x1b[0m', { email });

  // Find user
  console.log('\x1b[1m🔍 [RESET_PASSWORD] Looking up user...\x1b[0m');
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    console.log('\x1b[1m❌ [RESET_PASSWORD] User not found\x1b[0m', { email });
    throw new NotFoundError('User not found');
  }
  console.log('\x1b[1m✓ [RESET_PASSWORD] User found\x1b[0m', { userId: user.id });

  // Hash new password
  console.log('\x1b[1m🔐 [RESET_PASSWORD] Hashing new password...\x1b[0m');
  const passwordHash = await hashPassword(input.newPassword);
  console.log('\x1b[1m✓ [RESET_PASSWORD] Password hashed\x1b[0m');

  // Update password
  console.log('\x1b[1m🔄 [RESET_PASSWORD] Updating password in database...\x1b[0m');
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash },
  });
  console.log('\x1b[1m✅ [RESET_PASSWORD] Password updated successfully\x1b[0m');

  // Delete reset token
  console.log('\x1b[1m🗑️ [RESET_PASSWORD] Deleting reset token...\x1b[0m');
  deletePasswordResetToken(input.resetToken);
  console.log('\x1b[1m✓ [RESET_PASSWORD] Reset token deleted\x1b[0m');

  return { message: 'Password reset successful' };
};

const registerHospital = async (input) => {
  console.log('\x1b[1m🏥 [REGISTER_HOSPITAL] START - Hospital registration initiated\x1b[0m', { email: input?.hospital?.workEmail });
  // Check if hospital already exists
  if (!prisma || !prisma.hospital) {
    console.error('Prisma client or prisma.hospital is undefined', { prismaKeys: prisma && Object.keys(prisma) });
    throw new Error('Prisma client not initialized (prisma.hospital is undefined)');
  }

  console.log('\x1b[1m🔍 [REGISTER_HOSPITAL] Checking for existing hospital...\x1b[0m');
  const existingHospital = await prisma.hospital.findFirst({
    where: {
      OR: [
        { npiNumber: input.hospital.npiNumber },
        { workEmail: input.hospital.workEmail },
      ],
    },
  });

  if (existingHospital) {
    console.log('\x1b[1m❌ [REGISTER_HOSPITAL] Hospital already exists\x1b[0m', { hospitalId: existingHospital.id });
    throw new ConflictError('Hospital with this NPI number or email already exists');
  }
  console.log('\x1b[1m✓ [REGISTER_HOSPITAL] No existing hospital found, proceeding...\x1b[0m');

  // Create hospitals
  console.log('\x1b[1m🏗️ [REGISTER_HOSPITAL] Creating new hospital...\x1b[0m');
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
  console.log('\x1b[1m✅ [REGISTER_HOSPITAL] Hospital created successfully\x1b[0m', { hospitalId: hospital.id });

  const subscription = await prisma.subscription.create({
    data:{
      hospitalId:hospital.id,
      plan:'FREE'
    }
  });
  console.log('\x1b[1m💳 [REGISTER_HOSPITAL] Subscription created successfully\x1b[0m', { subscriptionId: subscription.id, plan: subscription.plan });

  // Create admin user for authentication
  let user = null;
  if (input.admin) {
    console.log('\x1b[1m👤 [REGISTER_HOSPITAL] Creating admin user...\x1b[0m', { adminEmail: input.hospital.workEmail });
    const existingUser = await prisma.user.findUnique({
      where: { email: input.hospital.workEmail },
    });

    if (existingUser) {
      console.log('\x1b[1m❌ [REGISTER_HOSPITAL] User already exists\x1b[0m', { userId: existingUser.id });
      throw new ConflictError('User with this email already exists');
    }
    console.log('\x1b[1m✓ [REGISTER_HOSPITAL] No existing user found, proceeding...\x1b[0m');

    const passwordHash = await hashPassword(input.admin.password);

    user = await prisma.user.create({
      data: {
        email: input.hospital.workEmail,
        passwordHash,
        
        firstName: input.admin.firstName,
        lastName: input.admin.lastName,
        role: 'HOSPITAL_ADMIN',
        status: 'PENDING_EMAIL_VERIFICATION',
        hospitalId: hospital.id,
      },
    });
    console.log('\x1b[1m✅ [REGISTER_HOSPITAL] Admin user created successfully\x1b[0m', { userId: user.id });

    // Send verification email
    const verificationCode = generateVerificationCode();
    console.log('\x1b[1m📧 [REGISTER_HOSPITAL] Verification code generated and stored\x1b[0m');
    storeVerificationToken(input.hospital.workEmail, verificationCode);
    //await sendVerificationEmail(input.hospital.workEmail, verificationCode);
  }

  const tokenPayload = {
    userId: user?.id || '',
    hospitalId: hospital.id,
    email: input.hospital.workEmail,
    role: 'HOSPITAL_ADMIN',
  };

  const temporaryToken = generateTemporaryToken(tokenPayload, '10m'); // 10 minutes
  console.log('\x1b[1m🎟️ [REGISTER_HOSPITAL] Temporary token generated\x1b[0m');
  const accessToken = generateAccessToken(tokenPayload);
  console.log('\x1b[1m✅ [REGISTER_HOSPITAL] Access token generated, registration complete\x1b[0m');
  return {
    ...hospital,
    temporaryToken,
    accessToken,
    nextStep: user ? 'VERIFY_EMAIL' : 'EMAIL_VERIFICATION_OPTIONAL',
    userId: user?.id,
  };
};

const logout = async (userId) => {
  console.log('\x1b[1m👋 [LOGOUT] User logged out\x1b[0m', { userId });
  return { message: 'Logged out successfully' };
};

const refreshAccessToken = async (userPayload) => {
  console.log('\x1b[1m🔄 [REFRESH_TOKEN] START - Token refresh initiated\x1b[0m', { userId: userPayload?.userId });
  try {
    console.log('\x1b[1m🎟️ [REFRESH_TOKEN] Generating new access token...\x1b[0m');
    // Generate new access token and refresh token using the payload from the verified refresh token
    const newAccessToken = generateAccessToken({
      userId: userPayload.userId,
      email: userPayload.email,
      role: userPayload.role,
      ...(userPayload.clinicId && { clinicId: userPayload.clinicId }),
      ...(userPayload.hospitalId && { hospitalId: userPayload.hospitalId }),
    });

    // Rotate refresh token for better security
    console.log('\x1b[1m🔄 [REFRESH_TOKEN] Rotating refresh token...\x1b[0m');
    const newRefreshToken = generateRefreshToken({
      userId: userPayload.userId,
      email: userPayload.email,
      role: userPayload.role,
      ...(userPayload.clinicId && { clinicId: userPayload.clinicId }),
      ...(userPayload.hospitalId && { hospitalId: userPayload.hospitalId }),
    });
    console.log('\x1b[1m✅ [REFRESH_TOKEN] Tokens refreshed successfully\x1b[0m');

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      expiresIn: 3600,
    };
  } catch (error) {
    console.log('\x1b[1m❌ [REFRESH_TOKEN] Token refresh failed\x1b[0m', { error: error.message });
    throw new UnauthorizedError('Failed to refresh token');
  }
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
  refreshAccessToken,
};
