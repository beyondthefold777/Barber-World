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
      {/* Login/Register Text */}
      <TouchableOpacity 
        style={styles.loginText}
        onPress={() => navigation.navigate('AuthScreen')}
      >
        <Text style={styles.loginButtonText}>Login/Register</Text>
      </TouchableOpacity>

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

        <TouchableOpacity style={styles.barberSignup}>
          <Text style={styles.signupText}>Barbershop? List Your Shop</Text>
        </TouchableOpacity>

        <View style={styles.promoSection}>
          <Text style={styles.promoTitle}>Special Offer!</Text>
          <Text style={styles.promoText}>Get 25% Off Your First Cut</Text>
          <Text style={styles.promoSubtext}>When you sign up and book today</Text>
          <TouchableOpacity 
            style={styles.promoButton}
            onPress={() => navigation.navigate('AuthScreen')}
          >
            <Text style={styles.promoButtonText}>Claim Offer</Text>
          </TouchableOpacity>
        </View>
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
  loginText: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 1,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  topRightImage: {
    position: 'absolute',
    top: 80,
    right: 20,
    zIndex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    paddingTop: 150,
  },
  featuredSection: {
    marginBottom: 30,
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
    marginBottom: 30,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  signupText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  promoSection: {
    padding: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FFFFFF',
    alignItems: 'center',
  },
  promoTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  promoText: {
    color: '#FF0000',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  promoSubtext: {
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 15,
  },
  promoButton: {
    backgroundColor: '#FF0000',
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  promoButtonText: {
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