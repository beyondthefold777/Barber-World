import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
  SafeAreaView,
  Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import messageService from '../services/messageService';

const ChatScreen = ({ route, navigation }) => {
  const { conversationId, recipientId, recipientName, recipientImage } = route.params;
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const flatListRef = useRef(null);
  const { user } = useAuth();
  
  // Set up polling for new messages
  const pollingIntervalRef = useRef(null);
  
  useEffect(() => {
    // Set navigation options
    navigation.setOptions({
      headerTitle: () => (
        <View style={styles.headerTitleContainer}>
          {recipientImage ? (
            <Image source={{ uri: recipientImage }} style={styles.headerAvatar} />
          ) : (
            <View style={styles.headerDefaultAvatar}>
              <Text style={styles.headerAvatarText}>{recipientName.charAt(0)}</Text>
            </View>
          )}
          <Text style={styles.headerTitle} numberOfLines={1}>{recipientName}</Text>
        </View>
      ),
      headerStyle: {
        backgroundColor: '#000000',
      },
      headerTintColor: '#FFFFFF',
    });
    
    console.log(`ChatScreen initialized with recipient: ${recipientId} ${recipientName}`);
    console.log(`Current user ID: ${user.id}`);
    
    // Load messages
    loadMessages();
    
    // Set up polling for new messages every 10 seconds
    pollingIntervalRef.current = setInterval(() => {
      if (!sending && !refreshing) {
        refreshMessages();
      }
    }, 10000);
    
    // Clean up interval on unmount
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);
  
  const loadMessages = async () => {
    setLoading(true);
    
    const params = {
      conversationId,
      recipientId
    };
    
    console.log(`Loading messages with params:`, params);
    
    if (conversationId) {
      console.log(`Loading messages using conversation ID: ${conversationId}`);
    } else {
      console.log(`Loading messages using recipient ID: ${recipientId}`);
    }
    
    try {
      const response = await messageService.getMessages(params);
      
      if (response.success) {
        // Sort messages by date (oldest first)
        const sortedMessages = response.messages.sort((a, b) => 
          new Date(a.createdAt) - new Date(b.createdAt)
        );
        
        setMessages(sortedMessages);
        
        // If we got a conversation ID back from the API, update our local state
        if (response.conversation && !conversationId) {
          navigation.setParams({ conversationId: response.conversation });
        }
        
        console.log(`Successfully loaded ${sortedMessages.length} messages`);
      } else {
        console.error('Failed to load messages:', response.message);
        Alert.alert('Error', response.message || 'Failed to load messages');
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      Alert.alert('Error', 'An unexpected error occurred while loading messages');
    } finally {
      setLoading(false);
    }
  };
  
  const refreshMessages = async () => {
    if (refreshing) return;
    
    setRefreshing(true);
    console.log(`Refreshing messages with params:`, {
      conversationId,
      recipientId
    });
    
    if (conversationId) {
      console.log(`Refreshing messages using conversation ID: ${conversationId}`);
    }
    
    try {
      const response = await messageService.getMessages({
        conversationId,
        recipientId
      });
      
      if (response.success) {
        // Sort messages by date (oldest first)
        const sortedMessages = response.messages.sort((a, b) => 
          new Date(a.createdAt) - new Date(b.createdAt)
        );
        
        // Check if we have new messages
        if (sortedMessages.length !== messages.length) {
          console.log(`Refreshed messages count: ${sortedMessages.length}`);
          console.log(`Current messages count: ${messages.length}`);
          console.log('New messages received, updating UI');
          setMessages(sortedMessages);
        }
      } else {
        console.error('Failed to refresh messages:', response.message);
      }
    } catch (error) {
      console.error('Error refreshing messages:', error);
    } finally {
      setRefreshing(false);
    }
  };
  
  const sendMessage = async () => {
    if (!newMessage.trim() || sending) return;
    
    setSending(true);
    console.log(`Sending message to recipient: ${recipientId}`);
    
    // Clear input field
    const messageText = newMessage;
    setNewMessage('');
    
    // Prepare message data
    const messageData = {
      recipientId,
      text: messageText
    };
    
    // If we have a conversation ID, include it
    if (conversationId) {
      console.log(`Using conversation ID: ${conversationId}`);
      messageData.conversationId = conversationId;
    }
    
    console.log(`Sending message to API: ${messageText}`);
    console.log(`Sending message data:`, messageData);
    
    try {
      const response = await messageService.sendMessage(messageData);
      
      if (response.success) {
        console.log(`Message send response:`, JSON.stringify(response));
        console.log(`Message sent successfully:`, response.message);
        
        // If we got a conversation ID back and didn't have one before, update our params
        if (response.conversationId && !conversationId) {
          navigation.setParams({ conversationId: response.conversationId });
        }
        
        // Refresh messages to get the new message from the server
        refreshMessages();
      } else {
        console.error('Failed to send message:', response.message);
        Alert.alert('Error', response.message || 'Failed to send message');
        // Restore the message text if sending failed
        setNewMessage(messageText);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'An unexpected error occurred while sending message');
      // Restore the message text if sending failed
      setNewMessage(messageText);
    } finally {
      setSending(false);
    }
  };
  
  const renderMessage = ({ item }) => {
    // Simple check: if the sender ID matches the current user's ID, it's sent by the user
    const isSentByUser = item.sender === user.id;
    
    console.log(`Rendering message: ${item._id} from user: ${item.sender}, current user: ${user.id}, isSentByUser: ${isSentByUser}`);
    
    return (
      <View style={[
        styles.messageContainer,
        isSentByUser ? styles.userMessageContainer : styles.recipientMessageContainer
      ]}>
        <View style={[
          styles.messageBubble,
          isSentByUser ? styles.userMessageBubble : styles.recipientMessageBubble
        ]}>
          <Text style={styles.messageText}>{item.text}</Text>
        </View>
      </View>
    );
  };
  
  return (
    <LinearGradient
      colors={['#000000', '#333333']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoidingView}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#FF0000" />
              <Text style={styles.loadingText}>Loading messages...</Text>
            </View>
          ) : (
            <FlatList
              ref={flatListRef}
              data={messages}
              renderItem={renderMessage}
              keyExtractor={(item) => item._id}
              contentContainerStyle={styles.messagesList}
              onContentSizeChange={() => {
                if (flatListRef.current && messages.length > 0) {
                  flatListRef.current.scrollToEnd({ animated: false });
                }
              }}
              onLayout={() => {
                if (flatListRef.current && messages.length > 0) {
                  flatListRef.current.scrollToEnd({ animated: false });
                }
              }}
            />
          )}
          
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Type a message..."
              placeholderTextColor="#999"
              value={newMessage}
              onChangeText={setNewMessage}
              multiline
            />
            <TouchableOpacity
              style={[styles.sendButton, !newMessage.trim() || sending ? styles.disabledSendButton : null]}
              onPress={sendMessage}
              disabled={!newMessage.trim() || sending}
            >
              {sending ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Feather name="send" size={20} color="#FFFFFF" />
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
  keyboardAvoidingView: {
    flex: 1,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
  },
  headerDefaultAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FF0000',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  headerAvatarText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    maxWidth: 200,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: 'white',
    marginTop: 10,
    fontSize: 16,
  },
  messagesList: {
    padding: 15,
    paddingBottom: 20,
  },
  messageContainer: {
    marginBottom: 10,
    maxWidth: '80%',
  },
  userMessageContainer: {
    alignSelf: 'flex-end',
  },
  recipientMessageContainer: {
    alignSelf: 'flex-start',
  },
  messageBubble: {
    padding: 12,
    borderRadius: 18,
    minWidth: 50,
  },
  userMessageBubble: {
    backgroundColor: '#FF0000',
    borderTopRightRadius: 4,
  },
  recipientMessageBubble: {
    backgroundColor: '#333',
    borderTopLeftRadius: 4,
  },
  messageText: {
    color: 'white',
    fontSize: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#111',
    borderTopWidth: 1,
    borderTopColor: '#333',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: '#222',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    color: 'white',
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: '#FF0000',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  disabledSendButton: {
    backgroundColor: '#666',
  },
});

export default ChatScreen;
