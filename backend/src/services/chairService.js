const prisma = require('../db/client');
const crypto = require('crypto');
const { sendEmail } = require('../utils/email');
const { sendSMS } = require('../utils/sms');

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
        orderBy: {
          createdAt: 'desc',
        },
      });
      return chairs;
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
      });
      if (!chair) {
        throw new Error('Infusion chair not found');
      }
      return chair;
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
      // Validate the required fields
      const { chairNumber } = chairData;

    

      // Generate a random 8-character password (alphanumeric)
      // const generateRandomPassword = (length = 8) => {
      //   const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      //   let pw = '';
      //   const bytes = crypto.randomBytes(length);
      //   for (let i = 0; i < length; i++) {
      //     pw += chars[bytes[i] % chars.length];
      //   }
      //   return pw;
      // };

      // const plainPassword = generateRandomPassword(8);
      // console.log('The chair password is',plainPassword)

      const chair = await prisma.infusionChair.create({
        data: {
          clinicId,
          chairNumber,
          status: 'ACTIVE',
        },
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
        
        await sendSMS(chairNumber, message);
      } catch (e) {
        console.error('Failed to send chair account SMS:', e);
      }

      return chair;
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
        orderBy: {
          createdAt: 'asc',
        },
      });

      return chairs;
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
