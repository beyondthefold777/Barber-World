import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import config from '../config/environment';

const API_URL = config.apiUrl;

// Get reviews for a shop
export const getShopReviews = async (shopId) => {
  try {
    console.log(`Fetching reviews for shop ${shopId}`);
    const response = await axios.get(`${API_URL}/api/shop/${shopId}/reviews`);
    
    if (response.data && response.data.success) {
      console.log(`Successfully fetched ${response.data.reviews.length} reviews`);
      return response.data;
    } else {
      console.log('Failed to fetch reviews:', response.data);
      return { success: false, reviews: [] };
    }
  } catch (error) {
    console.error('Error fetching shop reviews:', error);
    return { success: false, reviews: [], error: error.message };
  }
};

// Submit a review for a shop - Updated to include username with correct field names
export const submitShopReview = async (shopId, reviewData, token = null) => {
  try {
    console.log(`Submitting review for shop ${shopId}:`, reviewData);
    
    // If token is not provided as parameter, try to get it from AsyncStorage
    if (!token) {
      token = await AsyncStorage.getItem('userToken');
    }
    
    // Ensure we're using the correct field name for the review text
    // If reviewData has 'comment' but backend expects 'text', convert it
    if (reviewData.comment && !reviewData.text) {
      reviewData.text = reviewData.comment;
      delete reviewData.comment;
    }
    
    // Try to get user data from AsyncStorage
    try {
      const userDataString = await AsyncStorage.getItem('userData');
      if (userDataString) {
        const userData = JSON.parse(userDataString);
        // Use the username field specifically
        if (userData.username) {
          // Make sure we're using the field name the backend expects
          reviewData.userName = userData.username;
          console.log('Found username from storage:', userData.username);
        } else if (userData.businessName) {
          // For barbershop users, use businessName as fallback
          reviewData.userName = userData.businessName;
          console.log('Using businessName as username:', userData.businessName);
        }
      }
    } catch (error) {
      console.log('Error getting user data from storage:', error);
    }
    
    // Set up headers
    const headers = {
      'Content-Type': 'application/json'
    };
    
    // Add token to headers if available - using x-auth-token header
    if (token) {
      headers['x-auth-token'] = token;
      console.log('Using authentication token for review submission');
    } else {
      console.log('No authentication token found, submitting review without authentication');
    }
    
    console.log('Final review data being sent:', reviewData);
    
    // Make the API request with or without the token
    const response = await axios.post(
      `${API_URL}/api/shop/${shopId}/reviews`,
      reviewData,
      { headers }
    );
    
    console.log('Review submission response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error submitting review:', error);
    
    // Handle specific error responses
    if (error.response) {
      console.log('Error response data:', error.response.data);
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
