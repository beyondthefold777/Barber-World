const nodemailer = require('nodemailer');
const config = require('../config/config');

const transporter = nodemailer.createTransport({
  service: config.emailService,
  auth: {
    user: config.emailUser,
    pass: config.emailPassword
  }
});

const emailService = {
  sendVerificationEmail: async (user, token) => {
    const verificationUrl = `${config.frontendUrl}/verify-email?token=${token}`;
    
    const mailOptions = {
      from: config.emailUser,
      to: user.email,
      subject: 'Email Verification - Barber World',
      html: `
        <h1>Verify Your Email</h1>
        <p>Hello ${user.username || user.businessName || 'there'},</p>
        <p>Please click the link below to verify your email address:</p>
        <a href="${verificationUrl}">Verify Email</a>
        <p>This link will expire in 24 hours.</p>
        <p>If you did not create an account, please ignore this email.</p>
      `
    };
    
    return transporter.sendMail(mailOptions);
  },
  
  sendPasswordResetEmail: async (user, token) => {
    const resetUrl = `${config.frontendUrl}/reset-password?token=${token}`;
    
    const mailOptions = {
      from: config.emailUser,
      to: user.email,
      subject: 'Password Reset - Barber World',
      html: `
        <h1>Reset Your Password</h1>
        <p>Hello ${user.username || user.businessName || 'there'},</p>
        <p>Please click the link below to reset your password:</p>
        <a href="${resetUrl}">Reset Password</a>
        <p>This link will expire in 1 hour.</p>
        <p>If you did not request a password reset, please ignore this email.</p>
      `
    };
    
    return transporter.sendMail(mailOptions);
  }
};

module.exports = emailService;