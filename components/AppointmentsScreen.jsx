import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert
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
      
      // Make the API call even without a token - let the API handle auth errors
      const response = await appointmentService.getUserAppointments(token);
      
      logScreen(`API Response received, type: ${typeof response}`);
      
      if (response && response.appointments) {
        logScreen(`Found ${response.appointments.length} appointments in response.appointments`);
        
        // Log each appointment's client ID and shop details
        response.appointments.forEach(app => {
          logScreen(`Appointment ${app._id}: clientId=${app.clientId}, shopName=${app.shopName || 'N/A'}, shopId=${JSON.stringify(app.shopId || 'N/A')}`);
        });
        
        setAppointments(response.appointments);
        
        // Cache the appointments
        await AsyncStorage.setItem('appointments', JSON.stringify(response.appointments));
        logScreen("Appointments saved to AsyncStorage");
      } else if (response && Array.isArray(response)) {
        // If the response is directly an array of appointments
        logScreen(`Found ${response.length} appointments in array response`);
        
        // Log each appointment's client ID and shop details
        response.forEach(app => {
          logScreen(`Appointment ${app._id}: clientId=${app.clientId}, shopName=${app.shopName || 'N/A'}, shopId=${JSON.stringify(app.shopId || 'N/A')}`);
        });
        
        setAppointments(response);
        
        // Cache the appointments
        await AsyncStorage.setItem('appointments', JSON.stringify(response));
        logScreen("Appointments saved to AsyncStorage");
      } else {
        // If no appointments are found or response format is unexpected
        logScreen(`Unexpected response format: ${JSON.stringify(response)}`);
        // Keep existing appointments if we have them, otherwise set to empty array
        if (appointments.length === 0) {
          setAppointments([]);
        }
      }
      
      // Log the first appointment for debugging if available
      if (appointments.length > 0) {
        const firstAppointment = appointments[0];
        logScreen("First appointment details:");
        logScreen(`- ID: ${firstAppointment._id}`);
        logScreen(`- Client ID: ${firstAppointment.clientId}`);
        logScreen(`- Shop: ${firstAppointment.shopName || (firstAppointment.shopId && typeof firstAppointment.shopId === 'object' ? firstAppointment.shopId.name : 'Unknown')}`);
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
      
      const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
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
      }
    }
    return null;
  };

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
        
        {loading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FF0000" />
            <Text style={styles.loadingText}>Loading appointments...</Text>
          </View>
        ) : (
          <FlatList
            data={appointments}
            renderItem={renderAppointmentItem}
            keyExtractor={(item) => item._id || Math.random().toString()}
            contentContainerStyle={styles.listContainer}
            refreshing={refreshing}
            onRefresh={handleRefresh}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Feather name="calendar" size={50} color="#666" />
                <Text style={styles.emptyText}>No appointments found</Text>
                <TouchableOpacity 
                  style={styles.bookButton}
                  onPress={() => {
                    logScreen("Navigate to GuestLandingPage to find barbershop");
                    navigation.navigate('GuestLandingPage');
                  }}
                >
                  <Text style={styles.bookButtonText}>Find a Barbershop</Text>
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
  });
  
  export default AppointmentsScreen;
  