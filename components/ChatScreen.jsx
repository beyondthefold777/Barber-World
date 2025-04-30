import React, { useState, useEffect, useRef, useCallback } from 'react';
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
import AsyncStorage from '@react-native-async-storage/async-storage';
import messageService from '../services/messageService';

const ChatScreen = ({ route, navigation }) => {
  const { recipientId, recipientName, recipientImage, shopId, conversationId } = route.params;
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [retrying, setRetrying] = useState(false);
  const flatListRef = useRef(null);
  const { user } = useAuth();

  useEffect(() => {
    // Set the header title to the recipient's name
    navigation.setOptions({
      title: recipientName || 'Chat',
    });
    
    // Load messages
    loadMessages();
    
    // Mark messages as read when opening the chat
    if (conversationId) {
      markMessagesAsRead();
    }
    
    console.log('ChatScreen initialized with recipient:', recipientId, recipientName);
  }, [recipientId]);

  const loadMessages = async () => {
    setLoading(true);
    setError(null);
    console.log('Loading messages for conversation with recipient:', recipientId);
    
    try {
      const response = await messageService.getMessages(recipientId);
      
      if (response.success) {
        console.log(`Successfully loaded ${response.messages?.length || 0} messages`);
        
        // Format messages for the UI
        const formattedMessages = response.messages.map(msg => ({
          _id: msg._id,
          text: msg.text,
          createdAt: new Date(msg.createdAt),
          user: {
            _id: msg.sender,
            name: msg.sender === user?.id ? user?.username : recipientName,
          },
          sent: true,
          received: msg.read,
        }));
        
        setMessages(formattedMessages);
        
        // Mark messages as read if there are any
        if (formattedMessages.length > 0 && conversationId) {
          markMessagesAsRead();
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
      setRetrying(false);
    }
  };

  const markMessagesAsRead = async () => {
    try {
      console.log('Marking messages as read for conversation:', conversationId);
      if (!conversationId) return;
      
      const response = await messageService.markAsRead(conversationId);
      if (response.success) {
        console.log('Messages marked as read successfully');
      } else {
        console.error('Failed to mark messages as read:', response.message);
      }
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const handleSendMessage = async () => {
    if (inputText.trim() === '' || sending) return;
    setSending(true);
    console.log('Sending message to recipient:', recipientId);
    
    const messageText = inputText.trim();
    setInputText('');
    
    // Create a temporary message object for immediate UI feedback
    const newMessage = {
      _id: Date.now().toString(),
      text: messageText,
      createdAt: new Date(),
      user: {
        _id: user?.id || 'current-user',
        name: user?.username || user?.name || 'Me',
      },
      sent: true,
      received: false,
    };
    
    // Add message to UI immediately for better UX
    setMessages(prevMessages => [...prevMessages, newMessage]);
    
    try {
      console.log('Sending message to API:', messageText);
      
      const response = await messageService.sendMessage(recipientId, messageText);
      
      if (response.success) {
        console.log('Message sent successfully:', response.message);
        
        // Update message status after sending to server
        setMessages(prevMessages => 
          prevMessages.map(msg =>
            msg._id === newMessage._id ? { 
              ...msg,
              _id: response.message?._id || msg._id, // Use server-generated ID
              received: true 
            } : msg
          )
        );
      } else {
        console.error('Failed to send message:', response.message);
        throw new Error(response.message || 'Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Show error status on the message
      setMessages(prevMessages =>
        prevMessages.map(msg =>
          msg._id === newMessage._id ? { ...msg, error: true } : msg
        )
      );
      
      Alert.alert('Message Not Sent', 'Failed to send your message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const retryLoadMessages = () => {
    setRetrying(true);
    loadMessages();
  };

  const testApiConnection = async () => {
    setRetrying(true);
    try {
      const result = await messageService.testConnection();
      if (result.success) {
        Alert.alert('Connection Test', 'Successfully connected to the API server. Retrying to load messages...');
        loadMessages();
      } else {
        Alert.alert('Connection Test Failed', result.message);
        setRetrying(false);
      }
    } catch (error) {
      Alert.alert('Connection Test Error', error.message);
      setRetrying(false);
    }
  };

  const renderMessage = ({ item }) => {
    const isUserMessage = item.user._id === (user?.id || 'current-user');
    
    return (
      <View style={[
        styles.messageContainer,
        isUserMessage ? styles.userMessageContainer : styles.otherMessageContainer
      ]}>
        <View style={[
          styles.messageBubble,
          isUserMessage ? styles.userMessageBubble : styles.otherMessageBubble
        ]}>
          <Text style={styles.messageText}>{item.text}</Text>
          <Text style={styles.messageTime}>
            {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            {isUserMessage && (
              item.error ? 
                <Feather name="alert-circle" size={12} color="red" style={{ marginLeft: 5 }} /> :
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
          <View style={styles.errorButtonsContainer}>
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={retryLoadMessages}
              disabled={retrying}
            >
              {retrying ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text style={styles.retryButtonText}>Retry</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.testConnectionButton}
              onPress={testApiConnection}
              disabled={retrying}
            >
              <Text style={styles.retryButtonText}>Test Connection</Text>
            </TouchableOpacity>
          </View>
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
                    {recipientName ? recipientName.charAt(0).toUpperCase() : 'B'}
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
              keyExtractor={item => item._id}
              contentContainerStyle={styles.messagesContainer}
              onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
              onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
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
  errorButtonsContainer: {
    flexDirection: 'row',
    marginTop: 20,
  },
  retryButton: {
    backgroundColor: '#FF0000',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginHorizontal: 5,
  },
  testConnectionButton: {
    backgroundColor: '#555',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginHorizontal: 5,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default ChatScreen;
