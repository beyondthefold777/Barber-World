const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');


// Configure nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'nexphase1989@gmail.com',
    pass: process.env.EMAIL_PASS
  }
});

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
let emailRoutes, accountRoutes;
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
  emailRoutes = require('./routes/emailRoutes');
  console.log('Email routes loaded successfully');
} catch (err) {
  console.error('Error loading email routes:', err);
}
try {
  accountRoutes = require('./routes/accountRoutes');
  console.log('Account routes loaded successfully');
} catch (err) {
  console.error('Error loading account routes:', err);
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

// Define port and host explicitly for Fly.io
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
if (emailRoutes) {
  app.use('/api/email', emailRoutes);
  console.log('Email routes mounted');
}
if (accountRoutes) {
  app.use('/api/account', accountRoutes);
  console.log('Account routes mounted');
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
  app.post('/api/shop/:shopId/reviews', (req, res, next) => {
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

// Service routes - Add these four routes to your existing index.js file
app.post('/api/shop/:shopId/services', authMiddleware, async (req, res) => {
  try {
    const { shopId } = req.params;
    const { name, description, duration, price } = req.body;
    
    // Validation
    if (!name || !price) {
      return res.status(400).json({
        success: false,
        message: 'Service name and price are required'
      });
    }
    
    // Verify shop exists
    const Shop = require('./models/shop.model');
    const shop = await Shop.findById(shopId);
    if (!shop) {
      return res.status(404).json({
        success: false,
        message: 'Shop not found'
      });
    }
    
    // Check if user is the shop owner
    if (shop.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to modify this shop'
      });
    }
    
    // Create new service
    const newService = {
      name,
      description: description || '',
      duration: duration || 30,
      price
    };
    
    // Add service to shop
    shop.services.push(newService);
    await shop.save();
    
    res.status(201).json({
      success: true,
      message: 'Service added successfully',
      service: newService
    });
  } catch (error) {
    console.error('Error adding service:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding service',
      error: error.message
    });
  }
});

app.get('/api/shop/:shopId/services', async (req, res) => {
  try {
    const { shopId } = req.params;
    
    const Shop = require('./models/shop.model');
    const shop = await Shop.findById(shopId, 'services');
    
    if (!shop) {
      return res.status(404).json({
        success: false,
        message: 'Shop not found'
      });
    }
    
    res.status(200).json({
      success: true,
      count: shop.services ? shop.services.length : 0,
      services: shop.services || []
    });
  } catch (error) {
    console.error(`Error fetching services for shop ${req.params.shopId}:`, error);
    res.status(500).json({
      success: false,
      message: 'Error fetching shop services',
      error: error.message
    });
  }
});

app.put('/api/shop/:shopId/services/:serviceId', authMiddleware, async (req, res) => {
  try {
    const { shopId, serviceId } = req.params;
    const { name, description, duration, price } = req.body;
    
    // Verify shop exists
    const Shop = require('./models/shop.model');
    const shop = await Shop.findById(shopId);
    if (!shop) {
      return res.status(404).json({
        success: false,
        message: 'Shop not found'
      });
    }
    
    // Check if user is the shop owner
    if (shop.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to modify this shop'
      });
    }
    
    // Find the service
    const serviceIndex = shop.services.findIndex(service => service._id.toString() === serviceId);
    if (serviceIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }
    
    // Update service
    if (name) shop.services[serviceIndex].name = name;
    if (description !== undefined) shop.services[serviceIndex].description = description;
    if (duration) shop.services[serviceIndex].duration = duration;
    if (price) shop.services[serviceIndex].price = price;
    
    await shop.save();
    
    res.status(200).json({
      success: true,
      message: 'Service updated successfully',
      service: shop.services[serviceIndex]
    });
  } catch (error) {
    console.error('Error updating service:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating service',
      error: error.message
    });
  }
});

app.delete('/api/shop/:shopId/services/:serviceId', authMiddleware, async (req, res) => {
  try {
    const { shopId, serviceId } = req.params;
    
    // Verify shop exists
    const Shop = require('./models/shop.model');
    const shop = await Shop.findById(shopId);
    if (!shop) {
      return res.status(404).json({
        success: false,
        message: 'Shop not found'
      });
    }
    
    // Check if user is the shop owner
    if (shop.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to modify this shop'
      });
    }
    
    // Find and remove the service
    const serviceIndex = shop.services.findIndex(service => service._id.toString() === serviceId);
    if (serviceIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }
    
    // Remove service
    shop.services.splice(serviceIndex, 1);
    await shop.save();
    
    res.status(200).json({
      success: true,
      message: 'Service deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting service:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting service',
      error: error.message
    });
  }
});


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

// Add route handler for reset-password
app.get('/reset-password', (req, res) => {
  const token = req.query.token;
  
  // Serve an HTML page with a button to open the app
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Reset Password - Barber World</title>
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style>
        body { 
          font-family: Arial, sans-serif; 
          text-align: center; 
          padding: 20px; 
          background-color: #f5f5f5;
          color: #333;
        }
        .container { 
          max-width: 600px; 
          margin: 0 auto; 
          background-color: white;
          padding: 30px;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .logo {
          margin-bottom: 20px;
        }
        h1 {
          color: #FF0000;
          margin-bottom: 20px;
        }
        .btn { 
          background-color: #FF0000; 
          color: white; 
          padding: 12px 20px; 
          border: none; 
          border-radius: 4px; 
          cursor: pointer; 
          font-size: 16px;
          text-decoration: none;
          display: inline-block;
          margin: 10px 0;
        }
        .btn:hover {
          background-color: #cc0000;
        }
        .note {
          margin-top: 20px;
          font-size: 14px;
          color: #666;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="logo">
          <h1>Barber World</h1>
        </div>
        <h2>Reset Your Password</h2>
        <p>Click the button below to open the app and reset your password.</p>
        <a href="barberworld://reset-password?token=${token}" class="btn">Open App</a>
        <p class="note">If the button doesn't work, you may need to install the Barber World app first.</p>
      </div>
    </body>
    </html>
  `);
});

// Password change functionality
app.post('/api/change-password', authMiddleware, async (req, res) => {
  try {
    // Get user ID from the authenticated request
    const userId = req.user.id;
    
    // Get request data
    const { currentPassword, newPassword } = req.body;
    
    // Validation
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Please provide both current and new password' });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters long' });
    }
    
    // Get user from database
    const User = require('./models/User'); // Adjust path if needed
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Check if current password is correct
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }
    
    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // Update password in database
    user.password = hashedPassword;
    await user.save();
    
    console.log(`Password updated successfully for user ${userId}`);
    res.status(200).json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ success: false, message: 'Server error during password change' });
  }
});

// Password reset request functionality
app.post('/api/request-password-reset', async (req, res) => {
  try {
    const { email } = req.body;
    
    // Validation
    if (!email) {
      return res.status(400).json({ success: false, message: 'Please provide an email address' });
    }
    
    // Find user by email
    const User = require('./models/User'); // Adjust path if needed
    const user = await User.findOne({ email });
    if (!user) {
      // For security reasons, don't reveal that the user doesn't exist
      return res.status(200).json({ 
        success: true,
        message: 'If your email exists in our system, you will receive a password reset link' 
      });
    }
    
    // Generate reset token
    const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    
    // Store reset token and expiry in user document
    // Use findByIdAndUpdate to bypass validation
    await User.findByIdAndUpdate(
      user._id,
      {
        resetToken: resetToken,
        resetTokenExpiry: Date.now() + 3600000 // 1 hour from now
      },
      { runValidators: false }
    );
    
    // Create both web and mobile deep link URLs
    const webResetUrl = `https://barber-world.fly.dev/reset-password?token=${resetToken}`;
    const mobileDeepLink = `barberworld://reset-password?token=${resetToken}`;
    
    // Send password reset email using Nodemailer with both links
    const mailOptions = {
      from: `"Barber World" <${process.env.EMAIL_USER || 'nexphase1989@gmail.com'}>`,
      to: email,
      subject: 'Password Reset Request',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
          <h2 style="color: #FF0000; border-bottom: 1px solid #eee; padding-bottom: 10px;">Password Reset Request</h2>
          
          <p>Hello,</p>
          
          <p>We received a request to reset your password for your Barber World account. Click the button below to reset your password:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${webResetUrl}" style="background-color: #FF0000; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold;">Reset Password</a>
          </div>
          
          <p>If you're using the mobile app, please use this link instead:</p>
          <div style="text-align: center; margin: 20px 0;">
            <a href="${mobileDeepLink}" style="background-color: #333; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold;">Reset in Mobile App</a>
          </div>
          
          <p>If you didn't request a password reset, you can safely ignore this email.</p>
          
          <p>This link will expire in 1 hour for security reasons.</p>
          
          <p>Best regards,<br>The Barber World Team</p>
          
          <div style="margin-top: 20px; font-size: 12px; color: #777; text-align: center; border-top: 1px solid #eee; padding-top: 20px;">
            <p>If the buttons don't work, copy and paste one of these URLs into your browser:</p>
            <p style="word-break: break-all;">Web: ${webResetUrl}</p>
            <p style="word-break: break-all;">Mobile: ${mobileDeepLink}</p>
          </div>
        </div>
      `
    };
    
    try {
      await transporter.sendMail(mailOptions);
      console.log(`Password reset email sent to ${email}`);
    } catch (emailError) {
      console.error('Error sending password reset email:', emailError);
      // Continue execution even if email fails - don't reveal email sending issues to client
    }
    
    res.status(200).json({
      success: true,
      message: 'If your email exists in our system, you will receive a password reset link'
    });
  } catch (error) {
    console.error('Error requesting password reset:', error);
    res.status(500).json({ success: false, message: 'Server error during password reset request' });
  }
});

// Password reset functionality
app.post('/api/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    
    // Validation
    if (!token || !newPassword) {
      return res.status(400).json({ success: false, message: 'Please provide both token and new password' });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters long' });
    }
    
    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(400).json({ success: false, message: 'Invalid or expired token' });
    }
    
    // Find user by id and check if reset token is valid
    const User = require('./models/User'); // Adjust path if needed
    const user = await User.findOne({ 
      _id: decoded.id,
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() }
    });
    
    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired token' });
    }
    
    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // Update password and clear reset token fields using findByIdAndUpdate to bypass validation
    await User.findByIdAndUpdate(
      user._id,
      {
        password: hashedPassword,
        resetToken: undefined,
        resetTokenExpiry: undefined
      },
      { runValidators: false }
    );
    
    // Send password change confirmation email
    const mailOptions = {
      from: `"Barber World" <${process.env.EMAIL_USER || 'nexphase1989@gmail.com'}>`,
      to: user.email,
      subject: 'Your Password Has Been Reset',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
          <h2 style="color: #FF0000; border-bottom: 1px solid #eee; padding-bottom: 10px;">Password Reset Successful</h2>
          
          <p>Hello,</p>
          
                    <p>Your password for Barber World has been successfully reset.</p>
          
          <p>If you did not request this change, please contact our support team immediately.</p>
          
          <p>Best regards,<br>The Barber World Team</p>
        </div>
      `
    };
    
    try {
      await transporter.sendMail(mailOptions);
      console.log(`Password reset confirmation email sent to ${user.email}`);
    } catch (emailError) {
      console.error('Error sending password reset confirmation email:', emailError);
      // Continue execution even if email fails
    }
    
    console.log(`Password has been reset successfully for user ${user._id}`);
    res.status(200).json({ success: true, message: 'Password has been reset successfully' });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ success: false, message: 'Server error during password reset' });
  }
});

// Contact support endpoint
app.post('/api/contact-support', async (req, res) => {
  try {
    const { name, email, category, subject, message } = req.body;
    
    // Validation
    if (!email || !subject || !message || !category) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide email, category, subject, and message' 
      });
    }
    
    // Get user info if authenticated
    let userId = null;
    let userName = name || 'User';
    
    if (req.headers.authorization) {
      const token = req.headers.authorization.split(' ')[1];
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.id;
        
        // Get user details if available
        const User = require('./models/User');
        const user = await User.findById(userId);
        if (user) {
          userName = user.name || userName;
        }
      } catch (err) {
        console.log('Invalid token in contact support, continuing as guest');
      }
    }
    
    // Prepare email to support team
    const supportMailOptions = {
      from: `"Barber World Support" <${process.env.EMAIL_USER || 'nexphase1989@gmail.com'}>`,
      to: process.env.SUPPORT_EMAIL || 'nexphase1989@gmail.com',
      subject: `Support Request: ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
          <h2 style="color: #FF0000; border-bottom: 1px solid #eee; padding-bottom: 10px;">New Support Request</h2>
          
          <p><strong>From:</strong> ${userName} (${email})</p>
          <p><strong>Category:</strong> ${category}</p>
          <p><strong>Subject:</strong> ${subject}</p>
          
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Message:</strong></p>
            <p>${message.replace(/\n/g, '<br>')}</p>
          </div>
          
          ${userId ? `<p><strong>User ID:</strong> ${userId}</p>` : ''}
          <p><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
        </div>
      `
    };
    
    // Prepare confirmation email to user
    const userConfirmationMailOptions = {
      from: `"Barber World Support" <${process.env.EMAIL_USER || 'nexphase1989@gmail.com'}>`,
      to: email,
      subject: `Your Support Request: ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
          <h2 style="color: #FF0000; border-bottom: 1px solid #eee; padding-bottom: 10px;">Support Request Received</h2>
          
          <p>Hello ${userName},</p>
          
          <p>We've received your support request with the following details:</p>
          
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Category:</strong> ${category}</p>
            <p><strong>Subject:</strong> ${subject}</p>
            <p><strong>Message:</strong></p>
            <p>${message.replace(/\n/g, '<br>')}</p>
          </div>
          
          <p>Our support team will review your request and get back to you as soon as possible. Please allow 24-48 hours for a response.</p>
          
          <p>Best regards,<br>The Barber World Support Team</p>
        </div>
      `
    };
    
    // Send emails
    try {
      await transporter.sendMail(supportMailOptions);
      console.log(`Support request email sent to support team from ${email}`);
      
      await transporter.sendMail(userConfirmationMailOptions);
      console.log(`Confirmation email sent to user at ${email}`);
    } catch (emailError) {
      console.error('Error sending support emails:', emailError);
      // Continue execution even if email fails - don't reveal email sending issues to client
    }
    
    res.status(200).json({
      success: true,
      message: 'Your support request has been submitted successfully'
    });
  } catch (error) {
    console.error('Error processing support request:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while processing your support request' 
    });
  }
});

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
// Messaging routes - Add these directly to your server file
// Import mongoose and models
const mongoose = require('mongoose');
const Message = require('./models/Message');
const Conversation = require('./models/Conversation');
const User = require('./models/User');
const Shop = require('./models/shop.model');

// Get all conversations for the current user
app.get('/api/messages/conversations', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    console.log('Getting conversations for user ID:', userId);
    
    // Find all conversations where the current user is a participant
    const conversations = await Conversation.find({
      participants: userId
    }).sort({ updatedAt: -1 });

    // Format the conversations for the client
    const formattedConversations = [];

    // Process each conversation
    for (const conversation of conversations) {
      // Find the other participant ID (not the current user)
      const otherParticipantId = conversation.participants.find(
        participant => participant.toString() !== userId
      );
      
      // Get unread count for current user
      const unreadCount = conversation.unreadCounts.get(userId) || 0;
      
      // Check if the other participant is a user
      let otherParticipant = await User.findById(otherParticipantId)
        .select('username firstName lastName profileImage businessName role');
      
      let isShop = false;
      
      // If not found in users, check if it's a shop
      if (!otherParticipant) {
        const shop = await Shop.findById(otherParticipantId)
          .select('name images');
          
        if (shop) {
          isShop = true;
          otherParticipant = {
            _id: shop._id,
            businessName: shop.name,
            profileImage: shop.images && shop.images.length > 0 ? shop.images[0] : null,
            role: 'shop'
          };
        }
      }
      
      if (otherParticipant) {
        formattedConversations.push({
          _id: conversation._id,
          recipient: otherParticipant,
          lastMessage: conversation.lastMessage,
          lastMessageText: conversation.lastMessageText,
          lastMessageDate: conversation.lastMessageDate,
          unreadCount: unreadCount,
          isShop: isShop
        });
      }
    }

    res.status(200).json({
      success: true,
      conversations: formattedConversations
    });
  } catch (error) {
    console.error('Error getting conversations:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving conversations',
      error: error.message
    });
  }
});

// Get messages between current user and a specific recipient
app.get('/api/messages/:recipientId', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { recipientId } = req.params;
    console.log(`Getting messages between ${userId} and ${recipientId}`);
        
    // Validate recipientId
    if (!mongoose.Types.ObjectId.isValid(recipientId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid recipient ID'
      });
    }

    // Check if recipient exists (either as a User or a Shop)
    let recipient = await User.findById(recipientId);
    let isShop = false;
    
    // If not found in User collection, check if it's a Shop
    if (!recipient) {
      const shop = await Shop.findById(recipientId);
      if (shop) {
        isShop = true;
        recipient = {
          _id: shop._id,
          businessName: shop.name,
          profileImage: shop.images && shop.images.length > 0 ? shop.images[0] : null,
          role: 'shop'
        };
      } else {
        return res.status(404).json({
          success: false,
          message: 'Recipient not found'
        });
      }
    }

    // Find or create conversation
    let conversation = await Conversation.findOne({
      participants: { $all: [userId, recipientId] }
    });

    // If no conversation exists yet, create a new one
    if (!conversation) {
      console.log('Creating new conversation');
      conversation = new Conversation({
        participants: [userId, recipientId],
        unreadCounts: new Map()
      });
      await conversation.save();
            
      // Add conversation reference to user
      await User.findByIdAndUpdate(userId, {
        $addToSet: { conversations: conversation._id }
      });
      
      // If recipient is a user (not a shop), add conversation to their list too
      if (!isShop) {
        await User.findByIdAndUpdate(recipientId, {
          $addToSet: { conversations: conversation._id }
        });
      }
    }

    // Get messages between these users
    const messages = await Message.find({
      $or: [
        { sender: userId, recipient: recipientId },
        { sender: recipientId, recipient: userId }
      ]
    }).sort({ createdAt: 1 });

    console.log(`Found ${messages.length} messages`);

    // Mark messages from recipient as read
    await Message.updateMany(
      { sender: recipientId, recipient: userId, read: false },
      { read: true }
    );

    // Update unread count in conversation
    if (conversation.unreadCounts.get(userId) > 0) {
      conversation.unreadCounts.set(userId, 0);
      await conversation.save();
    }

    res.status(200).json({
      success: true,
      conversation: conversation._id,
      recipient: recipient,
      messages,
      isShop
    });
  } catch (error) {
    console.error('Error getting messages:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving messages',
      error: error.message
    });
  }
});

// Send a message to a recipient
app.post('/api/messages/send', authMiddleware, async (req, res) => {
  try {
    const senderId = req.user.userId;
    const { recipientId, text } = req.body;
    console.log(`Sending message from ${senderId} to ${recipientId}`);

    // Validate input
    if (!recipientId || !text) {
      return res.status(400).json({
        success: false,
        message: 'Recipient ID and message text are required'
      });
    }
        
    if (!mongoose.Types.ObjectId.isValid(recipientId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid recipient ID'
      });
    }

    // Check if recipient exists (either as a User or a Shop)
    let recipient = await User.findById(recipientId);
    let isShop = false;
    
    // If not found in User collection, check if it's a Shop
    if (!recipient) {
      recipient = await Shop.findById(recipientId);
      isShop = true;
      
      if (!recipient) {
        return res.status(404).json({
          success: false,
          message: 'Recipient not found'
        });
      }
    }

    // Create the message
    const newMessage = new Message({
      sender: senderId,
      recipient: recipientId,
      text,
      read: false
    });
    await newMessage.save();
    console.log('Message saved with ID:', newMessage._id);

    // Find or create conversation
    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, recipientId] }
    });

    if (!conversation) {
      // Create new conversation
      console.log('Creating new conversation');
      conversation = new Conversation({
        participants: [senderId, recipientId],
        lastMessage: newMessage._id,
        lastMessageText: text,
        lastMessageDate: new Date(),
        unreadCounts: new Map([[recipientId, 1]])
      });
            
      // Add conversation reference to sender
      await User.findByIdAndUpdate(senderId, {
        $addToSet: { conversations: conversation._id }
      });

      // If recipient is a user (not a shop), add conversation to their list too
      if (!isShop) {
        await User.findByIdAndUpdate(recipientId, {
          $addToSet: { conversations: conversation._id }
        });
      }
    } else {
      // Update existing conversation
      console.log('Updating existing conversation:', conversation._id);
      conversation.lastMessage = newMessage._id;
      conversation.lastMessageText = text;
      conversation.lastMessageDate = new Date();
            
      // Increment unread count for recipient
      const currentUnreadCount = conversation.unreadCounts.get(recipientId) || 0;
      conversation.unreadCounts.set(recipientId, currentUnreadCount + 1);
    }
    await conversation.save();

    res.status(201).json({
      success: true,
      message: newMessage
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending message',
      error: error.message
    });
  }
});

// Mark messages as read
app.put('/api/messages/read/:conversationId', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { conversationId } = req.params;
    console.log(`Marking messages as read in conversation ${conversationId} for user ${userId}`);

    // Validate conversationId
    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid conversation ID'
      });
    }

    // Find the conversation
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    // Check if user is a participant
    if (!conversation.participants.some(p => p.toString() === userId)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this conversation'
      });
    }

    // Find the other participant
    const otherParticipantId = conversation.participants.find(
      id => id.toString() !== userId
    );

    // Mark all messages from the other participant as read
    const result = await Message.updateMany(
      { sender: otherParticipantId, recipient: userId, read: false },
      { read: true }
    );

    console.log(`Marked ${result.nModified || result.modifiedCount} messages as read`);

    // Reset unread count for current user
    conversation.unreadCounts.set(userId, 0);
    await conversation.save();

    res.status(200).json({
      success: true,
      message: 'Messages marked as read'
    });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking messages as read',
      error: error.message
    });
  }
});

// Get unread message count
app.get('/api/messages/unread/count', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    console.log('Getting unread count for user:', userId);

    // Find all conversations where the user is a participant
    const conversations = await Conversation.find({
      participants: userId
    });

    // Calculate total unread messages
    let totalUnread = 0;
    conversations.forEach(conversation => {
      totalUnread += conversation.unreadCounts.get(userId) || 0;
    });

    console.log(`User ${userId} has ${totalUnread} unread messages`);

    res.status(200).json({
      success: true,
      unreadCount: totalUnread
    });
  } catch (error) {
    console.error('Error getting unread count:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving unread message count',
      error: error.message
    });
  }
});

// Delete a conversation
app.delete('/api/messages/conversations/:conversationId', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { conversationId } = req.params;
    console.log(`Deleting conversation ${conversationId} for user ${userId}`);

    // Validate conversationId
    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid conversation ID'
      });
    }

    // Find the conversation
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    // Check if user is a participant
    if (!conversation.participants.some(p => p.toString() === userId)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this conversation'
      });
    }

    // Delete all messages in the conversation
    await Message.deleteMany({
      $or: [
        { sender: conversation.participants[0], recipient: conversation.participants[1] },
        { sender: conversation.participants[1], recipient: conversation.participants[0] }
      ]
    });

    // Get the other participant ID
    const otherParticipantId = conversation.participants.find(
      id => id.toString() !== userId
    );

    // Check if other participant is a user or shop
    const isShop = !(await User.findById(otherParticipantId));

    // Remove conversation reference from current user
    await User.findByIdAndUpdate(userId, {
      $pull: { conversations: conversationId }
    });

    // If other participant is a user (not a shop), remove conversation from their list too
    if (!isShop) {
      await User.findByIdAndUpdate(otherParticipantId, {
        $pull: { conversations: conversationId }
      });
    }

    // Delete the conversation
    await Conversation.findByIdAndDelete(conversationId);

    res.status(200).json({
      success: true,
      message: 'Conversation deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting conversation:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting conversation',
      error: error.message
    });
  }
});

// Add a route to get conversation by recipient ID
app.get('/api/messages/conversation/:recipientId', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { recipientId } = req.params;
    console.log(`Getting conversation between ${userId} and ${recipientId}`);

    // Validate recipientId
    if (!mongoose.Types.ObjectId.isValid(recipientId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid recipient ID'
      });
    }

    // Find conversation
    const conversation = await Conversation.findOne({
      participants: { $all: [userId, recipientId] }
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    res.status(200).json({
      success: true,
      conversationId: conversation._id
    });
  } catch (error) {
    console.error('Error getting conversation:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving conversation',
      error: error.message
    });
  }
});

// Add a route to get a single message by ID
app.get('/api/messages/message/:messageId', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { messageId } = req.params;
    console.log(`Getting message ${messageId}`);

    // Validate messageId
    if (!mongoose.Types.ObjectId.isValid(messageId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid message ID'
      });
    }

    // Find the message
    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Check if user is sender or recipient
    if (message.sender.toString() !== userId && message.recipient.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this message'
      });
    }

    res.status(200).json({
      success: true,
      message
    });
  } catch (error) {
    console.error('Error getting message:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving message',
      error: error.message
    });
  }
});

// Add a route to delete a single message
app.delete('/api/messages/message/:messageId', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { messageId } = req.params;
    console.log(`Deleting message ${messageId}`);

    // Validate messageId
    if (!mongoose.Types.ObjectId.isValid(messageId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid message ID'
      });
    }

    // Find the message
    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Check if user is sender
    if (message.sender.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Only the sender can delete a message'
      });
    }

    // Find the conversation
    const conversation = await Conversation.findOne({
      participants: { $all: [message.sender, message.recipient] }
    });

    // Delete the message
    await Message.findByIdAndDelete(messageId);

    // If this was the last message in the conversation, update the conversation
    if (conversation && conversation.lastMessage && conversation.lastMessage.toString() === messageId) {
      // Find the new last message
      const lastMessage = await Message.findOne({
        $or: [
          { sender: conversation.participants[0], recipient: conversation.participants[1] },
          { sender: conversation.participants[1], recipient: conversation.participants[0] }
        ]
      }).sort({ createdAt: -1 });

      if (lastMessage) {
        conversation.lastMessage = lastMessage._id;
        conversation.lastMessageText = lastMessage.text;
        conversation.lastMessageDate = lastMessage.createdAt;
        await conversation.save();
      } else {
        // No messages left, delete the conversation
        await Conversation.findByIdAndDelete(conversation._id);
                
        // Check if other participant is a user or shop
        const otherParticipantId = conversation.participants.find(
          id => id.toString() !== userId
        );
        const isShop = !(await User.findById(otherParticipantId));

        // Remove conversation reference from current user
        await User.findByIdAndUpdate(userId, {
          $pull: { conversations: conversation._id }
        });

        // If other participant is a user (not a shop), remove conversation from their list too
        if (!isShop) {
          await User.findByIdAndUpdate(otherParticipantId, {
            $pull: { conversations: conversation._id }
          });
        }
      }
    }

    res.status(200).json({
      success: true,
      message: 'Message deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting message',
      error: error.message
    });
  }
});

// Add a route to get paginated messages for a conversation
app.get('/api/messages/conversation/:conversationId/messages', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { conversationId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    console.log(`Getting messages for conversation ${conversationId}, page ${page}, limit ${limit}`);

    // Validate conversationId
    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid conversation ID'
      });
    }

    // Find the conversation
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    // Check if user is a participant
    if (!conversation.participants.some(p => p.toString() === userId)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this conversation'
      });
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
        
    // Get messages for this conversation
    const messages = await Message.find({
      $or: [
        { sender: conversation.participants[0], recipient: conversation.participants[1] },
        { sender: conversation.participants[1], recipient: conversation.participants[0] }
      ]
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

    // Get total count for pagination
    const totalMessages = await Message.countDocuments({
      $or: [
        { sender: conversation.participants[0], recipient: conversation.participants[1] },
        { sender: conversation.participants[1], recipient: conversation.participants[0] }
      ]
    });

    // Mark unread messages as read
    await Message.updateMany(
      { 
        sender: { $ne: userId },
        recipient: userId,
        read: false 
      },
      { read: true }
    );

    // Reset unread count for current user
    if (conversation.unreadCounts.get(userId) > 0) {
      conversation.unreadCounts.set(userId, 0);
      await conversation.save();
    }

    res.status(200).json({
      success: true,
      messages: messages.reverse(), // Reverse to get chronological order
      pagination: {
        total: totalMessages,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(totalMessages / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error getting conversation messages:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving conversation messages',
      error: error.message
    });
  }
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

// Create the server instance with explicit host binding for Fly.io
const server = app.listen(PORT, HOST, () => {
  console.log(`Server running on ${HOST}:${PORT}`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});
