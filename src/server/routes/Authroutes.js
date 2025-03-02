const express = require('express');
const router = express.Router();

// Import controllers (we'll create these next)
const authController = require('../controllers/authController');

// Client Routes
router.post('/client/register', authController.registerClient);
router.post('/client/login', authController.loginClient);

// Barbershop Routes
router.post('/barbershop/register', authController.registerBarbershop);
router.post('/barbershop/login', authController.loginBarbershop);

// Main Barbershop Routes
router.post('/main-barbershop/register', authController.registerMainBarbershop);
router.post('/main-barbershop/login', authController.loginMainBarbershop);

// Password Reset Routes
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

// Verification Routes
router.post('/verify-email', authController.verifyEmail);
router.post('/resend-verification', authController.resendVerification);

module.exports = router;