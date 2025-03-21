import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  FlatList,
  Image,
  StatusBar,
  Animated,
  Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { authService } from '../services/api';

const GuestLandingPage = ({ navigation }) => {
  const [searchType, setSearchType] = useState('location');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const slideAnim = useRef(new Animated.Value(-300)).current;

  const toggleMenu = () => {
    const toValue = isOpen ? -300 : 0;
    Animated.timing(slideAnim, {
      toValue,
      duration: 300,
      useNativeDriver: true,
    }).start();
    setIsOpen(!isOpen);
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      navigation.navigate('Login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    try {
      const searchParams = searchType === 'location' 
        ? { city, state }
        : { zipCode };
      
      // Use the existing searchBarbershops method from authService
      const results = await authService.searchBarbershops(searchParams);
      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  // Updated renderBarbershop function with safety checks
  const renderBarbershop = ({ item }) => {
    // Make sure item has an _id before trying to use it
    if (!item || !item._id) {
      console.log('Invalid shop item:', item);
      return null;
    }
    
    return (
      <TouchableOpacity 
        style={styles.barbershopCard}
        onPress={() => navigation.navigate('BarbershopDetail', { shopId: item._id })}
      >
        <Text style={styles.barbershopName}>{item.businessName || item.name}</Text>
        <Text style={styles.barbershopAddress}>{item.address}</Text>
        <Text style={styles.barbershopLocation}>{`${item.city}, ${item.state} ${item.zipCode || ''}`}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <LinearGradient
      colors={['#000000', '#333333']}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" translucent={true} backgroundColor="transparent" />

      {/* Hamburger Menu Button */}
      <TouchableOpacity 
        style={styles.menuButton}
        onPress={toggleMenu}
      >
        <Feather name="menu" size={24} color="white" />
      </TouchableOpacity>

      {/* Animated Sidebar */}
      <Animated.View 
        style={[
          styles.sidebar,
          {
            transform: [{ translateX: slideAnim }],
          },
        ]}
      >
        <LinearGradient
          colors={['#000000', '#333333']}
          style={styles.sidebarGradient}
        >
          <TouchableOpacity onPress={toggleMenu} style={styles.closeButton}>
            <Feather name="x" size={24} color="white" />
          </TouchableOpacity>

          <View style={styles.sidebarHeader}>
            <Text style={styles.sidebarTitle}>Business Center</Text>
            <View style={styles.titleUnderline} />
          </View>

          <View style={styles.sidebarContent}>
            <ScrollView 
              showsVerticalScrollIndicator={true}
              indicatorStyle="white"
            >
              {/* Section Titles */}
              <Text style={styles.sidebarSection}>Account</Text>
              <Text style={styles.sidebarSection}>Financial</Text>
              <Text style={styles.sidebarSection}>Marketing & Promotions</Text>
              <Text style={styles.sidebarSection}>Communication Hub</Text>
              <Text style={styles.sidebarSection}>Analytics & Reports</Text>
              <Text style={styles.sidebarSection}>Settings</Text>
              <Text style={styles.sidebarSection}>Support & Resources</Text>
            </ScrollView>
          </View>

          <View style={styles.sidebarFooter}>
            <TouchableOpacity style={styles.footerLink}>
              <Text style={styles.footerText}>Terms of Service</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.footerLink}>
              <Text style={styles.footerText}>Privacy Policy</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.footerLink}>
              <Text style={styles.footerText}>Contact Us</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.footerLink}>
              <Text style={styles.footerText}>Help Center</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.logoutButton}
              onPress={handleLogout}
            >
              <MaterialIcons name="logout" size={24} color="#FF0000" />
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </Animated.View>

      {/* Top Right Image */}
      <View style={styles.topRightImage}>
        <Image 
          source={require('../assets/clippers1.png')}
          style={{width: 50, height: 50}}
        />
      </View>

      {/* Main Content Area */}
      <ScrollView style={styles.content}>
        <View style={styles.searchSection}>
          <Text style={styles.sectionTitle}>Find Your Barber</Text>
          
          <View style={styles.searchTypeContainer}>
            <TouchableOpacity 
              style={[
                styles.searchTypeButton, 
                searchType === 'location' && styles.activeSearchType
              ]}
              onPress={() => setSearchType('location')}
            >
              <Text style={styles.searchTypeText}>City & State</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.searchTypeButton, 
                searchType === 'zip' && styles.activeSearchType
              ]}
              onPress={() => setSearchType('zip')}
            >
              <Text style={styles.searchTypeText}>ZIP Code</Text>
            </TouchableOpacity>
          </View>

          {searchType === 'location' ? (
            <View style={styles.locationInputs}>
              <TextInput
                style={[styles.input, styles.cityInput]}
                placeholder="City"
                placeholderTextColor="#999"
                value={city}
                onChangeText={setCity}
              />
              <TextInput
                style={[styles.input, styles.stateInput]}
                placeholder="State"
                placeholderTextColor="#999"
                value={state}
                onChangeText={setState}
                maxLength={2}
              />
            </View>
          ) : (
            <TextInput
              style={styles.input}
              placeholder="Enter ZIP Code"
              placeholderTextColor="#999"
              value={zipCode}
              onChangeText={setZipCode}
              keyboardType="numeric"
              maxLength={5}
            />
          )}

          <TouchableOpacity 
            style={styles.searchButton}
            onPress={handleSearch}
            disabled={loading}
          >
            <Text style={styles.searchButtonText}>
              {loading ? 'Searching...' : 'Search'}
            </Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={searchResults}
          renderItem={renderBarbershop}
          keyExtractor={(item) => item._id?.toString() || Math.random().toString()}
          style={styles.resultsList}
          contentContainerStyle={styles.resultsContent}
          ListEmptyComponent={
            <Text style={styles.noResults}>
              {loading ? 'Searching for barbershops...' : 'No barbershops found'}
            </Text>
          }
        />

        <TouchableOpacity 
          style={styles.barberSignup}
          onPress={() => navigation.navigate('Register')}
        >
          <Text style={styles.signupText}>Barbershop? List Your Shop</Text>
        </TouchableOpacity>
      </ScrollView>

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
          <Text style={styles.navText}>Schedule</Text>
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
  menuButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 2,
    padding: 10,
  },
  sidebar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 300,
    backgroundColor: '#000',
    zIndex: 999,
  },
  sidebarGradient: {
    flex: 1,
    padding: 20,
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    padding: 10,
    zIndex: 3,
  },
  sidebarHeader: {
    paddingTop: 60,
    marginBottom: 10,
    alignItems: 'flex-start',
  },
  sidebarTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  titleUnderline: {
    height: 2,
    backgroundColor: '#FFFFFF',
    width: '100%',
    marginBottom: 10,
  },
  sidebarContent: {
    flex: 1,
    paddingTop: 10,
  },
  sidebarSection: {
    color: '#FF0000',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 8,
    paddingHorizontal: 10,
  },
  sidebarFooter: {
    borderTopWidth: 1,
    borderTopColor: '#444',
    paddingTop: 20,
  },
  footerLink: {
    padding: 8,
  },
  footerText: {
    color: '#888',
    fontSize: 14,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    marginTop: 10,
  },
  logoutText: {
    color: '#FF0000',
    fontSize: 16,
    marginLeft: 8,
    fontWeight: 'bold',
  },
  topRightImage: {
    position: 'absolute',
    top: 120,
    right: 20,
    zIndex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    paddingTop: 100,
  },
  searchSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  searchTypeContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    backgroundColor: '#222',
    borderRadius: 8,
    padding: 4,
  },
  searchTypeButton: {
    flex: 1,
    padding: 10,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeSearchType: {
    backgroundColor: '#FF0000',
  },
  searchTypeText: {
    color: 'white',
    fontWeight: 'bold',
  },
  locationInputs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  input: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    fontSize: 16,
  },
  cityInput: {
    flex: 2,
    marginRight: 10,
  },
  stateInput: {
    flex: 1,
  },
  searchButton: {
    backgroundColor: '#FF0000',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  searchButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  resultsList: {
    marginBottom: 20,
  },
  resultsContent: {
    padding: 20,
  },
  barbershopCard: {
    backgroundColor: '#222',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  barbershopName: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  barbershopAddress: {
    color: '#CCC',
    fontSize: 14,
    marginBottom: 3,
  },
  barbershopLocation: {
    color: '#999',
    fontSize: 14,
    marginBottom: 5,
  },
  servicesText: {
    color: '#FF0000',
    fontSize: 14,
    marginTop: 5,
  },
  ratingText: {
    color: '#FFD700',
    fontSize: 14,
    marginTop: 3,
  },
  noResults: {
    color: '#999',
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
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

export default GuestLandingPage;