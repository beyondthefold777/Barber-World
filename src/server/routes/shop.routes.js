const express = require('express');
const router = express.Router();
const shopController = require('../controllers/shopController');
const authMiddleware = require('../middleware/auth');

// Debug logging to confirm routes are loaded
console.log('Shop routes file loaded successfully');

// Shop routes
router.post('/create', authMiddleware, (req, res, next) => {
  console.log('Create shop route hit');
  shopController.createShop(req, res, next);
});

router.get('/', authMiddleware, (req, res, next) => {
  console.log('Get shop route hit');
  shopController.getShop(req, res, next);
});

router.put('/update', authMiddleware, (req, res, next) => {
  console.log('Update shop route hit');
  shopController.updateShop(req, res, next);
});

// Image routes
router.post('/upload-image', authMiddleware, (req, res, next) => {
  console.log('Upload image route hit');
  console.log('Controller method exists:', typeof shopController.uploadImage === 'function');
  shopController.uploadImage(req, res, next);
});

router.get('/images', authMiddleware, (req, res, next) => {
  console.log('Get images route hit');
  shopController.getShopImages(req, res, next);
});

router.delete('/images/:imageId', authMiddleware, (req, res, next) => {
  console.log('Delete image route hit');
  shopController.deleteImage(req, res, next);
});

// Service routes
router.post('/services', authMiddleware, (req, res, next) => {
  console.log('Add service route hit');
  shopController.addService(req, res, next);
});

router.delete('/services/:serviceId', authMiddleware, (req, res, next) => {
  console.log('Remove service route hit');
  shopController.removeService(req, res, next);
});

// Review routes
router.post('/:shopId/reviews', authMiddleware, (req, res, next) => {
  console.log('Add review route hit');
  shopController.addReview(req, res, next);
});

// Debug logging for the imported controller
console.log('shopController methods:', Object.keys(shopController));

module.exports = router;