import AsyncStorage from '@react-native-async-storage/async-storage';

export const clearUserData = async () => {
  try {
    const keysToRemove = [
      'token',
      'userToken',
      'userData',
      'user',
      'userInfo',
      'userRole',
      'appointments',
      'userAppointments'
    ];
    
    console.log('Clearing user data from AsyncStorage');
    await Promise.all(keysToRemove.map(key => AsyncStorage.removeItem(key)));
    console.log('User data cleared successfully');
    
    return true;
  } catch (error) {
    console.error('Error clearing user data:', error);
    return false;
  }
};

export const storeUserData = async (userData, token) => {
  try {
    // Store user data
    await AsyncStorage.setItem('userData', JSON.stringify(userData));
    
    // Store token
    if (token) {
      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('userToken', token);
    }
    
    // Store user role if available
    if (userData && userData.role) {
      await AsyncStorage.setItem('userRole', userData.role);
    }
    
    // Clear any existing appointments data to prevent contamination
    await AsyncStorage.removeItem('appointments');
    await AsyncStorage.removeItem('userAppointments');
    
    console.log('User data stored successfully');
    return true;
  } catch (error) {
    console.error('Error storing user data:', error);
    return false;
  }
};

export const getUserData = async () => {
  try {
    const userData = await AsyncStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Error getting user data:', error);
    return null;
  }
};

export const getUserToken = async () => {
  try {
    return await AsyncStorage.getItem('token') || await AsyncStorage.getItem('userToken');
  } catch (error) {
    console.error('Error getting user token:', error);
    return null;
  }
};

export const getUserId = async () => {
  try {
    const userData = await getUserData();
    return userData?.id || null;
  } catch (error) {
    console.error('Error getting user ID:', error);
    return null;
  }
};

export const clearAppointmentsData = async () => {
  try {
    await AsyncStorage.removeItem('appointments');
    await AsyncStorage.removeItem('userAppointments');
    console.log('Appointments data cleared successfully');
    return true;
  } catch (error) {
    console.error('Error clearing appointments data:', error);
    return false;
  }
};
