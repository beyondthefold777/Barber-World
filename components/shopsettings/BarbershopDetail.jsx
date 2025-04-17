import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  FlatList,
  Dimensions,
  TextInput,
  Modal
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, FontAwesome } from '@expo/vector-icons';
import { shopService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import reviewService from '../../services/reviewService';
import AsyncStorage from '@react-native-async-storage/async-storage'; 

const { width } = Dimensions.get('window');

const BarbershopDetail = ({ route, navigation }) => {
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [reviewText, setReviewText] = useState('');
  const [rating, setRating] = useState(0);
  const [reviews, setReviews] = useState([]);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [loadingReviews, setLoadingReviews] = useState(false);
  
  // Get auth context to check if user is logged in
  const { user } = useAuth();
  
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
        
        // Fetch reviews separately
        fetchReviews();
      } catch (error) {
        console.error('Error fetching shop details:', error);
        setError('Failed to load barbershop details');
      } finally {
        setLoading(false);
      }
    };
    
    fetchShopDetails();
  }, [shopId]);
  
  const fetchReviews = async () => {
    if (!shopId) return;
    
    setLoadingReviews(true);
    try {
      console.log('Fetching reviews for shop', shopId);
      const response = await reviewService.getShopReviews(shopId);
      console.log('Successfully fetched', response.reviews?.length || 0, 'reviews');
      
      if (response.success && Array.isArray(response.reviews)) {
        setReviews(response.reviews);
      } else {
        console.error('Invalid reviews response:', response);
        setReviews([]);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setReviews([]);
      // Don't set error state here to avoid blocking the whole screen
    } finally {
      setLoadingReviews(false);
    }
  };

  const handleBookAppointment = () => {
    if (!shop) return;
    
    navigation.navigate('SchedulingScreen', { 
      shopId: shop._id,
      shopName: shop.businessName || shop.name
    });
  };

  const handleSubmitReview = async () => {
    if (submittingReview) return; // Prevent double submission
    
    if (rating === 0) {
      Alert.alert('Error', 'Please select a rating');
      return;
    }
    
    if (reviewText.trim() === '') {
      Alert.alert('Error', 'Please enter a review');
      return;
    }
    
    setSubmittingReview(true);
    
    try {
      const reviewData = {
        rating,
        text: reviewText
      };
      
      console.log('Submitting review for shop', shopId, 'with data:', reviewData);
      
      // Get the auth token from AsyncStorage
      const token = await AsyncStorage.getItem('userToken');
      console.log('Auth token available:', !!token);
      
      // Pass the token to the review service
      const response = await reviewService.submitShopReview(shopId, reviewData, token);
      console.log('Review submission response:', response);
      
      if (response.success) {
        // Update the shop's rating and review count
        setShop({
          ...shop,
          rating: response.shopRating || shop.rating,
          reviewCount: response.reviewCount || (shop.reviewCount || 0) + 1
        });
        
        // Instead of manually adding the review, fetch all reviews again
        await fetchReviews();
        
        // Close the modal and reset form
        setReviewModalVisible(false);
        setReviewText('');
        setRating(0);
        
        Alert.alert('Success', 'Your review has been submitted!');
      } else {
        Alert.alert('Error', response.message || 'Failed to submit review');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      Alert.alert('Error', 'Failed to submit review. Please try again.');
    } finally {
      setSubmittingReview(false);
    }
  };
  
  // Render a gallery item
  const renderGalleryItem = ({ item }) => (
    <TouchableOpacity style={styles.galleryItem}>
      <Image 
        source={{ uri: item }}
        style={styles.galleryImage}
        resizeMode="cover"
      />
    </TouchableOpacity>
  );

  // Render a review item
  const renderReviewItem = ({ item }) => (
    <View style={styles.reviewItem}>
      <View style={styles.reviewHeader}>
        <Text style={styles.reviewerName}>{item.user?.name || 'Anonymous'}</Text>
        <View style={styles.reviewRating}>
          {[1, 2, 3, 4, 5].map(star => (
            <FontAwesome 
              key={star}
              name="star" 
              size={14} 
              color={star <= item.rating ? '#FFD700' : '#444'} 
              style={styles.starIcon}
            />
          ))}
          <Text style={styles.reviewDate}>
            {new Date(item.date).toLocaleDateString()}
          </Text>
        </View>
      </View>
      <Text style={styles.reviewText}>{item.text}</Text>
    </View>
  );

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
        
        {/* Shop Image - Always use barbershop.png as the main header image */}
        <View style={styles.imageContainer}>
          <Image 
            source={require('../../assets/barbershop.png')}
            style={styles.shopImage}
            resizeMode="contain"
          />
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
        
        {/* About */}
        {shop.description && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.descriptionText}>{shop.description}</Text>
          </View>
        )}
        
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
        
        {/* Gallery Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Gallery</Text>
          {shop.images && shop.images.length > 0 ? (
            <FlatList
              data={shop.images}
              renderItem={renderGalleryItem}
              keyExtractor={(item, index) => index.toString()}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.galleryContainer}
            />
          ) : (
            <Text style={styles.noContentText}>No gallery images available</Text>
          )}
        </View>
        
        {/* Reviews Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.reviewsHeader}>
            <Text style={styles.sectionTitle}>Customer Reviews</Text>
            <TouchableOpacity 
              style={styles.writeReviewButton}
              onPress={() => setReviewModalVisible(true)} // Removed authentication check
            >
              <Text style={styles.writeReviewText}>Write a Review</Text>
            </TouchableOpacity>
          </View>
          
          {loadingReviews ? (
            <ActivityIndicator size="small" color="#FF0000" style={{marginVertical: 20}} />
          ) : reviews && reviews.length > 0 ? (
            <FlatList
            data={reviews}
            renderItem={renderReviewItem}
            keyExtractor={(item) => item._id?.toString() || `review-${Math.random()}`}
            scrollEnabled={false}
            contentContainerStyle={styles.reviewsContainer}
          />
          
          ) : (
            <Text style={styles.noContentText}>No reviews yet. Be the first to review!</Text>
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
        
        {/* Book Appointment Button */}
        <TouchableOpacity 
          style={styles.bookButton}
          onPress={handleBookAppointment}
        >
          <Text style={styles.bookButtonText}>Book Appointment</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Review Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={reviewModalVisible}
        onRequestClose={() => setReviewModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Write a Review</Text>
              <TouchableOpacity onPress={() => setReviewModalVisible(false)}>
                <Feather name="x" size={24} color="white" />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.ratingLabel}>Your Rating:</Text>
            <View style={styles.starRatingContainer}>
              {[1, 2, 3, 4, 5].map(star => (
                <TouchableOpacity 
                  key={star}
                  onPress={() => setRating(star)}
                >
                  <FontAwesome 
                    name="star" 
                    size={30} 
                    color={star <= rating ? '#FFD700' : '#444'} 
                    style={styles.starRatingIcon}
                  />
                </TouchableOpacity>
              ))}
            </View>
            
            <Text style={styles.reviewLabel}>Your Review:</Text>
            <TextInput
              style={styles.reviewInput}
              placeholder="Share your experience with this barbershop..."
              placeholderTextColor="#999"
              multiline={true}
              numberOfLines={5}
              value={reviewText}
              onChangeText={setReviewText}
            />
            
            <TouchableOpacity 
              style={styles.submitButton}
              onPress={handleSubmitReview}
              disabled={submittingReview}
            >
              <Text style={styles.submitButtonText}>
                {submittingReview ? 'Submitting...' : 'Submit Review'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    width: width,
    height: 220,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
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
  galleryContainer: {
    paddingVertical: 10,
  },
  galleryItem: {
    marginRight: 10,
    borderRadius: 8,
    overflow: 'hidden',
    width: 150,
    height: 150,
  },
  galleryImage: {
    width: '100%',
    height: '100%',
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
  // Review section styles
  reviewsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  writeReviewButton: {
    backgroundColor: '#FF0000',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  writeReviewText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  reviewsContainer: {
    paddingBottom: 10,
  },
  reviewItem: {
    backgroundColor: '#222',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#FF0000',
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewerName: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  reviewRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starIcon: {
    marginLeft: 2,
  },
  reviewDate: {
    color: '#999',
    fontSize: 12,
    marginLeft: 8,
  },
  reviewText: {
    color: '#CCC',
    fontSize: 14,
    lineHeight: 20,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#222',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    maxWidth: 500,
    borderWidth: 1,
    borderColor: '#444',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#444',
  },
  modalTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  ratingLabel: {
    color: 'white',
    fontSize: 16,
    marginBottom: 10,
  },
  starRatingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  starRatingIcon: {
    marginHorizontal: 5,
  },
  reviewLabel: {
    color: 'white',
    fontSize: 16,
    marginBottom: 10,
  },
  reviewInput: {
    backgroundColor: '#333',
    color: 'white',
    padding: 15,
    borderRadius: 8,
    height: 120,
    textAlignVertical: 'top',
    marginBottom: 20,
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: '#FF0000',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default BarbershopDetail;

