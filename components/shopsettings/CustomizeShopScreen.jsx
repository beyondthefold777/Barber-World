import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  Modal
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../context/AuthContext';
import { shopService } from '../../services/shopservice';

const CustomizeShopScreen = () => {
  // Use the useAuth hook instead of directly accessing the context
  const { token } = useAuth();
  
  // Shop data state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zip, setZip] = useState('');
  
  // Images and services
  const [images, setImages] = useState([]);
  const [services, setServices] = useState([]);
  
  // UI state
  const [loading, setLoading] = useState(true);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [isCreatingShop, setIsCreatingShop] = useState(true);
  
  // Service form state
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [serviceName, setServiceName] = useState('');
  const [serviceDescription, setServiceDescription] = useState('');
  const [servicePrice, setServicePrice] = useState('');
  const [serviceDuration, setServiceDuration] = useState('');
  
  // Ref to track if component is mounted
  const isMounted = useRef(true);
  
  useEffect(() => {
    if (token) {
      loadShopData();
    } else {
      setLoading(false);
      Alert.alert('Authentication Error', 'You need to be logged in to access this feature.');
    }
    
    // Cleanup function
    return () => {
      isMounted.current = false;
    };
  }, [token]);
  
  const loadShopData = async () => {
    if (!token) {
      Alert.alert('Authentication Error', 'No valid token found. Please log in again.');
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      
      const response = await shopService.getShopData(token);
      
      if (response.shop) {
        // Shop exists, load its data
        const shopData = response.shop;
        
        setName(shopData.name || '');
        setDescription(shopData.description || '');
        setPhone(shopData.phone || '');
        
        if (shopData.location) {
          setAddress(shopData.location.address || '');
          setCity(shopData.location.city || '');
          setState(shopData.location.state || '');
          setZip(shopData.location.zip || '');
        }
        
        if (shopData.images && shopData.images.length > 0) {
          setImages(shopData.images);
        }
        
        // Set services directly from shop data
        if (shopData.services && shopData.services.length > 0) {
          setServices(shopData.services);
        } else {
          setServices([]);
        }
        
        setIsCreatingShop(false);
        setDataLoaded(true);
      } else {
        // No shop found, prepare for creation
        setIsCreatingShop(true);
        setDataLoaded(false);
      }
    } catch (error) {
      console.error('Error loading shop data:', error);
      
      if (error.status === 404) {
        // Shop not found, prepare for creation
        setIsCreatingShop(true);
        setDataLoaded(false);
      } else {
        Alert.alert('Error', 'Failed to load shop data. Please try again.');
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  };

  const createShop = async () => {
    if (!token) {
      Alert.alert('Authentication Error', 'No valid token found. Please log in again.');
      return;
    }
    
    if (!name.trim()) {
      Alert.alert('Required Field', 'Please enter a shop name');
      return;
    }
    
    try {
      setLoading(true);
      
      const shopData = {
        name,
        description,
        phone,
        location: {
          address,
          city,
          state,
          zip
        }
      };
      
      const response = await shopService.createShop(shopData, token);
      
      if (response.success) {
        Alert.alert('Success', 'Shop created successfully!');
        setIsCreatingShop(false);
        setDataLoaded(true);
        loadShopData(); // Reload data to get the created shop
      } else {
        Alert.alert('Error', response.message || 'Failed to create shop');
      }
    } catch (error) {
      console.error('Error creating shop:', error);
      Alert.alert('Error', error.message || 'Failed to create shop');
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  };
  
  const updateShop = async () => {
    if (!token) {
      Alert.alert('Authentication Error', 'No valid token found. Please log in again.');
      return;
    }
    
    if (!name.trim()) {
      Alert.alert('Required Field', 'Please enter a shop name');
      return;
    }
    
    try {
      setLoading(true);
      
      const shopData = {
        name,
        description,
        phone,
        location: {
          address,
          city,
          state,
          zip
        }
      };
      
      const response = await shopService.updateShopDetails(shopData, token);
      
      if (response.success) {
        Alert.alert('Success', 'Shop updated successfully!');
        loadShopData(); // Reload data to get the updated shop
      } else {
        Alert.alert('Error', response.message || 'Failed to update shop');
      }
    } catch (error) {
      console.error('Error updating shop:', error);
      Alert.alert('Error', error.message || 'Failed to update shop');
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  };
  
  const pickImage = async () => {
    if (!token) {
      Alert.alert('Authentication Error', 'No valid token found. Please log in again.');
      return;
    }
    
    if (!dataLoaded) {
      Alert.alert('Create Shop First', 'Please create your shop before adding images.');
      return;
    }
    
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert('Permission Required', 'You need to grant permission to access your photos');
      return;
    }
    
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
      base64: true,
    });
    
    if (!result.canceled && result.assets && result.assets[0]) {
      const base64Image = `data:image/jpeg;base64,${result.assets[0].base64}`;
      
      try {
        setLoading(true);
        const response = await shopService.uploadImage(base64Image, token);
        
        if (response.success) {
          // Add the new image to the images array
          setImages([...images, base64Image]);
          Alert.alert('Success', 'Image uploaded successfully!');
        } else {
          Alert.alert('Error', response.message || 'Failed to upload image');
        }
      } catch (error) {
        console.error('Error uploading image:', error);
        Alert.alert('Error', error.message || 'Failed to upload image');
      } finally {
        if (isMounted.current) {
          setLoading(false);
        }
      }
    }
  };
  
  const deleteImage = async (index) => {
    if (!token) {
      Alert.alert('Authentication Error', 'No valid token found. Please log in again.');
      return;
    }
    
    try {
      setLoading(true);
      const response = await shopService.deleteImage(index, token);
      
      if (response.success) {
        // Remove the image from the images array
        const updatedImages = [...images];
        updatedImages.splice(index, 1);
        setImages(updatedImages);
        Alert.alert('Success', 'Image deleted successfully!');
      } else {
        Alert.alert('Error', response.message || 'Failed to delete image');
      }
    } catch (error) {
      console.error('Error deleting image:', error);
      Alert.alert('Error', error.message || 'Failed to delete image');
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  };

  const openServiceForm = (service = null) => {
    if (!dataLoaded) {
      Alert.alert('Create Shop First', 'Please create your shop before adding services.');
      return;
    }
    
    if (service) {
      // Editing existing service
      setEditingService(service);
      setServiceName(service.name || '');
      setServiceDescription(service.description || '');
      setServicePrice(service.price ? service.price.toString() : '');
      setServiceDuration(service.duration ? service.duration.toString() : '');
    } else {
      // Adding new service
      setEditingService(null);
      setServiceName('');
      setServiceDescription('');
      setServicePrice('');
      setServiceDuration('');
    }
    
    setShowServiceForm(true);
  };

  const closeServiceForm = () => {
    setShowServiceForm(false);
    setEditingService(null);
  };

  const saveService = async () => {
    if (!token) {
      Alert.alert('Authentication Error', 'No valid token found. Please log in again.');
      return;
    }
    
    if (!serviceName.trim()) {
      Alert.alert('Required Field', 'Please enter a service name');
      return;
    }
    
    if (!servicePrice.trim() || isNaN(parseFloat(servicePrice))) {
      Alert.alert('Invalid Price', 'Please enter a valid price');
      return;
    }
    
    if (!serviceDuration.trim() || isNaN(parseInt(serviceDuration))) {
      Alert.alert('Invalid Duration', 'Please enter a valid duration in minutes');
      return;
    }
    
    try {
      setLoading(true);
      
      const serviceData = {
        name: serviceName,
        description: serviceDescription,
        price: parseFloat(servicePrice),
        duration: parseInt(serviceDuration)
      };
      
      let response;
      
      if (editingService) {
        // Update existing service
        response = await shopService.updateService(editingService._id, serviceData, token);
      } else {
        // Create new service
        response = await shopService.addService(serviceData, token);
      }
      
      if (response.success) {
        Alert.alert(
          'Success', 
          editingService ? 'Service updated successfully!' : 'Service added successfully!'
        );
        closeServiceForm();
        loadShopData(); // Reload shop data to get the updated services
      } else {
        Alert.alert('Error', response.message || 'Failed to save service');
      }
    } catch (error) {
      console.error('Error saving service:', error);
      Alert.alert('Error', error.message || 'Failed to save service');
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  };

  const deleteService = async (serviceId) => {
    if (!token) {
      Alert.alert('Authentication Error', 'No valid token found. Please log in again.');
      return;
    }
    
    try {
      setLoading(true);
      const response = await shopService.removeService(serviceId, token);
      
      if (response.success) {
        Alert.alert('Success', 'Service deleted successfully!');
        loadShopData(); // Reload shop data to get the updated services list
      } else {
        Alert.alert('Error', response.message || 'Failed to delete service');
      }
    } catch (error) {
      console.error('Error deleting service:', error);
      Alert.alert('Error', error.message || 'Failed to delete service');
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  };
  
  if (loading) {
    return (
      <LinearGradient
        colors={['#1E1E1E', '#121212']}
        style={styles.container}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF0000" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </LinearGradient>
    );
  }
  
  if (!token) {
    return (
      <LinearGradient
        colors={['#1E1E1E', '#121212']}
        style={styles.container}
      >
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>Authentication Error</Text>
          <Text style={styles.loadingText}>Please log in to access this feature.</Text>
        </View>
      </LinearGradient>
    );
  }
  
  return (
    <LinearGradient
      colors={['#1E1E1E', '#121212']}
      style={styles.container}
    >
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>
            {isCreatingShop ? 'Create Your Shop' : 'Customize Your Shop'}
          </Text>
        </View>
        
        {/* Shop Details Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Shop Details</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Shop Name</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              style={styles.input}
              placeholder="Enter shop name"
              placeholderTextColor="#666"
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Description</Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              style={[styles.input, styles.textArea]}
              placeholder="Describe your shop"
              placeholderTextColor="#666"
              multiline
              numberOfLines={4}
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Phone</Text>
            <TextInput
              value={phone}
              onChangeText={setPhone}
              style={styles.input}
              placeholder="Phone number"
              placeholderTextColor="#666"
              keyboardType="phone-pad"
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Address</Text>
            <TextInput
              value={address}
              onChangeText={setAddress}
              style={styles.input}
              placeholder="Street address"
              placeholderTextColor="#666"
            />
          </View>
          
          <View style={styles.locationRow}>
            <View style={[styles.inputContainer, { flex: 2, marginRight: 10 }]}>
              <Text style={styles.inputLabel}>City</Text>
              <TextInput
                value={city}
                onChangeText={setCity}
                style={styles.input}
                placeholder="City"
                placeholderTextColor="#666"
              />
            </View>
            
            <View style={[styles.inputContainer, { flex: 1, marginRight: 10 }]}>
              <Text style={styles.inputLabel}>State</Text>
              <TextInput
                value={state}
                onChangeText={setState}
                style={styles.input}
                placeholder="State"
                placeholderTextColor="#666"
              />
            </View>
            
            <View style={[styles.inputContainer, { flex: 1 }]}>
              <Text style={styles.inputLabel}>ZIP</Text>
              <TextInput
                value={zip}
                onChangeText={setZip}
                style={styles.input}
                placeholder="ZIP"
                placeholderTextColor="#666"
                keyboardType="numeric"
              />
            </View>
          </View>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={isCreatingShop ? createShop : updateShop}
          >
            <Feather name={isCreatingShop ? "save" : "edit-2"} size={20} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>
              {isCreatingShop ? 'Create Shop' : 'Update Shop Details'}
            </Text>
          </TouchableOpacity>
        </View>
        
        {/* Only show images section if shop exists */}
        {dataLoaded && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Shop Images</Text>
            
            <TouchableOpacity
              style={styles.actionButton}
              onPress={pickImage}
            >
              <Feather name="camera" size={20} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>Add Image</Text>
            </TouchableOpacity>
            
            <View style={styles.imagesContainer}>
              {images && images.length > 0 ? (
                images.map((image, index) => (
                  <View key={index} style={styles.imageContainer}>
                    <Image
                      source={{ uri: image }}
                      style={styles.image}
                    />
                    <TouchableOpacity
                      style={styles.deleteImageButton}
                      onPress={() => deleteImage(index)}
                    >
                      <Feather name="trash-2" size={18} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>
                ))
              ) : (
                <Text style={styles.noDataText}>No images added yet</Text>
              )}
            </View>
          </View>
        )}
        
        {/* Only show services section if shop exists */}
        {dataLoaded && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Services</Text>
            
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => openServiceForm()}
            >
              <Feather name="plus" size={20} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>Add Service</Text>
            </TouchableOpacity>
            
            <View style={styles.servicesList}>
              {services && services.length > 0 ? (
                services.map((service, index) => (
                  <View key={index} style={styles.serviceItem}>
                    <View style={styles.serviceInfo}>
                      <Text style={styles.serviceName}>{service.name}</Text>
                      <Text style={styles.serviceDetails}>
                        ${service.price} • {service.duration} min
                      </Text>
                      {service.description && (
                        <Text style={styles.serviceDescription} numberOfLines={2}>
                          {service.description}
                        </Text>
                      )}
                    </View>
                    <TouchableOpacity
                      style={styles.serviceAction}
                      onPress={() => openServiceForm(service)}
                    >
                      <Feather name="edit" size={18} color="#FFFFFF" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.serviceAction, { marginLeft: 10 }]}
                      onPress={() => {
                        Alert.alert(
                          'Delete Service',
                          'Are you sure you want to delete this service?',
                          [
                            {
                              text: 'Cancel',
                              style: 'cancel'
                            },
                            {
                              text: 'Delete',
                              onPress: () => deleteService(service._id),
                              style: 'destructive'
                            }
                          ]
                        );
                      }}
                    >
                      <Feather name="trash-2" size={18} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>
                ))
              ) : (
                <Text style={styles.noDataText}>No services added yet</Text>
              )}
            </View>
          </View>
        )}
        
        {/* Help Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Need Help?</Text>
          <TouchableOpacity
            style={styles.helpButton}
            onPress={() => Alert.alert('Support', 'Contact our support team for assistance with your shop setup.')}
          >
            <Feather name="help-circle" size={20} color="#FFFFFF" />
            <Text style={styles.helpButtonText}>Contact Support</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      
      {/* Service Form Modal */}
      <Modal
        visible={showServiceForm}
        transparent={true}
        animationType="slide"
        onRequestClose={closeServiceForm}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingService ? 'Edit Service' : 'Add New Service'}
              </Text>
              <TouchableOpacity onPress={closeServiceForm}>
                <Feather name="x" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalScrollView}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Service Name</Text>
                <TextInput
                  value={serviceName}
                  onChangeText={setServiceName}
                  style={styles.input}
                  placeholder="Enter service name"
                  placeholderTextColor="#666"
                />
              </View>
              
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Description</Text>
                <TextInput
                  value={serviceDescription}
                  onChangeText={setServiceDescription}
                  style={[styles.input, styles.textArea]}
                  placeholder="Describe the service"
                  placeholderTextColor="#666"
                  multiline
                  numberOfLines={4}
                />
              </View>
              
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Price ($)</Text>
                <TextInput
                  value={servicePrice}
                  onChangeText={setServicePrice}
                  style={styles.input}
                  placeholder="Enter price"
                  placeholderTextColor="#666"
                  keyboardType="numeric"
                />
              </View>
              
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Duration (minutes)</Text>
                <TextInput
                  value={serviceDuration}
                  onChangeText={setServiceDuration}
                  style={styles.input}
                  placeholder="Enter duration"
                  placeholderTextColor="#666"
                  keyboardType="numeric"
                />
              </View>
              
              <TouchableOpacity
                style={styles.actionButton}
                onPress={saveService}
              >
                <Feather name="save" size={20} color="#FFFFFF" />
                <Text style={styles.actionButtonText}>
                  {editingService ? 'Update Service' : 'Add Service'}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    marginTop: 10,
  },
  errorText: {
    color: '#FF0000',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  contentContainer: {
    padding: 20,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  section: {
    backgroundColor: '#333333',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginBottom: 15,
  },
  inputContainer: {
    marginBottom: 15,
  },
  inputLabel: {
    color: '#FFFFFF',
    marginBottom: 5,
    fontSize: 16,
  },
  input: {
    backgroundColor: '#444444',
    color: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  locationRow: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF0000',
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
  },
  actionButtonText: {
    color: '#FFFFFF',
    marginLeft: 8,
    fontSize: 16,
    fontWeight: 'bold',
  },
  imagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 15,
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
  deleteImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255, 0, 0, 0.8)',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDataText: {
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 10,
    color: '#888',
  },
  servicesList: {
    marginTop: 15,
  },
  serviceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#444444',
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  serviceDetails: {
    color: '#888',
    marginTop: 4,
  },
  serviceDescription: {
    color: '#AAAAAA',
    marginTop: 4,
    fontSize: 14,
  },
  serviceAction: {
    backgroundColor: '#444444',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  helpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#444444',
    padding: 15,
    borderRadius: 8,
  },
  helpButtonText: {
    color: '#FFFFFF',
    marginLeft: 8,
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#333333',
    borderRadius: 8,
    width: '100%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#444444',
  },
  modalTitle: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  modalScrollView: {
    padding: 16,
  }
});

export default CustomizeShopScreen;
