import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { Button, TextInput } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { shopService } from '../../services/shopservice';
import { useAuth } from '../../context/AuthContext';

const CustomizeShopScreen = () => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [shopData, setShopData] = useState(null);
  const [images, setImages] = useState([]);
  const [services, setServices] = useState([]);
  const [businessName, setBusinessName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [description, setDescription] = useState('');
  const [dataLoaded, setDataLoaded] = useState(false);

  // No useEffect to fetch data on load - we'll only fetch when the button is clicked

  const fetchShopData = async () => {
    try {
      setLoading(true);
      const response = await shopService.getShopData(token);
      console.log('Shop data fetched:', response);
      
      if (response && response.shop) {
        const data = response.shop;
        setShopData(data);
        setImages(data.images || []);
        setServices(data.services || []);
        setBusinessName(data.name || '');
        setAddress(data.location?.address || '');
        setPhone(data.phone || '');
        setDescription(data.description || '');
        setDataLoaded(true);
      } else {
        Alert.alert('Info', 'No shop data found. You can create your shop details now.');
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching shop:', error);
      Alert.alert('Error', 'Failed to load shop data: ' + (error.message || 'Unknown error'));
      setLoading(false);
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const base64Image = `data:image/jpeg;base64,${result.assets[0].base64}`;
        uploadImage(base64Image);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const uploadImage = async (base64Image) => {
    try {
      setLoading(true);
      console.log('Uploading image to server...');
      
      const response = await shopService.uploadImage(base64Image, token);
      console.log('Image upload response:', response);
      
      if (response && response.success) {
        // Add the new image to the images array
        if (response.images && response.images.length > 0) {
          setImages(response.images);
          Alert.alert('Success', 'Image uploaded successfully');
        } else {
          Alert.alert('Warning', 'Image uploaded but no images returned');
        }
      } else {
        Alert.alert('Error', response?.message || 'Failed to upload image');
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error uploading image:', error);
      Alert.alert('Error', 'Failed to upload image: ' + (error.message || 'Unknown error'));
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Customize Your Shop</Text>
      
      {/* Button to fetch shop data */}
      <Button 
        mode="contained" 
        onPress={fetchShopData}
        style={styles.button}
        icon="refresh"
      >
        {dataLoaded ? 'Refresh Shop Data' : 'Load Shop Data'}
      </Button>
      
      {/* Images Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Shop Images</Text>
        
        <Button 
          mode="contained" 
          onPress={pickImage}
          style={styles.button}
          icon="camera"
        >
          Add Image
        </Button>
        
        <View style={styles.imagesContainer}>
          {images && images.length > 0 ? (
            images.map((image, index) => (
              <View key={index} style={styles.imageContainer}>
                <Image 
                  source={{ uri: image }} 
                  style={styles.image} 
                />
              </View>
            ))
          ) : (
            <Text style={styles.noDataText}>No images added yet</Text>
          )}
        </View>
      </View>
      
      {/* Shop Details Section - Only show if data is loaded */}
      {dataLoaded && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Shop Details</Text>
          
          <TextInput
            label="Business Name"
            value={businessName}
            onChangeText={setBusinessName}
            style={styles.input}
          />
          
          <TextInput
            label="Address"
            value={address}
            onChangeText={setAddress}
            style={styles.input}
          />
          
          <TextInput
            label="Phone"
            value={phone}
            onChangeText={setPhone}
            style={styles.input}
            keyboardType="phone-pad"
          />
          
          <TextInput
            label="Description"
            value={description}
            onChangeText={setDescription}
            style={styles.input}
            multiline
            numberOfLines={4}
          />
        </View>
      )}
      
      {/* Services Section - Only show if data is loaded */}
      {dataLoaded && services && services.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Services</Text>
          
          <View style={styles.servicesList}>
            {services.map((service, index) => (
              <View key={index} style={styles.serviceItem}>
                <View style={styles.serviceInfo}>
                  <Text style={styles.serviceName}>{service.name}</Text>
                  <Text style={styles.serviceDetails}>
                    ${service.price} • {service.duration} min
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  input: {
    marginBottom: 12,
    backgroundColor: 'white',
  },
  button: {
    marginVertical: 8,
  },
  imagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  imageContainer: {
    width: '48%',
    marginBottom: 16,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 150,
    borderRadius: 8,
  },
  noDataText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#888',
  },
  servicesList: {
    marginTop: 8,
  },
  serviceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  serviceDetails: {
    color: '#666',
    marginTop: 4,
  }
});

export default CustomizeShopScreen;