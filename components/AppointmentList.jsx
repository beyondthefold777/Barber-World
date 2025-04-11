import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  StatusBar,
  Image,
  Dimensions,
  ActivityIndicator
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { appointmentService } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const AppointmentList = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const userToken = await AsyncStorage.getItem('userToken');
      const data = await appointmentService.getBarbershopAppointments(userToken);
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

  const renderAppointmentItem = ({ item }) => (
    <View style={styles.appointmentCard}>
      <View style={styles.dateContainer}>
        <Text style={styles.date}>{formatDate(item.date)}</Text>
        <Text style={styles.time}>{item.timeSlot}</Text>
      </View>
      
      <View style={styles.detailsContainer}>
        <Text style={styles.service}>{item.service}</Text>
        <View style={styles.clientContainer}>
          <Feather name="user" size={14} color="#BBBBBB" />
          <Text style={styles.clientName}>{item.clientName || 'Client'}</Text>
        </View>
        <View style={styles.statusContainer}>
          <View 
            style={[
              styles.statusDot, 
              { 
                backgroundColor: 
                  item.status === 'confirmed' ? '#4CAF50' : 
                  item.status === 'canceled' ? '#F44336' : 
                  item.status === 'completed' ? '#2196F3' : '#FF9800' 
              }
            ]} 
          />
          <Text style={styles.status}>
            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </Text>
        </View>
      </View>
      
      <TouchableOpacity style={styles.moreButton}>
        <Feather name="more-vertical" size={20} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );

  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Feather name="calendar" size={50} color="#666" />
      <Text style={styles.emptyText}>No appointments found</Text>
    </View>
  );

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
        <Text style={styles.title}>Upcoming Appointments</Text>
        <View style={styles.topRightImage}>
          <Image 
            source={require('../assets/pole1.png')}
            style={{width: 70, height: 70}}
            resizeMode="contain"
          />
        </View>
      </View>

      {loading && appointments.length === 0 ? (
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
          refreshControl={
            <RefreshControl 
              refreshing={loading} 
              onRefresh={fetchAppointments}
              colors={["#FF0000"]}
              tintColor="#FF0000"
            />
          }
          ListEmptyComponent={renderEmptyComponent}
        />
      )}

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
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  dateContainer: {
    width: 80,
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
    fontWeight: '500',
  },
  detailsContainer: {
    flex: 1,
    marginLeft: 15,
  },
  service: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
  },
  clientContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  clientName: {
    color: '#DDDDDD',
    fontSize: 14,
    marginLeft: 5,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  status: {
    color: '#BBBBBB',
    fontSize: 14,
  },
  moreButton: {
    padding: 8,
    marginLeft: 10,
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
    textAlign: 'center',
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

export default AppointmentList;
