import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { appointmentService } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AppointmentList = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);

  // Function to get user ID from AsyncStorage
  const getUserId = async () => {
    try {
      const userData = await AsyncStorage.getItem('userData');
      if (userData) {
        const parsedUserData = JSON.parse(userData);
        console.log('AppointmentList: User data retrieved:', parsedUserData.userId);
        return parsedUserData.userId;
      }
      return null;
    } catch (error) {
      console.error('AppointmentList: Error getting user ID:', error);
      return null;
    }
  };

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      console.log('AppointmentList: Starting to fetch appointments...');
      
      // Get user ID if we don't have it yet
      const currentUserId = userId || await getUserId();
      if (currentUserId) {
        setUserId(currentUserId);
      }
      
      console.log('AppointmentList: User ID:', currentUserId);
      
      // First try to get appointments from AsyncStorage
      const storedAppointments = await AsyncStorage.getItem('appointments');
      console.log('AppointmentList: Stored appointments retrieved from AsyncStorage');
      
      if (storedAppointments) {
        const allAppointments = JSON.parse(storedAppointments);
        console.log(`AppointmentList: Total appointments in storage: ${allAppointments.length}`);
        
        // Filter appointments for the current user
        if (currentUserId) {
          const userAppointments = allAppointments.filter(
            appointment => appointment.clientId === currentUserId
          );
          
          console.log(`AppointmentList: Filtered ${userAppointments.length} appointments for user ${currentUserId}`);
          
          if (userAppointments.length > 0) {
            setAppointments(userAppointments);
            setLoading(false);
            return;
          } else {
            console.log('AppointmentList: No appointments found for this user in AsyncStorage');
          }
        } else {
          console.log('AppointmentList: No user ID available to filter appointments');
        }
      } else {
        console.log('AppointmentList: No appointments found in AsyncStorage');
      }
      
      // If we couldn't get user appointments from AsyncStorage, fetch from API
      const userToken = await AsyncStorage.getItem('userToken');
      console.log('AppointmentList: User token retrieved:', !!userToken);
      
      if (!userToken) {
        console.log('AppointmentList: No user token available');
        setLoading(false);
        return;
      }
      
      // Fetch appointments from API
      console.log('AppointmentList: Fetching appointments from API...');
      const data = await appointmentService.getBarbershopAppointments(userToken);
      console.log('AppointmentList: Appointments data received from API');
      
      // Check if data is valid
      if (!data) {
        console.log('AppointmentList: No data received from API');
        setAppointments([]);
        return;
      }
      
      // Log the structure of the data
      console.log(`AppointmentList: Data type: ${Array.isArray(data) ? 'array' : typeof data}`);
      console.log(`AppointmentList: Data length: ${Array.isArray(data) ? data.length : 'N/A'}`);
      
      // If we have appointments, log details about the first one
      if (Array.isArray(data) && data.length > 0) {
        const firstAppointment = data[0];
        console.log('AppointmentList: First appointment details:');
        console.log(`- ID: ${firstAppointment._id}`);
        console.log(`- ClientId: ${firstAppointment.clientId}`);
        console.log(`- ShopId type: ${typeof firstAppointment.shopId}`);
        
        if (firstAppointment.shopId) {
          if (typeof firstAppointment.shopId === 'object') {
            console.log(`- Shop name: ${firstAppointment.shopId.name || 'undefined'}`);
          } else {
            console.log(`- Shop ID value: ${firstAppointment.shopId}`);
            console.log('- Shop ID is not an object (not populated)');
          }
        } else {
          console.log('- ShopId is null or undefined');
        }
      }
      
      // Filter appointments for the current user if we have a user ID
      let userAppointments = data;
      if (currentUserId) {
        userAppointments = data.filter(
          appointment => appointment.clientId === currentUserId
        );
        console.log(`AppointmentList: Filtered ${userAppointments.length} appointments for user ${currentUserId}`);
      }
      
      // Store all appointments in AsyncStorage for future use
      await AsyncStorage.setItem('appointments', JSON.stringify(data));
      console.log('AppointmentList: All appointments saved to AsyncStorage');
      
      setAppointments(userAppointments);
    } catch (error) {
      console.error('AppointmentList: Error fetching appointments:', error);
      // Show an alert for debugging
      Alert.alert(
        "Error Fetching Appointments",
        `Error: ${error.message}\n\nStack: ${error.stack}`
      );
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={fetchAppointments} />
      }
    >
      <Text style={styles.title}>Upcoming Appointments</Text>
      
      {appointments.length === 0 && !loading ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.noAppointments}>No upcoming appointments</Text>
          <TouchableOpacity 
            style={styles.bookButton}
            onPress={() => {
              // Navigate to booking screen if you have navigation set up
              // navigation.navigate('BookAppointment');
              Alert.alert("Book Appointment", "Navigate to booking screen");
            }}
          >
            <Text style={styles.bookButtonText}>Book an Appointment</Text>
          </TouchableOpacity>
        </View>
      ) : (
        appointments.map((appointment) => {
          // Log each appointment's shop info as we render
          console.log(`Rendering appointment ${appointment._id}:`);
          console.log(`- ClientId: ${appointment.clientId}`);
          console.log(`- ShopId type: ${typeof appointment.shopId}`);
          console.log(`- Has shop name: ${appointment.shopId && appointment.shopId.name ? 'Yes' : 'No'}`);
          
          return (
            <View key={appointment._id} style={styles.appointmentCard}>
              <View style={styles.dateContainer}>
                <Text style={styles.date}>{formatDate(appointment.date)}</Text>
                <Text style={styles.time}>{appointment.timeSlot}</Text>
              </View>
              
              <View style={styles.detailsContainer}>
                <Text style={styles.service}>{appointment.service}</Text>
                
                {/* Display shop name with better error handling */}
                {appointment.shopId ? (
                  typeof appointment.shopId === 'object' ? (
                    <Text style={styles.shopName}>
                      at {appointment.shopId.name || 'Unnamed Shop'}
                      {appointment.shopId.location && appointment.shopId.location.city ? 
                        ` (${appointment.shopId.location.city})` : ''}
                    </Text>
                  ) : (
                    <Text style={styles.shopName}>Shop ID: {appointment.shopId}</Text>
                  )
                ) : (
                  <Text style={styles.shopName}>No shop information</Text>
                )}
                
                <View style={styles.statusContainer}>
                  <View style={[styles.statusDot, { 
                    backgroundColor: 
                      appointment.status === 'confirmed' ? '#00FF00' : 
                      appointment.status === 'cancelled' ? '#FF0000' :
                      appointment.status === 'completed' ? '#0000FF' : '#FFD700'
                  }]} />
                  <Text style={styles.status}>
                    {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                  </Text>
                </View>
              </View>
              
              <TouchableOpacity 
                style={styles.moreButton}
                onPress={() => {
                  Alert.alert(
                    "Appointment Options",
                    "What would you like to do?",
                    [
                      { 
                        text: "View Details", 
                        onPress: () => Alert.alert("Details", JSON.stringify(appointment, null, 2))
                      },
                      { 
                        text: "Cancel Appointment", 
                        style: "destructive",
                        onPress: () => Alert.alert("Cancel", "Appointment cancellation would go here")
                      },
                      { text: "Close", style: "cancel" }
                    ]
                  );
                }}
              >
                <Feather name="more-vertical" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          );
        })
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 50,
  },
  noAppointments: {
    color: '#CCCCCC',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  bookButton: {
    backgroundColor: '#FF0000',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  bookButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  appointmentCard: {
    backgroundColor: '#333333',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateContainer: {
    flex: 1,
  },
  date: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  time: {
    color: '#FF0000',
    fontSize: 14,
    marginTop: 4,
  },
  detailsContainer: {
    flex: 2,
    marginLeft: 16,
  },
  service: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  shopName: {
    color: '#AAAAAA',
    fontSize: 14,
    marginTop: 2,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  status: {
    color: '#CCCCCC',
    fontSize: 14,
  },
  moreButton: {
    padding: 8,
  },
});

export default AppointmentList;
