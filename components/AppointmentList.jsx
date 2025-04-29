import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { appointmentService } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const AppointmentList = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const navigation = useNavigation();

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
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAppointments();
  };

  const formatAppointmentDate = (dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        console.log(`Invalid date format: ${dateString}`);
        return 'Invalid date';
      }
      
      const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      return date.toLocaleDateString('en-US', options);
    } catch (error) {
      console.log(`Error formatting date: ${error.message}`);
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

  const handleCancelAppointment = async (appointmentId) => {
    console.log(`Cancel appointment requested for ID: ${appointmentId}`);
    
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
              console.log(`Proceeding with cancellation of appointment: ${appointmentId}`);
              
              // Get token from AsyncStorage
              const token = await AsyncStorage.getItem('userToken');
              console.log(`Token for cancellation from AsyncStorage: ${token ? 'Found' : 'Not found'}`);
              
              // Use appointmentService for cancellation
              await appointmentService.cancelAppointment(appointmentId, token);
              console.log("Cancellation API call successful");
              
              // Update the local state after successful cancellation
              setAppointments(appointments.map(app => 
                app._id === appointmentId ? {...app, status: 'canceled'} : app
              ));
              
              Alert.alert('Success', 'Your appointment has been canceled.');
            } catch (error) {
              console.log(`ERROR canceling appointment: ${error.message}`);
              console.log(`Error stack: ${error.stack}`);
              
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

  const renderAppointmentItem = ({ item }) => {
    // Log each appointment as it's rendered
    const shopName = getShopName(item);
    const barberName = getBarberName(item);
    
    console.log(`Rendering appointment: ${item._id}, status: ${item.status}, shopName: ${shopName}`);
    
    return (
      <View style={styles.appointmentCard}>
        <View style={styles.appointmentHeader}>
          <Text style={styles.shopName}>Appointment</Text>
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
            <Feather name="calendar" size={14} color="#999" />
            <Text style={styles.detailText}>{formatAppointmentDate(item.date)}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Feather name="clock" size={14} color="#999" />
            <Text style={styles.detailText}>{item.timeSlot || 'No time specified'}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Feather name="scissors" size={14} color="#999" />
            <Text style={styles.detailText}>{item.service || 'No service specified'}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Feather name="home" size={14} color="#999" />
            <Text style={styles.detailText}>{shopName}</Text>
          </View>
          
          {barberName && (
            <View style={styles.detailRow}>
              <Feather name="user" size={14} color="#999" />
              <Text style={styles.detailText}>{barberName}</Text>
            </View>
          )}
        </View>
        
        {item.status === 'confirmed' && (
          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={() => handleCancelAppointment(item._id)}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const isBarbershop = userInfo && (userInfo.role === 'barbershop' || userInfo.role === 'mainBarbershop');

  return (
    <LinearGradient
      colors={['#000000', '#333333']}
      style={styles.gradientContainer}
    >
      <View style={styles.container}>
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
            refreshControl={
              <RefreshControl 
                refreshing={refreshing} 
                onRefresh={handleRefresh}
                colors={["#FF0000"]}
                tintColor="#FF0000"
              />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Feather name="calendar" size={50} color="#666" />
                <Text style={styles.emptyText}>
                  {isBarbershop 
                    ? "No upcoming appointments for your shop" 
                    : "You don't have any appointments yet"}
                </Text>
                {!isBarbershop && (
                  <TouchableOpacity 
                    style={styles.bookButton}
                    onPress={() => {
                      console.log("Navigate to booking screen");
                      navigation.navigate('GuestLandingPage');
                    }}
                  >
                    <Text style={styles.bookButtonText}>Book an Appointment</Text>
                  </TouchableOpacity>
                )}
              </View>
            }
          />
        )}
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 16,
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
    paddingBottom: 20,
    paddingTop: 10,
  },
  appointmentCard: {
    backgroundColor: '#222',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#FF0000',
  },
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  shopName: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  statusBadge: {
    paddingVertical: 3,
    paddingHorizontal: 6,
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
    fontSize: 11,
    fontWeight: 'bold',
  },
  appointmentDetails: {
    marginBottom: 10,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailText: {
    color: '#CCC',
    marginLeft: 8,
    fontSize: 14,
  },
  cancelButton: {
    backgroundColor: '#333',
    padding: 8,
    borderRadius: 5,
    alignItems: 'center',
    alignSelf: 'flex-end',
    marginTop: 2,
    borderWidth: 1,
    borderColor: '#F44336',
    paddingHorizontal: 15,
  },
  cancelButtonText: {
    color: '#F44336',
    fontWeight: 'bold',
    fontSize: 13,
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
});

export default AppointmentList;
