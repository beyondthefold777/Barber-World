const express = require('express');
const router = express.Router();
const shopController = require('../controllers/shopController');
const authMiddleware = require('../middleware/auth');

// Debug logging to confirm routes are loaded
console.log('Shop routes file loaded successfully');

// IMPORTANT: Order matters! More specific routes should come first

// Add the direct location search route
router.get('/location-search', (req, res) => {
  console.log('Router: Location search route hit with query:', req.query);
  try {
    const { location, state } = req.query;
    
    // Use the Shop model with the correct file path
    const Shop = require('../models/shop.model');
    
    let query = {};
    
    if (location) {
      query.$or = [
        { 'location.city': { $regex: location.trim(), $options: 'i' } },
        { 'location.address': { $regex: location.trim(), $options: 'i' } }
      ];
    }
    
    if (state) {
      query['location.state'] = { $regex: state.trim(), $options: 'i' };
    }
    
    console.log('Router: Direct location search query:', JSON.stringify(query));
    
    Shop.find(query)
      .populate('userId', 'firstName lastName email')
      .then(shops => {
        console.log(`Router: Found ${shops.length} shops matching location criteria`);
        res.status(200).json({
          success: true,
          count: shops.length,
          shops: shops
        });
      })
      .catch(err => {
        console.error('Router: Error in direct location search:', err);
        res.status(500).json({ 
          success: false, 
          message: 'Error searching shops by location' 
        });
      });
  } catch (error) {
    console.error('Router: Exception in location search route:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error in location search' 
    });
  }
});

// Get all shops (public route - no auth required)
router.get('/all', (req, res, next) => {
  console.log('Get all shops route hit with query:', req.query);
  shopController.getAllShops(req, res, next);
});

// Search shops by location
router.get('/searchByLocation', (req, res, next) => {
  console.log('Search shops by location route hit with query:', req.query);
  shopController.searchShopsByLocation(req, res, next);
});

// Search shops by service
router.get('/searchByService', (req, res, next) => {
  console.log('Search shops by service route hit with query:', req.query);
  shopController.searchShopsByService(req, res, next);
});

// Get featured shops
router.get('/featured', (req, res, next) => {
  console.log('Get featured shops route hit');
  shopController.getFeaturedShops(req, res, next);
});

// Get shop by userId (public route - no auth required)
router.get('/byUserId/:userId', (req, res, next) => {
  console.log('Get shop by userId route hit with userId:', req.params.userId);
  shopController.getShopByUserId(req, res, next);
});

// Shop routes requiring authentication
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

router.get('/:shopId/reviews', (req, res, next) => {
  console.log('Get shop reviews route hit');
  shopController.getShopReviews(req, res, next);
});

// Shop stats
router.get('/stats', authMiddleware, (req, res, next) => {
  console.log('Get shop stats route hit');
  shopController.getShopStats(req, res, next);
});

// Get shop by ID (public route - no auth required)
// This should be LAST as it's a catch-all for any ID
router.get('/:id', (req, res, next) => {
  console.log('Get shop by ID route hit with ID:', req.params.id);
  shopController.getShopById(req, res, next);
});

// Debug logging for the imported controller
console.log('shopController methods:', Object.keys(shopController));

module.exports = router;
