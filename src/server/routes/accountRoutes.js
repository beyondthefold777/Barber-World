const express = require('express');
const router = express.Router();
const accountController = require('../controllers/accountController');
const auth = require('../middleware/auth');

// All routes require authentication
router.use(auth);

// Get user profile
router.get('/profile', accountController.getProfile);

// Update user profile
router.put('/profile', accountController.updateProfile);

// Change password
router.post('/change-password', accountController.changePassword);

// Update notification settings
router.put('/notifications', accountController.updateNotificationSettings);

// Delete account
router.delete('/', accountController.deleteAccount);

module.exports = router;
