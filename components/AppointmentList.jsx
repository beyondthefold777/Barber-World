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
  const [userInfo, setUserInfo] = useState(null);

  // Function to get user info from AsyncStorage
  const getUserInfo = async () => {
    try {
      const userData = await AsyncStorage.getItem('userData');
      if (userData) {
        const parsedUserData = JSON.parse(userData);
        console.log('AppointmentList: User data retrieved:', parsedUserData);
        return parsedUserData;
      }
      return null;
    } catch (error) {
      console.error('AppointmentList: Error getting user info:', error);
      return null;
    }
  };

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      console.log('AppointmentList: Starting to fetch appointments...');
      
      // Get user info if we don't have it yet
      const currentUserInfo = userInfo || await getUserInfo();
      if (currentUserInfo) {
        setUserInfo(currentUserInfo);
      }
      
      console.log('AppointmentList: User Info:', currentUserInfo);
      
      // Get user token
      const userToken = await AsyncStorage.getItem('userToken');
      console.log('AppointmentList: User token retrieved:', !!userToken);
      
      if (!userToken) {
        console.log('AppointmentList: No user token available');
        setLoading(false);
        return;
      }
      
      // First try to get appointments from AsyncStorage
      const storageKey = 'barbershopAppointments';
      const storedAppointments = await AsyncStorage.getItem(storageKey);
      console.log('AppointmentList: Checking stored appointments');
      
      if (storedAppointments) {
        const parsedAppointments = JSON.parse(storedAppointments);
        console.log(`AppointmentList: Found ${parsedAppointments.length} appointments in storage`);
        setAppointments(parsedAppointments);
      }
      
      // Fetch appointments from API regardless of storage to ensure fresh data
      console.log('AppointmentList: Fetching appointments from API...');
      const data = await appointmentService.getBarbershopAppointments(userToken);
      console.log(`AppointmentList: Received ${data.length} appointments from API`);
      
      // Update state with fresh data
      setAppointments(data);
      
    } catch (error) {
      console.error('AppointmentList: Error fetching appointments:', error);
      Alert.alert(
        "Error Fetching Appointments",
        `Error: ${error.message}`
      );
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

  const isBarbershop = userInfo && (userInfo.role === 'barbershop' || userInfo.role === 'mainBarbershop');

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={fetchAppointments} />
      }
    >
      <Text style={styles.title}>
        {isBarbershop ? 'Shop Appointments' : 'My Appointments'}
      </Text>
      
      {appointments.length === 0 && !loading ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.noAppointments}>
            {isBarbershop ? 'No upcoming appointments for your shop' : 'No upcoming appointments'}
          </Text>
          {!isBarbershop && (
            <TouchableOpacity 
              style={styles.bookButton}
              onPress={() => {
                // Navigate to booking screen
                Alert.alert("Book Appointment", "Navigate to booking screen");
              }}
              >
              <Text style={styles.bookButtonText}>Book an Appointment</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        appointments.map((appointment) => {
          // Determine what information to display based on user role
          const isBarbershop = userInfo && (userInfo.role === 'barbershop' || userInfo.role === 'mainBarbershop');
          
          return (
            <View key={appointment._id} style={styles.appointmentCard}>
              <View style={styles.dateContainer}>
                <Text style={styles.date}>{formatDate(appointment.date)}</Text>
                <Text style={styles.time}>{appointment.timeSlot}</Text>
              </View>
              
              <View style={styles.detailsContainer}>
                <Text style={styles.service}>{appointment.service}</Text>
                
                {/* Display client or shop info based on user role */}
                {isBarbershop ? (
                  // For barbershop users, show client info
                  <Text style={styles.clientName}>
                    Client: {appointment.clientData ? 
                      `${appointment.clientData.firstName} ${appointment.clientData.lastName}` : 
                      (appointment.clientId || 'Unknown Client')}
                  </Text>
                ) : (
                  // For clients, show shop info
                  <Text style={styles.shopName}>
                    at {appointment.shopData ? 
                      appointment.shopData.name : 
                      (typeof appointment.shopId === 'object' ? 
                        appointment.shopId.name || 'Unnamed Shop' : 
                        'Barbershop')}
                  </Text>
                )}
                
                <View style={styles.statusContainer}>
                  <View style={[styles.statusDot, {
                    backgroundColor:
                      appointment.status === 'confirmed' ? '#00FF00' :
                      appointment.status === 'cancelled' || appointment.status === 'canceled' ? '#FF0000' :
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
                        text: isBarbershop ? "Update Status" : "Cancel Appointment",
                        style: isBarbershop ? "default" : "destructive",
                        onPress: () => {
                          if (isBarbershop) {
                            // Show status update options for barbershop
                            Alert.alert(
                              "Update Status",
                              "Select new status:",
                              [
                                { text: "Confirmed", onPress: () => console.log("Status updated to confirmed") },
                                { text: "Completed", onPress: () => console.log("Status updated to completed") },
                                { text: "Cancelled", onPress: () => console.log("Status updated to cancelled") },
                                { text: "Cancel", style: "cancel" }
                              ]
                            );
                          } else {
                            // Show cancellation confirmation for clients
                            Alert.alert(
                              "Cancel Appointment",
                              "Are you sure you want to cancel this appointment?",
                              [
                                { 
                                  text: "Yes, Cancel", 
                                  style: "destructive",
                                  onPress: async () => {
                                    try {
                                      const userToken = await AsyncStorage.getItem('userToken');
                                      if (userToken) {
                                        await appointmentService.cancelAppointment(appointment._id, userToken);
                                        fetchAppointments(); // Refresh the list
                                      }
                                    } catch (error) {
                                      console.error("Error cancelling appointment:", error);
                                      Alert.alert("Error", "Failed to cancel appointment");
                                    }
                                  }
                                },
                                { text: "No, Keep It", style: "cancel" }
                              ]
                            );
                          }
                        }
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
  clientName: {
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
