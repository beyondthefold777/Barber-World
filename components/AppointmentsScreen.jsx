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

const AppointmentsScreen = ({ navigation }) => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { userToken } = useAuth();

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      // Use appointmentService instead of authService
      const response = await appointmentService.getUserAppointments(userToken);
      if (response && response.appointments) {
        setAppointments(response.appointments);
      } else if (response && Array.isArray(response)) {
        // If the response is directly an array of appointments
        setAppointments(response);
      } else {
        // If no appointments are found
        setAppointments([]);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
      Alert.alert('Error', 'Failed to load your appointments. Please try again.');
      setAppointments([]);
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

  const handleCancelAppointment = async (appointmentId) => {
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
              // Use appointmentService for cancellation
              await appointmentService.cancelAppointment(appointmentId, userToken);
              
              // Update the local state after successful cancellation
              setAppointments(appointments.map(app => 
                app._id === appointmentId ? {...app, status: 'canceled'} : app
              ));
              
              Alert.alert('Success', 'Your appointment has been canceled.');
            } catch (error) {
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
      const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      return date.toLocaleDateString('en-US', options);
    } catch (error) {
      return dateString;
    }
  };

  const renderAppointmentItem = ({ item }) => {
    return (
      <View style={styles.appointmentCard}>
        <View style={styles.appointmentHeader}>
          <Text style={styles.shopName}>{item.shopName || 'Barbershop'}</Text>
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
            <Text style={styles.detailText}>{item.timeSlot}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Feather name="scissors" size={16} color="#999" />
            <Text style={styles.detailText}>{item.service}</Text>
          </View>
          
          {item.barberName && (
            <View style={styles.detailRow}>
              <Feather name="user" size={16} color="#999" />
              <Text style={styles.detailText}>{item.barberName}</Text>
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
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContainer}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Feather name="calendar" size={50} color="#666" />
              <Text style={styles.emptyText}>No appointments found</Text>
              <TouchableOpacity 
                style={styles.bookButton}
                onPress={() => navigation.navigate('GuestLandingPage')}
              >
                <Text style={styles.bookButtonText}>Find a Barbershop</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}

      <TouchableOpacity 
        style={styles.newAppointmentButton}
        onPress={() => navigation.navigate('GuestLandingPage')}
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
