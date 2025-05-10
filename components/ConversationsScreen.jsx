import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import messageService from '../services/messageService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ConversationsScreen = ({ navigation }) => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await messageService.getConversations(token);
      
      if (response.success && Array.isArray(response.conversations)) {
        setConversations(response.conversations);
      } else {
        console.error('Invalid conversations response:', response);
        setConversations([]);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
      setConversations([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadConversations();
  };

  const handleConversationPress = (conversation) => {
    // Log the conversation object to see what we're working with
    console.log('Navigating to conversation:', JSON.stringify(conversation, null, 2));
    
    // IMPORTANT: Pass the conversationId to the ChatScreen
    navigation.navigate('ChatScreen', {
      conversationId: conversation._id, // Add this line to pass the conversation ID
      recipientId: conversation.recipient._id,
      recipientName: conversation.recipient.name || conversation.recipient.businessName,
      recipientImage: conversation.recipient.profileImage,
      shopId: conversation.recipient.shopId
    });
  };
  

  const renderConversationItem = ({ item }) => {
    const lastMessageTime = new Date(item.lastMessage.createdAt);
    const now = new Date();
    const isToday = lastMessageTime.toDateString() === now.toDateString();
    
    // Format time as "Today at 2:30 PM" or "May 20 at 2:30 PM"
    const timeString = isToday
      ? `Today at ${lastMessageTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
      : `${lastMessageTime.toLocaleDateString([], { month: 'short', day: 'numeric' })} at ${lastMessageTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

    return (
      <TouchableOpacity
        style={styles.conversationItem}
        onPress={() => handleConversationPress(item)}
      >
        {item.recipient.profileImage ? (
          <Image
            source={{ uri: item.recipient.profileImage }}
            style={styles.avatar}
          />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarInitial}>
              {(item.recipient.name || item.recipient.businessName || 'U').charAt(0).toUpperCase()}
            </Text>
          </View>
        )}

        <View style={styles.conversationInfo}>
          <View style={styles.conversationHeader}>
            <Text style={styles.recipientName}>
              {item.recipient.name || item.recipient.businessName || 'Unknown'}
            </Text>
            <Text style={styles.timeText}>{timeString}</Text>
          </View>
          
          <View style={styles.messagePreviewContainer}>
            <Text 
              style={[
                styles.messagePreview,
                item.unreadCount > 0 ? styles.unreadMessagePreview : {}
              ]}
              numberOfLines={1}
            >
              {item.lastMessage.text}
            </Text>
            
            {item.unreadCount > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadCount}>
                  {item.unreadCount > 99 ? '99+' : item.unreadCount}
                </Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyList = () => {
    if (loading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color="#FF0000" />
          <Text style={styles.emptyText}>Loading conversations...</Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Feather name="message-circle" size={60} color="#666" />
        <Text style={styles.emptyTitle}>No conversations yet</Text>
        <Text style={styles.emptyText}>
          Your messages with barbers will appear here
        </Text>
      </View>
    );
  };

  return (
    <LinearGradient colors={['#000000', '#333333']} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
      </View>

      <FlatList
        data={conversations}
        renderItem={renderConversationItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={renderEmptyList}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#FF0000"
            colors={["#FF0000"]}
          />
        }
      />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 15,
    paddingTop: 50,
    borderBottomWidth: 1,
    borderBottomColor: '#444',
  },
  headerTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  listContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  conversationItem: {
    flexDirection: 'row',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
  },
  avatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FF0000',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  avatarInitial: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  conversationInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  recipientName: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  timeText: {
    color: '#999',
    fontSize: 12,
  },
  messagePreviewContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  messagePreview: {
    color: '#CCC',
    fontSize: 14,
    flex: 1,
  },
  unreadMessagePreview: {
    color: 'white',
    fontWeight: 'bold',
  },
  unreadBadge: {
    backgroundColor: '#FF0000',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
    paddingHorizontal: 5,
  },
  unreadCount: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    marginTop: 100,
  },
  emptyTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  emptyText: {
    color: '#CCC',
    textAlign: 'center',
    fontSize: 16,
  },
});

export default ConversationsScreen;
