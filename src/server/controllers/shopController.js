const mongoose = require('mongoose');

// Use the correct model path
const Shop = require('../models/shop.model');
const User = require('../models/User');

// Helper function to check if ID is valid
const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

const shopController = {
  // Get shop data for the authenticated user
  getShop: async (req, res, next) => {
    try {
      const userId = req.user.userId;
      console.log('Getting shop for user ID:', userId);

      const shop = await Shop.findOne({ userId: userId });
      
      // Return null if no shop found (client will handle this)
      res.json({ shop });
    } catch (error) {
      console.error('Error getting shop:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  },

  // Get shop by userId (new method)
  getShopByUserId: async (req, res, next) => {
    try {
      const { userId } = req.params;
      console.log('Looking for shop with userId:', userId);
      
      if (!userId) {
        return res.status(400).json({ success: false, message: 'User ID is required' });
      }
      
      const shop = await Shop.findOne({ userId: userId });
      
      if (!shop) {
        console.log('No shop found for userId:', userId);
        return res.status(404).json({ success: false, message: 'Shop not found for this user' });
      }
      
      console.log('Found shop for userId:', shop._id);
      return res.json({ success: true, shop });
    } catch (error) {
      console.error('Error fetching shop by userId:', error);
      return res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
  },

  // Create a new shop
  createShop: async (req, res, next) => {
    try {
      const userId = req.user.userId;
      const { name, description, location } = req.body;

      // Check if shop already exists for this user
      const existingShop = await Shop.findOne({ userId: userId });
      if (existingShop) {
        return res.status(400).json({ success: false, message: 'Shop already exists for this user' });
      }

      // Create new shop
      const shop = new Shop({
        userId: userId,
        name,
        description,
        location,
        images: [],
        services: [],
        reviews: [],
        rating: 0
      });

      await shop.save();
      res.status(201).json({ success: true, shop });
    } catch (error) {
      console.error('Error creating shop:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  },

  // Update shop details
  updateShop: async (req, res, next) => {
    try {
      const userId = req.user.userId;
      const { name, description, location } = req.body;

      // Find and update shop
      const shop = await Shop.findOneAndUpdate(
        { userId: userId },
        { name, description, location },
        { new: true }
      );

      if (!shop) {
        return res.status(404).json({ success: false, message: 'Shop not found' });
      }

      res.json({ success: true, shop });
    } catch (error) {
      console.error('Error updating shop:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  },

  // Upload image to shop
  uploadImage: async (req, res, next) => {
    try {
      const userId = req.user.userId;
      console.log('Upload image for user ID:', userId);
      
      const { imageData } = req.body;
      
      if (!imageData) {
        return res.status(400).json({ success: false, message: 'No image data provided' });
      }
      
      console.log('Image data received, length:', imageData.length);
      
      // Find the shop associated with this user
      let shop = await Shop.findOne({ userId: userId });
      
      // If no shop exists, create one automatically
      if (!shop) {
        console.log('No shop found for user, creating one automatically');
        
        // Get user details to use for shop creation
        const user = await User.findById(userId);
        if (!user) {
          console.log('User not found with ID:', userId);
          return res.status(404).json({ success: false, message: 'User not found' });
        }
        
        console.log('User found:', user.email);
        
        // Create a new shop with basic details from user
        shop = new Shop({
          userId: userId,
          name: user.businessName || `${user.firstName || 'New'}'s Barbershop`,
          description: '',
          location: {
            address: user.address || '',
            city: user.city || '',
            state: user.state || '',
            zip: user.zipCode || ''
          },
          images: [],
          services: [],
          reviews: [],
          rating: 0
        });
        
        await shop.save();
        console.log('New shop created with ID:', shop._id);
      } else {
        console.log('Existing shop found with ID:', shop._id);
      }
      
      // Add the image to the shop's images array
      shop.images.push(imageData);
      await shop.save();
      
      console.log(`Image added to shop ${shop._id}, total images: ${shop.images.length}`);
      
      res.json({ 
        success: true, 
        message: 'Image uploaded successfully',
        shop: {
          id: shop._id,
          name: shop.name,
          imagesCount: shop.images.length
        }
      });
    } catch (error) {
      console.error('Upload image error:', error);
      res.status(500).json({ success: false, message: 'Failed to upload image', error: error.message });
    }
  },

  // Get shop images
  getShopImages: async (req, res, next) => {
    try {
      const userId = req.user.userId;
      
      const shop = await Shop.findOne({ userId: userId });
      if (!shop) {
        return res.status(404).json({ success: false, message: 'Shop not found' });
      }
      
      res.json({ success: true, images: shop.images });
    } catch (error) {
      console.error('Error getting shop images:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  },

  // Delete image from shop
  deleteImage: async (req, res, next) => {
    try {
      const userId = req.user.userId;
      const { imageId } = req.params;
      
      const shop = await Shop.findOne({ userId: userId });
      if (!shop) {
        return res.status(404).json({ success: false, message: 'Shop not found' });
      }
      
      // Remove image at the specified index
      const index = parseInt(imageId);
      if (index >= 0 && index < shop.images.length) {
        shop.images.splice(index, 1);
        await shop.save();
        res.json({ success: true, message: 'Image deleted successfully' });
      } else {
        res.status(400).json({ success: false, message: 'Invalid image index' });
      }
    } catch (error) {
      console.error('Error deleting image:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  },

  // Add service to shop
  addService: async (req, res, next) => {
    try {
      const userId = req.user.userId;
      const { name, price, duration } = req.body;
      
      if (!name || !price || !duration) {
        return res.status(400).json({ success: false, message: 'Missing required service fields' });
      }
      
      const shop = await Shop.findOne({ userId: userId });
      if (!shop) {
        return res.status(404).json({ success: false, message: 'Shop not found' });
      }
      
      shop.services.push({ name, price, duration });
      await shop.save();
      
      res.json({ success: true, service: shop.services[shop.services.length - 1] });
    } catch (error) {
      console.error('Error adding service:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  },

  // Remove service from shop
  removeService: async (req, res, next) => {
    try {
      const userId = req.user.userId;
      const { serviceId } = req.params;
      
      const shop = await Shop.findOne({ userId: userId });
      if (!shop) {
        return res.status(404).json({ success: false, message: 'Shop not found' });
      }
      
      // Find and remove the service
      const serviceIndex = shop.services.findIndex(service => 
        service._id.toString() === serviceId
      );
      
      if (serviceIndex === -1) {
        return res.status(404).json({ success: false, message: 'Service not found' });
      }
      
      shop.services.splice(serviceIndex, 1);
      await shop.save();
      
      res.json({ success: true, message: 'Service removed successfully' });
    } catch (error) {
      console.error('Error removing service:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  },

  // Get shop by ID (for public viewing)
  getShopById: async (req, res, next) => {
    try {
      const { id } = req.params;
      console.log('Getting shop by ID:', id);
      
      if (!isValidObjectId(id)) {
        return res.status(400).json({ success: false, message: 'Invalid shop ID' });
      }
      
      const shop = await Shop.findById(id).populate('userId', 'firstName lastName email');
      if (!shop) {
        return res.status(404).json({ success: false, message: 'Shop not found' });
      }
      
      console.log('Found shop by ID:', shop._id);
      res.json({ success: true, shop });
    } catch (error) {
      console.error('Error getting shop by ID:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  },

  // Get all shops (for marketplace/search)
  getAllShops: async (req, res, next) => {
    try {
      console.log('getAllShops called with query:', req.query);
      const { search, location, state, service } = req.query;
      
      let query = {};
      
      // Add search filters if provided
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ];
      }
      
      if (location) {
        // Try both city and address fields for maximum compatibility
        query.$or = query.$or || [];
        query.$or.push(
          { 'location.city': { $regex: location.trim(), $options: 'i' } },
          { 'location.address': { $regex: location.trim(), $options: 'i' } }
        );
      }
      
      if (state) {
        query['location.state'] = { $regex: state.trim(), $options: 'i' };
      }
      
      if (service) {
        query['services.name'] = { $regex: service, $options: 'i' };
      }
      
      console.log('Shop query:', JSON.stringify(query));
      const shops = await Shop.find(query).populate('userId', 'firstName lastName email');
      console.log(`Found ${shops.length} shops matching criteria`);
      
      // Return a consistent response format
      return res.status(200).json({
        success: true,
        count: shops.length,
        shops: shops
      });
    } catch (error) {
      console.error('Error in getAllShops:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  },

  // Add a review to a shop
  addReview: async (req, res, next) => {
    try {
      const userId = req.user.userId;
      const { shopId } = req.params;
      const { rating, comment } = req.body;
      
      if (!rating) {
        return res.status(400).json({ success: false, message: 'Rating is required' });
      }
      
      if (!isValidObjectId(shopId)) {
        return res.status(400).json({ success: false, message: 'Invalid shop ID' });
      }
      
      const shop = await Shop.findById(shopId);
      if (!shop) {
        return res.status(404).json({ success: false, message: 'Shop not found' });
      }

      // Check if user already reviewed this shop
      const existingReviewIndex = shop.reviews.findIndex(review => 
        review.userId.toString() === userId
      );
      
      if (existingReviewIndex !== -1) {
        // Update existing review
        shop.reviews[existingReviewIndex].rating = rating;
        shop.reviews[existingReviewIndex].comment = comment;
        shop.reviews[existingReviewIndex].date = Date.now();
      } else {
        // Add new review
        shop.reviews.push({
          userId: userId,
          rating,
          comment,
          date: Date.now()
        });
      }
      
      // Update shop's overall rating
      const totalRating = shop.reviews.reduce((sum, review) => sum + review.rating, 0);
      shop.rating = totalRating / shop.reviews.length;
      
      await shop.save();
      
      res.json({ success: true, message: 'Review added successfully', rating: shop.rating });
    } catch (error) {
      console.error('Error adding review:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  },
  
  // Get reviews for a shop
  getShopReviews: async (req, res, next) => {
    try {
      const { shopId } = req.params;
      
      if (!isValidObjectId(shopId)) {
        return res.status(400).json({ success: false, message: 'Invalid shop ID' });
      }
      
      const shop = await Shop.findById(shopId)
        .populate('reviews.userId', 'firstName lastName profileImage');
        
      if (!shop) {
        return res.status(404).json({ success: false, message: 'Shop not found' });
      }
      
      res.json({ success: true, reviews: shop.reviews, rating: shop.rating });
    } catch (error) {
      console.error('Error getting shop reviews:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  },
  
   // Search shops by location - UPDATED METHOD
   searchShopsByLocation: async (req, res, next) => {
    try {
      console.log('Controller: searchShopsByLocation called with query:', req.query);
      const { location, state, city, zip } = req.query;
      
      // Build the query
      let query = {};
      
      if (location) {
        // Use a case-insensitive regex search for city or address
        query.$or = [
          { 'location.city': { $regex: location.trim(), $options: 'i' } },
          { 'location.address': { $regex: location.trim(), $options: 'i' } }
        ];
      }
      
      if (city) {
        query['location.city'] = { $regex: city.trim(), $options: 'i' };
      }
      
      if (state) {
        // Use a case-insensitive regex search for state
        query['location.state'] = { $regex: state.trim(), $options: 'i' };
      }
      
      if (zip) {
        query['location.zip'] = zip;
      }
      
      console.log('Controller: Location search query:', JSON.stringify(query));
      
      // Execute the query
      const shops = await Shop.find(query)
        .populate('userId', 'firstName lastName email')
        .exec();
      
      console.log(`Controller: Found ${shops.length} shops matching location criteria`);
      
      // Return the results
      return res.status(200).json({
        success: true,
        count: shops.length,
        shops: shops
      });
    } catch (error) {
      console.error('Controller: Error in searchShopsByLocation:', error);
      return res.status(500).json({
        success: false,
        message: 'Error searching shops by location',
        error: error.message
      });
    }
  },
  
  // Search shops by service
  searchShopsByService: async (req, res, next) => {
    try {
      const { service } = req.query;
      console.log('Searching shops by service:', service);
      
      if (!service) {
        return res.status(400).json({ success: false, message: 'Service name is required' });
      }
      
      const shops = await Shop.find({
        'services.name': { $regex: service, $options: 'i' }
      }).populate('userId', 'firstName lastName email');
      
      console.log(`Found ${shops.length} shops offering service: ${service}`);
      
      res.json({ success: true, shops });
    } catch (error) {
      console.error('Error searching shops by service:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  },
  
  // Get featured shops (highest rated)
  getFeaturedShops: async (req, res, next) => {
    try {
      const limit = parseInt(req.query.limit) || 5;
      
      const shops = await Shop.find({ rating: { $gt: 0 } })
        .sort({ rating: -1 })
        .limit(limit)
        .populate('userId', 'firstName lastName email');
      
      console.log(`Found ${shops.length} featured shops`);
      
      res.json({ success: true, shops });
    } catch (error) {
      console.error('Error getting featured shops:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  },
  
  // Get shop statistics
  getShopStats: async (req, res, next) => {
    try {
      const userId = req.user.userId;
      
      const shop = await Shop.findOne({ userId: userId });
      if (!shop) {
        return res.status(404).json({ success: false, message: 'Shop not found' });
      }
      
      // Calculate statistics
      const stats = {
        totalServices: shop.services.length,
        totalReviews: shop.reviews.length,
        averageRating: shop.rating,
        totalImages: shop.images.length
      };
      
      res.json({ success: true, stats });
    } catch (error) {
      console.error('Error getting shop stats:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  },
  
  // Search barbershops by zipCode, city, state (for POST request) - UPDATED METHOD
  searchBarbershops: async (req, res) => {
    try {
      console.log('Controller: searchBarbershops called with body:', req.body);
      const { zipCode, city, state } = req.body;
      
      // Build the query
      let query = {};
      
      if (zipCode) {
        query['location.zip'] = zipCode;
      }
      
      if (city) {
        query['location.city'] = { $regex: city.trim(), $options: 'i' };
      }
      
      if (state) {
        query['location.state'] = { $regex: state.trim(), $options: 'i' };
      }
      
      console.log('Controller: Barbershop search query:', JSON.stringify(query));
      
      // Execute the query
      const shops = await Shop.find(query)
        .populate('userId', 'firstName lastName email')
        .exec();
      
      console.log(`Controller: Found ${shops.length} barbershops matching search criteria`);
      
      // Return the results
      return res.status(200).json({
        success: true,
        count: shops.length,
        shops: shops
      });
    } catch (error) {
      console.error('Controller: Error in searchBarbershops:', error);
      return res.status(500).json({
        error: 'Error searching barbershops',
        details: error.message
      });
    }
  }
};

module.exports = shopController;
