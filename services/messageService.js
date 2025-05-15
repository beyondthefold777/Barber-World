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
/** * Get messages for a specific conversation or recipient * @param {string|object} recipientIdOrOptions - ID of the recipient (user or shop) or an object with conversationId */
const getMessages = async (recipientIdOrOptions) => {
  try {
    let endpoint;
    
    // Check if we're passing a conversation ID or recipient ID
    if (typeof recipientIdOrOptions === 'object' && recipientIdOrOptions.conversationId) {
      // We have a conversation ID
      endpoint = `/api/messages/conversation/${recipientIdOrOptions.conversationId}/messages`;
      console.log('Getting messages using conversation ID:', recipientIdOrOptions.conversationId);
    } else {
      // We have a recipient ID
      const recipientId = typeof recipientIdOrOptions === 'object' ? recipientIdOrOptions.recipientId : recipientIdOrOptions;
      endpoint = `/api/messages/${recipientId}`;
      console.log('Getting messages using recipient ID:', recipientId);
    }
    
    const response = await makeApiRequest({
      endpoint: endpoint
    });
    
    // If using recipient ID and successful, we might get a conversation ID back
    if (typeof recipientIdOrOptions !== 'object' && response.success && response.conversationId) {
      return {
        ...response,
        conversation: response.conversationId
      };
    }
    
    // If using conversation ID directly, include it in the response
    if (typeof recipientIdOrOptions === 'object' && recipientIdOrOptions.conversationId) {
      return {
        ...response,
        conversation: recipientIdOrOptions.conversationId
      };
    }
    
    return response.success
      ? response
      : {
           success: false,
           message: response.message || 'Failed to fetch messages',
           messages: []
         };
  } catch (error) {
    console.error('Error fetching messages:', error);
    return { success: false, message: 'An unexpected error occurred', messages: [] };
  }
};

/**
 * Send a message to a recipient
 * @param {object} messageData - Contains recipientId, text, and optionally conversationId
 */
const sendMessage = async (messageData) => {
  try {
    // Extract data from the messageData object
    const { recipientId, text, conversationId } = messageData;
    
    if (!recipientId || !text) {
      console.error('Missing required fields for sending message');
      return { success: false, message: 'Recipient ID and message text are required' };
    }
    
    // Prepare the message data
    const payload = {
      recipientId,
      text
    };
    
    // If conversationId is provided, include it to ensure we use the existing conversation
    if (conversationId) {
      payload.conversationId = conversationId;
      console.log('Using existing conversation ID:', conversationId);
    }
    
    console.log('Sending message data:', payload);
    
    const response = await makeApiRequest({
      method: 'POST',
      endpoint: '/api/messages/send',
      data: payload
    });
    
    console.log('Message send response:', JSON.stringify(response));
    
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
 * Mark a conversation as read
 * @param {string} conversationId - ID of the conversation to mark as read
 */
const markConversationAsRead = async (conversationId) => {
  try {
    console.log(`Marking conversation ${conversationId} as read`);
    
    // Use the existing markAsRead function or create a new endpoint
    const response = await markAsRead(conversationId);
    
    if (response.success) {
      console.log(`Successfully marked conversation ${conversationId} as read`);
    } else {
      console.error(`Failed to mark conversation ${conversationId} as read:`, response.message);
    }
    
    return response;
  } catch (error) {
    console.error(`Error marking conversation ${conversationId} as read:`, error);
    return { 
      success: false, 
      message: 'An unexpected error occurred while marking conversation as read' 
    };
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
      : { success: false, message: response.message || 'Failed to get unread count', count: 0 };
  } catch (error) {
    console.error('Error getting unread count:', error);
    return { success: false, message: 'An unexpected error occurred', count: 0 };
  }
};

/**
 * Find or get an existing conversation with a recipient
 * @param {string} recipientId - ID of the recipient
 */
const findOrCreateConversation = async (recipientId) => {
  try {
    const response = await makeApiRequest({
      method: 'POST',
      endpoint: '/api/messages/conversation',
      data: { recipientId }
    });
    
    return response.success 
      ? response.conversation 
      : null;
  } catch (error) {
    console.error('Error finding/creating conversation:', error);
    return null;
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
  markConversationAsRead,  // Added this new method
  getUnreadCount,
  findOrCreateConversation,
  checkAuthStatus
};
