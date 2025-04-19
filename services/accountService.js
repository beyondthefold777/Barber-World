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
   * @param {Object} updateData - Data to update (username, phoneNumber, address, etc.)
   */
  updateProfile: async (updateData) => {
    try {
      console.log('accountService: Updating profile with data:', updateData);
      const token = await AsyncStorage.getItem('authToken');
      
      if (!token) {
        console.log('accountService: No auth token found');
        return { success: false, message: 'No auth token found' };
      }
      
      // Ensure we're only sending allowed fields to the API
      const sanitizedData = {
        username: updateData.username,
        phoneNumber: updateData.phoneNumber,
        address: updateData.address,
        city: updateData.city,
        state: updateData.state,
        zipCode: updateData.zipCode,
        bio: updateData.bio,
        profileImage: updateData.profileImage
      };
      
      // Remove undefined fields
      Object.keys(sanitizedData).forEach(key => 
        sanitizedData[key] === undefined && delete sanitizedData[key]
      );
      
      console.log('accountService: Making API request to update profile with sanitized data:', sanitizedData);
      const response = await axios.put(
        `${API_URL}/account/profile`,
        sanitizedData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      console.log('accountService: Update response received', response.data);
      
      if (response.data.success) {
        // Update the cached user data
        const cachedData = await AsyncStorage.getItem('userData');
        let userData = {};
        
        if (cachedData) {
          userData = JSON.parse(cachedData);
        }
        
        // Merge the updated data with existing cached data
        const updatedUserData = {
          ...userData,
          ...response.data.user
        };
        
        await AsyncStorage.setItem('userData', JSON.stringify(updatedUserData));
        console.log('accountService: Updated cached user data');
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
   * Update user's phone number
   * @param {string} phoneNumber - The new phone number
   */
  updatePhoneNumber: async (phoneNumber) => {
    try {
      console.log('accountService: Updating phone number to:', phoneNumber);
      return await accountService.updateProfile({ phoneNumber });
    } catch (error) {
      console.error('accountService: Error updating phone number:', error);
      return {
        success: false,
        message: 'Failed to update phone number'
      };
    }
  },
  
  /**
   * Update user's address information
   * @param {Object} addressData - Address data (address, city, state, zipCode)
   */
  updateAddress: async (addressData) => {
    try {
      console.log('accountService: Updating address information:', addressData);
      return await accountService.updateProfile(addressData);
    } catch (error) {
      console.error('accountService: Error updating address:', error);
      return {
        success: false,
        message: 'Failed to update address'
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
   * Update cached user data
   * @param {Object} userData - User data to cache
   */
  updateCachedUserData: async (userData) => {
    try {
      console.log('accountService: Updating cached user data');
      const currentDataString = await AsyncStorage.getItem('userData');
      let currentData = {};
      
      if (currentDataString) {
        currentData = JSON.parse(currentDataString);
      }
      
      const updatedData = {
        ...currentData,
        ...userData
      };
      
      await AsyncStorage.setItem('userData', JSON.stringify(updatedData));
      console.log('accountService: Cached user data updated successfully');
      return true;
    } catch (error) {
      console.error('accountService: Error updating cached user data:', error);
      return false;
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
