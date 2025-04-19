import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import config from '../config/environment';

const API_URL = config.apiUrl;

/**
 * Creates an API request with error handling
 */
const makeApiRequest = async ({ method = 'GET', endpoint, data = null, token = null }) => {
  try {
    const headers = { 'Content-Type': 'application/json' };
    
    if (token) {
      headers['x-auth-token'] = token;
    }
    
    const response = await axios({
      method,
      url: `${API_URL}${endpoint}`,
      data,
      headers
    });
    
    return response.data;
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Network error. Please check your connection.'
    };
  }
};

/**
 * Get reviews for a shop
 */
export const getShopReviews = async (shopId) => {
  try {
    const response = await makeApiRequest({
      endpoint: `/api/shop/${shopId}/reviews`
    });
    
    return response?.success ? response : { success: false, reviews: [] };
  } catch (error) {
    console.error('Error fetching shop reviews:', error);
    return { success: false, reviews: [] };
  }
};

/**
 * Submit a review for a shop
 */
export const submitShopReview = async (shopId, reviewData, token = null) => {
  try {
    // Get token if not provided
    token = token || await AsyncStorage.getItem('userToken');
    
    // Prepare review data
    const normalizedData = { ...reviewData };
    
    // Convert comment to text if needed
    if (normalizedData.comment && !normalizedData.text) {
      normalizedData.text = normalizedData.comment;
      delete normalizedData.comment;
    }
    
    // Add username from storage if available
    const userDataString = await AsyncStorage.getItem('userData');
    if (userDataString) {
      const userData = JSON.parse(userDataString);
      normalizedData.userName = userData.username || userData.businessName || '';
    }
    
    // Make the API request
    return await makeApiRequest({
      method: 'POST',
      endpoint: `/api/shop/${shopId}/reviews`,
      data: normalizedData,
      token
    });
  } catch (error) {
    return {
      success: false,
      message: 'Network error. Please check your connection and try again.'
    };
  }
};

export default {
  getShopReviews,
  submitShopReview
};
