import axios from 'axios';
import config from '../config/environment';

const messageService = {
  // Get all conversations for the current user
  getConversations: async (token) => {
    try {
      const response = await axios.get(`${config.API_URL}/messages/conversations`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching conversations:', error);
      return { success: false, error: error.response?.data?.message || 'Failed to fetch conversations' };
    }
  },

  // Get messages for a specific conversation
  getMessages: async (recipientId, token) => {
    try {
      const response = await axios.get(`${config.API_URL}/messages/${recipientId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching messages:', error);
      return { success: false, error: error.response?.data?.message || 'Failed to fetch messages' };
    }
  },

  // Send a message to a recipient
  sendMessage: async (recipientId, text, token) => {
    try {
      const response = await axios.post(
        `${config.API_URL}/messages/send`,
        { recipientId, text },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error sending message:', error);
      return { success: false, error: error.response?.data?.message || 'Failed to send message' };
    }
  },

  // Mark messages as read
  markAsRead: async (conversationId, token) => {
    try {
      const response = await axios.put(
        `${config.API_URL}/messages/read/${conversationId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error marking messages as read:', error);
      return { success: false, error: error.response?.data?.message || 'Failed to mark messages as read' };
    }
  }
};

export default messageService;
