const User = require('../models/User');
const jwt = require('jsonwebtoken');
const config = require('../config/config');
const emailService = require('../services/emailService');

const emailController = {
  // Generate verification token
  generateVerificationToken: (userId) => {
    return jwt.sign(
      { userId },
      config.jwtSecret,
      { expiresIn: '24h' }
    );
  },
  
  // Send verification email
  sendVerificationEmail: async (req, res) => {
    try {
      const { userId } = req.body;
      
      if (!userId) {
        return res.status(400).json({ success: false, message: 'User ID is required' });
      }
      
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      
      if (user.isEmailVerified) {
        return res.status(400).json({ success: false, message: 'Email already verified' });
      }
      
      const token = emailController.generateVerificationToken(user._id);
      await emailService.sendVerificationEmail(user, token);
      
      return res.status(200).json({ success: true, message: 'Verification email sent' });
    } catch (error) {
      console.error('Error sending verification email:', error);
      return res.status(500).json({ success: false, message: 'Failed to send verification email' });
    }
  },
  
  // Verify email with token
  verifyEmail: async (req, res) => {
    try {
      const { token } = req.body;
      
      if (!token) {
        return res.status(400).json({ success: false, message: 'Verification token is required' });
      }
      
      const decoded = jwt.verify(token, config.jwtSecret);
      const user = await User.findById(decoded.userId);
      
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      
      if (user.isEmailVerified) {
        return res.status(400).json({ success: false, message: 'Email already verified' });
      }
      
      user.isEmailVerified = true;
      await user.save();
      
      return res.status(200).json({ success: true, message: 'Email verified successfully' });
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ success: false, message: 'Verification token has expired' });
      }
      
      console.error('Error verifying email:', error);
      return res.status(500).json({ success: false, message: 'Failed to verify email' });
    }
  },
  
  // Request password reset
  requestPasswordReset: async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ success: false, message: 'Email is required' });
      }
      
      const user = await User.findOne({ email });
      if (!user) {
        // For security reasons, don't reveal that the email doesn't exist
        return res.status(200).json({ success: true, message: 'If your email exists in our system, you will receive a password reset link' });
      }
      
      const token = jwt.sign(
        { userId: user._id },
        config.jwtSecret,
        { expiresIn: '1h' }
      );
      
      await emailService.sendPasswordResetEmail(user, token);
      
      return res.status(200).json({ success: true, message: 'Password reset email sent' });
    } catch (error) {
      console.error('Error requesting password reset:', error);
      return res.status(500).json({ success: false, message: 'Failed to process password reset request' });
    }
  }
};

module.exports = emailController;
