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
import { Feather, MaterialIcons, FontAwesome, Ionicons } from '@expo/vector-icons';
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
      console.log('Search results received:', results.length);
      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  // Updated renderBarbershop function with enhanced styling
  const renderBarbershop = ({ item, index }) => {
    // Make sure item has an _id before trying to use it
    if (!item || !item._id) {
      console.log('Invalid shop item:', item);
      return null;
    }
        
    // Format the address for display
    const formatAddress = () => {
      if (item.formattedAddress) {
        return item.formattedAddress;
      } else if (item.address && typeof item.address === 'object') {
        return item.address.street || '';
      } else if (typeof item.address === 'string') {
        return item.address;
      }
      return '';
    };
        
    // Format the location (city, state, zip)
    const formatLocation = () => {
      let city = '';
      let state = '';
      let zip = '';
            
      // Try to get values from both possible locations
      if (item.address && typeof item.address === 'object') {
        city = item.address.city || item.city || '';
        state = item.address.state || item.state || '';
        zip = item.address.zip || item.address.zipCode || item.zipCode || '';
      } else {
        city = item.city || '';
        state = item.state || '';
        zip = item.zipCode || '';
      }
            
      let location = '';
            
      if (city) {
        location += city;
      }
            
      if (city && state) {
        location += ', ';
      }
            
      if (state) {
        location += state;
      }
            
      if ((city || state) && zip) {
        location += ' ';
      }
            
      if (zip) {
        location += zip;
      }
            
      return location || '';
    };

    // Use actual rating if available
    const rating = item.rating ? item.rating.toFixed(1) : (Math.random() * 2 + 3).toFixed(1);
    const distance = item.distance ? item.distance.toFixed(1) : (Math.random() * 10).toFixed(1);
        
    // Format services for display
    const formatServices = () => {
      if (item.services && item.services.length > 0) {
        return item.services.slice(0, 3).map(service => 
          typeof service === 'object' ? service.name : service
        ).join(' • ');
      }
      return ['Haircut', 'Beard Trim', 'Shave', 'Lineup'].slice(0, Math.floor(Math.random() * 4) + 1).join(' • ');
    };
        
    // Get the best available image for the shop
    const getShopImage = () => {
      // First try profile image
      if (item.profileImage) {
        return { uri: item.profileImage };
      } 
      // Then try first image from images array
      else if (item.images && item.images.length > 0) {
        return { uri: item.images[0] };
      } 
      // Fall back to default image
      else {
        return require('../assets/clippers1.png');
      }
    };

    return (
      <TouchableOpacity 
        style={[styles.barbershopCard, index % 2 === 0 ? styles.barbershopCardEven : styles.barbershopCardOdd]}
        onPress={() => navigation.navigate('BarbershopDetail', { shopId: item._id })}
      >
        <LinearGradient
          colors={index % 2 === 0 ? ['#000000', '#222222'] : ['#111111', '#333333']}
          style={styles.cardGradient}
        >
          <View style={styles.cardHeader}>
            <View style={styles.shopIconContainer}>
              <Image 
                source={getShopImage()}
                style={{ width: '100%', height: '100%', borderRadius: 25 }}
                resizeMode="cover"
              />
            </View>
            <View style={styles.shopInfoContainer}>
              <Text style={styles.barbershopName}>{item.name || item.businessName || 'Unnamed Barbershop'}</Text>
              <View style={styles.ratingContainer}>
                <FontAwesome name="star" size={16} color="#FFD700" />
                <Text style={styles.ratingText}>{rating}</Text>
                <View style={styles.distanceContainer}>
                  <Ionicons name="location" size={16} color="#FF0000" />
                  <Text style={styles.distanceText}>{distance} mi</Text>
                </View>
              </View>
            </View>
          </View>
                    
          <View style={styles.cardDivider} />
                    
          <View style={styles.cardBody}>
            <View style={styles.addressRow}>
              <Feather name="map-pin" size={16} color="#BBBBBB" style={styles.addressIcon} />
              <Text style={styles.barbershopAddress}>{formatAddress()}</Text>
            </View>
            <Text style={styles.barbershopLocation}>{formatLocation()}</Text>
                        
            <View style={styles.servicesContainer}>
              <Text style={styles.servicesText}>
                {formatServices()}
              </Text>
            </View>
          </View>
                    
          <View style={styles.cardFooter}>
            <TouchableOpacity 
              style={styles.bookButton}
              onPress={() => navigation.navigate('BarbershopDetail', { shopId: item._id, initialTab: 'booking' })}
            >
              <Text style={styles.bookButtonText}>Book Now</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.detailsButton}
              onPress={() => navigation.navigate('BarbershopDetail', { shopId: item._id })}
            >
              <Text style={styles.detailsButtonText}>Details</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
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
              <TouchableOpacity onPress={() => {
                navigation.navigate('Settings');
                toggleMenu(); // Close the menu after navigation
              }}>
                <Text style={styles.sidebarSection}>Settings</Text>
              </TouchableOpacity>
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
              <Image 
                source={require('../assets/scissors.png')}
                style={styles.buttonIcon}
              />
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
        
        {/* Results Section with Title */}
        {searchResults.length > 0 && (
          <View style={styles.resultsSection}>
            <View style={styles.resultsTitleContainer}>
              <Text style={styles.resultsTitle}>Barbershops Near You</Text>
              <Text style={styles.resultsCount}>{searchResults.length} found</Text>
            </View>
            
            <FlatList
              data={searchResults}
              renderItem={renderBarbershop}
              keyExtractor={(item) => item._id?.toString() || Math.random().toString()}
              style={styles.resultsList}
              contentContainerStyle={styles.resultsContent}
              showsVerticalScrollIndicator={false}
              scrollEnabled={false} // Disable scrolling on FlatList since it's inside ScrollView
            />
          </View>
        )}
        
        {/* No Results Message */}
        {searchResults.length === 0 && !loading && (
          <View style={styles.noResultsContainer}>
            <FontAwesome name="search" size={50} color="#444" />
            <Text style={styles.noResults}>
              No barbershops found
            </Text>
            <Text style={styles.noResultsSubtext}>
              Try a different location or ZIP code
            </Text>
          </View>
        )}
        
        {/* Loading Indicator */}
        {loading && (
          <View style={styles.loadingContainer}>
            <FontAwesome name="spinner" size={40} color="#FF0000" />
            <Text style={styles.loadingText}>Searching for barbershops...</Text>
          </View>
        )}
        
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
          onPress={() => navigation.navigate('AppointmentsScreen')}
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
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => navigation.navigate('Settings')}
        >
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
    flexDirection: 'row',
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
  },
  activeSearchType: {
    backgroundColor: '#FF0000',
  },
  buttonIcon: {
    width: 30,
    height: 30,
    marginRight: 8,
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
  // New enhanced results section styles
  resultsSection: {
    marginBottom: 20,
  },
  resultsTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  resultsTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  resultsCount: {
    color: '#FF0000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resultsList: {
    marginBottom: 20,
  },
  resultsContent: {
    paddingBottom: 10,
  },
  barbershopCard: {
    marginBottom: 15,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  barbershopCardEven: {
    borderLeftWidth: 3,
    borderLeftColor: '#FF0000',
  },
  barbershopCardOdd: {
    borderLeftWidth: 3,
    borderLeftColor: '#0000FF',
  },
  cardGradient: {
    padding: 15,
  },
  cardHeader: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  shopIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 0, 0, 0.3)',
  },
  shopInfoContainer: {
    flex: 1,
  },
  barbershopName: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    textShadowColor: 'rgba(255, 255, 255, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    color: '#FFD700',
    fontSize: 14,
    marginLeft: 5,
    fontWeight: 'bold',
  },
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 15,
  },
  distanceText: {
    color: '#BBBBBB',
    fontSize: 14,
    marginLeft: 5,
  },
  cardDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: 10,
  },
  cardBody: {
    marginBottom: 10,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 5,
  },
  addressIcon: {
    marginRight: 5,
    marginTop: 2,
  },
  barbershopAddress: {
    color: '#E0E0E0',
    fontSize: 15,
    flex: 1,
  },
  barbershopLocation: {
    color: '#BBBBBB',
    fontSize: 14,
    marginBottom: 8,
    marginLeft: 21, // To align with the address text
  },
  servicesContainer: {
    marginTop: 5,
  },
  servicesText: {
    color: '#FF0000',
    fontSize: 14,
    fontStyle: 'italic',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  bookButton: {
    backgroundColor: '#FF0000',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },
  bookButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  detailsButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
    flex: 1,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  detailsButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  noResultsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 10,
    marginVertical: 20,
  },
  noResults: {
    color: '#BBBBBB',
    textAlign: 'center',
    marginTop: 15,
    fontSize: 18,
    fontWeight: 'bold',
  },
  noResultsSubtext: {
    color: '#888888',
    textAlign: 'center',
    marginTop: 10,
    fontSize: 14,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    marginVertical: 20,
  },
  loadingText: {
    color: '#BBBBBB',
    textAlign: 'center',
    marginTop: 15,
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
