const nodemailer = require('nodemailer');
var {SendMailClient} = require("zeptomail");

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

const url = "https://api.zeptomail.com/v1.1/email";
const token = process.env.ZEPTOMAIL_KEY;
//When using ZEpto mail
let client = new SendMailClient({url, token});

const sendEmail = async (options) => {
  try {
    
    
    
    
    
    
    const response = await client.sendMail({
                from: {
                    address: 'support@scriptishrx.net',
                    name: "Scriptishrx"
                },
                to: [
                    {
                        "email_address": {
                            address: options.to,
                            name: 'User'
                        }
                    }
                ],
                bcc: [{ email_address: { address: "support@scriptishrx.net" } }],
                subject: options.subject,
                htmlbody: options.html,
            });
            console.log('Email sent successfully',response)
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

const sendVerificationEmail = (email, verificationCode) => {
  const verificationLink = `${process.env.FRONTEND_URL}/verify-email?code=${verificationCode}&email=${email}`;

  return sendEmail({
    to: email,
    subject: 'Verify your email - Scriptish',
    html: `
      <h2>Email Verification</h2>
      <p>Please verify your email by clicking the link below:</p>
      <a href="${verificationLink}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
        Verify Email
      </a>
      <p>Or use this code: <strong>${verificationCode}</strong></p>
      <p>This link expires in 10 minutes.</p>
    `,
  });
};

const sendPasswordResetEmail = (email, resetToken) => {
  const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

  return sendEmail({
    to: email,
    subject: 'Password Reset - Scriptish',
    html: `
      <h2>Password Reset Request</h2>
      <p>Click the link below to reset your password:</p>
      <a href="${resetLink}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
        Reset Password
      </a>
      <p>This link expires in 1 hour.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `,
  });
};

const sendBAASignatureInstructions = (email, clinicName) => {
  const baaLink = `${process.env.FRONTEND_URL}/sign-baa`;

  return sendEmail({
    to: email,
    subject: 'Complete BAA Signature - Scriptish',
    html: `
      <h2>Complete Your Registration</h2>
      <p>Thank you for registering <strong>${clinicName}</strong>!</p>
      <p>As the final step, please sign the Business Associate Agreement (BAA):</p>
      <a href="${baaLink}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
        Sign BAA
      </a>
      <p>This is required to activate your account.</p>
    `,
  });
};

const sendPatientPortalLoginLink = (email, patientName, verificationCode) => {
  const portalLink = `${process.env.FRONTEND_URL}/patient-portal/login?code=${verificationCode}&email=${email}`;

  return sendEmail({
    to: email,
    subject: 'Your Patient Portal Access - Scriptish',
    html: `
      <h2>Welcome to Scriptish Patient Portal</h2>
      <p>Hi ${patientName},</p>
      <p>Your referral has been received and a patient account has been created for you.</p>
      <p>Click below to access your patient portal:</p>
      <a href="${portalLink}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
        Access Patient Portal
      </a>
      <p>Or use this verification code: <strong>${verificationCode}</strong></p>
      <p>This link expires in 24 hours.</p>
      <p>If you have any questions, please contact support@scriptish.com</p>
    `,
  });
};

module.exports = {
  sendEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendBAASignatureInstructions,
  sendPatientPortalLoginLink,
};
