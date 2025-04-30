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
  SafeAreaView
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ChatScreen = ({ route, navigation }) => {
  const { recipientId, recipientName, recipientImage, shopId } = route.params;
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const flatListRef = useRef(null);
  const { user } = useAuth();

  useEffect(() => {
    // Set the header title to the recipient's name
    navigation.setOptions({
      title: recipientName || 'Chat',
    });
    // Load messages
    loadMessages();
  }, [recipientId]);

  const loadMessages = async () => {
    setLoading(true);
    try {
      // In a real app, you would fetch messages from your API
      // For now, we'll just simulate loading with a timeout
      setTimeout(() => {
        // This is just placeholder data - in a real app, you would fetch from your API
        setMessages([]);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error loading messages:', error);
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (inputText.trim() === '' || sending) return;
    setSending(true);
    const newMessage = {
      _id: Date.now().toString(),
      text: inputText.trim(),
      createdAt: new Date(),
      user: {
        _id: user?.id || 'current-user',
        name: user?.name || 'Me',
      },
      sent: true,
      received: false,
    };

    // Add message to UI immediately for better UX
    setMessages(prevMessages => [...prevMessages, newMessage]);
    setInputText('');

    try {
      // In a real app, you would send the message to your API
      // For example:
      // const token = await AsyncStorage.getItem('userToken');
      // const response = await messageService.sendMessage(recipientId, inputText, token);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Update message status after "sending" to server
      setMessages(prevMessages => 
        prevMessages.map(msg =>
          msg._id === newMessage._id ? { ...msg, received: true } : msg
        )
      );
    } catch (error) {
      console.error('Error sending message:', error);
      // Show error status on the message
      setMessages(prevMessages => 
        prevMessages.map(msg =>
          msg._id === newMessage._id ? { ...msg, error: true } : msg
        )
      );
    } finally {
      setSending(false);
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
});

export default ChatScreen;
