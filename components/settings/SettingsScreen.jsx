import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, MaterialIcons, Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../context/AuthContext';
import config from '../../config/environment';

const API_URL = config.apiUrl;

// Add logging utility
const logScreen = (message) => {
  console.log(`[SETTINGS SCREEN] ${new Date().toISOString()} - ${message}`);
};

const SettingsScreen = ({ navigation }) => {
  const { userToken, userId, logout } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState({
    pushNotifications: true,
    emailNotifications: true,
    smsNotifications: false,
    darkMode: true,
    locationServices: true,
    dataCollection: true,
    appointmentReminders: true,
    marketingEmails: false,
    autoCheckIn: false,
    biometricLogin: false,
    language: 'English',
    currency: 'USD',
  });

  useEffect(() => {
    logScreen("Settings screen mounted");
    logScreen(`Auth context values - userToken: ${userToken ? 'exists' : 'null'}, userId: ${userId || 'null'}`);
    
    // You could load user settings from API or AsyncStorage here
    const loadSettings = async () => {
      try {
        const savedSettings = await AsyncStorage.getItem('userSettings');
        if (savedSettings) {
          setSettings(JSON.parse(savedSettings));
          logScreen("Loaded settings from AsyncStorage");
        }
      } catch (error) {
        logScreen(`Error loading settings: ${error.message}`);
      }
    };
    
    loadSettings();
  }, [userToken, userId]);

  const handleToggleSetting = async (setting) => {
    const newSettings = {
      ...settings,
      [setting]: !settings[setting]
    };
    
    setSettings(newSettings);
    
    // Save settings to AsyncStorage
    try {
      await AsyncStorage.setItem('userSettings', JSON.stringify(newSettings));
      logScreen(`Updated setting: ${setting} to ${!settings[setting]}`);
    } catch (error) {
      logScreen(`Error saving settings: ${error.message}`);
    }
  };

const handleDeleteAccount = async () => {
  Alert.alert(
    'Delete Account',
    'Are you sure you want to delete your account? This action cannot be undone.',
    [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            setIsLoading(true);
            logScreen('Starting account deletion process');
            
            // Get token from context or AsyncStorage
            let token = userToken;
            if (!token) {
              token = await AsyncStorage.getItem('userToken');
              logScreen(`Token from AsyncStorage: ${token ? 'Found' : 'Not found'}`);
            }
            
            // Check if token exists
            if (!token) {
              logScreen('No token found for account deletion');
              Alert.alert('Error', 'You need to be logged in to delete your account');
              setIsLoading(false);
              return;
            }
            
            // Get user ID from context or AsyncStorage
            let id = userId;
            if (!id) {
              const userData = await AsyncStorage.getItem('userData');
              if (userData) {
                const parsed = JSON.parse(userData);
                id = parsed.id || parsed._id || parsed.userId;
                logScreen(`User ID from AsyncStorage: ${id}`);
              }
            }
            
            if (!id) {
              logScreen('No user ID found for account deletion');
              Alert.alert('Error', 'User ID not found. Please log in again.');
              setIsLoading(false);
              return;
            }
            
            logScreen(`Using token for deletion: ${token ? 'YES' : 'NO'}`);
            logScreen(`Using user ID for deletion: ${id}`);
            
            // Log token details (first few characters for security)
            const tokenPreview = token.substring(0, 10) + '...';
            logScreen(`Token preview: ${tokenPreview}`);
            
            // Make the API call to the correct endpoint
            logScreen(`Attempting to delete account with ID: ${id}`);
            
            const response = await axios({
              method: 'delete',
              url: `${API_URL}/api/account`, // Updated to match the server endpoint
              headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });
            
            logScreen(`Delete account response: ${response.status}`);
            
            if (response.status === 200 || response.status === 204) {
              // Success - proceed with logout
              await handleSuccessfulDeletion();
            } else {
              logScreen(`Unexpected response status: ${response.status}`);
              throw new Error(`Unexpected response status: ${response.status}`);
            }
          } catch (error) {
            logScreen(`Delete account error: ${error.message}`);
            console.error('Delete account error:', error);
            Alert.alert(
              'Error',
              'Unable to delete account. Please try again later.'
            );
          } finally {
            setIsLoading(false);
            }
          }
        }
      ]
    );
  };
  
  const handleSuccessfulDeletion = async () => {
    // Clear all storage
    await AsyncStorage.clear();
    logScreen('AsyncStorage cleared after account deletion');
    
    // Use the logout function from AuthContext
    if (logout) {
      logout();
      logScreen('Logged out via AuthContext');
    }
    
    Alert.alert(
      'Account Deleted',
      'Your account has been successfully deleted.',
      [{ 
        text: 'OK', 
        onPress: () => {
          logScreen('Navigating to Login screen');
          navigation.reset({
            index: 0,
            routes: [{ name: 'Login' }],
          });
        }
      }]
    );
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          onPress: async () => {
            try {
              logScreen('User confirmed logout');
              
              // Use the logout function from AuthContext
              if (logout) {
                logout();
                logScreen('Logged out via AuthContext');
              } else {
                // Fallback if logout function is not available
                await AsyncStorage.clear();
                logScreen('AsyncStorage cleared for logout');
              }
              
              // Navigate to login screen
              logScreen('Navigating to Login screen');
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              });
            } catch (error) {
              logScreen(`Logout error: ${error.message}`);
              console.error('Logout error:', error);
              Alert.alert('Error', 'Failed to log out. Please try again.');
            }
          }
        }
      ]
    );
  };

  const renderSettingToggle = (title, description, settingKey, icon) => (
    <View style={styles.settingItem}>
      <View style={styles.settingIconContainer}>
        {icon}
      </View>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        <Text style={styles.settingDescription}>{description}</Text>
      </View>
      <Switch
        value={settings[settingKey]}
        onValueChange={() => handleToggleSetting(settingKey)}
        trackColor={{ false: '#444', true: '#FF0000' }}
        thumbColor={settings[settingKey] ? '#FFFFFF' : '#f4f3f4'}
      />
    </View>
  );

  return (
    <LinearGradient
      colors={['#000000', '#333333']}
      style={styles.container}
    >
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Feather name="arrow-left" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 44 }} />
      </View>
      
      <ScrollView style={styles.content}>
        {/* Account Section */}
        <View style={styles.accountSection}>
          <TouchableOpacity 
            style={styles.profilePreview}
            onPress={() => navigation.navigate('AccountDetails')}
          >
            <View style={styles.profileImageContainer}>
              <View style={styles.profileImagePlaceholder}>
                <Feather name="user" size={30} color="#666" />
              </View>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>Account Details</Text>
              <Text style={styles.profileEmail}>Tap to view your profile</Text>
            </View>
            <Feather name="chevron-right" size={24} color="#888" />
          </TouchableOpacity>
        </View>
        
        {/* Notifications Section */}
        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          
          {renderSettingToggle(
            'Push Notifications',
            'Receive push notifications for important updates',
            'pushNotifications',
            <Ionicons name="notifications" size={22} color="#FF0000" />
          )}
          
          {renderSettingToggle(
            'Email Notifications',
            'Receive email notifications for important updates',
            'emailNotifications',
            <MaterialIcons name="email" size={22} color="#FF0000" />
          )}
          
          {renderSettingToggle(
            'SMS Notifications',
            'Receive text messages for important updates',
            'smsNotifications',
            <MaterialIcons name="sms" size={22} color="#FF0000" />
          )}
          
          {renderSettingToggle(
            'Appointment Reminders',
            'Receive reminders before your appointments',
            'appointmentReminders',
            <MaterialIcons name="event" size={22} color="#FF0000" />
          )}
        </View>
        
        {/* Privacy Section */}
        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>Privacy & Security</Text>
          
          {renderSettingToggle(
            'Location Services',
            'Allow app to access your location',
            'locationServices',
            <MaterialIcons name="location-on" size={22} color="#FF0000" />
          )}
          
          {renderSettingToggle(
            'Data Collection',
            'Allow app to collect usage data',
            'dataCollection',
            <MaterialIcons name="data-usage" size={22} color="#FF0000" />
          )}
          
          {renderSettingToggle(
            'Marketing Emails',
            'Receive promotional emails',
            'marketingEmails',
            <MaterialIcons name="campaign" size={22} color="#FF0000" />
          )}
          
          {renderSettingToggle(
            'Biometric Login',
            'Use fingerprint or face ID to login',
            'biometricLogin',
            <MaterialIcons name="fingerprint" size={22} color="#FF0000" />
          )}
        </View>
        
        {/* Danger Zone */}
        <TouchableOpacity 
          style={styles.dangerButton}
          onPress={handleDeleteAccount}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#FF0000" style={{ marginRight: 10 }} />
          ) : (
            <MaterialIcons name="delete-forever" size={24} color="#FF0000" />
          )}
          <Text style={styles.dangerButtonText}>
            {isLoading ? 'Deleting Account...' : 'Delete Account'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={handleLogout}
          disabled={isLoading}
        >
          <MaterialIcons name="logout" size={24} color="#FFFFFF" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  backButton: {
    padding: 10,
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 20,
  },
   accountSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  profilePreview: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
    borderWidth: 2,
    borderColor: '#FF0000',
    overflow: 'hidden',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  profileImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#222',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  profileEmail: {
    color: '#BBB',
    fontSize: 14,
  },
  settingsSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  sectionTitle: {
    color: '#FF0000',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  settingIconContainer: {
    width: 40,
    alignItems: 'center',
    marginRight: 10,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    color: 'white',
    fontSize: 16,
    marginBottom: 3,
  },
  settingDescription: {
    color: '#999',
    fontSize: 14,
  },
  settingValue: {
    color: '#999',
    fontSize: 14,
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#FF0000',
  },
  dangerButtonText: {
    color: '#FF0000',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF0000',
    padding: 15,
    borderRadius: 8,
    marginBottom: 30,
  },
  logoutText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
});

export default SettingsScreen;
