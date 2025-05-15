import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Animated,
  ScrollView,
  Alert,
  Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUnreadMessages } from '../context/UnreadMessagesContext';
import NotificationBadge from './NotificationBadge';

const BarbershopDashboard = () => {
  const navigation = useNavigation();
  const [isOpen, setIsOpen] = useState(false);
  const slideAnim = useRef(new Animated.Value(-300)).current;
  const { unreadCount } = useUnreadMessages();
  
  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userRole');
      navigation.replace('Login');
    } catch (error) {
      Alert.alert('Logout Failed', 'Please try again');
    }
  };

  const toggleMenu = () => {
    const toValue = isOpen ? -300 : 0;
    Animated.timing(slideAnim, {
      toValue,
      duration: 300,
      useNativeDriver: true,
    }).start();
    setIsOpen(!isOpen);
  };

  const sidebarSections = [
    {
      title: "Appointments",
      items: [
        {
          label: "View Appointments",
          screen: "AppointmentList",
          icon: "calendar"
        },
      ]
    },
    {
      title: "Shop Settings",
      items: [
        {
          label: "Customize Shop",
          screen: "CustomizeShop",
          icon: "settings"
        },
      ]
    },
    {
      title: "Account",
      items: [
        {
          label: "Settings",
          screen: "Settings",
          icon: "user"
        },
        {
          label: "Logout",
          onPress: handleLogout,
          icon: "log-out"
        }
      ]
    }
  ];

  return (
    <LinearGradient
      colors={['#000000', '#333333']}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" translucent={true} backgroundColor="transparent" />
      
      <ScrollView style={styles.content} stickyHeaderIndices={[0]}>
        {/* Sticky Header */}
        <View style={styles.stickyHeader}>
          <TouchableOpacity 
            style={styles.menuButton}
            onPress={toggleMenu}
          >
            <Feather name="menu" size={24} color="white" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.welcomeContainer}>
          <Text style={styles.mainTitle}>Welcome to Your Barber Dashboard</Text>
          <Text style={styles.welcomeText}>
            Manage your appointments and customize your shop profile
          </Text>
          
          <View style={styles.featuresList}>
            <View style={styles.featureItem}>
              <Feather name="calendar" size={20} color="#FF0000" />
              <Text style={styles.featureText}>View and manage your appointments</Text>
            </View>
            
            <View style={styles.featureItem}>
              <Feather name="edit" size={20} color="#FF0000" />
              <Text style={styles.featureText}>Customize your shop profile</Text>
            </View>
            
            <View style={styles.featureItem}>
    <Feather name="message-square" size={20} color="#FF0000" />
    <Text style={styles.featureText}>Message clients directly for appointment details</Text>
  </View>
</View>
        </View>
        
        <View style={styles.quickActionsContainer}>
          <Text style={styles.quickActionsTitle}>Quick Actions</Text>
          
          <View style={styles.actionCardsContainer}>
            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => navigation.navigate('AppointmentList')}
            >
              <Feather name="calendar" size={32} color="#FF0000" />
              <Text style={styles.actionCardTitle}>Appointments</Text>
              <Text style={styles.actionCardDesc}>View your upcoming appointments</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => navigation.navigate('CustomizeShop')}
            >
              <Feather name="settings" size={32} color="#FF0000" />
              <Text style={styles.actionCardTitle}>Shop Settings</Text>
              <Text style={styles.actionCardDesc}>Customize your shop profile</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      {/* Animated Sidebar */}
      <Animated.View 
        style={[
          styles.sidebar,
          {
            transform: [{ translateX: slideAnim }],
          },
        ]}
      >
        <LinearGradient
          colors={['#000000', '#333333']}
          style={styles.sidebarGradient}
        >
          <TouchableOpacity onPress={toggleMenu} style={styles.closeButton}>
            <Feather name="x" size={24} color="white" />
          </TouchableOpacity>
          <View style={styles.sidebarHeader}>
            <Text style={styles.sidebarTitle}>Barber Dashboard</Text>
            <View style={styles.titleUnderline} />
          </View>
          
          <ScrollView 
            style={styles.sidebarContent}
            showsVerticalScrollIndicator={true}
            indicatorStyle="white"
          >
            {sidebarSections.map((section, index) => (
              <View key={index}>
                <Text style={styles.sidebarSection}>{section.title}</Text>
                {section.items.map((item, itemIndex) => (
                  <TouchableOpacity 
                    key={itemIndex}
                    style={styles.sidebarItem}
                    onPress={() => {
                      if (item.screen) {
                        navigation.navigate(item.screen);
                        toggleMenu();
                      } else if (item.onPress) {
                        item.onPress();
                      }
                    }}
                  >
                    <View style={styles.sidebarItemRow}>
                      <View style={styles.sidebarItemContent}>
                        {item.icon && <Feather name={item.icon} size={20} color={item.icon === "log-out" ? "#FF0000" : "#FFFFFF"} style={styles.itemIcon} />}
                        <Text style={[styles.sidebarItemText, item.icon === "log-out" ? styles.logoutText : null]}>
                          {item.label}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            ))}
          </ScrollView>
        </LinearGradient>
      </Animated.View>
     {/* Bottom Navigation Bar */}
<View style={styles.navbar}>
  <TouchableOpacity 
    style={styles.navItem}
    onPress={() => navigation.navigate('BarbershopDashboard')}
  >
    <Feather name="home" size={24} color="white" />
    <Text style={styles.navText}>Home</Text>
  </TouchableOpacity>
  
  <TouchableOpacity 
    style={styles.navItem}
    onPress={() => navigation.navigate('MessagesScreen')}
  >
    <View style={styles.iconWithBadge}>
      <Feather name="message-square" size={24} color="white" />
      {unreadCount > 0 && <NotificationBadge count={unreadCount} />}
    </View>
    <Text style={styles.navText}>Messages</Text>
  </TouchableOpacity>
  
  <TouchableOpacity>
    <LinearGradient
      colors={['#FF0000', '#FFFFFF', '#0000FF', '#FF0000', '#FFFFFF', '#0000FF']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.clipperButton}
    />
  </TouchableOpacity>
  
  <TouchableOpacity 
    style={styles.navItem}
    onPress={() => navigation.navigate('ProfileSettings')}
  >
    <Feather name="user" size={24} color="white" />
    <Text style={styles.navText}>Profile</Text>
  </TouchableOpacity>
  
  <TouchableOpacity 
    style={styles.navItem}
    onPress={() => navigation.navigate('Settings')}

  >
    <Feather name="settings" size={24} color="white" />
    <Text style={styles.navText}>Settings</Text>
  </TouchableOpacity>
</View>

    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  stickyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 10,
    paddingHorizontal: 20,
    backgroundColor: '#000000', // Match the gradient start color
  },
  menuButton: {
    padding: 10,
  },
  sidebar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 300,
    backgroundColor: '#000',
    zIndex: 999,
  },
  sidebarGradient: {
    flex: 1,
    padding: 20,
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    padding: 10,
    zIndex: 3,
  },
  sidebarHeader: {
    paddingTop: 60,
    marginBottom: 10,
  },
  sidebarTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  titleUnderline: {
    height: 2,
    backgroundColor: '#FFFFFF',
    width: '100%',
    marginTop: 10,
  },
  sidebarContent: {
    flex: 1,
    marginTop: 20,
  },
  sidebarSection: {
    color: '#FF0000',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  sidebarItem: {
    paddingVertical: 12,
    paddingHorizontal: 10,
  },
  sidebarItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sidebarItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemIcon: {
    marginRight: 12,
  },
  sidebarItemText: {
    color: 'white',
    fontSize: 16,
  },
  logoutText: {
    color: '#FF0000',
    fontWeight: 'bold'
  },
  content: {
    flex: 1,
  },
  welcomeContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 10,
    padding: 20,
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 20,
  },
  mainTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  welcomeText: {
    color: '#DDD',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 15,
    lineHeight: 22,
  },
  featuresList: {
    marginTop: 15,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureText: {
    color: 'white',
    fontSize: 16,
    marginLeft: 12,
  },
  quickActionsContainer: {
    marginBottom: 20,
    marginHorizontal: 20,
  },
  quickActionsTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  actionCardsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionCard: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 10,
    padding: 15,
    width: '48%',
    alignItems: 'center',
  },
  actionCardTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 5,
  },
  actionCardDesc: {
    color: '#DDD',
    fontSize: 12,
    textAlign: 'center',
  },
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#000000',
    paddingBottom: 20,
    paddingTop: 10,
  },
  navItem: {
    alignItems: 'center',
  },
  navText: {
    color: 'white',
    fontSize: 12,
    marginTop: 5,
  },
  navText: {
    color: 'white',
    fontSize: 12,
    marginTop: 5,
  },
  centerButtonContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    left: '50%',
    marginLeft: -30,
  },
  clipperButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -25,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
});

export default BarbershopDashboard;
