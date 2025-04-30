import axios from 'axios';
import config from '../config/environment';

const API_URL = config.apiUrl;
console.log('API URL configured as:', API_URL);

// Helper function to log request details
const logRequest = (method, url, token, data) => {
  console.log(`${method} request to: ${url}`);
  if (token) {
    console.log(`Using token (first 10 chars): ${token.substring(0, 10)}...`);
    console.log(`Token length: ${token.length}`);
  }
  if (data) {
    console.log(`Request data:`, JSON.stringify(data).substring(0, 200) + (JSON.stringify(data).length > 200 ? '...' : ''));
  }
};

// Helper function to handle errors
const handleError = (method, error) => {
  if (error.response) {
    console.error(`API Error - ${method} status:`, error.response.status);
    console.error(`API Error - ${method} data:`, error.response.data);
    
    // Return a more structured error that includes status code
    return {
      status: error.response.status,
      message: error.response.data.error || error.response.data.message || 'An error occurred',
      data: error.response.data
    };
  } else {
    console.error(`API Error - ${method}:`, error.message);
    
    // Return a generic error
    return {
      status: 500,
      message: error.message || 'Network error occurred',
    };
  }
};

// Check if token exists before making authenticated requests
const validateToken = (token, methodName) => {
  if (!token) {
    console.error(`${methodName}: No authentication token provided`);
    throw {
      status: 401,
      message: 'Authentication token is required'
    };
  }
  
  // Log token details for debugging
  console.log(`Token validation for ${methodName}:`, {
    length: token.length,
    start: token.substring(0, 10),
    end: token.substring(token.length - 10)
  });
};

export const shopService = {
  // Get shop data for the authenticated user
  getShopData: async (token) => {
    validateToken(token, 'getShopData');
    
    try {
      const url = `${API_URL}/api/shop`;
      logRequest('GET', url, token);
      
      const response = await axios.get(
        url,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('Shop data response:', JSON.stringify(response.data).substring(0, 200) + '...');
      return response.data;
    } catch (error) {
      throw handleError('getShopData', error);
    }
  },

  // Upload image
  uploadImage: async (imageBase64, token) => {
    validateToken(token, 'uploadImage');
    
    try {
      const url = `${API_URL}/api/shop/upload-image`;
      logRequest('POST', url, token);
      console.log('Image data length:', imageBase64.length);
      
      // Ensure token is properly formatted in the Authorization header
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
      
      console.log('Request headers:', headers);
      
      // Change 'image' to 'imageData' to match what the controller expects
      const response = await axios.post(
        url,
        { imageData: imageBase64 },
        { headers }
      );
      
      console.log('Image upload response status:', response.status);
      return response.data;
    } catch (error) {
      throw handleError('uploadImage', error);
    }
  },
  
  // Delete image
  deleteImage: async (imageIndex, token) => {
    validateToken(token, 'deleteImage');
    
    try {
      const url = `${API_URL}/api/shop/images/${imageIndex}`;
      logRequest('DELETE', url, token);
      
      const response = await axios.delete(
        url,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      return response.data;
    } catch (error) {
      throw handleError('deleteImage', error);
    }
  },
  
  // Add service
  addService: async (serviceData, token) => {
    validateToken(token, 'addService');
    
    try {
      const url = `${API_URL}/api/shop/services`;
      logRequest('POST', url, token, serviceData);
      
      // Make sure the service data is properly formatted
      const formattedServiceData = {
        name: serviceData.name,
        description: serviceData.description,
        price: parseFloat(serviceData.price),
        duration: parseInt(serviceData.duration),
        category: serviceData.category || null
      };
      
      console.log('Formatted service data:', formattedServiceData);
      
      const response = await axios.post(
        url,
        formattedServiceData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('Add service response:', response.data);
      return response.data;
    } catch (error) {
      throw handleError('addService', error);
    }
  },
  
  // Remove service
  removeService: async (serviceId, token) => {
    validateToken(token, 'removeService');
    
    try {
      const url = `${API_URL}/api/shop/services/${serviceId}`;
      logRequest('DELETE', url, token);
      
      const response = await axios.delete(
        url,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      return response.data;
    } catch (error) {
      throw handleError('removeService', error);
    }
  },
  
  // Update shop details
  updateShopDetails: async (shopData, token) => {
    validateToken(token, 'updateShopDetails');
    
    try {
      const url = `${API_URL}/api/shop/update`;
      logRequest('PUT', url, token, shopData);
      
      // Make sure phone is included in the request
      const formattedShopData = {
        name: shopData.name,
        description: shopData.description,
        phone: shopData.phone, // Ensure phone is included
        location: {
          address: shopData.location.address,
          city: shopData.location.city,
          state: shopData.location.state,
          zip: shopData.location.zip
        }
      };
      
      console.log('Formatted shop data:', formattedShopData);
      
      const response = await axios.put(
        url,
        formattedShopData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('Update shop response:', response.data);
      return response.data;
    } catch (error) {
      throw handleError('updateShopDetails', error);
    }
  },
  
  // Get shop images
  getShopImages: async (token) => {
    validateToken(token, 'getShopImages');
    
    try {
      const url = `${API_URL}/api/shop/images`;
      logRequest('GET', url, token);
      
      const response = await axios.get(
        url,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      return response.data;
    } catch (error) {
      throw handleError('getShopImages', error);
    }
  },
  
  // Get shop by ID (for public viewing)
  getShopById: async (shopId) => {
    try {
      const url = `${API_URL}/api/shop/${shopId}`;
      logRequest('GET', url);
      
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      throw handleError('getShopById', error);
    }
  },
  
  // Get all shops (for marketplace/search)
  getAllShops: async (searchParams = {}) => {
    try {
      let url = `${API_URL}/api/shop/all`;
      
      // Add search parameters if provided
      if (Object.keys(searchParams).length > 0) {
        const queryParams = new URLSearchParams();
        
        if (searchParams.search) {
          queryParams.append('search', searchParams.search);
        }
        
        if (searchParams.location) {
          queryParams.append('location', searchParams.location);
        }
        
        if (searchParams.service) {
          queryParams.append('service', searchParams.service);
        }
        
        url += `?${queryParams.toString()}`;
      }
      
      logRequest('GET', url);
      
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      throw handleError('getAllShops', error);
    }
  },
  
  // Add a review to a shop
  addReview: async (shopId, reviewData, token) => {
    validateToken(token, 'addReview');
    
    try {
      const url = `${API_URL}/api/shop/${shopId}/reviews`;
      logRequest('POST', url, token, reviewData);
      
      const response = await axios.post(
        url,
        reviewData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      return response.data;
    } catch (error) {
      throw handleError('addReview', error);
    }
  },
  
  // Create a new shop
  createShop: async (shopData, token) => {
    validateToken(token, 'createShop');
    
    try {
      const url = `${API_URL}/api/shop/create`;
      logRequest('POST', url, token, shopData);
      
      const response = await axios.post(
        url,
        shopData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('Create shop response:', response.data);
      return response.data;
    } catch (error) {
      throw handleError('createShop', error);
    }
  },
  
  // Update a service
  updateService: async (serviceId, serviceData, token) => {
    validateToken(token, 'updateService');
    
    try {
      const url = `${API_URL}/api/shop/services/${serviceId}`;
      logRequest('PUT', url, token, serviceData);
      
      // Make sure the service data is properly formatted
      const formattedServiceData = {
        name: serviceData.name,
        description: serviceData.description,
        price: parseFloat(serviceData.price),
        duration: parseInt(serviceData.duration),
        category: serviceData.category || null
      };
      
      console.log('Formatted service data for update:', formattedServiceData);
      
      const response = await axios.put(
        url,
        formattedServiceData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('Update service response:', response.data);
      return response.data;
    } catch (error) {
      throw handleError('updateService', error);
    }
  }
};
