import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AccountDetailsScreen = ({ navigation }) => {
  const { token, user: authUser, logout } = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phoneNumber: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
  });

  // Debug AuthContext data
  useEffect(() => {
    console.log('AuthContext user data:', authUser);
    if (authUser) {
      console.log('AuthContext user keys:', Object.keys(authUser));
      console.log('Phone number in AuthContext:', authUser.phoneNumber);
    }
  }, [authUser]);

  useEffect(() => {
    console.log('AccountDetailsScreen mounted, calling loadUserData()');
    loadUserData();
  }, [token]); // Re-fetch when token changes

  const loadUserData = async () => {
    console.log('Starting loadUserData()');
    setLoading(true);
    
    try {
      // Use data from AuthContext
      if (authUser) {
        console.log('Using user data from AuthContext');
        console.log('Auth user data:', authUser);
        setUser(authUser);
        
        // Initialize form with AuthContext data
        setFormData({
          username: authUser.username || '',
          email: authUser.email || '',
          phoneNumber: authUser.phoneNumber || '',
          address: authUser.address || '',
          city: authUser.city || '',
          state: authUser.state || '',
          zipCode: authUser.zipCode || '',
        });
      } else {
        // Try to get cached data if no authUser
        try {
          const userDataString = await AsyncStorage.getItem('userData');
          if (userDataString) {
            const cachedData = JSON.parse(userDataString);
            console.log('Found cached user data:', cachedData);
            setUser(cachedData);
            
            // Initialize form with cached data
            setFormData({
              username: cachedData.username || '',
              email: cachedData.email || '',
              phoneNumber: cachedData.phoneNumber || '',
              address: cachedData.address || '',
              city: cachedData.city || '',
              state: cachedData.state || '',
              zipCode: cachedData.zipCode || '',
            });
          } else {
            // No cached data and no authUser
            console.log('No user data available');
            Alert.alert('Session Expired', 'Please login again');
            navigation.navigate('Login');
          }
        } catch (cacheError) {
          console.error('Error retrieving cached user data:', cacheError);
          Alert.alert('Error', 'Failed to load your profile information');
          navigation.navigate('Login');
        }
      }
    } catch (error) {
      console.error('Error in loadUserData:', error);
      Alert.alert('Error', 'An unexpected error occurred while loading your profile');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    console.log(`Updating form field: ${field} to: ${value}`);
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveProfile = async () => {
    console.log('Starting handleSaveProfile()');
    setLoading(true);
    
    try {
      // Update local state with form data
      const updatedUser = {
        ...user,
        username: formData.username,
        phoneNumber: formData.phoneNumber,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
      };
      
      console.log('Updating user data:', updatedUser);
      
      // Update local state
      setUser(updatedUser);
      
      // Save to AsyncStorage
      await AsyncStorage.setItem('userData', JSON.stringify(updatedUser));
      
      setEditMode(false);
      Alert.alert('Success', 'Your profile has been updated successfully');
      
      // Note: These changes are only saved locally
      // You'll need to implement server sync later if needed
    } catch (error) {
      console.error('Error in handleSaveProfile:', error);
      Alert.alert('Error', 'An unexpected error occurred while updating your profile');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    console.log('Handling logout');
    try {
      // Use the logout function from AuthContext
      const success = await logout();
      
      if (success) {
        // Clear local user data
        await AsyncStorage.removeItem('userData');
        
        navigation.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
      } else {
        Alert.alert('Error', 'Failed to logout. Please try again.');
      }
    } catch (error) {
      console.error('Error during logout:', error);
      Alert.alert('Error', 'Failed to logout');
    }
  };

  console.log('Rendering AccountDetailsScreen');
  console.log('Current state - loading:', loading, 'user:', user ? 'exists' : 'null');
  if (loading && !user) {
    console.log('Rendering loading screen');
    return (
      <LinearGradient
        colors={['#000000', '#333333']}
        style={styles.loadingContainer}
      >
        <ActivityIndicator size="large" color="#FF0000" />
        <Text style={styles.loadingText}>Loading your profile...</Text>
      </LinearGradient>
    );
  }

  console.log('Rendering main screen content');
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
        <Text style={styles.headerTitle}>Account Details</Text>
        <TouchableOpacity 
          style={styles.editButton}
          onPress={() => {
            console.log('Toggle edit mode:', !editMode);
            setEditMode(!editMode);
          }}
        >
          <Feather name={editMode ? "check" : "edit-2"} size={24} color="white" />
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.content}>
        <View style={styles.profileSection}>
          <View style={styles.profileIcon}>
            <Feather name="user" size={60} color="#FF0000" />
          </View>
          
          <Text style={styles.profileName}>
            {user?.username || 'User'}
          </Text>
          <Text style={styles.profileEmail}>{user?.email}</Text>
          
          {editMode ? (
            <TouchableOpacity 
              style={styles.saveButton}
              onPress={handleSaveProfile}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text style={styles.saveButtonText}>Save Changes</Text>
              )}
            </TouchableOpacity>
          ) : null}
        </View>
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          
          <View style={styles.infoField}>
            <Text style={styles.fieldLabel}>Username</Text>
            {editMode ? (
              <TextInput
                style={styles.input}
                value={formData.username}
                onChangeText={(text) => handleInputChange('username', text)}
                placeholder="Enter username"
                placeholderTextColor="#999"
              />
            ) : (
              <Text style={styles.fieldValue}>{user?.username || 'Not provided'}</Text>
            )}
          </View>
          
          <View style={styles.infoField}>
            <Text style={styles.fieldLabel}>Email</Text>
            <Text style={styles.fieldValue}>{user?.email || 'Not provided'}</Text>
          </View>
        </View>
        
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          
          <View style={styles.infoField}>
            <Text style={styles.fieldLabel}>Phone Number</Text>
            {editMode ? (
              <TextInput
                style={[styles.input, styles.requiredField]}
                value={formData.phoneNumber}
                onChangeText={(text) => handleInputChange('phoneNumber', text)}
                placeholder="Enter your phone number"
                placeholderTextColor="#999"
                keyboardType="phone-pad"
              />
            ) : (
              <Text style={styles.fieldValue}>{user?.phoneNumber || 'Not provided'}</Text>
            )}
            {editMode && (
              <Text style={styles.fieldHint}>
                Please provide your phone number for appointment notifications
              </Text>
            )}
          </View>
        </View>
        
        {(user?.role === 'barbershop' || user?.role === 'mainBarbershop') && (
          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>Business Information</Text>
            
            <View style={styles.infoField}>
              <Text style={styles.fieldLabel}>Business Name</Text>
              <Text style={styles.fieldValue}>{user?.businessName || 'Not provided'}</Text>
            </View>
          </View>
        )}
        
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Billing Address (Optional)</Text>
          <Text style={styles.fieldDescription}>
            You can add a billing address for future payments if needed.
          </Text>
          
          <View style={styles.infoField}>
            <Text style={styles.fieldLabel}>Street Address</Text>
            {editMode ? (
              <TextInput
                style={styles.input}
                value={formData.address}
                onChangeText={(text) => handleInputChange('address', text)}
                placeholder="Enter street address (optional)"
                placeholderTextColor="#999"
              />
            ) : (
              <Text style={styles.fieldValue}>{user?.address || 'Not provided'}</Text>
            )}
          </View>
          
          <View style={styles.infoField}>
            <Text style={styles.fieldLabel}>City</Text>
            {editMode ? (
              <TextInput
                style={styles.input}
                value={formData.city}
                onChangeText={(text) => handleInputChange('city', text)}
                placeholder="Enter city (optional)"
                placeholderTextColor="#999"
              />
            ) : (
              <Text style={styles.fieldValue}>{user?.city || 'Not provided'}</Text>
            )}
          </View>
          
          <View style={styles.infoField}>
            <Text style={styles.fieldLabel}>State</Text>
            {editMode ? (
              <TextInput
                style={styles.input}
                value={formData.state}
                onChangeText={(text) => handleInputChange('state', text)}
                placeholder="Enter state (optional)"
                placeholderTextColor="#999"
                maxLength={2}
              />
            ) : (
              <Text style={styles.fieldValue}>{user?.state || 'Not provided'}</Text>
            )}
          </View>
          
          <View style={styles.infoField}>
            <Text style={styles.fieldLabel}>ZIP Code</Text>
            {editMode ? (
              <TextInput
                style={styles.input}
                value={formData.zipCode}
                onChangeText={(text) => handleInputChange('zipCode', text)}
                placeholder="Enter ZIP code (optional)"
                placeholderTextColor="#999"
                keyboardType="numeric"
                maxLength={5}
              />
            ) : (
              <Text style={styles.fieldValue}>{user?.zipCode || 'Not provided'}</Text>
            )}
          </View>
        </View>
        
        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
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
  editButton: {
    padding: 10,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  profileIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 2,
    borderColor: '#FF0000',
  },
  profileName: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  profileEmail: {
    color: '#BBB',
    fontSize: 16,
    marginBottom: 15,
  },
  saveButton: {
    backgroundColor: '#FF0000',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginTop: 10,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoSection: {
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
  infoField: {
    marginBottom: 15,
  },
  fieldLabel: {
    color: '#999',
    fontSize: 14,
    marginBottom: 5,
  },
  fieldValue: {
    color: 'white',
    fontSize: 16,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    color: 'white',
    borderRadius: 5,
    padding: 12,
    fontSize: 16,
  },
  requiredField: {
    borderLeftWidth: 3,
    borderLeftColor: '#FF0000',
  },
  fieldHint: {
    color: '#999',
    fontSize: 12,
    marginTop: 5,
    fontStyle: 'italic',
  },
  fieldDescription: {
    color: '#BBB',
    fontSize: 14,
    marginBottom: 15,
    fontStyle: 'italic',
  },
  logoutButton: {
    backgroundColor: '#333',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 30,
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AccountDetailsScreen;
