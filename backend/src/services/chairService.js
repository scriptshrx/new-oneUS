const { prisma } = require('../db/client');

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
      // Validate required fields
      const { name, email, specialty, operatingAddress, city, state, zipCode } = chairData;

      if (!name || !email || !specialty || !operatingAddress || !city || !state || !zipCode) {
        throw new Error('Missing required fields');
      }

      const chair = await prisma.infusionChair.create({
        data: {
          clinicId,
          name,
          email,
          specialty,
          operatingAddress,
          city,
          state,
          zipCode,
          status: 'ACTIVE',
        },
      });

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
          name: 'asc',
        },
      });

      return chairs;
    } catch (error) {
      throw new Error(`Failed to fetch chairs with patients: ${error.message}`);
    }
  }
}

module.exports = ChairService;
