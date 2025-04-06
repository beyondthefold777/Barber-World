const express = require('express');
const router = express.Router();
const stripeController = require('../controllers/stripeController');
const authMiddleware = require('../middleware/auth');

// Public routes
router.post('/create-trial', stripeController.createTrialSubscription);

// Protected routes (require authentication)
router.get('/subscription', authMiddleware, stripeController.getSubscriptionStatus);
router.post('/subscription/cancel', authMiddleware, stripeController.cancelSubscription);
router.post('/subscription/resume', authMiddleware, stripeController.resumeSubscription);
router.post('/payment-method/update', authMiddleware, stripeController.updatePaymentMethod);

module.exports = router;
