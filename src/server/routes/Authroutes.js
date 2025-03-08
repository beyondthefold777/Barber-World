const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validateRegistration } = require('../middleware/validation');

// Unified login route
router.post('/login', authController.login);

// Client Routes
router.post('/client/register', 
  validateRegistration(['email', 'password', 'username', 'phoneNumber']), 
  authController.registerClient
);

// Barbershop Routes
router.post('/barbershop/register', 
  validateRegistration(['email', 'password', 'businessName']), 
  authController.registerBarbershop
);

// Main Barbershop Routes
router.post('/main-barbershop/register', 
  validateRegistration(['email', 'password', 'businessName', 'adminCode']), 
  authController.registerMainBarbershop
);

// Password Reset Routes
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

// Verification Routes
router.post('/verify-email', authController.verifyEmail);
router.post('/resend-verification', authController.resendVerification);

module.exports = router;