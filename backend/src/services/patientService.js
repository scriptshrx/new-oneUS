
const prisma = require('../db/client')
const fetchAllPatients= async(clinicId)=>{
const patients = await prisma.patient.findMany({
    where:{clinicId}
});
return patients;
}

const fetchPatientById = async(patientId)=>{
    const patient = await prisma.patient.findUnique({
      where:{id:patientId}
    })

    console.log('Patient fetched by id successfully')
    return patient
  }

    //fetch patient by patient id


const fetchPatientsByChairId = async(chairId) => {
  const patients = await prisma.patient.findMany({
    where: { infusionChairId: chairId },
    include: { 
      infusionChair: true,
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

module.exports={fetchAllPatients, fetchPatientsByChairId, fetchPatientById}