import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Image
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, MaterialIcons, Ionicons } from '@expo/vector-icons';

const SettingsScreen = ({ navigation }) => {
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

  const handleToggleSetting = (setting) => {
    setSettings({
      ...settings,
      [setting]: !settings[setting]
    });
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
          
          <TouchableOpacity 
            style={styles.optionItem}
            onPress={() => navigation.navigate('PaymentMethods')}
          >
            <View style={styles.settingIconContainer}>
              <Feather name="credit-card" size={24} color="#FF0000" />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Payment Methods</Text>
              <Text style={styles.settingDescription}>Manage your payment options</Text>
            </View>
            <Feather name="chevron-right" size={20} color="#888" />
          </TouchableOpacity>
        </View>
        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          
          {renderSettingToggle(
            'Push Notifications',
            'Receive push notifications for appointments and updates',
            'pushNotifications',
            <Feather name="bell" size={24} color="#FF0000" />
          )}
          
          {renderSettingToggle(
            'Email Notifications',
            'Receive email notifications for bookings and receipts',
            'emailNotifications',
            <MaterialIcons name="email" size={24} color="#FF0000" />
          )}
          
          {renderSettingToggle(
            'SMS Notifications',
            'Receive text message reminders for upcoming appointments',
            'smsNotifications',
            <MaterialIcons name="sms" size={24} color="#FF0000" />
          )}
          
          {renderSettingToggle(
            'Appointment Reminders',
            'Get reminders before your scheduled appointments',
            'appointmentReminders',
            <Feather name="calendar" size={24} color="#FF0000" />
          )}
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
          
          {renderSettingToggle(
            'Auto Check-In',
            'Automatically check in when you arrive at your appointment',
            'autoCheckIn',
            <Feather name="check-circle" size={24} color="#FF0000" />
          )}
          
          {renderSettingToggle(
            'Biometric Login',
            'Use fingerprint or face recognition to log in',
            'biometricLogin',
            <MaterialIcons name="fingerprint" size={24} color="#FF0000" />
          )}
        </View>
        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>Privacy</Text>
          
          {renderSettingToggle(
            'Data Collection',
            'Allow anonymous usage data to improve our services',
            'dataCollection',
            <Feather name="database" size={24} color="#FF0000" />
          )}
          
          {renderSettingToggle(
            'Marketing Emails',
            'Receive promotional emails and special offers',
            'marketingEmails',
            <MaterialIcons name="local-offer" size={24} color="#FF0000" />
          )}
          
          <TouchableOpacity 
            style={styles.optionItem}
            onPress={() => navigation.navigate('PrivacySecurity')}
          >
            <View style={styles.settingIconContainer}>
              <Feather name="shield" size={24} color="#FF0000" />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Privacy & Security</Text>
              <Text style={styles.settingDescription}>Manage your privacy settings</Text>
            </View>
            <Feather name="chevron-right" size={20} color="#888" />
          </TouchableOpacity>
        </View>
        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>Regional Settings</Text>
          
          <TouchableOpacity 
            style={styles.optionItem}
            onPress={() => {
              Alert.alert(
                'Select Language',
                'Choose your preferred language',
                [
                  { text: 'English', onPress: () => console.log('English selected') },
                  { text: 'Spanish', onPress: () => console.log('Spanish selected') },
                  { text: 'French', onPress: () => console.log('French selected') },
                  { text: 'Cancel', style: 'cancel' }
                ]
              );
            }}
          >
            <View style={styles.settingIconContainer}>
              <Ionicons name="language" size={24} color="#FF0000" />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Language</Text>
              <Text style={styles.settingValue}>{settings.language}</Text>
            </View>
            <Feather name="chevron-right" size={20} color="#888" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.optionItem}
            onPress={() => {
              Alert.alert(
                'Select Currency',
                'Choose your preferred currency',
                [
                  { text: 'USD ($)', onPress: () => console.log('USD selected') },
                  { text: 'EUR (€)', onPress: () => console.log('EUR selected') },
                  { text: 'GBP (£)', onPress: () => console.log('GBP selected') },
                  { text: 'Cancel', style: 'cancel' }
                ]
              );
            }}
          >
            <View style={styles.settingIconContainer}>
              <Feather name="dollar-sign" size={24} color="#FF0000" />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Currency</Text>
              <Text style={styles.settingValue}>{settings.currency}</Text>
            </View>
            <Feather name="chevron-right" size={20} color="#888" />
          </TouchableOpacity>
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
          
          <TouchableOpacity 
            style={styles.optionItem}
            onPress={() => navigation.navigate('Feedback')}
          >
            <View style={styles.settingIconContainer}>
              <MaterialIcons name="feedback" size={24} color="#FF0000" />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Send Feedback</Text>
              <Text style={styles.settingDescription}>Help us improve the app</Text>
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
          onPress={() => {
            Alert.alert(
              'Delete Account',
              'Are you sure you want to delete your account? This action cannot be undone.',
              [
                { text: 'Cancel', style: 'cancel' },
                { 
                  text: 'Delete', 
                  style: 'destructive',
                  onPress: () => {
                    // Navigate to login after confirmation
                    navigation.reset({
                      index: 0,
                      routes: [{ name: 'Login' }],
                    });
                  }
                }
              ]
            );
          }}
        >
                <MaterialIcons name="delete-forever" size={24} color="#FF0000" />
          <Text style={styles.dangerButtonText}>Delete Account</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={() => {
            Alert.alert(
              'Logout',
              'Are you sure you want to log out?',
              [
                { text: 'Cancel', style: 'cancel' },
                { 
                  text: 'Logout', 
                  onPress: () => {
                    // Navigate to login screen
                    navigation.reset({
                      index: 0,
                      routes: [{ name: 'Login' }],
                    });
                  }
                }
              ]
            );
          }}
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
