import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  SafeAreaView,
  Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import messageService from '../services/messageService';

const MessagesScreen = ({ navigation }) => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    // Set navigation options
    navigation.setOptions({
      headerShown: true,
      headerTitle: 'Messages',
      headerStyle: {
        backgroundColor: '#000000',
      },
      headerTintColor: '#FFFFFF',
    });
    
    // Load conversations
    loadConversations();
    
    // Add a focus listener to reload conversations when screen is focused
    const unsubscribe = navigation.addListener('focus', () => {
      console.log('MessagesScreen focused - reloading conversations');
      loadConversations();
    });
    
    return unsubscribe;
  }, [navigation]);

  const loadConversations = async () => {
    setLoading(true);
    console.log('Loading conversations...');
    
    try {
      const response = await messageService.getConversations();
      
      if (response.success) {
        console.log(`Successfully loaded ${response.conversations?.length || 0} conversations`);
        setConversations(response.conversations || []);
      } else {
        console.error('Failed to load conversations:', response.message);
        Alert.alert('Error', response.message || 'Failed to load conversations. Please try again.');
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
      Alert.alert('Error', 'An unexpected error occurred while loading conversations.');
    } finally {
      setLoading(false);
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    
    const now = new Date();
    const messageDate = new Date(timestamp);
    
    // If today, show time
    if (messageDate.toDateString() === now.toDateString()) {
      return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // If this week, show day name
    const diffDays = Math.floor((now - messageDate) / (1000 * 60 * 60 * 24));
    if (diffDays < 7) {
      return messageDate.toLocaleDateString([], { weekday: 'short' });
    }
    
    // Otherwise show date
    return messageDate.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const navigateToChat = (conversation) => {
    console.log('Navigating to chat with:', conversation.recipient.username || conversation.recipient.businessName);
    
    navigation.navigate('ChatScreen', {
      conversationId: conversation._id,
      recipientId: conversation.recipient._id,
      recipientName: conversation.recipient.businessName || conversation.recipient.username,
      recipientImage: conversation.recipient.profileImage,
    });
  };

  const renderConversationItem = ({ item }) => {
    const recipientName = item.recipient.businessName || item.recipient.username || 'Unknown';
    // Remove the "No messages yet" fallback text
    const lastMessageText = item.lastMessageText || '';
    const timestamp = item.lastMessage?.createdAt || item.lastMessageDate;
    const unread = item.unreadCount > 0;
      
    return (
      <TouchableOpacity
        style={styles.conversationItem}
        onPress={() => navigateToChat(item)}
      >
        <View style={styles.avatarContainer}>
          {item.recipient.profileImage ? (
            <Image source={{ uri: item.recipient.profileImage }} style={styles.avatar} />
          ) : (
            <View style={styles.defaultAvatar}>
              <Text style={styles.avatarText}>
                {recipientName.charAt(0)}
              </Text>
            </View>
          )}
          {unread && <View style={styles.unreadIndicator} />}
        </View>
              
        <View style={styles.conversationContent}>
          <View style={styles.conversationHeader}>
            <Text style={styles.recipientName}>{recipientName}</Text>
            <Text style={styles.timestamp}>{formatTimestamp(timestamp)}</Text>
          </View>
          <Text 
            style={[styles.lastMessage, unread && styles.unreadMessage]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {lastMessageText}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };
  
  return (
    <LinearGradient
      colors={['#000000', '#333333']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FF0000" />
            <Text style={styles.loadingText}>Loading conversations...</Text>
          </View>
        ) : conversations.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Feather name="message-square" size={60} color="#666" />
            <Text style={styles.emptyText}>No conversations yet</Text>
            <TouchableOpacity 
              style={styles.newMessageButton}
              onPress={() => navigation.navigate('NewMessage')}
            >
              <Text style={styles.newMessageButtonText}>Start a new conversation</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <FlatList
              data={conversations}
              renderItem={renderConversationItem}
              keyExtractor={(item) => item._id}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              refreshing={loading}
              onRefresh={loadConversations}
            />
            <TouchableOpacity 
              style={styles.floatingButton}
              onPress={() => navigation.navigate('NewMessage')}
            >
              <Feather name="edit" size={24} color="white" />
            </TouchableOpacity>
          </>
        )}
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    color: 'white',
    fontSize: 18,
    marginTop: 20,
    marginBottom: 30,
  },
  newMessageButton: {
    backgroundColor: '#FF0000',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
  },
  newMessageButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  listContent: {
    padding: 15,
  },
  conversationItem: {
    flexDirection: 'row',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 15,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  defaultAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FF0000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  unreadIndicator: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FF0000',
    bottom: 0,
    right: 0,
    borderWidth: 2,
    borderColor: '#000',
  },
  conversationContent: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  recipientName: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  timestamp: {
    color: '#999',
    fontSize: 12,
  },
  lastMessage: {
    color: '#999',
    fontSize: 14,
  },
  unreadMessage: {
    color: 'white',
    fontWeight: '600',
  },
  floatingButton: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FF0000',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
});

export default MessagesScreen;
