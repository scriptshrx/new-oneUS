const prisma = require('../db/client');
const { NotFoundError, ValidationError, ConflictError } = require('../middleware/errorHandler');
const { generateVerificationCode } = require('../utils/password');
const { sendPatientPortalLoginLink } = require('../utils/email');

const createReferral = async (input, hospitalIdParam) => {
  // Validate required fields
  if (!input.patientInfo || !input.referringPhysician || !input.clinical) {
    throw new ValidationError('Missing required fields: patientInfo, referringPhysician, clinical');
  }

  // Determine hospitalId: prefer explicit input, fall back to provided param from auth
  const hospitalId = input.hospitalId || hospitalIdParam;
  if (!hospitalId) {
    throw new ValidationError('Missing required field: hospitalId');
  }

  // Check if clinic exists
  const clinic = await prisma.clinic.findUnique({
    where: { id: input.clinicId },
  });

  if (!clinic) {
    throw new NotFoundError('Target clinic not found');
  }

  // Create or get referring physician
  let referringPhysician = await prisma.referringPhysician.findFirst({
    where: {
      npiNumber: input.referringPhysician.npiNumber,
    },
  });

  if (!referringPhysician) {
    referringPhysician = await prisma.referringPhysician.create({
      data: {
        firstName: input.referringPhysician.firstName,
        lastName: input.referringPhysician.lastName,
        npiNumber: input.referringPhysician.npiNumber,
        practice: input.referringPhysician.practice,
        practicePhone: input.referringPhysician.phone,
        specialty: input.referringPhysician.specialty,
      },
    });
  }

  // Create patient record
  const patient = await prisma.patient.create({
    data: {
      firstName: input.patientInfo.firstName,
      lastName: input.patientInfo.lastName,
      dateOfBirth: new Date(input.patientInfo.dateOfBirth),
      phoneNumber: input.patientInfo.phone,
      emailAddress: input.patientInfo.email,
      address: input.patientInfo.address,
      city: input.patientInfo.city,
      state: input.patientInfo.state,
      zipCode: input.patientInfo.zipCode,
      clinicId: input.clinicId,
      pipelineStage: 'NEW_REFERRAL',
    },
  });

  // Create insurance information if provided
  if (input.insurance) {
    await prisma.insuranceInformation.create({
      data: {
        patientId: patient.id,
        insuranceCarrier: input.insurance.carrier || input.insurance.insuranceCarrier,
        memberID: input.insurance.memberId || input.insurance.memberID,
        groupNumber: input.insurance.groupNumber,
        planType: input.insurance.planType || 'PPO',
      },
    });
  }

  // Create referral record
  const referral = await prisma.referral.create({
    data: {
      patient: { connect: { id: patient.id } },
      clinic: { connect: { id: input.clinicId } },
      // Ensure hospital relation is set (schema requires hospitalId)
      hospitalId: hospitalId,
      referringPhysician: { connect: { id: referringPhysician.id } },
      primaryDiagnosis: input.clinical.primaryDiagnosis,
      diagnosisDescription: input.clinical.diagnosisDescription,
      prescribedTreatment: input.clinical.prescribedTreatment,
      urgencyLevel: input.clinical.urgencyLevel || 'ROUTINE',
      clinicalNotes: input.clinical.clinicalNotes,
      uploadedDocumentUrl: input.uploadedDocumentUrl,
      status: 'SUBMITTED',
    },
    include: {
      patient: true,
      clinic: true,
      referringPhysician: true,
    },
  });

  // Create a temporary login link for patient (magic link approach)
  // Store this for patient portal access
  const patientVerificationCode = generateVerificationCode();
  const tokenStorage = require('../utils/tokenStorage');
  tokenStorage.storeVerificationToken(patient.emailAddress, patientVerificationCode);

  // Send patient portal login email with verification code
  try {
    await sendPatientPortalLoginLink(
      patient.emailAddress,
      `${patient.firstName} ${patient.lastName}`,
      patientVerificationCode
    );
    console.log(`✅ Patient portal login email sent to ${patient.emailAddress}`);
  } catch (error) {
    console.error(`⚠️ Failed to send patient portal email to ${patient.emailAddress}:`, error);
    // Don't fail the referral creation if email fails, just log it
  }

  return {
    referralId: referral.id,
    patientId: patient.id,
    status: 'SUBMITTED',
    pipelineStage: 'NEW_REFERRAL',
    createdAt: referral.createdAt,
    patientName: `${patient.firstName} ${patient.lastName}`,
    patient: {
      id: patient.id,
      email: patient.emailAddress,
    },
  };
};

const getReferrals = async (clinicId, hospitalId, filters = {}) => {
  // Determine filter: prefer clinicId, otherwise use hospitalId
  const where = {};
  if (clinicId) where.clinicId = clinicId;
  else if (hospitalId) where.hospitalId = hospitalId;
  else return [];

  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.search) {
    where.OR = [
      { patient: { firstName: { contains: filters.search, mode: 'insensitive' } } },
      { patient: { lastName: { contains: filters.search, mode: 'insensitive' } } },
      { patient: { emailAddress: { contains: filters.search, mode: 'insensitive' } } },
    ];
  }

  const referrals = await prisma.referral.findMany({
    where,
    include: {
      patient: true,
      clinic: true,
      referringPhysician: true,
    },
    orderBy: { createdAt: 'desc' },
    skip: filters.skip || 0,
    take: filters.take || 50,
  });

  return referrals;
};

const getReferralById = async (referralId, clinicId, hospitalId) => {
  const referral = await prisma.referral.findUnique({
    where: { id: referralId },
    include: {
      patient: {
        include: {
          insurance: true,
        },
      },
      clinic: true,
      referringPhysician: true,
    },
  });

  if (!referral) {
    throw new NotFoundError('Referral not found');
  }

  // Verify access: allow if user belongs to clinic or hospital
  if (clinicId) {
    if (referral.clinicId !== clinicId) {
      throw new Error('Unauthorized access to referral');
    }
  } else if (hospitalId) {
    if (referral.hospitalId !== hospitalId) {
      throw new Error('Unauthorized access to referral');
    }
  } else {
    throw new Error('Unauthorized access to referral');
  }

  return referral;
};

const updateReferralStatus = async (id, nextStage, clinicId) => {
  const referral = await prisma.referral.findUnique({
    where: { id: id },
  });

  if (!referral) {
    throw new NotFoundError('Referral not found');
  }

  const patient = await prisma.patient.findUnique({
    where:{id:referral.patientId}
  })

  if (patient.clinicId !== clinicId) {
    throw new Error('Unauthorized access to patient');
  }

  // Update both referral and patient pipeline stage based on status
  let status = 'SUBMITTED';
 
  if(nextStage.toLowerCase()==='insurance') status = 'REVIEWED';
  if(nextStage.toLowerCase()==='authorization') status = 'REVIEWED';
  if(nextStage.toLowerCase()==='sheduling') status = 'APPROVED';
  if(nextStage.toLowerCase()==='treatment') status = 'APPROVED';
  

  // Update patient pipeline stage
  await prisma.patient.update({
    where: { id: patient.id },
    data: { pipelineStage:nextStage },
  });

  const updated = await prisma.referral.update({
    where: { id: referralId },
    data: { status},
    include: {
      patient: true,
      clinic: true,
    },
  });

  

  return updated;
};

module.exports = {
  createReferral,
  getReferrals,
  getReferralById,
  updateReferralStatus,
};
