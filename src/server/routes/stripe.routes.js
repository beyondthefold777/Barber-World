const express = require('express');
const router = express.Router();
const stripeController = require('../controllers/stripeController');
const authMiddleware = require('../middleware/auth');

// Public routes
router.post('/create-trial', stripeController.createTrial);

// Protected routes (require authentication)
router.get('/subscription', authMiddleware, stripeController.getSubscription);
router.post('/subscription/cancel', authMiddleware, stripeController.cancelSubscription);
router.post('/create-payment-intent', authMiddleware, stripeController.createPaymentIntent);

module.exports = router;
