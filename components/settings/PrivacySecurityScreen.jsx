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
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { authService } from '../../services/api';

const PrivacySecurityScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({
    twoFactorAuth: false,
    biometricLogin: false,
    locationTracking: true,
    dataSharing: true,
    cookieUsage: true,
    analyticsCollection: true,
    marketingCommunications: false,
  });

  useEffect(() => {
    fetchPrivacySettings();
  }, []);

  const fetchPrivacySettings = async () => {
    try {
      setLoading(true);
      // In a real app, you would fetch privacy settings from your API
      const response = await authService.getPrivacySettings();
      setSettings(response || {});
    } catch (error) {
      console.error('Error fetching privacy settings:', error);
      Alert.alert('Error', 'Failed to load your privacy settings');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSetting = async (setting) => {
    try {
      const updatedSettings = {
        ...settings,
        [setting]: !settings[setting]
      };
      
      setSettings(updatedSettings);
      
      // In a real app, you would save this to your backend
      await authService.updatePrivacySettings({
        [setting]: !settings[setting]
      });
    } catch (error) {
      console.error(`Error updating ${setting}:`, error);
      // Revert the change if the update fails
      setSettings(settings);
      Alert.alert('Error', `Failed to update ${setting.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
    }
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

  if (loading) {
    return (
      <LinearGradient
        colors={['#000000', '#333333']}
        style={styles.loadingContainer}
      >
        <ActivityIndicator size="large" color="#FF0000" />
        <Text style={styles.loadingText}>Loading privacy settings...</Text>
      </LinearGradient>
    );
  }
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
        <Text style={styles.headerTitle}>Privacy & Security</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security</Text>
          
          {renderSettingToggle(
            'Two-Factor Authentication',
            'Add an extra layer of security to your account',
            'twoFactorAuth',
            <Feather name="lock" size={24} color="#FF0000" />
          )}
          
          {renderSettingToggle(
            'Biometric Login',
            'Use fingerprint or face recognition to log in',
            'biometricLogin',
            <MaterialIcons name="fingerprint" size={24} color="#FF0000" />
          )}
          
          <TouchableOpacity 
            style={styles.optionItem}
            onPress={() => navigation.navigate('ChangePassword')}
          >
            <View style={styles.settingIconContainer}>
              <Feather name="key" size={24} color="#FF0000" />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Change Password</Text>
              <Text style={styles.settingDescription}>Update your account password</Text>
            </View>
            <Feather name="chevron-right" size={20} color="#888" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.optionItem}
            onPress={() => navigation.navigate('LoginActivity')}
          >
            <View style={styles.settingIconContainer}>
              <Feather name="activity" size={24} color="#FF0000" />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Login Activity</Text>
              <Text style={styles.settingDescription}>Review your recent login sessions</Text>
            </View>
            <Feather name="chevron-right" size={20} color="#888" />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacy</Text>
          
          {renderSettingToggle(
            'Location Tracking',
            'Allow the app to track your location',
            'locationTracking',
            <Feather name="map-pin" size={24} color="#FF0000" />
          )}
          
          {renderSettingToggle(
            'Data Sharing',
            'Share your data with our partners to improve services',
            'dataSharing',
            <Feather name="share-2" size={24} color="#FF0000" />
          )}
          
          {renderSettingToggle(
            'Cookie Usage',
            'Allow cookies to enhance your browsing experience',
            'cookieUsage',
            <MaterialIcons name="cookie" size={24} color="#FF0000" />
          )}
          
          {renderSettingToggle(
            'Analytics Collection',
            'Allow collection of anonymous usage data',
            'analyticsCollection',
            <Feather name="bar-chart-2" size={24} color="#FF0000" />
          )}
          
          {renderSettingToggle(
            'Marketing Communications',
            'Receive promotional emails and offers',
            'marketingCommunications',
            <MaterialIcons name="local-offer" size={24} color="#FF0000" />
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Management</Text>
          
          <TouchableOpacity 
            style={styles.optionItem}
            onPress={() => navigation.navigate('DownloadData')}
          >
            <View style={styles.settingIconContainer}>
              <Feather name="download" size={24} color="#FF0000" />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Download Your Data</Text>
              <Text style={styles.settingDescription}>Get a copy of your personal data</Text>
            </View>
            <Feather name="chevron-right" size={20} color="#888" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.optionItem}
            onPress={() => {
              Alert.alert(
                'Clear Browsing Data',
                'Are you sure you want to clear all browsing data?',
                [
                  { text: 'Cancel', style: 'cancel' },
                  { 
                    text: 'Clear', 
                    style: 'destructive',
                    onPress: () => {
                      // Clear browsing data logic
                      Alert.alert('Success', 'Browsing data cleared successfully');
                    }
                  }
                ]
              );
            }}
          >
            <View style={styles.settingIconContainer}>
              <Feather name="trash-2" size={24} color="#FF0000" />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Clear Browsing Data</Text>
              <Text style={styles.settingDescription}>Clear your browsing history and cache</Text>
            </View>
            <Feather name="chevron-right" size={20} color="#888" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.dangerItem}
            onPress={() => {
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
                        await authService.deleteAccount();
                        navigation.reset({
                          index: 0,
                          routes: [{ name: 'Login' }],
                        });
                      } catch (error) {
                        console.error('Error deleting account:', error);
                        Alert.alert('Error', 'Failed to delete your account');
                      }
                    }
                  }
                ]
              );
            }}
          >
            <View style={styles.settingIconContainer}>
              <MaterialIcons name="delete-forever" size={24} color="#FF0000" />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.dangerTitle}>Delete Account</Text>
              <Text style={styles.settingDescription}>Permanently delete your account and all data</Text>
            </View>
            <Feather name="chevron-right" size={20} color="#888" />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Legal</Text>
          
          <TouchableOpacity 
            style={styles.optionItem}
            onPress={() => navigation.navigate('TermsOfService')}
          >
            <View style={styles.settingIconContainer}>
              <Feather name="file-text" size={24} color="#FF0000" />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Terms of Service</Text>
              <Text style={styles.settingDescription}>Read our terms of service</Text>
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
              <Text style={styles.settingDescription}>Read our privacy policy</Text>
            </View>
            <Feather name="chevron-right" size={20} color="#888" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
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
  section: {
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
  dangerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
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
  dangerTitle: {
    color: '#FF0000',
    fontSize: 16,
    marginBottom: 3,
  },
  settingDescription: {
    color: '#999',
    fontSize: 14,
  },
});

export default PrivacySecurityScreen;
