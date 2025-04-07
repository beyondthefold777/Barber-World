// routes/stripe.routes.js
const express = require('express');
const router = express.Router();
const stripeController = require('../controllers/stripeController');
const authMiddleware = require('../middleware/auth');

// Public routes
router.post('/create-checkout-session', stripeController.createCheckoutSession);
router.get('/subscription-success', stripeController.handleSubscriptionSuccess);
router.post('/webhook', express.raw({ type: 'application/json' }), stripeController.handleWebhook);

// Add the new create-trial endpoint
router.post('/create-trial', stripeController.createTrial);

// Protected routes
router.get('/subscription/:userId', authMiddleware, stripeController.getSubscription);
router.post('/cancel-subscription/:userId', authMiddleware, stripeController.cancelSubscription);
router.post('/reactivate-subscription/:userId', authMiddleware, stripeController.reactivateSubscription);

module.exports = router;
