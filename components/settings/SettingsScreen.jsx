import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Image,
  ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, MaterialIcons, Ionicons } from '@expo/vector-icons';
import AuthContext from '../../context/AuthContext';
import config from '../../config/environment';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const SettingsScreen = ({ navigation }) => {
  const [settings, setSettings] = useState({
    darkMode: true,
    locationServices: true,
  });
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Use the AuthContext with your specific implementation
  const { token, user, logout } = useContext(AuthContext);

  const handleToggleSetting = (setting) => {
    setSettings({
      ...settings,
      [setting]: !settings[setting]
    });
  };

  // Using the same approach as your message service
  const makeApiRequest = async ({ method = 'GET', endpoint, data = null }) => {
    try {
      // Get token if available, but don't require it
      const storedToken = await AsyncStorage.getItem('userToken');
      const headers = { 'Content-Type': 'application/json' };
      
      if (storedToken) {
        // Use Authorization header instead of x-auth-token
        headers['Authorization'] = `Bearer ${storedToken}`;
        
        // Keep x-auth-token for backward compatibility if needed
        headers['x-auth-token'] = storedToken;
      }
      
      console.log(`Making ${method} request to ${endpoint} with token: ${storedToken ? 'Yes' : 'No'}`);
      
      const response = await axios({
        method,
        url: `${config.API_URL}${endpoint}`,
        data,
        headers,
        timeout: 10000 // 10 second timeout
      });
      
      return response.data;
    } catch (error) {
      console.error(`API request failed: ${error.message}`);
      console.error('Error details:', error.response?.data || 'No response data');
      
      return {
        success: false,
        message: error.response?.data?.message || 'Network error. Please check your connection.'
      };
    }
  };

  const handleDeleteAccount = async () => {
    try {
      setIsDeleting(true);
      
      console.log('Attempting to delete account...');
      
      // Use the makeApiRequest function that works with your other API calls
      const response = await makeApiRequest({
        method: 'DELETE',
        endpoint: '/api/user/delete-account'
      });
      
      console.log('Delete account response:', response);
      
      if (response.success) {
        Alert.alert(
          'Account Deleted',
          'Your account and all associated data have been permanently deleted.',
          [
            {
              text: 'OK',
              onPress: async () => {
                await logout();
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'Login' }],
                });
              }
            }
          ]
        );
      } else {
        // Handle error from the API
        Alert.alert(
          'Error',
          response.message || 'Failed to delete account. Please try again later.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error in handleDeleteAccount:', error);
      
      Alert.alert(
        'Error',
        'An unexpected error occurred. Please try again later.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const confirmDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action CANNOT be undone and all your data will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            // Show second confirmation for extra security
            Alert.alert(
              'Final Confirmation',
              'Please confirm that you want to permanently delete your account and all associated data.',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Permanently Delete',
                  style: 'destructive',
                  onPress: handleDeleteAccount
                }
              ]
            );
          }
        }
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          onPress: async () => {
            await logout();
            navigation.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            });
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
        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>Account</Text>
          
          <TouchableOpacity 
            style={styles.optionItem}
            onPress={() => navigation.navigate('AccountDetails')}
          >
            <View style={styles.settingIconContainer}>
              <Feather name="user" size={24} color="#FF0000" />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Personal Information</Text>
              <Text style={styles.settingDescription}>Manage your profile details</Text>
            </View>
            <Feather name="chevron-right" size={20} color="#888" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.optionItem}
            onPress={() => navigation.navigate('ChangePassword')}
          >
            <View style={styles.settingIconContainer}>
              <Feather name="lock" size={24} color="#FF0000" />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Change Password</Text>
              <Text style={styles.settingDescription}>Update your password</Text>
            </View>
            <Feather name="chevron-right" size={20} color="#888" />
          </TouchableOpacity>
        </View>
        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>App Preferences</Text>
          
          {renderSettingToggle(
            'Dark Mode',
            'Use dark theme throughout the app',
            'darkMode',
            <Feather name="moon" size={24} color="#FF0000" />
          )}
          
          {renderSettingToggle(
            'Location Services',
            'Allow the app to access your location for nearby shops',
            'locationServices',
            <Feather name="map-pin" size={24} color="#FF0000" />
          )}
        </View>
        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>Support</Text>
          
          <TouchableOpacity 
            style={styles.optionItem}
            onPress={() => navigation.navigate('HelpCenter')}
          >
            <View style={styles.settingIconContainer}>
              <Feather name="help-circle" size={24} color="#FF0000" />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Help Center</Text>
              <Text style={styles.settingDescription}>Get help with using the app</Text>
            </View>
            <Feather name="chevron-right" size={20} color="#888" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.optionItem}
            onPress={() => navigation.navigate('ContactSupport')}
          >
            <View style={styles.settingIconContainer}>
              <Feather name="message-circle" size={24} color="#FF0000" />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Contact Support</Text>
              <Text style={styles.settingDescription}>Reach out to our support team</Text>
            </View>
            <Feather name="chevron-right" size={20} color="#888" />
          </TouchableOpacity>
        </View>
        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>About</Text>
          
          <TouchableOpacity 
            style={styles.optionItem}
            onPress={() => navigation.navigate('TermsOfService')}
          >
            <View style={styles.settingIconContainer}>
              <Feather name="file-text" size={24} color="#FF0000" />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Terms of Service</Text>
            </View>
            <Feather name="chevron-right" size={20} color="#888" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.optionItem}
            onPress={() => navigation.navigate('PrivacyPolicy')}
          >
            <View style={styles.settingIconContainer}>
              <Feather name="shield" size={24} color="#FF0000" />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Privacy Policy</Text>
            </View>
            <Feather name="chevron-right" size={20} color="#888" />
          </TouchableOpacity>
          
          <View style={styles.optionItem}>
            <View style={styles.settingIconContainer}>
              <Feather name="info" size={24} color="#FF0000" />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>App Version</Text>
              <Text style={styles.settingValue}>1.0.0</Text>
            </View>
          </View>
        </View>
        
        <TouchableOpacity 
          style={styles.dangerButton}
          disabled={isDeleting}
          onPress={confirmDeleteAccount}
        >
          {isDeleting ? (
            <ActivityIndicator size="small" color="#FF0000" style={{ marginRight: 10 }} />
          ) : (
            <MaterialIcons name="delete-forever" size={24} color="#FF0000" />
          )}
          <Text style={styles.dangerButtonText}>
            {isDeleting ? 'Deleting Account...' : 'Delete Account'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={handleLogout}
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
    marginBottom: 20,
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
