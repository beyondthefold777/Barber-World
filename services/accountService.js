import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'https://barber-world.fly.dev/api';

const accountService = {
  /**
   * Get the current user's profile
   */
  getProfile: async () => {
    try {
      console.log('accountService: Getting user profile');
      const token = await AsyncStorage.getItem('authToken');
      
      if (!token) {
        console.log('accountService: No auth token found');
        return { success: false, message: 'No auth token found' };
      }
      
      console.log('accountService: Making API request to fetch profile');
      const response = await axios.get(`${API_URL}/account/profile`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      console.log('accountService: Profile data received', response.data);
      
      if (response.data.success) {
        // Cache the user data
        await AsyncStorage.setItem('userData', JSON.stringify(response.data.user));
      }
      
      return response.data;
    } catch (error) {
      console.error('accountService: Error fetching profile:', error);
      console.log('accountService: Error response:', error.response?.data);
      
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch profile'
      };
    }
  },
  
  /**
   * Update the user's profile
   */
  updateProfile: async (updateData) => {
    try {
      console.log('accountService: Updating profile with data:', updateData);
      const token = await AsyncStorage.getItem('authToken');
      
      if (!token) {
        console.log('accountService: No auth token found');
        return { success: false, message: 'No auth token found' };
      }
      
      console.log('accountService: Making API request to update profile');
      const response = await axios.put(
        `${API_URL}/account/profile`,
        updateData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      console.log('accountService: Update response received', response.data);
      
      if (response.data.success) {
        // Update the cached user data
        await AsyncStorage.setItem('userData', JSON.stringify(response.data.user));
      }
      
      return response.data;
    } catch (error) {
      console.error('accountService: Error updating profile:', error);
      console.log('accountService: Error response:', error.response?.data);
      
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update profile'
      };
    }
  },
  
  /**
   * Get cached user data
   */
  getCachedUserData: async () => {
    try {
      console.log('accountService: Getting cached user data');
      const userDataString = await AsyncStorage.getItem('userData');
      
      if (!userDataString) {
        console.log('accountService: No cached user data found');
        return null;
      }
      
      console.log('accountService: Cached user data found');
      return JSON.parse(userDataString);
    } catch (error) {
      console.error('accountService: Error getting cached user data:', error);
      return null;
    }
  },
  
  /**
   * Logout the user
   */
  logout: async () => {
    try {
      console.log('accountService: Logging out user');
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('userData');
      return { success: true };
    } catch (error) {
      console.error('accountService: Error during logout:', error);
      return { success: false, message: 'Failed to logout' };
    }
  }
};

export default accountService;
