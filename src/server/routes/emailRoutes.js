const express = require('express');
const router = express.Router();
const emailController = require('../controllers/emailController');
const auth = require('../middleware/auth');

// Send verification email
router.post('/send-verification', auth, emailController.sendVerificationEmail);

// Verify email with token
router.post('/verify', emailController.verifyEmail);

// Request password reset
router.post('/request-reset', emailController.requestPasswordReset);

module.exports = router;
