import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { appointmentService } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AppointmentList = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const userToken = await AsyncStorage.getItem('userToken');
      const data = await appointmentService.getBarbershopAppointments(userToken);
      console.log('Fetched appointments:', data);
      setAppointments(data);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
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
        <Text style={styles.noAppointments}>No upcoming appointments</Text>
      ) : (
        appointments.map((appointment) => (
          <View key={appointment._id} style={styles.appointmentCard}>
            <View style={styles.dateContainer}>
              <Text style={styles.date}>{formatDate(appointment.date)}</Text>
              <Text style={styles.time}>{appointment.timeSlot}</Text>
            </View>
            
            <View style={styles.detailsContainer}>
              <Text style={styles.service}>{appointment.service}</Text>
              
              {/* Display shop name if available */}
              {appointment.shopId && appointment.shopId.name ? (
                <Text style={styles.shopName}>at {appointment.shopId.name}</Text>
              ) : (
                <Text style={styles.shopName}>Shop info unavailable</Text>
              )}
              
              <View style={styles.statusContainer}>
                <View style={[styles.statusDot, { 
                  backgroundColor: appointment.status === 'confirmed' ? '#00FF00' : '#FFD700' 
                }]} />
                <Text style={styles.status}>{appointment.status}</Text>
              </View>
            </View>
            
            <TouchableOpacity style={styles.moreButton}>
              <Feather name="more-vertical" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        ))
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
  noAppointments: {
    color: '#CCCCCC',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
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
