import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, FontAwesome } from '@expo/vector-icons';
import { shopService } from '../../services/api';

const BarbershopDetail = ({ route, navigation }) => {
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Extract shopId from route params with safety check
  const shopId = route.params?.shopId;
  
  useEffect(() => {
    const fetchShopDetails = async () => {
      if (!shopId) {
        console.error('No shop ID provided in navigation params');
        setError('Shop ID is missing');
        setLoading(false);
        return;
      }
      
      try {
        console.log('Fetching shop details for ID:', shopId);
        const shopData = await shopService.getShopById(shopId);
        console.log('Shop data received:', shopData);
        setShop(shopData);
      } catch (error) {
        console.error('Error fetching shop details:', error);
        setError('Failed to load barbershop details');
      } finally {
        setLoading(false);
      }
    };

    fetchShopDetails();
  }, [shopId]);

  const handleBookAppointment = () => {
    if (!shop) return;
    
    navigation.navigate('SchedulingScreen', { 
      shopId: shop._id,
      shopName: shop.businessName || shop.name
    });
  };

  if (loading) {
    return (
      <LinearGradient colors={['#000000', '#333333']} style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF0000" />
        <Text style={styles.loadingText}>Loading barbershop details...</Text>
      </LinearGradient>
    );
  }

  if (error || !shop) {
    return (
      <LinearGradient colors={['#000000', '#333333']} style={styles.errorContainer}>
        <FontAwesome name="exclamation-triangle" size={50} color="#FF0000" />
        <Text style={styles.errorText}>{error || 'Failed to load barbershop'}</Text>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </LinearGradient>
    );
  }

  // Get address information from either location object or direct properties
  const address = shop.location?.address || shop.address || '';
  const city = shop.location?.city || shop.city || '';
  const state = shop.location?.state || shop.state || '';
  const zipCode = shop.location?.zip || shop.zipCode || '';

  return (
    <LinearGradient colors={['#000000', '#333333']} style={styles.container}>
      <ScrollView>
        {/* Header with back button */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Feather name="arrow-left" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Barbershop Details</Text>
        </View>
        
        {/* Shop Image */}
        <View style={styles.imageContainer}>
          {shop.images && shop.images.length > 0 ? (
            <Image 
              source={{ uri: shop.images[0] }}
              style={styles.shopImage}
              resizeMode="cover"
            />
          ) : (
            <Image 
              source={require('../../assets/barbershop.png')}
              style={styles.shopImage}
              resizeMode="cover"
            />
          )}
        </View>
        
        {/* Shop Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.shopName}>{shop.businessName || shop.name}</Text>
          <View style={styles.ratingContainer}>
            <FontAwesome name="star" size={16} color="#FFD700" />
            <Text style={styles.ratingText}>
              {shop.rating ? `${shop.rating.toFixed(1)} (${shop.reviewCount || 0} reviews)` : 'No ratings yet'}
            </Text>
          </View>
          
          <View style={styles.addressContainer}>
            <Feather name="map-pin" size={16} color="#FF0000" />
            <Text style={styles.addressText}>{address}</Text>
          </View>
          <Text style={styles.locationText}>{`${city}, ${state} ${zipCode}`}</Text>
          
          {shop.phone && (
            <View style={styles.contactContainer}>
              <Feather name="phone" size={16} color="#FF0000" />
              <Text style={styles.contactText}>{shop.phone}</Text>
            </View>
          )}
          
          {shop.email && (
            <View style={styles.contactContainer}>
              <Feather name="mail" size={16} color="#FF0000" />
              <Text style={styles.contactText}>{shop.email}</Text>
            </View>
          )}
        </View>
        
        {/* Services */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Services</Text>
          {shop.services && shop.services.length > 0 ? (
            shop.services.map((service, index) => (
              <View key={index} style={styles.serviceItem}>
                <Text style={styles.serviceName}>{service.name}</Text>
                <Text style={styles.servicePrice}>${typeof service.price === 'number' ? service.price.toFixed(2) : service.price}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.noContentText}>No services listed</Text>
          )}
        </View>
        
        {/* Hours */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Business Hours</Text>
          {shop.hours ? (
            Object.entries(shop.hours).map(([day, hours]) => (
              <View key={day} style={styles.hoursItem}>
                <Text style={styles.dayText}>{day.charAt(0).toUpperCase() + day.slice(1)}</Text>
                <Text style={styles.hoursText}>{hours || 'Closed'}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.noContentText}>Hours not available</Text>
          )}
        </View>
        
        {/* About */}
        {shop.description && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.descriptionText}>{shop.description}</Text>
          </View>
        )}
        
        {/* Book Appointment Button */}
        <TouchableOpacity 
          style={styles.bookButton}
          onPress={handleBookAppointment}
        >
          <Text style={styles.bookButtonText}>Book Appointment</Text>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: 'white',
    marginTop: 10,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: 'white',
    marginTop: 20,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    paddingTop: 50,
  },
  backButton: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#FF0000',
  },
  backButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 15,
  },
  imageContainer: {
    width: '100%',
    height: 200,
    marginBottom: 15,
  },
  shopImage: {
    width: '100%',
    height: '100%',
  },
  infoContainer: {
    padding: 15,
  },
  shopName: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  ratingText: {
    color: '#FFD700',
    marginLeft: 5,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  addressText: {
    color: 'white',
    marginLeft: 5,
  },
  locationText: {
    color: '#CCC',
    marginLeft: 21,
    marginBottom: 10,
  },
  contactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  contactText: {
    color: 'white',
    marginLeft: 5,
  },
  sectionContainer: {
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#444',
  },
  sectionTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  serviceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  serviceName: {
    color: 'white',
  },
  servicePrice: {
    color: '#FF0000',
    fontWeight: 'bold',
  },
  hoursItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  dayText: {
    color: 'white',
    fontWeight: 'bold',
  },
  hoursText: {
    color: '#CCC',
  },
  descriptionText: {
    color: '#CCC',
    lineHeight: 22,
  },
  noContentText: {
    color: '#999',
    fontStyle: 'italic',
  },
  bookButton: {
    backgroundColor: '#FF0000',
    padding: 15,
    margin: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 30,
  },
  bookButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default BarbershopDetail;