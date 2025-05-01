import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import config from '../config/environment';

const API_URL = config.apiUrl;

/**
 * Creates an API request with error handling
 */
const makeApiRequest = async ({ method = 'GET', endpoint, data = null }) => {
  try {
    // Get token if available, but don't require it
    const token = await AsyncStorage.getItem('userToken');
    const headers = { 'Content-Type': 'application/json' };
    
    if (token) {
      // Use Authorization header instead of x-auth-token
      headers['Authorization'] = `Bearer ${token}`;
      
      // Keep x-auth-token for backward compatibility if needed
      headers['x-auth-token'] = token;
    }
    
    console.log(`Making ${method} request to ${endpoint} with token: ${token ? 'Yes' : 'No'}`);
    
    const response = await axios({
      method,
      url: `${API_URL}${endpoint}`,
      data,
      headers,
      timeout: 10000 // 10 second timeout
    });
    
    return response.data;
  } catch (error) {
    console.error(`API request failed: ${error.message}`);
    console.error('Error details:', error.response?.data || 'No response data');
    
    return {
      success: false,
      message: error.response?.data?.message || 'Network error. Please check your connection.'
    };
  }
};

/**
 * Get all conversations for the current user
 * This will include both:
 * 1. Direct conversations where the user is a participant
 * 2. Conversations with shops owned by the user (if the user is a shop owner)
 */
const getConversations = async () => {
  try {
    const response = await makeApiRequest({
      endpoint: '/api/messages/conversations'
    });
    
    return response.success 
      ? response 
      : { success: false, message: response.message || 'Failed to fetch conversations', conversations: [] };
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return { success: false, message: 'An unexpected error occurred', conversations: [] };
  }
};

/**
 * Get messages for a specific conversation
 * @param {string} recipientId - ID of the recipient (user or shop)
 */
const getMessages = async (recipientId) => {
  try {
    // First get the conversation ID
    const conversationResponse = await makeApiRequest({
      endpoint: `/api/messages/conversation/${recipientId}`
    });
    
    if (!conversationResponse.success) {
      // If no conversation exists yet, return empty messages array
      return { 
        success: true, 
        messages: [],
        conversation: null
      };
    }
    
    // Now get the messages using the conversation ID
    const messagesResponse = await makeApiRequest({
      endpoint: `/api/messages/conversation/${conversationResponse.conversationId}/messages`
    });
    
    return messagesResponse.success
      ? { 
          ...messagesResponse,
          conversation: conversationResponse.conversationId
        }
      : { 
          success: false, 
          message: messagesResponse.message || 'Failed to fetch messages', 
          messages: [],
          conversation: conversationResponse.conversationId
        };
  } catch (error) {
    console.error('Error fetching messages:', error);
    return { success: false, message: 'An unexpected error occurred', messages: [] };
  }
};

/**
 * Send a message to a recipient
 * @param {string} recipientId - ID of the recipient (user or shop)
 * @param {string} text - Message text
 */
const sendMessage = async (recipientId, text) => {
  try {
    // Get user data if available
    const userDataString = await AsyncStorage.getItem('userData');
    let userData = {};
    
    if (userDataString) {
      userData = JSON.parse(userDataString);
    }
    
    const messageData = {
      recipientId,
      text
    };
    
    console.log('Sending message data:', messageData);
    
    const response = await makeApiRequest({
      method: 'POST',
      endpoint: '/api/messages/send',
      data: messageData
    });
    
    console.log('Message send response:', response);
    
    return response.success 
      ? response 
      : { success: false, message: response.message || 'Failed to send message' };
  } catch (error) {
    console.error('Error sending message:', error);
    return { success: false, message: 'An unexpected error occurred' };
  }
};

/**
 * Mark messages as read
 * @param {string} conversationId - ID of the conversation
 */
const markAsRead = async (conversationId) => {
  try {
    const response = await makeApiRequest({
      method: 'PUT',
      endpoint: `/api/messages/read/${conversationId}`
    });
    
    return response.success 
      ? response 
      : { success: false, message: response.message || 'Failed to mark messages as read' };
  } catch (error) {
    console.error('Error marking messages as read:', error);
    return { success: false, message: 'An unexpected error occurred' };
  }
};

/**
 * Get unread message count
 * This will include unread messages from both:
 * 1. Direct conversations where the user is a participant
 * 2. Conversations with shops owned by the user (if the user is a shop owner)
 */
const getUnreadCount = async () => {
  try {
    const response = await makeApiRequest({
      endpoint: '/api/messages/unread/count'
    });
    
    return response.success 
      ? response 
      : { success: false, message: response.message || 'Failed to get unread count', unreadCount: 0 };
  } catch (error) {
    console.error('Error getting unread count:', error);
    return { success: false, message: 'An unexpected error occurred', unreadCount: 0 };
  }
};

/**
 * Debug function to check authentication status
 */
const checkAuthStatus = async () => {
  try {
    const token = await AsyncStorage.getItem('userToken');
    const userData = await AsyncStorage.getItem('userData');
    
    console.log('Auth Status Check:');
    console.log('Token exists:', !!token);
    console.log('User data exists:', !!userData);
    
    if (token) {
      console.log('Token preview:', token.substring(0, 10) + '...');
    }
    
    return {
      isAuthenticated: !!token,
      hasUserData: !!userData
    };
  } catch (error) {
    console.error('Error checking auth status:', error);
    return {
      isAuthenticated: false,
      hasUserData: false,
      error: error.message
    };
  }
};

export default {
  getConversations,
  getMessages,
  sendMessage,
  markAsRead,
  getUnreadCount,
  checkAuthStatus
};
