import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { appointmentService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Add logging utility
const logScreen = (message) => {
  console.log(`[APPOINTMENTS SCREEN] ${new Date().toISOString()} - ${message}`);
};

const AppointmentsScreen = ({ navigation }) => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { userToken, userId } = useAuth();
  const [currentUserId, setCurrentUserId] = useState(null);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [selectedShop, setSelectedShop] = useState(null);
  const [userShops, setUserShops] = useState([]);

  // Function to get user data from AsyncStorage
  const getUserData = async () => {
    try {
      // Try multiple keys where user data might be stored
      const userData = await AsyncStorage.getItem('userData');
      const user = await AsyncStorage.getItem('user');
      const userInfo = await AsyncStorage.getItem('userInfo');
      
      logScreen(`AsyncStorage check - userData: ${userData ? 'Found' : 'Not found'}`);
      logScreen(`AsyncStorage check - user: ${user ? 'Found' : 'Not found'}`);
      logScreen(`AsyncStorage check - userInfo: ${userInfo ? 'Found' : 'Not found'}`);
      
      if (userData) {
        const parsed = JSON.parse(userData);
        logScreen(`userData contents: ${JSON.stringify(parsed)}`);
        return parsed;
      } else if (user) {
        const parsed = JSON.parse(user);
        logScreen(`user contents: ${JSON.stringify(parsed)}`);
        return parsed;
      } else if (userInfo) {
        const parsed = JSON.parse(userInfo);
        logScreen(`userInfo contents: ${JSON.stringify(parsed)}`);
        return parsed;
      }
      
      // If we can't find user data, let's dump all AsyncStorage keys for debugging
      const allKeys = await AsyncStorage.getAllKeys();
      logScreen(`All AsyncStorage keys: ${JSON.stringify(allKeys)}`);
      
      return null;
    } catch (error) {
      logScreen(`Error getting user data: ${error.message}`);
      return null;
    }
  };

  // Function to get current user ID
  const getCurrentUserId = async () => {
    // First try from context
    if (userId) {
      logScreen(`Using userId from context: ${userId}`);
      setCurrentUserId(userId);
      return userId;
    }
    
    // Then try from AsyncStorage user data
    const userData = await getUserData();
    if (userData) {
      // Try different possible property names
      const id = userData._id || userData.userId || userData.id || userData.user_id;
      if (id) {
        logScreen(`Found user ID in AsyncStorage: ${id}`);
        setCurrentUserId(id);
        return id;
      }
    }
    
    // If we still don't have an ID, try to extract it from the token
    try {
      const token = userToken || await AsyncStorage.getItem('userToken');
      if (token) {
        // JWT tokens are in format: header.payload.signature
        // We need the payload part which is the second segment
        const payload = token.split('.')[1];
        if (payload) {
          // Decode the base64 payload
          const decodedPayload = JSON.parse(atob(payload));
          logScreen(`Decoded JWT payload: ${JSON.stringify(decodedPayload)}`);
          
          // Look for user ID in common JWT claim names
          const id = decodedPayload.sub || decodedPayload.userId || decodedPayload._id || decodedPayload.id;
          if (id) {
            logScreen(`Extracted user ID from token: ${id}`);
            setCurrentUserId(id);
            return id;
          }
        }
      }
    } catch (error) {
      logScreen(`Error extracting user ID from token: ${error.message}`);
    }
    
    logScreen("Could not determine user ID from any source");
    return null;
  };

  const fetchAppointments = async () => {
    logScreen("Starting to fetch appointments");
    
    try {
      setLoading(true);
      
      // Get token from context or AsyncStorage
      let token = userToken;
      if (!token) {
        token = await AsyncStorage.getItem('userToken');
        logScreen(`Token from AsyncStorage: ${token ? 'Found' : 'Not found'}`);
      } else {
        logScreen(`Token from Auth context: ${token ? 'Found' : 'Not found'}`);
      }
      
      // Get user ID
      const userId = await getCurrentUserId();
      
      // Log token details (first few characters for security)
      if (token) {
        const tokenPreview = token.substring(0, 10) + '...';
        logScreen(`Token preview: ${tokenPreview}`);
      }
      
      // Fetch fresh data from API
      logScreen("Calling appointmentService.getUserAppointments");
      logScreen(`API call parameters - token: ${token ? 'YES' : 'NO'}`);
      
      // Make the API call with the token to get the current user's appointments
      const response = await appointmentService.getUserAppointments(token);
      
      logScreen(`API Response received, type: ${typeof response}`);
      
      let appointmentsData = [];
      
      if (response && response.appointments) {
        logScreen(`Found ${response.appointments.length} appointments in response.appointments`);
        appointmentsData = response.appointments;
      } else if (response && Array.isArray(response)) {
        // If the response is directly an array of appointments
        logScreen(`Found ${response.length} appointments in array response`);
        appointmentsData = response;
      } else {
        // If no appointments are found or response format is unexpected
        logScreen(`Unexpected response format: ${JSON.stringify(response)}`);
        appointmentsData = [];
      }
      
      // Filter appointments to only include those for the current user
      if (userId) {
        logScreen(`Attempting to filter appointments for user ID: ${userId}`);
        
        // Log all clientIds for debugging
        appointmentsData.forEach((app, index) => {
          logScreen(`Appointment ${index}: clientId=${app.clientId}, userId=${app.userId}`);
        });
        
        // Try different ID formats - MongoDB sometimes returns different formats
        const possibleUserIds = [
          userId,
          userId.toString(),
          // Add ObjectId format if needed
        ];
        
        const filteredAppointments = appointmentsData.filter(appointment => {
          // Check various possible ID fields and formats
          const clientIdMatch = possibleUserIds.includes(appointment.clientId);
          const userIdMatch = appointment.userId && possibleUserIds.includes(appointment.userId);
          const clientObjMatch = appointment.client && 
                                appointment.client._id && 
                                possibleUserIds.includes(appointment.client._id);
          
          // For debugging
          if (clientIdMatch || userIdMatch || clientObjMatch) {
            logScreen(`Match found for appointment: ${appointment._id}`);
          }
          
          return clientIdMatch || userIdMatch || clientObjMatch;
        });
        
        // If no appointments were found with exact ID match, try substring matching
        // This is a fallback for when IDs might be formatted differently
        if (filteredAppointments.length === 0) {
          logScreen(`No exact matches found, trying substring matching`);
          
          const fallbackAppointments = appointmentsData.filter(appointment => {
            const clientIdStr = String(appointment.clientId || '');
            const userIdStr = String(appointment.userId || '');
            const clientObjIdStr = appointment.client && appointment.client._id ? 
                                  String(appointment.client._id) : '';
            
            // Check if any ID contains the user ID or vice versa
            return clientIdStr.includes(userId) || 
                   userId.includes(clientIdStr) ||
                   userIdStr.includes(userId) || 
                   userId.includes(userIdStr) ||
                   clientObjIdStr.includes(userId) || 
                   userId.includes(clientObjIdStr);
          });
          
          if (fallbackAppointments.length > 0) {
            logScreen(`Found ${fallbackAppointments.length} appointments with substring matching`);
            appointmentsData = fallbackAppointments;
          } else {
            // If still no matches, show all appointments as a last resort
            // This is just for debugging - you may want to remove this in production
            logScreen(`No matches found even with substring matching. Showing all appointments for debugging.`);
          }
        } else {
          logScreen(`Filtered from ${appointmentsData.length} to ${filteredAppointments.length} appointments for user ${userId}`);
          appointmentsData = filteredAppointments;
        }
      }
      
      // Extract unique shop names for filtering
      const shops = new Set();
      appointmentsData.forEach(app => {
        const shopName = getShopName(app);
        if (shopName) shops.add(shopName);
      });
      
      const userShopsList = Array.from(shops).sort();
      setUserShops(userShopsList);
      
      // If we have shops and no shop is selected yet, select the first one
      if (userShopsList.length > 0 && !selectedShop) {
        setSelectedShop(userShopsList[0]);
      }
      
      setAppointments(appointmentsData);
      
      // Cache the appointments
      await AsyncStorage.setItem('appointments', JSON.stringify(appointmentsData));
      logScreen("Appointments saved to AsyncStorage");
      
      // Log the first appointment for debugging if available
      if (appointmentsData.length > 0) {
        const firstAppointment = appointmentsData[0];
        logScreen("First appointment details:");
        logScreen(`- ID: ${firstAppointment._id}`);
        logScreen(`- Client ID: ${firstAppointment.clientId}`);
        logScreen(`- Shop: ${getShopName(firstAppointment)}`);
        logScreen(`- Status: ${firstAppointment.status}`);
        logScreen(`- Date: ${firstAppointment.date}`);
      } else {
        logScreen("No appointments available to display");
      }
    } catch (error) {
      logScreen(`ERROR fetching appointments: ${error.message}`);
      logScreen(`Error stack: ${error.stack}`);
      
      console.error('Error fetching appointments:', error);
      // Don't show an alert for the error, just log it
      setAppointments([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    logScreen("Component mounted, fetching appointments");
    fetchAppointments();
    
    // Set up a listener for when the screen comes into focus
    const unsubscribe = navigation.addListener('focus', () => {
      logScreen("Screen focused, refreshing appointments");
      fetchAppointments();
    });
    
    // Clean up the listener when component unmounts
    return unsubscribe;
  }, [navigation]);

  const handleRefresh = () => {
    logScreen("Manual refresh triggered");
    setRefreshing(true);
    fetchAppointments();
  };

  const handleCancelAppointment = async (appointmentId) => {
    logScreen(`Cancel appointment requested for ID: ${appointmentId}`);
    
    Alert.alert(
      'Cancel Appointment',
      'Are you sure you want to cancel this appointment?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes',
          onPress: async () => {
            try {
              setLoading(true);
              logScreen(`Proceeding with cancellation of appointment: ${appointmentId}`);
              
              // Get token from context or AsyncStorage
              let token = userToken;
              if (!token) {
                token = await AsyncStorage.getItem('userToken');
                logScreen(`Token for cancellation from AsyncStorage: ${token ? 'Found' : 'Not found'}`);
              }
              
              // Use appointmentService for cancellation
              await appointmentService.cancelAppointment(appointmentId, token);
              logScreen("Cancellation API call successful");
              
              // Update the local state after successful cancellation
              setAppointments(appointments.map(app => 
                app._id === appointmentId ? {...app, status: 'canceled'} : app
              ));
              
              // Update the cached appointments
              const cachedAppointments = await AsyncStorage.getItem('appointments');
              if (cachedAppointments) {
                const parsedAppointments = JSON.parse(cachedAppointments);
                const updatedAppointments = parsedAppointments.map(app =>
                  app._id === appointmentId ? {...app, status: 'canceled'} : app
                );
                await AsyncStorage.setItem('appointments', JSON.stringify(updatedAppointments));
                logScreen("Updated appointments in AsyncStorage after cancellation");
              }
              
              Alert.alert('Success', 'Your appointment has been canceled.');
            } catch (error) {
              logScreen(`ERROR canceling appointment: ${error.message}`);
              logScreen(`Error stack: ${error.stack}`);
              
              console.error('Error canceling appointment:', error);
              Alert.alert('Error', 'Failed to cancel appointment. Please try again.');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const formatAppointmentDate = (dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        logScreen(`Invalid date format: ${dateString}`);
        return 'Invalid date';
      }
      
      // Create a date that accounts for timezone offset
      // This ensures we're displaying the correct day regardless of timezone
      const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        timeZone: 'UTC'  // Use UTC to prevent timezone shifts
      };
      
      return date.toLocaleDateString('en-US', options);
    } catch (error) {
      logScreen(`Error formatting date: ${error.message}`);
      return dateString || 'N/A';
    }
  };

  // Helper function to get shop name from appointment
  const getShopName = (appointment) => {
    // Try different possible locations for shop name
    if (appointment.shopName) {
      return appointment.shopName;
    } else if (appointment.shopId) {
      if (typeof appointment.shopId === 'object' && appointment.shopId.name) {
        return appointment.shopId.name;
      } else if (typeof appointment.shopId === 'string') {
        // If shopId is just a string ID, we can't get the name directly
        return 'Barbershop';
      }
    }
    return 'Barbershop';
  };

  // Helper function to get barber name from appointment
  const getBarberName = (appointment) => {
    if (appointment.barberName) {
      return appointment.barberName;
    } else if (appointment.barberId) {
      if (typeof appointment.barberId === 'object' && appointment.barberId.name) {
        return appointment.barberId.name;
      } else if (typeof appointment.barberId === 'string') {
        // If barberId is just a string ID, we can't get the name directly
        return null;
      }
    }
    return null;
  };

  // Helper function to get service name from appointment
  const getServiceName = (appointment) => {
    if (appointment.serviceName) {
      return appointment.serviceName;
    } else if (appointment.serviceId) {
      if (typeof appointment.serviceId === 'object' && appointment.serviceId.name) {
        return appointment.serviceId.name;
      } else if (typeof appointment.serviceId === 'string') {
        // If serviceId is just a string ID, we can't get the name directly
        return 'Haircut';
      }
    }
    return 'Haircut';
  };

  // Helper function to format time from appointment
  const formatAppointmentTime = (dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        logScreen(`Invalid time format: ${dateString}`);
        return 'Invalid time';
      }
      
      // Format time with timezone consideration
      // Using UTC ensures we display the exact time that was booked
      const options = { 
        hour: 'numeric', 
        minute: '2-digit', 
        hour12: true,
        timeZone: 'UTC'  // Use UTC to prevent timezone shifts
      };
      
      return date.toLocaleTimeString('en-US', options);
    } catch (error) {
      logScreen(`Error formatting time: ${error.message}`);
      return 'N/A';
    }
  };

  // Filter appointments based on selected shop
  const filteredAppointments = selectedShop
    ? appointments.filter(app => getShopName(app) === selectedShop)
    : appointments;

  // Render each appointment item
  const renderAppointmentItem = ({ item }) => {
    // Log each appointment as it's rendered
    const shopName = getShopName(item);
    const barberName = getBarberName(item);
    
    logScreen(`Rendering appointment: ${item._id}, status: ${item.status}, clientId: ${item.clientId}, shopName: ${shopName}`);
    
    return (
      <View style={styles.appointmentCard}>
        <View style={styles.appointmentHeader}>
          <Text style={styles.shopName}>{shopName}</Text>
          <View style={[styles.statusBadge, 
            item.status === 'confirmed' ? styles.confirmedStatus :
            item.status === 'canceled' ? styles.canceledStatus :
            item.status === 'completed' ? styles.completedStatus : styles.pendingStatus
          ]}>
            <Text style={styles.statusText}>
              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            </Text>
          </View>
        </View>
        
        <View style={styles.appointmentDetails}>
          <View style={styles.detailRow}>
            <Feather name="calendar" size={16} color="#999" />
            <Text style={styles.detailText}>{formatAppointmentDate(item.date)}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Feather name="clock" size={16} color="#999" />
            <Text style={styles.detailText}>{item.timeSlot || 'No time specified'}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Feather name="scissors" size={16} color="#999" />
            <Text style={styles.detailText}>{item.service || 'No service specified'}</Text>
          </View>
          
          {barberName && (
            <View style={styles.detailRow}>
              <Feather name="user" size={16} color="#999" />
              <Text style={styles.detailText}>{barberName}</Text>
            </View>
          )}
        </View>
        
        {item.status === 'confirmed' && (
          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={() => handleCancelAppointment(item._id)}
          >
            <Text style={styles.cancelButtonText}>Cancel Appointment</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };
  
  // Filter modal component
  const FilterModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={filterModalVisible}
      onRequestClose={() => setFilterModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Barbershop</Text>
            <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
              <Feather name="x" size={24} color="white" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.shopList}>
            {userShops.map((shop, index) => (
              <TouchableOpacity 
                key={index}
                style={[
                  styles.shopItem, 
                  selectedShop === shop && styles.selectedShopItem
                ]}
                onPress={() => {
                  setSelectedShop(shop);
                  setFilterModalVisible(false);
                }}
              >
                <Text style={styles.shopItemText}>{shop}</Text>
                {selectedShop === shop && (
                  <Feather name="check" size={20} color="#FF0000" />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
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
        <Text style={styles.headerTitle}>My Appointments</Text>
      </View>
      
      {/* Shop selector */}
      {userShops.length > 0 && (
        <View style={styles.filterContainer}>
          <TouchableOpacity 
            style={styles.filterButton}
            onPress={() => setFilterModalVisible(true)}
          >
            <Feather name="map-pin" size={18} color="white" />
            <Text style={styles.filterButtonText}>
              {selectedShop || 'Select a barbershop'}
            </Text>
            <Feather name="chevron-down" size={18} color="white" style={styles.dropdownIcon} />
          </TouchableOpacity>
        </View>
      )}
      
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF0000" />
          <Text style={styles.loadingText}>Loading appointments...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredAppointments}
          renderItem={renderAppointmentItem}
          keyExtractor={(item) => item._id || Math.random().toString()}
          contentContainerStyle={styles.listContainer}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Feather name="calendar" size={50} color="#666" />
              <Text style={styles.emptyText}>
                {userShops.length === 0
                  ? "You don't have any appointments yet"
                  : `No appointments found for ${selectedShop}`}
              </Text>
              <TouchableOpacity 
                style={styles.bookButton}
                onPress={() => {
                  logScreen("Navigate to GuestLandingPage to find barbershop");
                  navigation.navigate('GuestLandingPage');
                }}
              >
                <Text style={styles.bookButtonText}>Book an Appointment</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
      
      <TouchableOpacity 
        style={styles.newAppointmentButton}
        onPress={() => {
          logScreen("Navigate to GuestLandingPage to book new appointment");
          navigation.navigate('GuestLandingPage');
        }}
      >
        <Feather name="plus" size={24} color="white" />
        <Text style={styles.newAppointmentText}>Book New Appointment</Text>
      </TouchableOpacity>
      
      <FilterModal />
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
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#444',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 15,
  },
  filterContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#444',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    alignSelf: 'stretch',
  },
  filterButtonText: {
    color: 'white',
    marginLeft: 8,
    fontSize: 16,
    flex: 1,
  },
  dropdownIcon: {
    marginLeft: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#999',
    marginTop: 10,
    fontSize: 16,
  },
  listContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  appointmentCard: {
    backgroundColor: '#222',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#FF0000',
  },
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  shopName: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  confirmedStatus: {
    backgroundColor: '#4CAF50',
  },
  canceledStatus: {
    backgroundColor: '#F44336',
  },
  completedStatus: {
    backgroundColor: '#2196F3',
  },
  pendingStatus: {
    backgroundColor: '#FF9800',
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  appointmentDetails: {
    marginBottom: 15,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    color: '#CCC',
    marginLeft: 10,
    fontSize: 16,
  },
  cancelButton: {
    backgroundColor: '#333',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 5,
    borderWidth: 1,
    borderColor: '#F44336',
  },
  cancelButtonText: {
    color: '#F44336',
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    color: '#999',
    fontSize: 18,
    marginTop: 15,
    marginBottom: 20,
    textAlign: 'center',
  },
  bookButton: {
    backgroundColor: '#FF0000',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 10,
  },
  bookButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  newAppointmentButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#FF0000',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 30,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  newAppointmentText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    maxHeight: '70%',
    backgroundColor: '#222',
    borderRadius: 10,
    padding: 20,
    borderWidth: 1,
    borderColor: '#444',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#444',
    paddingBottom: 10,
  },
  modalTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  shopList: {
    maxHeight: 400,
  },
  shopItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  selectedShopItem: {
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
  },
  shopItemText: {
    color: 'white',
    fontSize: 16,
  },
});

export default AppointmentsScreen;
