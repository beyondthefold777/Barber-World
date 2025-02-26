import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const LandingPage = () => {
  const navigation = useNavigation();

  return (
    <LinearGradient
      colors={['#000000', '#333333']}
      style={styles.container}
    >
      {/* Top Right Image */}
      <View style={styles.topRightImage}>
        <Image 
          source={require('../assets/clippers1.png')}
          style={{width: 50, height: 50}}
        />
      </View>

      {/* Main Content Area */}
      <View style={styles.content}>
        <View style={styles.featuredSection}>
          <Text style={styles.sectionTitle}>Featured Barbershops</Text>
          {/* Add scrollable featured barbershops here */}
        </View>

        <View style={styles.quickBook}>
          <Text style={styles.sectionTitle}>Quick Book</Text>
          {/* Add quick booking options */}
        </View>

        <TouchableOpacity style={styles.barberSignup}>
          <Text style={styles.signupText}>Barbershop? List Your Shop</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Navigation Bar */}
      <View style={styles.navbar}>
        <TouchableOpacity style={styles.navItem}>
          <Feather name="home" size={24} color="white" />
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => navigation.navigate('SchedulingScreen')}
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
          <Feather name="search" size={24} color="white" />
          <Text style={styles.navText}>Find Shops</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem}>
          <Feather name="user" size={24} color="white" />
          <Text style={styles.navText}>Profile</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topRightImage: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  featuredSection: {
    marginTop: 20,
  },
  quickBook: {
    marginTop: 30,
  },
  sectionTitle: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  barberSignup: {
    backgroundColor: '#000000',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 30,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  signupText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#000000',
    paddingBottom: 20,
    paddingTop: 10,
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

export default LandingPage;
