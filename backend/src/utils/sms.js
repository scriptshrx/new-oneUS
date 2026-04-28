const twilio = require('twilio');

// Initialize Twilio client
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

/**
 * Send SMS message using Twilio
 * @param {string} to - Recipient phone number (E.164 format, e.g., +1234567890)
 * @param {string} message - Message body
 * @returns {Promise<Object>} - Twilio responses
 */
const sendSMS = async (to, message) => {
  try {
    if (!process.env.TWILIO_PHONE_NUMBER) {
      throw new Error('TWILIO_PHONE_NUMBER not configured');
    }

    if (!to) {
      throw new Error('Recipient phone number is required');
    }

    const response = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: to,
    });

    console.log('SMS sent successfully:', response.sid);
    return response;
  } catch (error) {
    console.error('Error sending SMS:', error);
    throw error;
  }
};

module.exports = { sendSMS };
