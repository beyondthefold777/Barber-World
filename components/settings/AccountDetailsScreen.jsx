import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
  ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { authService } from '../../services/api';

const AccountDetailsScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
  });

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const userData = await authService.getUserProfile();
      setUser(userData);
      setProfileImage(userData.profileImage || null);
      
      // Initialize form data with user data
      setFormData({
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        email: userData.email || '',
        phone: userData.phone || '',
        address: userData.address?.street || '',
        city: userData.address?.city || '',
        state: userData.address?.state || '',
        zipCode: userData.address?.zip || '',
      });
    } catch (error) {
      console.error('Error fetching user data:', error);
      Alert.alert('Error', 'Failed to load your profile information');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      
      // Format the data for the API
      const updatedUserData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        address: {
          street: formData.address,
          city: formData.city,
          state: formData.state,
          zip: formData.zipCode,
        }
      };
      
      // If profile image was changed, upload it
      if (profileImage && profileImage !== user.profileImage) {
        const imageResponse = await authService.uploadProfileImage(profileImage);
        updatedUserData.profileImage = imageResponse.imageUrl;
      }
      
      // Update user profile
      const response = await authService.updateUserProfile(updatedUserData);
      
      setUser(response);
      setEditMode(false);
      Alert.alert('Success', 'Your profile has been updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update your profile');
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!permissionResult.granted) {
        Alert.alert('Permission Required', 'You need to grant permission to access your photos');
        return;
      }
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      
      if (!result.canceled) {
        setProfileImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to select image');
    }
  };

  if (loading && !user) {
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
          onPress={() => setEditMode(!editMode)}
        >
          <Feather name={editMode ? "check" : "edit-2"} size={24} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.profileSection}>
          <TouchableOpacity 
            style={styles.profileImageContainer}
            onPress={editMode ? pickImage : null}
            disabled={!editMode}
          >
            {profileImage ? (
              <Image 
                source={{ uri: profileImage }} 
                style={styles.profileImage} 
              />
            ) : (
              <View style={styles.profileImagePlaceholder}>
                <Feather name="user" size={60} color="#666" />
              </View>
            )}
            {editMode && (
              <View style={styles.editImageOverlay}>
                <Feather name="camera" size={24} color="white" />
              </View>
            )}
          </TouchableOpacity>
          
          <Text style={styles.profileName}>
            {user?.firstName} {user?.lastName}
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
            <Text style={styles.fieldLabel}>First Name</Text>
            {editMode ? (
              <TextInput
                style={styles.input}
                value={formData.firstName}
                onChangeText={(text) => handleInputChange('firstName', text)}
                placeholder="Enter first name"
                placeholderTextColor="#999"
              />
            ) : (
              <Text style={styles.fieldValue}>{user?.firstName || 'Not provided'}</Text>
            )}
          </View>
          
          <View style={styles.infoField}>
            <Text style={styles.fieldLabel}>Last Name</Text>
            {editMode ? (
              <TextInput
                style={styles.input}
                value={formData.lastName}
                onChangeText={(text) => handleInputChange('lastName', text)}
                placeholder="Enter last name"
                placeholderTextColor="#999"
              />
            ) : (
              <Text style={styles.fieldValue}>{user?.lastName || 'Not provided'}</Text>
            )}
          </View>
          
          <View style={styles.infoField}>
            <Text style={styles.fieldLabel}>Email</Text>
            {editMode ? (
              <TextInput
                style={styles.input}
                value={formData.email}
                onChangeText={(text) => handleInputChange('email', text)}
                placeholder="Enter email"
                placeholderTextColor="#999"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            ) : (
              <Text style={styles.fieldValue}>{user?.email || 'Not provided'}</Text>
            )}
          </View>
          
          <View style={styles.infoField}>
            <Text style={styles.fieldLabel}>Phone Number</Text>
            {editMode ? (
              <TextInput
                style={styles.input}
                value={formData.phone}
                onChangeText={(text) => handleInputChange('phone', text)}
                placeholder="Enter phone number"
                placeholderTextColor="#999"
                keyboardType="phone-pad"
              />
            ) : (
              <Text style={styles.fieldValue}>{user?.phone || 'Not provided'}</Text>
            )}
          </View>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Address</Text>
          
          <View style={styles.infoField}>
            <Text style={styles.fieldLabel}>Street Address</Text>
            {editMode ? (
              <TextInput
                style={styles.input}
                value={formData.address}
                onChangeText={(text) => handleInputChange('address', text)}
                placeholder="Enter street address"
                placeholderTextColor="#999"
              />
            ) : (
              <Text style={styles.fieldValue}>{user?.address?.street || 'Not provided'}</Text>
            )}
          </View>
          
          <View style={styles.infoField}>
            <Text style={styles.fieldLabel}>City</Text>
            {editMode ? (
              <TextInput
                style={styles.input}
                value={formData.city}
                onChangeText={(text) => handleInputChange('city', text)}
                placeholder="Enter city"
                placeholderTextColor="#999"
              />
            ) : (
              <Text style={styles.fieldValue}>{user?.address?.city || 'Not provided'}</Text>
            )}
          </View>
          
          <View style={styles.infoField}>
            <Text style={styles.fieldLabel}>State</Text>
            {editMode ? (
              <TextInput
                style={styles.input}
                value={formData.state}
                onChangeText={(text) => handleInputChange('state', text)}
                placeholder="Enter state"
                placeholderTextColor="#999"
                maxLength={2}
              />
            ) : (
              <Text style={styles.fieldValue}>{user?.address?.state || 'Not provided'}</Text>
            )}
          </View>
          
          <View style={styles.infoField}>
            <Text style={styles.fieldLabel}>ZIP Code</Text>
            {editMode ? (
              <TextInput
                style={styles.input}
                value={formData.zipCode}
                onChangeText={(text) => handleInputChange('zipCode', text)}
                placeholder="Enter ZIP code"
                placeholderTextColor="#999"
                keyboardType="numeric"
                maxLength={5}
              />
            ) : (
              <Text style={styles.fieldValue}>{user?.address?.zip || 'Not provided'}</Text>
            )}
          </View>
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
  profileImageContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 15,
    position: 'relative',
    borderWidth: 3,
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
  editImageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
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
});

export default AccountDetailsScreen;