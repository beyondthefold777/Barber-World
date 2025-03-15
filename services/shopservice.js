import axios from 'axios';
import config from '../config/environment';

const API_URL = config.apiUrl;
console.log('API URL configured as:', API_URL);

// Helper function to log request details
const logRequest = (method, url, token) => {
  console.log(`${method} request to: ${url}`);
  if (token) {
    console.log(`Using token (first 10 chars): ${token.substring(0, 10)}...`);
  }
};

// Helper function to handle errors
const handleError = (method, error) => {
  if (error.response) {
    console.error(`API Error - ${method} status:`, error.response.status);
    console.error(`API Error - ${method} data:`, error.response.data);
    console.error(`API Error - ${method} headers:`, error.response.headers);
  } else {
    console.error(`API Error - ${method}:`, error.message);
  }
  throw error;
};

export const shopService = {
  // Get shop data
  getShopData: async (token) => {
    try {
      // Try the /api/shop/data endpoint first
      const url = `${API_URL}/api/shop/data`;
      logRequest('GET', url, token);
      
      try {
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
        // If the /data endpoint fails, try the fallback endpoint
        console.log('First endpoint failed, trying fallback...');
        const fallbackUrl = `${API_URL}/api/shop`;
        logRequest('GET', fallbackUrl, token);
        
        const fallbackResponse = await axios.get(
          fallbackUrl,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        return fallbackResponse.data;
      }
    } catch (error) {
      handleError('getShopData', error);
    }
  },
  
  // Upload image
  uploadImage: async (imageBase64, token) => {
    try {
      const url = `${API_URL}/api/shop/upload-image`;
      logRequest('POST', url, token);
      console.log('Image data length:', imageBase64.length);
      
      const response = await axios.post(
        url,
        { image: imageBase64 }, // Use 'image' as the key to match the server
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('Image upload response status:', response.status);
      return response.data;
    } catch (error) {
      handleError('uploadImage', error);
    }
  },
  
  // Delete image
  deleteImage: async (imageIndex, token) => {
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
      handleError('deleteImage', error);
    }
  },
  
  // Add service
  addService: async (serviceData, token) => {
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
      handleError('addService', error);
    }
  },
  
  // Remove service
  removeService: async (serviceId, token) => {
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
      handleError('removeService', error);
    }
  },
  
  // Update shop details
  updateShopDetails: async (shopData, token) => {
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
      handleError('updateShopDetails', error);
    }
  },
  
  // Get shop images
  getShopImages: async (token) => {
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
      handleError('getShopImages', error);
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
      handleError('getShopById', error);
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
      handleError('getAllShops', error);
    }
  },
  
  // Add a review to a shop
  addReview: async (shopId, reviewData, token) => {
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
      handleError('addReview', error);
    }
  },
  
  // Create a new shop
  createShop: async (shopData, token) => {
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
      handleError('createShop', error);
    }
  }
};