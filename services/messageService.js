import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import config from '../config/environment';

const API_URL = config.apiUrl;

/**
 * Creates an API request with error handling
 */
const makeApiRequest = async ({ method = 'GET', endpoint, data = null, token = null }) => {
  try {
    console.log(`Making ${method} request to: ${API_URL}${endpoint}`);
    
    const headers = { 'Content-Type': 'application/json' };
    
    if (token) {
      headers['x-auth-token'] = token;
    }
    
    const response = await axios({
      method,
      url: `${API_URL}${endpoint}`,
      data,
      headers,
      timeout: 10000 // 10 second timeout
    });
    
    console.log(`API response status: ${response.status}`);
    return response.data;
  } catch (error) {
    console.error(`API request failed: ${error.message}`);
    if (error.response) {
      console.error(`Status: ${error.response.status}, Data:`, error.response.data);
    }
    
    return {
      success: false,
      message: error.response?.data?.message || 'Network error. Please check your connection.'
    };
  }
};

/**
 * Get all conversations for the current user
 */
const getConversations = async () => {
  try {
    console.log('Fetching all conversations');
    const token = await AsyncStorage.getItem('userToken');
    
    if (!token) {
      console.error('No auth token found');
      return { success: false, message: 'Authentication required' };
    }
    
    const response = await makeApiRequest({
      endpoint: '/api/messages/conversations',
      token
    });
    
    if (response?.success) {
      console.log(`Successfully fetched ${response.conversations?.length || 0} conversations`);
      return response;
    } else {
      console.error('Failed to fetch conversations:', response?.message);
      return { 
        success: false, 
        message: response?.message || 'Failed to fetch conversations',
        conversations: [] 
      };
    }
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return { success: false, message: 'An unexpected error occurred', conversations: [] };
  }
};

/**
 * Get messages for a specific conversation
 */
const getMessages = async (recipientId) => {
  try {
    console.log(`Fetching messages for recipient: ${recipientId}`);
    const token = await AsyncStorage.getItem('userToken');
    
    if (!token) {
      console.error('No auth token found');
      return { success: false, message: 'Authentication required' };
    }
    
    const response = await makeApiRequest({
      endpoint: `/api/messages/${recipientId}`,
      token
    });
    
    if (response?.success) {
      console.log(`Successfully fetched ${response.messages?.length || 0} messages`);
      return response;
    } else {
      console.error('Failed to fetch messages:', response?.message);
      return { 
        success: false, 
        message: response?.message || 'Failed to fetch messages',
        messages: [] 
      };
    }
  } catch (error) {
    console.error('Error fetching messages:', error);
    return { success: false, message: 'An unexpected error occurred', messages: [] };
  }
};

/**
 * Send a message to a recipient
 */
const sendMessage = async (recipientId, text) => {
  try {
    console.log(`Sending message to recipient: ${recipientId}`);
    console.log(`Message text: ${text.substring(0, 30)}${text.length > 30 ? '...' : ''}`);
    
    const token = await AsyncStorage.getItem('userToken');
    
    if (!token) {
      console.error('No auth token found');
      return { success: false, message: 'Authentication required' };
    }
    
    // Add username from storage if available
    const userDataString = await AsyncStorage.getItem('userData');
    let userData = {};
    
    if (userDataString) {
      userData = JSON.parse(userDataString);
    }
    
    const messageData = { 
      recipientId, 
      text,
      senderName: userData.username || userData.businessName || ''
    };
    
    const response = await makeApiRequest({
      method: 'POST',
      endpoint: '/api/messages/send',
      data: messageData,
      token
    });
    
    if (response?.success) {
      console.log('Message sent successfully');
      return response;
    } else {
      console.error('Failed to send message:', response?.message);
      return { 
        success: false, 
        message: response?.message || 'Failed to send message'
      };
    }
  } catch (error) {
    console.error('Error sending message:', error);
    return { success: false, message: 'An unexpected error occurred' };
  }
};

/**
 * Mark messages as read
 */
const markAsRead = async (conversationId) => {
  try {
    console.log(`Marking messages as read for conversation: ${conversationId}`);
    const token = await AsyncStorage.getItem('userToken');
    
    if (!token) {
      console.error('No auth token found');
      return { success: false, message: 'Authentication required' };
    }
    
    const response = await makeApiRequest({
      method: 'PUT',
      endpoint: `/api/messages/read/${conversationId}`,
      token
    });
    
    if (response?.success) {
      console.log('Messages marked as read successfully');
      return response;
    } else {
      console.error('Failed to mark messages as read:', response?.message);
      return { 
        success: false, 
        message: response?.message || 'Failed to mark messages as read'
      };
    }
  } catch (error) {
    console.error('Error marking messages as read:', error);
    return { success: false, message: 'An unexpected error occurred' };
  }
};

/**
 * Test API connection
 */
const testConnection = async () => {
  try {
    console.log('Testing API connection...');
    const response = await makeApiRequest({
      endpoint: '/api/ping'
    });
    
    return response?.success 
      ? { success: true, message: 'Connected to API successfully' }
      : { success: false, message: response?.message || 'Connection test failed' };
  } catch (error) {
    console.error('API connection test failed:', error);
    return { success: false, message: `Connection test failed: ${error.message}` };
  }
};

export default {
  getConversations,
  getMessages,
  sendMessage,
  markAsRead,
  testConnection
};
