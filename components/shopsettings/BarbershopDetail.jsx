import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  FlatList,
  Linking,
  Share,
  StatusBar
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, MaterialIcons, FontAwesome } from '@expo/vector-icons';
import { shopService } from '../../services/shopservice';

const { width } = Dimensions.get('window');
const imageWidth = width;
const imageHeight = width * 0.6;

const BarbershopDetail = ({ route, navigation }) => {
  const { barbershop } = route.params;
  const [loading, setLoading] = useState(true);
  const [shopDetails, setShopDetails] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchShopDetails();
  }, []);

  const fetchShopDetails = async () => {
    try {
      setLoading(true);
      console.log(`Fetching details for shop ID: ${barbershop._id}`);
      
      // Use the existing shopService.getShopById method
      const response = await shopService.getShopById(barbershop._id);
      
      if (response && response.shop) {
        console.log('Shop details fetched successfully');
        setShopDetails(response.shop);
      } else {
        console.error('Invalid response format:', response);
        setError('Could not load shop details');
      }
    } catch (err) {
      console.error('Error fetching shop details:', err);
      setError(err.message || 'Failed to load shop details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCall = () => {
    if (shopDetails && shopDetails.phone) {
      Linking.openURL(`tel:${shopDetails.phone}`);
    }
  };

  const handleDirections = () => {
    if (shopDetails) {
      // Use location data from either shopDetails or barbershop
      const address = shopDetails.address || barbershop.address;
      const city = shopDetails.city || barbershop.city;
      const state = shopDetails.state || barbershop.state;
      const zipCode = shopDetails.zipCode || barbershop.zipCode;
      
      const destination = `${address}, ${city}, ${state} ${zipCode}`;
      const url = `https://maps.google.com/?q=${encodeURIComponent(destination)}`;
      Linking.openURL(url);
    }
  };

  const handleShare = async () => {
    if (shopDetails) {
      try {
        const shopName = shopDetails.businessName || barbershop.businessName;
        const address = shopDetails.address || barbershop.address;
        const city = shopDetails.city || barbershop.city;
        const state = shopDetails.state || barbershop.state;
        
        await Share.share({
          message: `Check out ${shopName} on Barber World! ${address}, ${city}, ${state}`,
          title: shopName,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    }
  };

  const handleBookAppointment = () => {
    navigation.navigate('SchedulingScreen', { shopId: barbershop._id, shopName: shopDetails?.businessName || barbershop.businessName });
  };

  const renderImageItem = ({ item, index }) => (
    <TouchableOpacity 
      activeOpacity={0.9}
      onPress={() => setActiveImageIndex(index)}
    >
      <Image 
        source={{ uri: item }} 
        style={[
          styles.carouselImage,
          activeImageIndex === index && styles.activeCarouselImage
        ]} 
      />
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <LinearGradient
        colors={['#000000', '#333333']}
        style={styles.loadingContainer}
      >
        <ActivityIndicator size="large" color="#FF0000" />
        <Text style={styles.loadingText}>Loading shop details...</Text>
      </LinearGradient>
    );
  }

  if (error) {
    return (
      <LinearGradient
        colors={['#000000', '#333333']}
        style={styles.loadingContainer}
      >
        <MaterialIcons name="error-outline" size={50} color="#FF0000" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={fetchShopDetails}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={['#000000', '#333333']}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" translucent={true} backgroundColor="transparent" />
      
      {/* Back Button */}
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Feather name="arrow-left" size={24} color="white" />
      </TouchableOpacity>
      
      <ScrollView style={styles.scrollView}>
        {/* Main Image */}
        {shopDetails?.images && shopDetails.images.length > 0 ? (
          <View style={styles.imageContainer}>
            <Image 
              source={{ uri: shopDetails.images[activeImageIndex] }} 
              style={styles.mainImage} 
              resizeMode="cover"
            />
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.8)']}
              style={styles.imageGradient}
            />
          </View>
        ) : (
          <View style={styles.noImageContainer}>
            <Feather name="image" size={50} color="#666" />
            <Text style={styles.noImageText}>No images available</Text>
          </View>
        )}
        
        {/* Image Carousel */}
        {shopDetails?.images && shopDetails.images.length > 1 && (
          <FlatList
            data={shopDetails.images}
            renderItem={renderImageItem}
            keyExtractor={(item, index) => `image-${index}`}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.carouselContainer}
          />
        )}
        
        {/* Shop Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.shopName}>{shopDetails?.businessName || barbershop.businessName}</Text>
          
          {shopDetails?.description && (
            <Text style={styles.description}>{shopDetails.description}</Text>
          )}
          
          <View style={styles.locationContainer}>
            <Feather name="map-pin" size={18} color="#FF0000" />
            <Text style={styles.locationText}>
              {shopDetails?.address || barbershop.address}, 
              {shopDetails?.city || barbershop.city}, 
              {shopDetails?.state || barbershop.state} 
              {shopDetails?.zipCode || barbershop.zipCode}
            </Text>
          </View>
          
          {shopDetails?.phone && (
            <View style={styles.locationContainer}>
              <Feather name="phone" size={18} color="#FF0000" />
              <Text style={styles.locationText}>{shopDetails.phone}</Text>
            </View>
          )}
          
          {/* Action Buttons */}
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={handleCall}
              disabled={!shopDetails?.phone}
            >
              <Feather name="phone" size={20} color="white" />
              <Text style={styles.actionButtonText}>Call</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={handleDirections}
            >
              <Feather name="map" size={20} color="white" />
              <Text style={styles.actionButtonText}>Directions</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={handleShare}
            >
              <Feather name="share-2" size={20} color="white" />
              <Text style={styles.actionButtonText}>Share</Text>
            </TouchableOpacity>
          </View>
          
          {/* Book Appointment Button */}
          <TouchableOpacity 
            style={styles.bookButton}
            onPress={handleBookAppointment}
          >
            <Text style={styles.bookButtonText}>Book Appointment</Text>
          </TouchableOpacity>
        </View>
        
        {/* Services Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Services</Text>
          
          {shopDetails?.services && shopDetails.services.length > 0 ? (
            shopDetails.services.map((service, index) => (
              <View key={`service-${index}`} style={styles.serviceItem}>
                <View style={styles.serviceInfo}>
                  <Text style={styles.serviceName}>{service.name}</Text>
                  {service.description && (
                    <Text style={styles.serviceDescription}>{service.description}</Text>
                  )}
                </View>
                <View style={styles.servicePriceContainer}>
                  <Text style={styles.servicePrice}>${service.price}</Text>
                  <Text style={styles.serviceDuration}>{service.duration} min</Text>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.noDataText}>No services listed</Text>
          )}
        </View>
        
        {/* Barbers Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Barbers</Text>
          
          {shopDetails?.barbers && shopDetails.barbers.length > 0 ? (
            <FlatList
              data={shopDetails.barbers}
              renderItem={({ item }) => (
                <View style={styles.barberItem}>
                  {item.profileImage ? (
                    <Image source={{ uri: item.profileImage }} style={styles.barberImage} />
                  ) : (
                    <View style={styles.barberImagePlaceholder}>
                      <Feather name="user" size={30} color="#666" />
                    </View>
                  )}
                  <View style={styles.barberInfo}>
                    <Text style={styles.barberName}>{item.name}</Text>
                    {item.specialties && (
                      <Text style={styles.barberSpecialties}>
                        {item.specialties.join(', ')}
                      </Text>
                    )}
                  </View>
                </View>
              )}
              keyExtractor={(item, index) => `barber-${index}`}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.barbersContainer}
            />
          ) : (
            <Text style={styles.noDataText}>No barbers listed</Text>
          )}
        </View>
        
        {/* Hours Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Business Hours</Text>
          
          {shopDetails?.hours ? (
            <View style={styles.hoursContainer}>
              {Object.entries(shopDetails.hours).map(([day, hours]) => (
                <View key={day} style={styles.hourRow}>
                  <Text style={styles.dayText}>{day}</Text>
                  <Text style={styles.hoursText}>
                    {hours.open ? `${hours.open} - ${hours.close}` : 'Closed'}
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.noDataText}>No business hours listed</Text>
          )}
        </View>
        
        {/* Reviews Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Reviews</Text>
          
          {shopDetails?.reviews && shopDetails.reviews.length > 0 ? (
            shopDetails.reviews.map((review, index) => (
              <View key={`review-${index}`} style={styles.reviewItem}>
                <View style={styles.reviewHeader}>
                  <Text style={styles.reviewerName}>{review.userName}</Text>
                  <View style={styles.ratingContainer}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <FontAwesome
                        key={`star-${star}`}
                        name={star <= review.rating ? "star" : "star-o"}
                        size={16}
                        color={star <= review.rating ? "#FFD700" : "#666"}
                        style={styles.starIcon}
                      />
                    ))}
                  </View>
                </View>
                <Text style={styles.reviewDate}>
                  {new Date(review.date).toLocaleDateString()}
                </Text>
                <Text style={styles.reviewText}>{review.comment}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.noDataText}>No reviews yet</Text>
          )}
        </View>
        
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Powered by Barber World
          </Text>
        </View>
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
  errorText: {
    color: 'white',
    marginTop: 10,
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 30,
  },
  retryButton: {
    backgroundColor: '#FF0000',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 20,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 8,
  },
  imageContainer: {
    width: imageWidth,
    height: imageHeight,
    position: 'relative',
  },
  mainImage: {
    width: '100%',
    height: '100%',
  },
  imageGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  noImageContainer: {
    width: imageWidth,
    height: imageHeight,
    backgroundColor: '#222',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noImageText: {
    color: '#666',
    marginTop: 10,
  },
  carouselContainer: {
    padding: 10,
    backgroundColor: '#222',
  },
  carouselImage: {
    width: 80,
    height: 60,
    borderRadius: 4,
    marginRight: 10,
    opacity: 0.7,
  },
  activeCarouselImage: {
    opacity: 1,
    borderWidth: 2,
    borderColor: '#FF0000',
  },
  infoContainer: {
    padding: 20,
  },
  shopName: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  description: {
    color: '#CCC',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 15,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  locationText: {
    color: '#CCC',
    fontSize: 14,
    marginLeft: 10,
    flex: 1,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 20,
  },
  actionButton: {
    backgroundColor: '#333',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
  },
  actionButtonText: {
    color: 'white',
    marginTop: 5,
    fontSize: 12,
  },
  bookButton: {
    backgroundColor: '#FF0000',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  bookButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  sectionContainer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  sectionTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  serviceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  serviceDescription: {
    color: '#999',
    fontSize: 14,
  },
  servicePriceContainer: {
    alignItems: 'flex-end',
  },
  servicePrice: {
    color: '#FF0000',
    fontSize: 18,
    fontWeight: 'bold',
  },
  serviceDuration: {
    color: '#999',
    fontSize: 12,
    marginTop: 4,
  },
  noDataText: {
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
    marginVertical: 20,
  },
  barbersContainer: {
    paddingVertical: 10,
  },
  barberItem: {
    width: 120,
    marginRight: 15,
    alignItems: 'center',
  },
  barberImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 10,
  },
  barberImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  barberInfo: {
    alignItems: 'center',
  },
  barberName: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  barberSpecialties: {
    color: '#999',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
  },
  hoursContainer: {
    marginTop: 10,
  },
  hourRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  dayText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  hoursText: {
    color: '#CCC',
    fontSize: 16,
  },
  reviewItem: {
    backgroundColor: '#222',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  reviewerName: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  ratingContainer: {
    flexDirection: 'row',
  },
  starIcon: {
    marginLeft: 2,
  },
  reviewDate: {
    color: '#999',
    fontSize: 12,
    marginBottom: 8,
  },
  reviewText: {
    color: '#CCC',
    fontSize: 14,
    lineHeight: 20,
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    color: '#666',
    fontSize: 12,
  },
});

export default BarbershopDetail;