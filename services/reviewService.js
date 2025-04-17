import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import config from '../config/environment';

const API_URL = config.apiUrl;

// Get reviews for a shop
export const getShopReviews = async (shopId) => {
  try {
    const response = await axios.get(`${API_URL}/api/shop/${shopId}/reviews`);
    
    if (response.data && response.data.success) {
      return response.data;
    } else {
      return { success: false, reviews: [] };
    }
  } catch (error) {
    console.error('Error fetching shop reviews:', error);
    return { success: false, reviews: [], error: error.message };
  }
};

// Submit a review for a shop
export const submitShopReview = async (shopId, reviewData, token = null) => {
  try {
    // Get token if not provided
    if (!token) {
      token = await AsyncStorage.getItem('userToken');
    }
    
    // Normalize review data
    const normalizedReviewData = { ...reviewData };
    if (normalizedReviewData.comment && !normalizedReviewData.text) {
      normalizedReviewData.text = normalizedReviewData.comment;
      delete normalizedReviewData.comment;
    }
    
    // Add username from storage if available
    try {
      const userDataString = await AsyncStorage.getItem('userData');
      if (userDataString) {
        const userData = JSON.parse(userDataString);
        normalizedReviewData.userName = userData.username || userData.businessName || '';
      }
    } catch (error) {
      // Continue without username if there's an error
    }
    
    // Set up headers
    const headers = {
      'Content-Type': 'application/json'
    };
    
    if (token) {
      headers['x-auth-token'] = token;
    }
    
    // Make the API request
    const response = await axios.post(
      `${API_URL}/api/shop/${shopId}/reviews`,
      normalizedReviewData,
      { headers }
    );
    
    return response.data;
  } catch (error) {
    // Handle error responses
    if (error.response && error.response.data) {
      return {
        success: false,
        message: error.response.data.message || 'Failed to submit review'
      };
    }
    
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
