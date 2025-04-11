import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StatusBar,
  Image,
  Dimensions
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
      const response = await appointmentService.getUserAppointments(userToken);
      if (response && response.appointments) {
        setAppointments(response.appointments);
      } else if (response && Array.isArray(response)) {
        setAppointments(response);
      } else {
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
              await appointmentService.cancelAppointment(appointmentId, userToken);
              
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
          <View style={[
            styles.statusBadge, 
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
      <StatusBar barStyle="light-content" translucent={true} backgroundColor="transparent" />
      
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Feather name="arrow-left" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.title}>My Appointments</Text>
        <View style={styles.topRightImage}>
          <Image 
            source={require('../assets/clippers1.png')}
            style={{width: 40, height: 40}}
          />
        </View>
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

      {/* Bottom Navigation Bar */}
      <View style={styles.navbar}>
        <TouchableOpacity style={styles.navItem}>
          <Feather name="bell" size={24} color="white" />
          <Text style={styles.navText}>Alerts</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => navigation.navigate('AppointmentList')}
        >
          <Feather name="calendar" size={24} color="white" />
          <Text style={styles.navText}>Appointments</Text>
        </TouchableOpacity>
        <TouchableOpacity>
          <LinearGradient
            colors={['#FF0000', '#FFFFFF', '#0000FF', '#FF0000', '#FFFFFF', '#0000FF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.clipperButton}
          />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Feather name="trending-up" size={24} color="white" />
          <Text style={styles.navText}>Analytics</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Feather name="user" size={24} color="white" />
          <Text style={styles.navText}>Profile</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  backButton: {
    padding: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  topRightImage: {
    padding: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#BBBBBB',
    marginTop: 10,
    fontSize: 16,
  },
  listContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  appointmentCard: {
    backgroundColor: '#000000',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#444444',
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  shopName: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  statusBadge: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
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
    marginBottom: 12,
  },
  detailText: {
    color: '#DDDDDD',
    marginLeft: 10,
    fontSize: 16,
  },
  cancelButton: {
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 5,
    borderWidth: 1,
    borderColor: '#F44336',
  },
  cancelButtonText: {
    color: '#F44336',
    fontWeight: 'bold',
    fontSize: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    marginTop: 50,
  },
  emptyText: {
    color: '#BBBBBB',
    fontSize: 18,
    marginTop: 15,
    marginBottom: 20,
    textAlign: 'center',
  },
  bookButton: {
    backgroundColor: '#FF0000',
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 10,
    marginTop: 10,
  },
  bookButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  newAppointmentButton: {
    position: 'absolute',
    bottom: 90, // Adjusted to be above navbar
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
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#000000',
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: '#333',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  navItem: {
    alignItems: 'center',
  },
  navText: {
    color: 'white',
    fontSize: 12,
    marginTop: 5,
  },
  clipperButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -25,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
});

export default AppointmentsScreen;
