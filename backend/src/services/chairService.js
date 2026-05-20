const prisma = require('../db/client');
const crypto = require('crypto');
const { sendEmail } = require('../utils/email');
const { sendSMS } = require('../utils/sms');
const dayjs = require('dayjs');
const { getTimezoneForState, convertUTCToClinicTime } = require('../utils/timezone');

const chairWithRelationsInclude = {
  patient: {
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      referrals: {
        where: { status: { in: ['SUBMITTED', 'REVIEWED', 'APPROVED'] } },
        orderBy: { createdAt: 'desc' },
        take: 1,
        select: {
          id: true,
          prescribedTreatment: true,
          primaryDiagnosis: true,
        },
      },
      appointments: {
        orderBy: { scheduledStartTime: 'desc' },
        take: 5,
        select: {
          id: true,
          appointmentType: true,
          scheduledDate: true,
          scheduledStartTime: true,
          scheduledEndTime: true,
          status: true,
          treatmentType: true,
        },
      },
    },
  },
  user: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      role: true,
    },
  },
};

const ACTIVE_APPOINTMENT_STATUSES = ['SCHEDULED', 'CONFIRMED', 'IN_PROGRESS'];

function displayName(firstName, lastName, fallback = '') {
  const name = [firstName, lastName].filter(Boolean).join(' ').trim();
  return name || fallback;
}

function pickPatientAppointment(appointments) {
  if (!appointments?.length) return null;

  const now = new Date();
  const upcoming = appointments
    .filter(
      (apt) =>
        ACTIVE_APPOINTMENT_STATUSES.includes(apt.status) &&
        new Date(apt.scheduledStartTime) >= now
    )
    .sort((a, b) => new Date(a.scheduledStartTime) - new Date(b.scheduledStartTime));

  if (upcoming.length > 0) return upcoming[0];
  return appointments[0];
}

function formatChairForResponse(chair) {
  if (!chair) return chair;

  const referral = chair.patient?.referrals?.[0];
  const appointment = pickPatientAppointment(chair.patient?.appointments);

  const patient = chair.patient
    ? {
        id: chair.patient.id,
        firstName: chair.patient.firstName,
        lastName: chair.patient.lastName,
        pipelineStage: chair.patient.pipelineStage,
        prescribedTreatment: referral?.prescribedTreatment ?? null,
        primaryDiagnosis: referral?.primaryDiagnosis ?? null,
        user: chair.patient.user ?? null,
        appointment,
      }
    : null;

  return {
    id: chair.id,
    clinicId: chair.clinicId,
    chairNumber: chair.chairNumber,
    status: chair.status,
    createdAt: chair.createdAt,
    updatedAt: chair.updatedAt,
    user: chair.user ?? null,
    staffName: chair.user ? displayName(chair.user.firstName, chair.user.lastName) : null,
    patient,
  };
}

class ChairService {
  /**
   * Get all infusion chairs for a clinic
   * @param {string} clinicId - The clinic ID
   * @returns {Promise<Array>} - Array of infusion chairs
   */
  static async getChairsByClinic(clinicId) {
    try {
      const chairs = await prisma.infusionChair.findMany({
        where: {
          clinicId: clinicId,
        },
        include: chairWithRelationsInclude,
        orderBy: {
          createdAt: 'desc',
        },
      });
      return chairs.map(formatChairForResponse);
    } catch (error) {
      throw new Error(`Failed to fetch infusion chairs: ${error.message}`);
    }
  }

  /**
   * Get a single infusion chair by ID
   * @param {string} chairId - The chair ID
   * @returns {Promise<Object>} - The infusion chair object
   */
  static async getChairById(chairId) {
    try {
      const chair = await prisma.infusionChair.findUnique({
        where: {
          id: chairId,
        },
        include: chairWithRelationsInclude,
      });
      if (!chair) {
        throw new Error('Infusion chair not found');
      }
      return formatChairForResponse(chair);
    } catch (error) {
      throw new Error(`Failed to fetch infusion chair: ${error.message}`);
    }
  }

  /**
   * Create a new infusion chair
   * @param {string} clinicId - The clinic ID
   * @param {Object} chairData - The chair data
   * @returns {Promise<Object>} - The created infusion chair
   */
  static async createChair(clinicId, chairData) {
    try {
      const { chairNumber, patientId, userId } = chairData;

      if (!chairNumber?.trim()) {
        throw new Error('Chair number is required');
      }

      if (patientId) {
        const patient = await prisma.patient.findUnique({ where: { id: patientId } });
        if (!patient) {
          throw new Error('Patient not found');
        }
        if (patient.clinicId !== clinicId) {
          throw new Error('Patient does not belong to this clinic');
        }
        if (patient.infusionChairId) {
          throw new Error('Patient is already assigned to another chair');
        }
      }

      if (userId) {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
          throw new Error('User not found');
        }
        if (user.clinicId !== clinicId) {
          throw new Error('User does not belong to this clinic');
        }
      }

      const chair = await prisma.$transaction(async (tx) => {
        const created = await tx.infusionChair.create({
          data: {
            clinicId,
            chairNumber: chairNumber.trim(),
            status: 'ACTIVE',
            ...(userId ? { userId } : {}),
          },
        });

        if (patientId) {
          await tx.patient.update({
            where: { id: patientId },
            data: { infusionChairId: created.id },
          });
        }

        return tx.infusionChair.findUnique({
          where: { id: created.id },
          include: chairWithRelationsInclude,
        });
      });

      // Try to fetch clinic name for email context
      let clinic = null;
      try {
        clinic = await prisma.clinic.findUnique({ where: { id: clinicId } });
      } catch (e) {
        // ignore
      }

      // Send account creation SMS (do not block on failure)
      try {
        const clinicName = clinic?.name || 'Your Clinic';
        const message = `Hello! Your infusion chair account has been created at ${clinicName}. Chair Number: ${chairNumber}. Please log in to the system to get started.`;
        console.log('sending SMS to',chairNumber)
        console.log('SMS message is',message)
        await sendSMS(chairNumber, message);
        console.log('SMS sent succcessfully')
      } catch (e) {
        console.error('Failed to send chair account SMS:', e);
      }

      return formatChairForResponse(chair);
    } catch (error) {
      throw new Error(`Failed to create infusion chair: ${error.message}`);
    }
  }

  /**
   * Update an infusion chair
   * @param {string} chairId - The chair ID
   * @param {Object} updateData - The data to update
   * @returns {Promise<Object>} - The updated infusion chair
   */
  static async updateChair(chairId, updateData) {
    try {
      const chair = await prisma.infusionChair.update({
        where: {
          id: chairId,
        },
        data: updateData,
      });

      return chair;
    } catch (error) {
      throw new Error(`Failed to update infusion chair: ${error.message}`);
    }
  }

  /**
   * Delete an infusion chair
   * @param {string} chairId - The chair ID
   * @returns {Promise<Object>} - The deleted infusion chair
   */
  static async deleteChair(chairId) {
    try {
      const chair = await prisma.infusionChair.delete({
        where: {
          id: chairId,
        },
      });

      return chair;
    } catch (error) {
      throw new Error(`Failed to delete infusion chair: ${error.message}`);
    }
  }

  /**
   * Archive an infusion chair (soft delete)
   * @param {string} chairId - The chair ID
   * @returns {Promise<Object>} - The archived infusion chair
   */
  static async archiveChair(chairId) {
    try {
      const chair = await prisma.infusionChair.update({
        where: {
          id: chairId,
        },
        data: {
          status: 'ARCHIVED',
        },
      });

      return chair;
    } catch (error) {
      throw new Error(`Failed to archive infusion chair: ${error.message}`);
    }
  }

  /**
   * Get infusion chairs with patients assigned to them
   * @param {string} clinicId - The clinic ID
   * @returns {Promise<Array>} - Array of chairs with their patients
   */
  static async getChairsWithPatients(clinicId) {
    try {
      // This would require additional fields or relationships in the Appointment model
      // For now, we'll get all chairs and can enhance later
      const chairs = await prisma.infusionChair.findMany({
        where: {
          clinicId: clinicId,
          status: 'ACTIVE',
        },
        include: chairWithRelationsInclude,
        orderBy: {
          createdAt: 'asc',
        },
      });

      return chairs.map(formatChairForResponse);
    } catch (error) {
      throw new Error(`Failed to fetch chairs with patients: ${error.message}`);
    }
  }

  /**
   * Tag an infusion chair to a patient
   * @param {string} patientId - The patient ID
   * @param {string} chairId - The chair ID
   * @returns {Promise<Object>} - The updated patient object
   */
  static async tagChairToPatient(patientId, chairId) {
    try {
      // Verify chair exists
      const chair = await prisma.infusionChair.findUnique({
        where: { id: chairId },
      });
      if (!chair) {
        throw new Error('Infusion chair not found');
      }

      // Verify patient exists
      const patient = await prisma.patient.findUnique({
        where: { id: patientId },
        include: { infusionChair: true },
      });
      if (!patient) {
        throw new Error('Patient not found');
      }
      const clinic = await prisma.clinic.findUnique({
        where:{id:patient.clinicId}
      });

      console.log('Clinic fetched successfully for this patient to bind chair')

      const clinicAddress = clinic.streetAddress;
      const clinicState = clinic.state;
      const clinicName = clinic.name;
      const clinicPhoneNumber = clinic.primaryPhone;
      const clinicTimezone = getTimezoneForState(clinic.state);
      
      const appointment = await prisma.appointment.findFirst({
        where: { patientId: patient.id }
      });

      console.log('Appointment fetched for this patient', appointment);

      const aptType = appointment.appointmentType;
      
      // Convert UTC times to clinic's local timezone
      const scheduledDateLocal = convertUTCToClinicTime(appointment.scheduledDate, clinicTimezone);
      const scheduleStartTimeLocal = convertUTCToClinicTime(appointment.scheduledStartTime, clinicTimezone);
      
      // Handle case where endTime might be null - calculate as 1 hour after start time in UTC
      let scheduleEndTimeLocal;
      if (appointment.scheduledEndTime) {
        scheduleEndTimeLocal = convertUTCToClinicTime(appointment.scheduledEndTime, clinicTimezone);
      } else {
        // Add 1 hour (3600000 ms) to UTC start time, then convert to local timezone
        const endTimeUTC = new Date(appointment.scheduledStartTime.getTime() + 3600000);
        scheduleEndTimeLocal = convertUTCToClinicTime(endTimeUTC, clinicTimezone);
      }
      
      const scheduleDate = dayjs(scheduledDateLocal).format('MMM DD, YYYY hh:mm A');
      const startingTime = dayjs(scheduleStartTimeLocal).format('MMM DD, YYYY hh:mm A');
      const scheduleEndTime = dayjs(scheduleEndTimeLocal).format('MMM DD, YYYY hh:mm A');

      // Debug logging
      console.log('DEBUG chairService - tagChairToPatient:');
      console.log('  scheduleStartTimeLocal:', scheduleStartTimeLocal);
      console.log('  scheduleEndTimeLocal:', scheduleEndTimeLocal);
      console.log('  startingTime (formatted):', startingTime);
      console.log('  scheduleEndTime (formatted):', scheduleEndTime);
      console.log('  appointment.scheduledStartTime (UTC):', appointment.scheduledStartTime);
      console.log('  appointment.scheduledEndTime (UTC):', appointment.scheduledEndTime);


      // Verify chair belongs to the same clinic as the patient
      if (chair.clinicId !== patient.clinicId) {
        throw new Error('Chair does not belong to the patient\'s clinic');
      }

      // Update patient with tagged chair
      const updatedPatient = await prisma.patient.update({
        where: { id: patientId },
        data: {
          infusionChairId: chairId,
        },
        include: { infusionChair: true },
      });

      //Send message to patient:
const to = patient.phoneNumber;
const patientName = patient.lastName
const message = `Hello ${patientName}, you are now scheduled for ${aptType} at ${clinicName}. Starts: ${startingTime}, and Ends: ${scheduleEndTime}. Please ensure to be present on time. Call ${clinicPhoneNumber} for more info. Address: ${clinicAddress}, ${clinicState}`
const smsSent = await sendSMS(to,message);
console.log('SMS sent successfully to the patient:',smsSent)
      return updatedPatient;
    } catch (error) {
      throw new Error(`Failed to tag chair to patient: ${error.message}`);
    }
  }

  /**
   * Get the tagged infusion chair for a patient
   * @param {string} patientId - The patient ID
   * @returns {Promise<Object|null>} - The infusion chair or null if none tagged
   */
  static async getTaggedChairForPatient(patientId) {
    try {
      const patient = await prisma.patient.findUnique({
        where: { id: patientId },
        include: { infusionChair: true },
      });

      if (!patient) {
        throw new Error('Patient not found');
      }

      return patient.infusionChair || null;
    } catch (error) {
      throw new Error(`Failed to fetch tagged chair for patient: ${error.message}`);
    }
  }
}

module.exports = ChairService;
