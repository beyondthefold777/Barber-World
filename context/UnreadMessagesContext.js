import React, { createContext, useContext, useState, useEffect } from 'react';
import messageService from '../services/messageService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const UnreadMessagesContext = createContext();

export const useUnreadMessages = () => useContext(UnreadMessagesContext);

export const UnreadMessagesProvider = ({ children }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [lastFetchTime, setLastFetchTime] = useState(null);

  // Function to fetch unread message count
  const fetchUnreadCount = async () => {
    try {
      setIsLoading(true);
      
      // Check if user is logged in by checking for token
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        console.log('UnreadMessagesContext - No token found, skipping unread count fetch');
        setUnreadCount(0);
        return;
      }
      
      console.log('UnreadMessagesContext - Fetching unread count from API');
      const response = await messageService.getUnreadCount();
      
      if (response.success) {
        // Make sure we're using the correct property name from the API response
        const count = response.count || response.unreadCount || 0;
        console.log(`UnreadMessagesContext - Fetched unread count: ${count}`);
        setUnreadCount(count);
      } else {
        console.error('UnreadMessagesContext - Failed to fetch unread count:', response.message);
      }
      
      setLastFetchTime(new Date());
    } catch (error) {
      console.error('UnreadMessagesContext - Error fetching unread count:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to mark a conversation as read and update the unread count
  const markConversationAsRead = async (conversationId) => {
    try {
      console.log(`UnreadMessagesContext - Marking conversation ${conversationId} as read`);
      
      // Call the API to mark the conversation as read
      const response = await messageService.markConversationAsRead(conversationId);
      
      if (response.success) {
        console.log(`UnreadMessagesContext - Successfully marked conversation as read`);
        // Refresh the unread count after marking as read
        fetchUnreadCount();
      } else {
        console.error(`UnreadMessagesContext - Failed to mark conversation as read:`, response.message);
      }
    } catch (error) {
      console.error(`UnreadMessagesContext - Error marking conversation as read:`, error);
    }
  };

  // Function to manually update the unread count (e.g., when a new message arrives)
  const updateUnreadCount = (count) => {
    if (typeof count === 'number') {
      console.log(`UnreadMessagesContext - Manually updating unread count to ${count}`);
      setUnreadCount(count);
    } else {
      // If no count is provided, fetch from API
      fetchUnreadCount();
    }
  };

  // Listen for auth state changes
  useEffect(() => {
    const checkAuthAndFetch = async () => {
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        console.log('UnreadMessagesContext - Token found, fetching unread count');
        fetchUnreadCount();
      } else {
        console.log('UnreadMessagesContext - No token found, resetting unread count');
        setUnreadCount(0);
      }
    };
    
    checkAuthAndFetch();
    
    // Set up a listener for auth state changes
    const authListener = async () => {
      try {
        const handleAuthChange = async () => {
          await checkAuthAndFetch();
        };
        
        // Check for token changes every 2 seconds (you might want to use a better approach in production)
        const intervalId = setInterval(handleAuthChange, 2000);
        
        return () => clearInterval(intervalId);
      } catch (error) {
        console.error('UnreadMessagesContext - Error setting up auth listener:', error);
      }
    };
    
    const cleanup = authListener();
    return () => {
      if (cleanup && typeof cleanup === 'function') {
        cleanup();
      }
    };
  }, []);

  // Set up periodic refresh of unread count (every 30 seconds)
  useEffect(() => {
    const intervalId = setInterval(async () => {
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        console.log('UnreadMessagesContext - Periodic refresh of unread count');
        fetchUnreadCount();
      }
    }, 30000);
    
    return () => clearInterval(intervalId);
  }, []);

  // Log the current unread count whenever it changes
  useEffect(() => {
    console.log(`UnreadMessagesContext - Current unread count: ${unreadCount}`);
  }, [unreadCount]);

  return (
    <UnreadMessagesContext.Provider
      value={{
        unreadCount,
        isLoading,
        lastFetchTime,
        fetchUnreadCount,
        markConversationAsRead,
        updateUnreadCount,
      }}
    >
      {children}
    </UnreadMessagesContext.Provider>
  );
};

export default UnreadMessagesProvider;
