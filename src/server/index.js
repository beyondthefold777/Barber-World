const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

// Log available route files
try {
  const routesDir = path.join(__dirname, 'routes');
  console.log('Routes directory exists:', fs.existsSync(routesDir));
  if (fs.existsSync(routesDir)) {
    console.log('Available route files:', fs.readdirSync(routesDir));
  }
} catch (err) {
  console.error('Error checking routes directory:', err);
}

// Try to import routes with detailed error handling
let appointmentRoutes, authRoutes, shopRoutes, expenseRoutes, taxRoutes, userRoutes;

try {
  appointmentRoutes = require('./routes/appointments');
  console.log('Appointment routes loaded successfully');
} catch (err) {
  console.error('Error loading appointment routes:', err);
}

try {
  authRoutes = require('./routes/Authroutes');
  console.log('Auth routes loaded successfully');
} catch (err) {
  console.error('Error loading auth routes:', err);
}

try {
  console.log('Attempting to load shop routes from:', path.resolve(__dirname, './routes/shop.routes.js'));
  shopRoutes = require('./routes/shop.routes');
  console.log('Shop routes loaded successfully');
  console.log('Shop routes methods:', typeof shopRoutes);
  console.log('Shop routes has router?', shopRoutes.stack ? 'Yes' : 'No');
} catch (err) {
  console.error('Error loading shop routes:', err);
}

try {
  expenseRoutes = require('./routes/expenseRoutes');
  console.log('Expense routes loaded successfully');
} catch (err) {
  console.error('Error loading expense routes:', err);
}

try {
  taxRoutes = require('./routes/tax.routes');
  console.log('Tax routes loaded successfully');
} catch (err) {
  console.error('Error loading tax routes:', err);
}

try {
  userRoutes = require('./routes/user.routes');
  console.log('User routes loaded successfully');
} catch (err) {
  console.error('Error loading user routes:', err);
}

// Import controllers and middleware for direct routes
let authMiddleware, shopController;

try {
  authMiddleware = require('./middleware/auth');
  console.log('Auth middleware loaded successfully');
} catch (err) {
  console.error('Error loading auth middleware:', err);
}

try {
  shopController = require('./controllers/shopController');
  console.log('Shop controller loaded successfully');
  console.log('Shop controller methods:', Object.keys(shopController));
} catch (err) {
  console.error('Error loading shop controller:', err);
}

const connectDB = require('../../config/db');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';

// Add CORS middleware
app.use(cors());

// Increase payload size limits
app.use(express.json({limit: '200mb'}));
app.use(express.urlencoded({limit: '200mb', extended: true}));

// Enhanced request logging
app.use((req, res, next) => {
  console.log(`
    New Request:
    Time: ${new Date().toISOString()}
    Method: ${req.method}
    Path: ${req.url}
  `);
  // Don't log the entire body as it might be too large
  console.log('Body size:', req.body ? JSON.stringify(req.body).length : 0);
  next();
});

connectDB();

// Mount routes with error handling
if (appointmentRoutes) {
  app.use('/api/appointments', appointmentRoutes);
  console.log('Appointment routes mounted');
}

if (authRoutes) {
  app.use('/api/auth', authRoutes);
  console.log('Auth routes mounted');
}

if (expenseRoutes) {
  app.use('/api/expenses', expenseRoutes);
  console.log('Expense routes mounted');
}

if (taxRoutes) {
  app.use('/api/tax', taxRoutes);
  console.log('Tax routes mounted');
}

if (userRoutes) {
  app.use('/api/users', userRoutes);
  console.log('User routes mounted');
}

// Add debugging route - ADD THIS BEFORE ANY OTHER ROUTES
app.get('/api/debug/shop/all', (req, res) => {
  console.log('Debug route hit with query:', req.query);
  res.json({
    message: 'Debug route working',
    query: req.query,
    controllerExists: !!shopController,
    getAllShopsExists: shopController && typeof shopController.getAllShops === 'function',
    controllerMethods: shopController ? Object.keys(shopController) : []
  });
});

// Add shop model debugging route
app.get('/api/debug/shop-model', async (req, res) => {
  try {
    // Use the correct file path for the Shop model
    const Shop = require('./models/shop.model');
    
    // Get a count of all shops
    const count = await Shop.countDocuments();
    
    // Get a sample of shops
    const sampleShops = await Shop.find().limit(3);
    
    // Get the model schema
    const schema = Shop.schema.paths;
    const schemaFields = Object.keys(schema).map(key => ({
      path: key,
      instance: schema[key].instance,
      options: schema[key].options
    }));
    
    res.json({
      success: true,
      modelExists: !!Shop,
      totalShops: count,
      sampleShops: sampleShops.map(shop => ({
        id: shop._id,
        name: shop.name,
        location: shop.location
      })),
      schemaFields: schemaFields
    });
  } catch (error) {
    console.error('Error in shop model debug route:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
});

// Add direct location search route
app.get('/api/shop/location-search', (req, res) => {
  console.log('Location search route hit with query:', req.query);
  try {
    const { location, state } = req.query;
    
    // Use the Shop model with the correct file path
    const Shop = require('./models/shop.model');
    
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
    
    console.log('Direct location search query:', JSON.stringify(query));
    
    Shop.find(query)
      .populate('userId', 'firstName lastName email')
      .then(shops => {
        console.log(`Found ${shops.length} shops matching location criteria`);
        res.status(200).json({
          success: true,
          count: shops.length,
          shops: shops
        });
      })
      .catch(err => {
        console.error('Error in direct location search:', err);
        res.status(500).json({ 
          success: false, 
          message: 'Error searching shops by location' 
        });
      });
  } catch (error) {
    console.error('Exception in location search route:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error in location search' 
    });
  }
});

// Add specific route for barbershop search
app.post('/api/auth/barbershops/search', (req, res) => {
  console.log('Direct barbershops search route hit with body:', req.body);
  if (typeof shopController.searchBarbershops === 'function') {
    shopController.searchBarbershops(req, res);
  } else {
    // Fallback implementation if controller method doesn't exist
    try {
      const { zipCode, city, state } = req.body;
      
      // Create a query based on the provided parameters
      let query = {};
      if (zipCode) query['location.zip'] = zipCode;
      if (city) query['location.city'] = { $regex: city, $options: 'i' };
      if (state) query['location.state'] = { $regex: state, $options: 'i' };
      
      console.log('Search query:', query);
      
      // Use the Shop model with the correct file path
      const Shop = require('./models/shop.model');
      Shop.find(query)
        .then(shops => {
          console.log(`Found ${shops.length} shops matching search criteria`);
          res.json(shops);
        })
        .catch(err => {
          console.error('Error searching shops:', err);
          res.status(500).json({ error: 'Error searching shops' });
        });
    } catch (error) {
      console.error('Error in barbershops search:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }
});

// Direct routes for shop operations
// Only add these if shopController is available
if (shopController) {
  // IMPORTANT: Order matters! More specific routes first, catch-all routes last
  
  // 1. Fixed path routes (most specific)
  // FIXED: Remove duplicate route definition for '/api/shop/all'
  app.get('/api/shop/all', (req, res) => {
    console.log('Direct get all shops route hit with query:', req.query);
    if (typeof shopController.getAllShops === 'function') {
      try {
        // Call directly without next to prevent middleware chain issues
        shopController.getAllShops(req, res);
      } catch (error) {
        console.error('Error in getAllShops route handler:', error);
        res.status(500).json({ success: false, message: 'Internal server error in getAllShops' });
      }
    } else {
      res.status(500).json({ error: 'Get all shops controller method not found' });
    }
  });
  
  // Add a new route with a different path for testing
  app.get('/api/shop/all-shops', (req, res) => {
    console.log('Alternative all shops route hit with query:', req.query);
    if (typeof shopController.getAllShops === 'function') {
      try {
        shopController.getAllShops(req, res);
      } catch (error) {
        console.error('Error in all-shops route handler:', error);
        res.status(500).json({ success: false, message: 'Internal server error in all-shops' });
      }
    } else {
      res.status(500).json({ error: 'Get all shops controller method not found' });
    }
  });
  
  app.get('/api/shop/searchByService', (req, res, next) => {
    console.log('Direct search shops by service route hit with query:', req.query);
    if (typeof shopController.searchShopsByService === 'function') {
      shopController.searchShopsByService(req, res, next);
    } else {
      res.status(500).json({ error: 'Search shops by service controller method not found' });
    }
  });
  
  app.get('/api/shop/searchByLocation', (req, res, next) => {
    console.log('Direct search shops by location route hit with query:', req.query);
    if (typeof shopController.searchShopsByLocation === 'function') {
      shopController.searchShopsByLocation(req, res, next);
    } else {
      res.status(500).json({ error: 'Search shops by location controller method not found' });
    }
  });
  
  app.get('/api/shop/featured', (req, res, next) => {
    console.log('Direct get featured shops route hit');
    if (typeof shopController.getFeaturedShops === 'function') {
      shopController.getFeaturedShops(req, res, next);
    } else {
      res.status(500).json({ error: 'Get featured shops controller method not found' });
    }
  });
  
  // 2. Routes with parameters in the middle of the path
  app.get('/api/shop/byUserId/:userId', (req, res, next) => {
    console.log('Direct get shop by userId route hit with userId:', req.params.userId);
    if (typeof shopController.getShopByUserId === 'function') {
      shopController.getShopByUserId(req, res, next);
    } else {
      res.status(500).json({ error: 'Get shop by userId controller method not found' });
    }
  });
  
  console.log('Public shop routes added successfully');
}

// Routes that require authentication
if (authMiddleware && shopController) {
  // Authenticated routes with fixed paths
  app.get('/api/shop/data', authMiddleware, (req, res, next) => {
    console.log('Direct get shop data route hit');
    if (typeof shopController.getShop === 'function') {
      shopController.getShop(req, res, next);
    } else {
      res.status(500).json({ error: 'Get shop controller method not found' });
    }
  });
  
  app.get('/api/shop', authMiddleware, (req, res, next) => {
    console.log('Direct get shop route hit');
    if (typeof shopController.getShop === 'function') {
      shopController.getShop(req, res, next);
    } else {
      res.status(500).json({ error: 'Get shop controller method not found' });
    }
  });
  
  app.post('/api/shop/upload-image', authMiddleware, (req, res, next) => {
    console.log('Direct upload image route hit');
    if (typeof shopController.uploadImage === 'function') {
      shopController.uploadImage(req, res, next);
    } else {
      res.status(500).json({ error: 'Upload image controller method not found' });
    }
  });
  
  app.get('/api/shop/stats', authMiddleware, (req, res, next) => {
    console.log('Direct get shop stats route hit');
    if (typeof shopController.getShopStats === 'function') {
      shopController.getShopStats(req, res, next);
    } else {
      res.status(500).json({ error: 'Get shop stats controller method not found' });
    }
  });
  
  app.put('/api/shop/update', authMiddleware, (req, res, next) => {
    console.log('Direct update shop route hit');
    if (typeof shopController.updateShop === 'function') {
      shopController.updateShop(req, res, next);
    } else {
      res.status(500).json({ error: 'Update shop controller method not found' });
    }
  });
  
  app.delete('/api/shop/images/:imageId', authMiddleware, (req, res, next) => {
    console.log('Direct delete image route hit');
    if (typeof shopController.deleteImage === 'function') {
      shopController.deleteImage(req, res, next);
    } else {
      res.status(500).json({ error: 'Delete image controller method not found' });
    }
  });
  
  app.post('/api/shop/services', authMiddleware, (req, res, next) => {
    console.log('Direct add service route hit');
    if (typeof shopController.addService === 'function') {
      shopController.addService(req, res, next);
    } else {
      res.status(500).json({ error: 'Add service controller method not found' });
    }
  });
  
  app.delete('/api/shop/services/:serviceId', authMiddleware, (req, res, next) => {
    console.log('Direct remove service route hit');
    if (typeof shopController.removeService === 'function') {
      shopController.removeService(req, res, next);
    } else {
      res.status(500).json({ error: 'Remove service controller method not found' });
    }
  });
  
  // Routes with shopId parameter
  app.post('/api/shop/:shopId/reviews', authMiddleware, (req, res, next) => {
    console.log('Direct add review route hit');
    if (typeof shopController.addReview === 'function') {
      shopController.addReview(req, res, next);
    } else {
      res.status(500).json({ error: 'Add review controller method not found' });
    }
  });
  
  app.get('/api/shop/:shopId/reviews', (req, res, next) => {
    console.log('Direct get shop reviews route hit');
    if (typeof shopController.getShopReviews === 'function') {
      shopController.getShopReviews(req, res, next);
    } else {
      res.status(500).json({ error: 'Get shop reviews controller method not found' });
    }
  });
  
  console.log('Authenticated shop routes added successfully');
}

// Mount the shop routes from the router
if (shopRoutes) {
  app.use('/api/shop', shopRoutes);
  console.log('Shop router mounted');
} else {
  console.error('Shop routes not mounted - module not loaded');
}

// IMPORTANT: This catch-all route must come LAST
if (shopController) {
  app.get('/api/shop/:id', (req, res, next) => {
    // Skip this handler if the ID is 'all' to prevent conflicts
    if (req.params.id === 'all') {
      console.log('Skipping catch-all handler for /api/shop/all');
      return next();
    }
    
    console.log('Direct get shop by ID route hit with ID:', req.params.id);
    if (typeof shopController.getShopById === 'function') {
      shopController.getShopById(req, res, next);
    } else {
      res.status(500).json({ error: 'Get shop by ID controller method not found' });
    }
  });
}

// Test route to verify server is working
app.get('/', (req, res) => {
  res.send('Barber World API is running!');
});

// Route for checking all registered routes
app.get('/api/routes', (req, res) => {
  const routes = [];
  app._router.stack.forEach(middleware => {
    if (middleware.route) {
      // Routes registered directly on the app
      routes.push({
        path: middleware.route.path,
        method: Object.keys(middleware.route.methods)[0]
      });
    } else if (middleware.name === 'router') {
      // Router middleware
      middleware.handle.stack.forEach(handler => {
        if (handler.route) {
          routes.push({
            path: middleware.regexp.toString() + handler.route.path,
            method: Object.keys(handler.route.methods)[0]
          });
        }
      });
    }
  });
  res.json(routes);
});

// Global error handler
app.use((err, req, res, next) => {
  const errorDetails = {
    timestamp: new Date().toISOString(),
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method
  };
  
  console.log('Error occurred:', errorDetails);
  
  res.status(500).json({
    error: err.message,
    path: req.path
  });
});

app.listen(PORT, HOST, () => {
  console.log(`Server running on ${HOST}:${PORT}`);
});
