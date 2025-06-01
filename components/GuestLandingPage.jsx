import React, { useRef, useState, useEffect } from 'react';
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
import { useUnreadMessages } from '../context/UnreadMessagesContext';
import NotificationBadge from '../components/NotificationBadge';

const GuestLandingPage = ({ navigation }) => {
  const [searchType, setSearchType] = useState('location');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const slideAnim = useRef(new Animated.Value(-300)).current;
  
  // Add a fallback for the unread messages context
  const unreadMessagesContext = useUnreadMessages();
  const unreadCount = unreadMessagesContext ? unreadMessagesContext.unreadCount : 0;

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
    setHasSearched(true);
    try {
      const searchParams = searchType === 'location' 
        ? { city, state }
        : { zipCode };
      
      // Use the existing searchBarbershops method from authService
      const results = await authService.searchBarbershops(searchParams);
      console.log('Search results received:', results.length);
      
      // Process results to ensure distance values are consistent
      const processedResults = results.map(shop => {
        // If shop doesn't have a distance, assign a fixed one based on shop ID
        if (!shop.distance) {
          // Use the shop's ID to generate a consistent "random" distance
          // This ensures the same shop always gets the same distance
          const idSum = shop._id.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
          const fixedDistance = ((idSum % 100) / 10 + 0.1).toFixed(1);
          return { ...shop, distance: fixedDistance };
        }
        return shop;
      });
      
      setSearchResults(processedResults);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

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
    
    // Use the distance that was set during handleSearch
    const distance = item.distance || "0.0";
    
    // Format services for display
    const formatServices = () => {
      if (item.services && item.services.length > 0) {
        return item.services.slice(0, 3).map(service => 
          typeof service === 'object' ? service.name : service
        ).join(' • ');
      }
      return ['Haircut', 'Beard Trim', 'Shave', 'Lineup'].slice(0, Math.floor(Math.random() * 4) + 1).join(' • ');
    };
    
    // Get up to 3 images for the gallery preview
    const getShopImages = () => {
      let images = [];
      
      // First try to get images from the images array
      if (item.images && item.images.length > 0) {
        // Take up to 3 images from the array
        images = item.images.slice(0, 3).map(img => ({ uri: img }));
      }
      
      // If no images in the array but there's a profile image, use that
      if (images.length === 0 && item.profileImage) {
        images.push({ uri: item.profileImage });
      }
      
      // If still no images, use a default image
      if (images.length === 0) {
        images.push(require('../assets/clippers1.png'));
      }
      
      return images;
    };
    const shopImages = getShopImages();
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
              <FontAwesome name="scissors" size={24} color="#FF0000" />
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
          
          {/* Gallery Preview */}
          <View style={styles.imageGalleryContainer}>
            {shopImages.map((image, imgIndex) => (
              <View key={imgIndex} style={styles.galleryImageWrapper}>
                <Image 
                  source={image}
                  style={styles.galleryImage}
                  resizeMode="cover"
                />
              </View>
            ))}
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
      
      <ScrollView style={styles.content} stickyHeaderIndices={[0]}>
        {/* Sticky Header */}
        <View style={styles.stickyHeader}>
          {/* Hamburger Menu Button */}
          <TouchableOpacity 
            style={styles.menuButton}
            onPress={toggleMenu}
          >
            <Feather name="menu" size={24} color="white" />
          </TouchableOpacity>
          
          {/* Top Right Image */}
          <View style={styles.topRightImage}>
            <Image 
              source={require('../assets/clippers1.png')}
              style={{width: 50, height: 50}}
            />
          </View>
        </View>
        
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
         
        {/* No Results Message - Only show after a search has been performed */}
        {searchResults.length === 0 && hasSearched && !loading && (
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
{/* Animated Sidebar - Styled like the BarbershopDashboard */}
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
      <Text style={styles.sidebarTitle}>Dashboard</Text>
      <View style={styles.titleUnderline} />
    </View>
    
    <ScrollView
      style={styles.sidebarContent}
      showsVerticalScrollIndicator={true}
      indicatorStyle="white"
    >
      {/* Guest Menu Section */}
      <View>
        <Text style={styles.sidebarSection}>Menu</Text>
        
        <TouchableOpacity 
          style={styles.sidebarItem}
          onPress={() => {
            navigation.navigate('AppointmentsScreen');
            toggleMenu();
          }}
        >
          <View style={styles.sidebarItemRow}>
            <View style={styles.sidebarItemContent}>
              <Feather name="calendar" size={20} color="#FFFFFF" style={styles.itemIcon} />
              <Text style={styles.sidebarItemText}>Appointments</Text>
            </View>
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.sidebarItem}
          onPress={() => {
            navigation.navigate('MessagesScreen');
            toggleMenu();
          }}
        >
          <View style={styles.sidebarItemRow}>
            <View style={styles.sidebarItemContent}>
              <Feather name="message-square" size={20} color="#FFFFFF" style={styles.itemIcon} />
              <Text style={styles.sidebarItemText}>Messages</Text>
              {unreadCount > 0 && (
                <View style={styles.menuBadge}>
                  <Text style={styles.menuBadgeText}>{unreadCount}</Text>
                </View>
              )}
            </View>
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.sidebarItem}
          onPress={() => {
            navigation.navigate('Settings');
            toggleMenu();
          }}
        >
          <View style={styles.sidebarItemRow}>
            <View style={styles.sidebarItemContent}>
              <Feather name="settings" size={20} color="#FFFFFF" style={styles.itemIcon} />
              <Text style={styles.sidebarItemText}>Settings</Text>
            </View>
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.sidebarItem}
          onPress={() => {
            navigation.navigate('HelpCenter');
            toggleMenu();
          }}
        >
          <View style={styles.sidebarItemRow}>
            <View style={styles.sidebarItemContent}>
              <Feather name="help-circle" size={20} color="#FFFFFF" style={styles.itemIcon} />
              <Text style={styles.sidebarItemText}>Help & Support</Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    </ScrollView>
    
    <View style={styles.sidebarFooter}>
      {/* Terms and Privacy Policy Links */}
      <View style={styles.footerLinksContainer}>
        <TouchableOpacity 
          style={styles.footerLink}
          onPress={() => {
            navigation.navigate('TermsOfService');
            toggleMenu();
          }}
        >
          <Text style={styles.footerText}>Terms of Service</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.footerLink}
          onPress={() => {
            navigation.navigate('PrivacyPolicy');
            toggleMenu();
          }}
        >
          <Text style={styles.footerText}>Privacy Policy</Text>
        </TouchableOpacity>
      </View>
      
      <TouchableOpacity 
        style={styles.sidebarItem}
        onPress={handleLogout}
      >
        <View style={styles.sidebarItemRow}>
          <View style={styles.sidebarItemContent}>
            <Feather name="log-out" size={20} color="#FF0000" style={styles.itemIcon} />
            <Text style={[styles.sidebarItemText, styles.logoutText]}>Logout</Text>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  </LinearGradient>
</Animated.View>


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
        
        <TouchableOpacity onPress={() => navigation.navigate('GuestLandingPage')}>
          <LinearGradient
            colors={['#FF0000', '#FFFFFF', '#0000FF', '#FF0000', '#FFFFFF', '#0000FF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.clipperButton}
          />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => navigation.navigate('MessagesScreen')}
        >
          <View style={styles.iconWithBadge}>
            <Feather name="message-square" size={24} color="white" />
            {unreadCount > 0 && (
              <NotificationBadge count={unreadCount} />
            )}
          </View>
          <Text style={styles.navText}>Messages</Text>
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
  stickyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 10,
    paddingHorizontal: 20,
    backgroundColor: '#000000', // Match the gradient start color
  },
  menuButton: {
    padding: 10,
  },
  topRightImage: {
    marginTop: 20,
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
  sidebarItem: {
    paddingVertical: 12,
    paddingHorizontal: 10,
  },
  sidebarItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sidebarItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  itemIcon: {
    marginRight: 12,
  },
  sidebarItemText: {
    color: 'white',
    fontSize: 16,
  },
  menuBadge: {
    position: 'absolute',
    right: -25,
    top: -5,
    backgroundColor: '#FF0000',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
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
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  searchSection: {
    padding: 20,
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
    paddingHorizontal: 20,
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
  // Updated gallery styles to align images to the left
  imageGalleryContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start', // Changed from center to flex-start
    alignItems: 'center',
    marginVertical: 10,
    height: 100,
  },
  galleryImageWrapper: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginRight: 10, // Changed from marginHorizontal to marginRight
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  galleryImage: {
    width: '100%',
    height: '100%',
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
    marginHorizontal: 20,
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
    marginHorizontal: 20,
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
    marginTop: -15,
    borderWidth: 3,
    borderColor: '#FFFFFF', 
    overflow: 'hidden',
  },
  iconWithBadge: {
    position: 'relative',
  },
});

export default GuestLandingPage;