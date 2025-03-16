import axios from 'axios';
import config from '../config/environment';

const API_URL = config.apiUrl;
console.log('API URL configured as:', API_URL);

// Helper function to log request details
const logRequest = (method, url, token) => {
  console.log(`${method} request to: ${url}`);
  if (token) {
    console.log(`Using token (first 10 chars): ${token.substring(0, 10)}...`);
    console.log(`Token length: ${token.length}`);
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
      
      const response = await axios.post(
        url,
        { image: imageBase64 },
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
      logRequest('POST', url, token);
      
      const response = await axios.post(
        url,
        serviceData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
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
      logRequest('PUT', url, token);
      
      const response = await axios.put(
        url,
        shopData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
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
      logRequest('POST', url, token);
      
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
      logRequest('POST', url, token);
      
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
      
      return response.data;
    } catch (error) {
      throw handleError('createShop', error);
    }
  }
};