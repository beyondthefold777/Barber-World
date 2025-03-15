const Shop = require('../models/shop.model');

// Log when the controller is loaded
console.log('Shop controller loaded successfully');
console.log('Shop model imported:', typeof Shop === 'function');

const shopController = {
  createShop: async (req, res) => {
    console.log('createShop method called');
    try {
      const { name, description, location, services } = req.body;
      console.log('Creating shop for user:', req.user.id);
      
      const shop = new Shop({
        userId: req.user.id,
        name,
        description,
        location,
        services,
        images: [] // Initialize with empty images array
      });

      await shop.save();
      console.log('Shop created successfully');
      res.json({ success: true, shop });
    } catch (error) {
      console.error('Shop creation error:', error);
      res.status(500).json({ error: 'Failed to create shop' });
    }
  },

  getShop: async (req, res) => {
    console.log('getShop method called');
    try {
      console.log('Fetching shop for user:', req.user.id);
      const shop = await Shop.findOne({ userId: req.user.id });
      console.log('Shop found:', !!shop);
      res.json({ shop });
    } catch (error) {
      console.error('Shop fetch error:', error);
      res.status(500).json({ error: 'Failed to fetch shop' });
    }
  },

  updateShop: async (req, res) => {
    console.log('updateShop method called');
    try {
      const updateData = { ...req.body };
      console.log('Updating shop for user:', req.user.id);
      
      // If an image is being uploaded
      if (updateData.images) {
        console.log('Image upload detected in update');
        // Find the shop first
        const existingShop = await Shop.findOne({ userId: req.user.id });
        
        if (!existingShop) {
          console.log('Shop not found for image upload');
          return res.status(404).json({ error: 'Shop not found' });
        }
        
        // Add the new image to the existing images array
        const updatedImages = [...(existingShop.images || []), updateData.images];
        updateData.images = updatedImages;
        
        console.log(`Adding new image. Total images: ${updatedImages.length}`);
      }
      
      const shop = await Shop.findOneAndUpdate(
        { userId: req.user.id },
        updateData,
        { new: true }
      );
      
      if (!shop) {
        console.log('Shop not found for update');
        return res.status(404).json({ error: 'Shop not found' });
      }
      
      console.log('Shop updated successfully');
      res.json({ success: true, shop });
    } catch (error) {
      console.error('Shop update error:', error);
      res.status(500).json({ error: 'Failed to update shop', message: error.message });
    }
  },

  uploadImage: async (req, res) => {
    console.log('uploadImage method called');
    try {
      // Check if user is authenticated
      if (!req.user || !req.user.id) {
        console.log('User not authenticated or user ID missing');
        return res.status(401).json({ success: false, message: 'User not authenticated' });
      }
      
      // Get the image data from the request body
      // Check for both possible property names
      const imageData = req.body.imageData || req.body.image;
      console.log('Image data received, length:', imageData ? imageData.length : 'no image data');
      console.log('User ID:', req.user.id);
      
      if (!imageData) {
        return res.status(400).json({ success: false, message: 'No image data provided' });
      }
      
      // First check if the shop exists
      const shopExists = await Shop.findOne({ userId: req.user.id });
      
      if (!shopExists) {
        console.log('Shop not found for user:', req.user.id);
        return res.status(404).json({ 
          success: false, 
          message: 'Shop not found. Please create a shop first.' 
        });
      }
      
      // Find and update the shop with the new image
      const shop = await Shop.findOneAndUpdate(
        { userId: req.user.id },
        { $push: { images: imageData } },
        { new: true }
      );
      
      console.log('Shop found and updated:', !!shop);
      console.log('Image uploaded successfully');
      console.log('Total images after update:', shop.images.length);
      
      res.json({
        success: true,
        message: 'Image uploaded successfully',
        images: shop.images
      });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ error: 'Image upload failed', message: error.message });
    }
  },

  getShopImages: async (req, res) => {
    console.log('getShopImages method called');
    try {
      console.log('Fetching images for user:', req.user.id);
      const shop = await Shop.findOne({ userId: req.user.id });
      console.log('Shop found:', !!shop);
      console.log('Images count:', shop ? shop.images.length : 0);
      res.json({ images: shop ? shop.images : [] });
    } catch (error) {
      console.error('Image fetch error:', error);
      res.status(500).json({ error: 'Failed to fetch images' });
    }
  },

  deleteImage: async (req, res) => {
    console.log('deleteImage method called');
    try {
      console.log('Deleting image for user:', req.user.id);
      console.log('Image index to delete:', req.params.imageId);
      
      // First get the shop to access the images
      const shop = await Shop.findOne({ userId: req.user.id });
      
      if (!shop) {
        return res.status(404).json({ error: 'Shop not found' });
      }
      
      // Remove the image at the specified index
      const imageIndex = parseInt(req.params.imageId);
      if (isNaN(imageIndex) || imageIndex < 0 || imageIndex >= shop.images.length) {
        return res.status(400).json({ error: 'Invalid image index' });
      }
      
      shop.images.splice(imageIndex, 1);
      await shop.save();
      
      console.log('Image deleted successfully');
      res.json({ success: true, images: shop.images });
    } catch (error) {
      console.error('Image delete error:', error);
      res.status(500).json({ error: 'Failed to delete image' });
    }
  },

  addService: async (req, res) => {
    console.log('addService method called');
    try {
      console.log('Adding service for user:', req.user.id);
      console.log('Service data:', req.body);
      const shop = await Shop.findOneAndUpdate(
        { userId: req.user.id },
        { $push: { services: req.body } },
        { new: true }
      );
      
      if (!shop) {
        return res.status(404).json({ error: 'Shop not found' });
      }
      
      console.log('Service added successfully');
      res.json({ success: true, services: shop.services });
    } catch (error) {
      console.error('Service add error:', error);
      res.status(500).json({ error: 'Failed to add service' });
    }
  },

  removeService: async (req, res) => {
    console.log('removeService method called');
    try {
      console.log('Removing service for user:', req.user.id);
      console.log('Service ID to remove:', req.params.serviceId);
      const shop = await Shop.findOneAndUpdate(
        { userId: req.user.id },
        { $pull: { services: { _id: req.params.serviceId } } },
        { new: true }
      );
      
      if (!shop) {
        return res.status(404).json({ error: 'Shop not found' });
      }
      
      console.log('Service removed successfully');
      res.json({ success: true, services: shop.services });
    } catch (error) {
      console.error('Service remove error:', error);
      res.status(500).json({ error: 'Failed to remove service' });
    }
  },

  addReview: async (req, res) => {
    console.log('addReview method called');
    try {
      const { rating, comment } = req.body;
      console.log('Adding review for shop:', req.params.shopId);
      console.log('Review data:', { rating, comment });
      
      const review = {
        userId: req.user.id,
        rating,
        comment
      };

      // First find the shop to get current rating
      const shopToUpdate = await Shop.findById(req.params.shopId);
      if (!shopToUpdate) {
        console.log('Shop not found');
        return res.status(404).json({ error: 'Shop not found' });
      }
      
      // Calculate new rating
      const newRating = (shopToUpdate.rating * shopToUpdate.reviews.length + rating) / (shopToUpdate.reviews.length + 1);
      console.log('New calculated rating:', newRating);

      const shop = await Shop.findOneAndUpdate(
        { _id: req.params.shopId },
        { 
          $push: { reviews: review },
          $set: { rating: newRating }
        },
        { new: true }
      );
      
      console.log('Review added successfully');
      res.json({ success: true, reviews: shop.reviews });
    } catch (error) {
      console.error('Review add error:', error);
      res.status(500).json({ error: 'Failed to add review' });
    }
  },
  
  // Get shop by ID (for public viewing)
  getShopById: async (req, res) => {
    console.log('getShopById method called');
    try {
      const { shopId } = req.params;
      console.log('Fetching shop by ID:', shopId);
      
      const shop = await Shop.findById(shopId);
      
      if (!shop) {
        console.log('Shop not found');
        return res.status(404).json({ error: 'Shop not found' });
      }
      
      console.log('Shop found successfully');
      res.json({ success: true, shop });
    } catch (error) {
      console.error('Shop fetch by ID error:', error);
      res.status(500).json({ error: 'Failed to fetch shop' });
    }
  },
  
  // Get all shops (for marketplace/search)
  getAllShops: async (req, res) => {
    console.log('getAllShops method called');
    try {
      const { search, location, service } = req.query;
      let query = {};
      
      // Build search query
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ];
      }
      
      if (location) {
        query['location.city'] = { $regex: location, $options: 'i' };
      }
      
      if (service) {
        query['services.name'] = { $regex: service, $options: 'i' };
      }
      
      console.log('Search query:', JSON.stringify(query));
      
      const shops = await Shop.find(query).sort({ rating: -1 });
      console.log(`Found ${shops.length} shops`);
      
      res.json({ success: true, shops });
    } catch (error) {
      console.error('Get all shops error:', error);
      res.status(500).json({ error: 'Failed to fetch shops' });
    }
  }
};

// Log all available methods
console.log('Controller methods:', Object.keys(shopController));

module.exports = shopController;