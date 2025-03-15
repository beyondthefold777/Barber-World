const express = require('express');
const fs = require('fs');
const path = require('path');

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
let appointmentRoutes, authRoutes, shopRoutes, expenseRoutes, taxRoutes;

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

if (shopRoutes) {
  app.use('/api/shop', shopRoutes);
  console.log('Shop routes mounted');
} else {
  console.error('Shop routes not mounted - module not loaded');
}

if (expenseRoutes) {
  app.use('/api/expenses', expenseRoutes);
  console.log('Expense routes mounted');
}

if (taxRoutes) {
  app.use('/api/tax', taxRoutes);
  console.log('Tax routes mounted');
}

// Direct routes for shop operations
// Only add these if both authMiddleware and shopController are available
if (authMiddleware && shopController) {
  // Direct route for image upload
  app.post('/api/shop/upload-image', authMiddleware, (req, res, next) => {
    console.log('Direct upload image route hit');
    if (typeof shopController.uploadImage === 'function') {
      shopController.uploadImage(req, res, next);
    } else {
      res.status(500).json({ error: 'Upload image controller method not found' });
    }
  });

  // Direct route for getting shop data - add this endpoint to match client expectations
  app.get('/api/shop/data', authMiddleware, (req, res, next) => {
    console.log('Direct get shop data route hit');
    if (typeof shopController.getShop === 'function') {
      shopController.getShop(req, res, next);
    } else {
      res.status(500).json({ error: 'Get shop controller method not found' });
    }
  });

  // Keep the original endpoint too
  app.get('/api/shop', authMiddleware, (req, res, next) => {
    console.log('Direct get shop route hit');
    if (typeof shopController.getShop === 'function') {
      shopController.getShop(req, res, next);
    } else {
      res.status(500).json({ error: 'Get shop controller method not found' });
    }
  });

  // Direct route for deleting images
  app.delete('/api/shop/images/:imageId', authMiddleware, (req, res, next) => {
    console.log('Direct delete image route hit');
    if (typeof shopController.deleteImage === 'function') {
      shopController.deleteImage(req, res, next);
    } else {
      res.status(500).json({ error: 'Delete image controller method not found' });
    }
  });

  // Direct route for adding services
  app.post('/api/shop/services', authMiddleware, (req, res, next) => {
    console.log('Direct add service route hit');
    if (typeof shopController.addService === 'function') {
      shopController.addService(req, res, next);
    } else {
      res.status(500).json({ error: 'Add service controller method not found' });
    }
  });

  // Direct route for removing services
  app.delete('/api/shop/services/:serviceId', authMiddleware, (req, res, next) => {
    console.log('Direct remove service route hit');
    if (typeof shopController.removeService === 'function') {
      shopController.removeService(req, res, next);
    } else {
      res.status(500).json({ error: 'Remove service controller method not found' });
    }
  });

  // Direct route for updating shop
  app.put('/api/shop/update', authMiddleware, (req, res, next) => {
    console.log('Direct update shop route hit');
    if (typeof shopController.updateShop === 'function') {
      shopController.updateShop(req, res, next);
    } else {
      res.status(500).json({ error: 'Update shop controller method not found' });
    }
  });

  console.log('Direct shop routes added successfully');
} else {
  console.error('Direct shop routes not added - missing middleware or controller');
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