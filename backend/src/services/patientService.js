
const prisma = require('../db/client')
const fetchAllPatients= async(clinicId)=>{
const patients = await prisma.patient.findMany({
    where:{clinicId}
});
return patients;
}

  //fetch patient by patient id

const fetchPatientById = async(patientId)=>{
    const patient = await prisma.patient.findUnique({
      where:{id:patientId}
    })

    console.log('Patient fetched by id successfully')
    return patient
  }

  

const fetchPatientsByChairId = async(chairId) => {
  const patients = await prisma.patient.findMany({
    where: { infusionChairId: chairId },
    include: { 
      infusionChair: true,
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      referrals: {
        include: {
          referringPhysician: true,
        },
        where: { status: { in: ['SUBMITTED', 'REVIEWED', 'APPROVED'] } },
        take: 1,
      }
    },
  });
  

  
  // Flatten referral data into patient object
  return patients.map(patient => {
    const referral = patient.referrals?.[0];
    const physician = referral?.referringPhysician || {};
    return {
      ...patient,
      primaryDiagnosis: referral?.primaryDiagnosis,
      prescribedTreatment: referral?.prescribedTreatment,
      urgencyLevel: referral?.urgencyLevel,
      clinicalNotes: referral?.clinicalNotes,
      referringPhysician: `${physician.firstName || ''} ${physician.lastName || ''}`.trim(),
      _referral: referral,
    };
  });
}

const updatePatient = async(patientId, updateData) => {
  try {
    const patient = await prisma.patient.update({
      where: { id: patientId },
      data: {
        firstName: updateData.firstName,
        lastName: updateData.lastName,
        dateOfBirth: updateData.dateOfBirth ? new Date(updateData.dateOfBirth) : undefined,
        phoneNumber: updateData.phoneNumber,
        emailAddress: updateData.emailAddress,
        address: updateData.address,
        city: updateData.city,
        state: updateData.state,
        zipCode: updateData.zipCode,
      },
    });
    return patient;
  } catch (error) {
    console.error('Error updating patient:', error);
    throw error;
  }
}

module.exports={fetchAllPatients, fetchPatientsByChairId, fetchPatientById, updatePatient}