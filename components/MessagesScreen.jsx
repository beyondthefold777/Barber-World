import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  SafeAreaView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

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
  }, []);

  const loadConversations = async () => {
    setLoading(true);
    try {
      // In a real app, you would fetch conversations from your API
      // For now, we'll just use dummy data
      setTimeout(() => {
        const dummyConversations = [
          {
            id: '1',
            recipientId: 'user1',
            recipientName: 'John Smith',
            recipientImage: null,
            lastMessage: 'Hey, I need to reschedule my appointment',
            timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
            unread: true,
          },
          {
            id: '2',
            recipientId: 'user2',
            recipientName: 'Sarah Johnson',
            recipientImage: null,
            lastMessage: 'Thanks for the great haircut!',
            timestamp: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
            unread: false,
          },
          {
            id: '3',
            recipientId: 'user3',
            recipientName: 'Mike Williams',
            recipientImage: null,
            lastMessage: 'Do you have any openings tomorrow?',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 hours ago
            unread: true,
          },
          {
            id: '4',
            recipientId: 'user4',
            recipientName: 'Lisa Brown',
            recipientImage: null,
            lastMessage: 'See you next week!',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
            unread: false,
          },
          {
            id: '5',
            recipientId: 'user5',
            recipientName: 'David Garcia',
            recipientImage: null,
            lastMessage: 'What products do you recommend for curly hair?',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48), // 2 days ago
            unread: false,
          },
        ];
        setConversations(dummyConversations);
        setLoading(false);
      }, 1000); // Simulate network delay
    } catch (error) {
      console.error('Error loading conversations:', error);
      setLoading(false);
    }
  };

  const formatTimestamp = (timestamp) => {
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
    navigation.navigate('ChatScreen', {
      conversationId: conversation.id,
      recipientId: conversation.recipientId,
      recipientName: conversation.recipientName,
    });
  };

  const renderConversationItem = ({ item }) => (
    <TouchableOpacity
      style={styles.conversationItem}
      onPress={() => navigateToChat(item)}
    >
      <View style={styles.avatarContainer}>
        {item.recipientImage ? (
          <Image source={{ uri: item.recipientImage }} style={styles.avatar} />
        ) : (
          <View style={styles.defaultAvatar}>
            <Text style={styles.avatarText}>
              {item.recipientName.charAt(0)}
            </Text>
          </View>
        )}
        {item.unread && <View style={styles.unreadIndicator} />}
      </View>
      
      <View style={styles.conversationContent}>
        <View style={styles.conversationHeader}>
          <Text style={styles.recipientName}>{item.recipientName}</Text>
          <Text style={styles.timestamp}>{formatTimestamp(item.timestamp)}</Text>
        </View>
        <Text 
          style={[styles.lastMessage, item.unread && styles.unreadMessage]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {item.lastMessage}
        </Text>
      </View>
    </TouchableOpacity>
  );

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
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
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
