import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
  SafeAreaView,
  Alert
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import messageService from '../services/messageService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import config from '../config/environment';

const ChatScreen = ({ route, navigation }) => {
  const { recipientId, recipientName, recipientImage, shopId, conversationId: initialConversationId } = route.params;
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [conversationId, setConversationId] = useState(initialConversationId);
  const flatListRef = useRef(null);
  const { user } = useAuth();
  
  // Store the user's ID to identify their messages
  const currentUserId = user?._id || user?.id;

  useEffect(() => {
    // Debug log to check user object
    console.log('User object in ChatScreen:', JSON.stringify(user, null, 2));
    console.log('Current user ID:', currentUserId);
    
    // Set the header title to the recipient's name
    navigation.setOptions({
      title: recipientName || 'Chat',
    });
    
    // Load messages
    loadMessages();
    
    // Mark messages as read when opening the chat
    if (conversationId) {
      markMessagesAsRead(conversationId);
    }
    
    console.log('ChatScreen initialized with recipient:', recipientId, recipientName);
    console.log('Current user ID:', currentUserId);
    
    // Set up a refresh interval to check for new messages
    const messageRefreshInterval = setInterval(() => {
      if (conversationId || recipientId) {
        refreshMessages();
      }
    }, 10000); // Check every 10 seconds
    
    // Clean up interval on unmount
    return () => {
      clearInterval(messageRefreshInterval);
    };
  }, [recipientId, conversationId]);

  const loadMessages = async () => {
    setLoading(true);
    setError(null);
    console.log('Loading messages with params:', {
       conversationId,
       recipientId,
       currentUserId
     });
    
    try {
      let response;
      
      // Use conversationId if available, otherwise use recipientId
      if (conversationId) {
        console.log('Loading messages using conversation ID:', conversationId);
        response = await messageService.getMessages({ conversationId });
      } else {
        console.log('Loading messages using recipient ID:', recipientId);
        response = await messageService.getMessages(recipientId);
      }
      
      if (response.success) {
        console.log(`Successfully loaded ${response.messages?.length || 0} messages`);
        
        // Update conversationId if it wasn't provided but we got it from the API
        if (response.conversation && !conversationId) {
          console.log('Setting conversation ID from response:', response.conversation);
          setConversationId(response.conversation);
        }
        
        // Format messages for the UI
        const formattedMessages = (response.messages || []).map(msg => {
          // Determine if the current user is the sender
          const isSentByCurrentUser = msg.sender === currentUserId;
          
          console.log(`Message ${msg._id}: sender=${msg.sender}, recipient=${msg.recipient}, currentUser=${currentUserId}, isSentByCurrentUser=${isSentByCurrentUser}`);
          
          return {
            _id: msg._id,
            text: msg.content || msg.text, // Handle both content and text fields
            createdAt: new Date(msg.timestamp || msg.createdAt),
            user: {
              _id: msg.sender, // Keep the actual sender ID
              name: isSentByCurrentUser ? 
                (user?.username || user?.businessName || 'Me') : 
                recipientName,
            },
            sent: true,
            received: msg.read,
            // Add this flag to help with rendering
            isSentByCurrentUser: isSentByCurrentUser
          };
        });
        
        // Sort messages by date (newest first)
        formattedMessages.sort((a, b) => b.createdAt - a.createdAt);
        
        setMessages(formattedMessages);
        
        // Mark messages as read if there are any
        if (formattedMessages.length > 0 && (conversationId || response.conversation)) {
          markMessagesAsRead(conversationId || response.conversation);
        }
      } else {
        console.error('Failed to load messages:', response.message);
        setError(response.message || 'Failed to load messages');
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      setError('An unexpected error occurred while loading messages');
    } finally {
      setLoading(false);
    }
  };
  
  const refreshMessages = async () => {
    console.log('Refreshing messages with params:', {
       conversationId,
       recipientId,
       currentUserId
     });
    
    try {
      // Only fetch new messages if we have a conversation ID or recipient ID
      if (!conversationId && !recipientId) return;
      
      let messagesResponse;
      
      // Use conversationId if available, otherwise use recipientId
      if (conversationId) {
        console.log('Refreshing messages using conversation ID:', conversationId);
        messagesResponse = await messageService.getMessages({ conversationId });
      } else {
        console.log('Refreshing messages using recipient ID:', recipientId);
        messagesResponse = await messageService.getMessages(recipientId);
      }
      
      if (messagesResponse.success && messagesResponse.messages) {
        // Format messages for the UI
        const formattedMessages = (messagesResponse.messages || []).map(msg => {
          // Determine if the current user is the sender
          const isSentByCurrentUser = msg.sender === currentUserId;
          
          console.log(`Message ${msg._id}: sender=${msg.sender}, recipient=${msg.recipient}, currentUser=${currentUserId}, isSentByCurrentUser=${isSentByCurrentUser}`);
          
          return {
            _id: msg._id,
            text: msg.content || msg.text, // Handle both content and text fields
            createdAt: new Date(msg.timestamp || msg.createdAt),
            user: {
              _id: msg.sender, // Keep the actual sender ID
              name: isSentByCurrentUser ? 
                (user?.username || user?.businessName || 'Me') : 
                recipientName,
            },
            sent: true,
            received: msg.read,
            // Add this flag to help with rendering
            isSentByCurrentUser: isSentByCurrentUser
          };
        });
        
        // Sort messages by date (newest first)
        formattedMessages.sort((a, b) => b.createdAt - a.createdAt);
        
        console.log('Refreshed messages count:', formattedMessages.length);
        console.log('Current messages count:', messages.length);
        
        // Check if we have new messages by comparing IDs
        const currentMessageIds = new Set(messages.map(m => m._id));
        const hasNewMessages = formattedMessages.some(m => !currentMessageIds.has(m._id));
        
        if (hasNewMessages || formattedMessages.length !== messages.length) {
          console.log('New messages received, updating UI');
          
          // Preserve pending messages
          const pendingMessages = messages.filter(m => m.pending);
          const updatedMessages = [...pendingMessages, ...formattedMessages.filter(m => 
            !pendingMessages.some(p => p._id === m._id)
          )];
          
          setMessages(updatedMessages);
          
          // Update conversation ID if needed
          if (messagesResponse.conversation && !conversationId) {
            setConversationId(messagesResponse.conversation);
          }
          
          // Mark messages as read
          if (conversationId || messagesResponse.conversation) {
            markMessagesAsRead(conversationId || messagesResponse.conversation);
          }
        }
      }
    } catch (error) {
      console.error('Error refreshing messages:', error);
    }
  };
  
  const markMessagesAsRead = async (convoId) => {
    try {
      const convId = convoId || conversationId;
      console.log('Marking messages as read for conversation:', convId);
      if (!convId) return;
      
      const response = await messageService.markAsRead(convId);
      if (response && response.success) {
        console.log('Messages marked as read successfully');
      } else if (response) {
        console.error('Failed to mark messages as read:', response.message);
      } else {
        console.error('Failed to mark messages as read: No response');
      }
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const handleSendMessage = async () => {
    if (inputText.trim() === '' || sending) return;
    setSending(true);
    console.log('Sending message to recipient:', recipientId);
    console.log('Using conversation ID:', conversationId);
    
    const messageText = inputText.trim();
    setInputText('');
    
    // Create a temporary message object for immediate UI feedback
    const tempId = Date.now().toString();
    const newMessage = {
      _id: tempId,
      text: messageText,
      createdAt: new Date(),
      user: {
        _id: currentUserId, // Use the current user's ID
        name: user?.username || user?.businessName || 'Me',
      },
      sent: true,
      received: false,
      pending: true, // Mark as pending until confirmed by server
      isSentByCurrentUser: true // Always true for messages we send
    };
    
    // Add message to UI immediately for better UX
    setMessages(prevMessages => [newMessage, ...prevMessages]);
    
    try {
      console.log('Sending message to API:', messageText);
      console.log('Sending message data:', { recipientId, text: messageText });
      
      const response = await messageService.sendMessage(recipientId, messageText);
      
      console.log('Message send response:', JSON.stringify(response));
      
      if (response.success) {
        console.log('Message sent successfully:', response.message);
        
        // If this is the first message, we might get a conversation ID back
        if (response.conversation && !conversationId) {
          console.log('Setting conversation ID from send response:', response.conversation);
          setConversationId(response.conversation);
        }
        
        // Update the temporary message with the server-generated ID and mark as received
        setMessages(prevMessages => 
          prevMessages.map(msg =>
            msg._id === tempId ? {
               ...msg,
              _id: response.message?._id || msg._id,
              pending: false,
              received: true,
              // Keep the isSentByCurrentUser flag
              isSentByCurrentUser: true
            } : msg
          )
        );
        
        // Refresh messages after sending to ensure we have the latest data
        setTimeout(() => {
          refreshMessages();
        }, 1000);
      } else {
        console.error('Failed to send message:', response.message);
        throw new Error(response.message || 'Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Show error status on the message
      setMessages(prevMessages =>
        prevMessages.map(msg =>
          msg._id === tempId ? { ...msg, pending: false, error: true } : msg
        )
      );
      
      Alert.alert('Message Not Sent', 'Failed to send your message. Please try again.');
    } finally {
      setSending(false);
    }
  };
  
  const retryLoadMessages = () => {
    loadMessages();
  };

  const renderMessage = ({ item }) => {
    // Use the isSentByCurrentUser flag we added to determine message alignment
    const isUserMessage = item.isSentByCurrentUser;
    
    console.log('Rendering message:', item._id, 'from user:', item.user._id, 'current user:', currentUserId, 'isUserMessage:', isUserMessage);
    
    return (
      <View style={[
        styles.messageContainer,
        isUserMessage ? styles.userMessageContainer : styles.otherMessageContainer
      ]}>
        <View style={[
          styles.messageBubble,
          isUserMessage ? styles.userMessageBubble : styles.otherMessageBubble,
          item.pending ? styles.pendingMessage : null,
          item.error ? styles.errorMessage : null
        ]}>
          <Text style={styles.messageText}>{item.text}</Text>
          <Text style={styles.messageTime}>
            {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            {isUserMessage && (
              item.error ? 
                <Feather name="alert-circle" size={12} color="red" style={{ marginLeft: 5 }} /> :
                item.pending ?
                  <Feather name="clock" size={12} color="#999" style={{ marginLeft: 5 }} /> :
                  item.received ?
                    <Feather name="check-circle" size={12} color="#4CAF50" style={{ marginLeft: 5 }} /> :
                    <Feather name="check" size={12} color="#999" style={{ marginLeft: 5 }} />
            )}
          </Text>
        </View>
      </View>
    );
  };
  
  const renderEmptyChat = () => {
    if (loading) {
      return (
        <View style={styles.emptyChatContainer}>
          <ActivityIndicator size="large" color="#FF0000" />
          <Text style={styles.emptyChatText}>Loading messages...</Text>
        </View>
      );
    }
    
    if (error) {
      return (
        <View style={styles.emptyChatContainer}>
          <Feather name="alert-circle" size={60} color="#FF3B30" style={styles.emptyChatIcon} />
          <Text style={styles.emptyChatTitle}>Connection Error</Text>
          <Text style={styles.emptyChatText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={retryLoadMessages}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }
    
    return (
      <View style={styles.emptyChatContainer}>
        <Feather name="message-square" size={100} color="#666" style={styles.emptyChatIcon} />
        <Text style={styles.emptyChatTitle}>Start a conversation</Text>
        <Text style={styles.emptyChatText}>
          Send a message to {recipientName} to discuss appointments, services, or ask questions.
        </Text>
        </View>
    );
  };

  return (
    <LinearGradient colors={['#000000', '#333333']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoidView}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Feather name="arrow-left" size={24} color="white" />
            </TouchableOpacity>
            <View style={styles.headerInfo}>
              {recipientImage ? (
                <Image 
                  source={{ uri: recipientImage }}
                  style={styles.recipientImage}
                />
              ) : (
                <View style={styles.recipientImagePlaceholder}>
                  <Text style={styles.recipientInitial}>
                    {recipientName ? recipientName.charAt(0).toUpperCase() : '?'}
                  </Text>
                </View>
              )}
              <Text style={styles.headerTitle}>{recipientName}</Text>
            </View>
          </View>
          
          {messages.length > 0 ? (
            <FlatList
              ref={flatListRef}
              data={messages}
              renderItem={renderMessage}
              keyExtractor={item => item._id.toString()}
              contentContainerStyle={styles.messagesContainer}
              inverted={true}
            />
          ) : (
            renderEmptyChat()
          )}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Type a message..."
              placeholderTextColor="#999"
              value={inputText}
              onChangeText={setInputText}
              multiline
            />
            <TouchableOpacity 
              style={[
                styles.sendButton,
                (inputText.trim() === '' || sending) ? styles.sendButtonDisabled : {}
              ]}
              onPress={handleSendMessage}
              disabled={inputText.trim() === '' || sending}
            >
              {sending ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Feather name="send" size={20} color="white" />
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  keyboardAvoidView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    paddingTop: Platform.OS === 'android' ? 40 : 15,
    borderBottomWidth: 1,
    borderBottomColor: '#444',
  },
  backButton: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#333',
  },
  headerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 15,
  },
  recipientImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  recipientImagePlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FF0000',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  recipientInitial: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  messagesContainer: {
    flexGrow: 1,
    padding: 15,
    paddingBottom: 20,
  },
  messageContainer: {
    marginBottom: 15,
    maxWidth: '80%',
  },
  userMessageContainer: {
    alignSelf: 'flex-end',
  },
  otherMessageContainer: {
    alignSelf: 'flex-start',
  },
  messageBubble: {
    padding: 12,
    borderRadius: 18,
    minWidth: 80,
  },
  userMessageBubble: {
    backgroundColor: '#FF0000',
    borderBottomRightRadius: 4,
  },
  otherMessageBubble: {
    backgroundColor: '#333',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    color: 'white',
    fontSize: 16,
  },
  messageTime: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    marginTop: 5,
    alignSelf: 'flex-end',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#444',
    backgroundColor: '#222',
  },
  input: {
    flex: 1,
    backgroundColor: '#333',
    color: 'white',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    maxHeight: 100,
    fontSize: 16,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FF0000',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  sendButtonDisabled: {
    backgroundColor: '#666',
  },
  emptyChatContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyChatIcon: {
    marginBottom: 20,
  },
  emptyChatTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  emptyChatText: {
    color: '#CCC',
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 24,
  },
  retryButton: {
    backgroundColor: '#FF0000',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginTop: 15,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  pendingMessage: {
    opacity: 0.7,
  },
  errorMessage: {
    borderColor: 'red',
    borderWidth: 1,
  },
});

export default ChatScreen;
