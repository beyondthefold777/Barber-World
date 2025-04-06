import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StatusBar,
  Image,
  Dimensions,
  TextInput
} from 'react-native';
import { CardField, useStripe } from '@stripe/stripe-react-native';
import { Feather, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import axios from 'axios';

const TrialSignup = ({ navigation }) => {
  const { createPaymentMethod, confirmPayment } = useStripe();
  const [isLoading, setIsLoading] = useState(false);
  const [cardComplete, setCardComplete] = useState(false);
  const [cardDetails, setCardDetails] = useState(null);
  const scrollViewRef = useRef();
  
  // Billing information state
  const [billingInfo, setBillingInfo] = useState({
    name: '',
    email: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'US'
  });
  
  // Payment method selection state
  const [paymentMethod, setPaymentMethod] = useState('card');

  // Handle form submission
// Update the handleSubmit function to match your server's expectations
const handleSubmit = async () => {
  // Validate billing information
  if (!validateBillingInfo()) {
    Alert.alert('Missing Information', 'Please complete all billing information fields');
    return;
  }
    
  if (paymentMethod === 'card' && !cardComplete) {
    Alert.alert('Please complete card details');
    return;
  }
    
  try {
    setIsLoading(true);
        
    console.log('Creating payment method with type:', paymentMethod);
    console.log('Card details:', cardDetails);
        
    // Create a payment method using Stripe React Native SDK
    const { paymentMethod: stripePaymentMethod, error } = await createPaymentMethod({
      paymentMethodType: 'Card',
      card: cardDetails,
      billingDetails: {
        name: billingInfo.name,
        email: billingInfo.email,
        address: {
          line1: billingInfo.address,
          city: billingInfo.city,
          state: billingInfo.state,
          postalCode: billingInfo.zipCode,
          country: billingInfo.country,
        },
      },
    });
        
    if (error) {
      console.error('Error creating payment method:', error);
      Alert.alert('Payment Method Error', error.message);
      setIsLoading(false);
      return;
    }
        
    console.log('Payment method created successfully:', stripePaymentMethod.id);
        
    // Send data to your server
    const response = await axios.post('https://barber-world.fly.dev/api/stripe/create-trial', {
      paymentMethodId: stripePaymentMethod.id,
      shopName: "My Barbershop", // Add a default or get from previous screen
      ownerName: billingInfo.name,
      email: billingInfo.email,
      phone: "", // Add a phone field to your form if needed
      address: billingInfo.address + ", " + billingInfo.city + ", " + billingInfo.state + " " + billingInfo.zipCode,
      numberOfChairs: 1 // Add a field to your form if needed
    });
        
    console.log('Trial signup response:', response.status, response.data);
        
    if (response.data.success) {
      Alert.alert(
        'Success!',
        'Your trial has been activated. You now have full access to all premium features.',
        [{ text: 'OK', onPress: () => navigation.navigate('BarbershopDashboard') }]
      );
    } else {
      Alert.alert('Error', response.data.message || 'Something went wrong');
    }
  } catch (error) {
    console.error('Error creating trial:', error);
        
    // Enhanced error logging
    if (error.response) {
      // The server responded with a status code outside of 2xx
      console.error('Server error details:', {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers
      });
      Alert.alert('Server Error', `Status: ${error.response.status}\n${JSON.stringify(error.response.data) || 'Unknown error'}`);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received:', error.request);
      Alert.alert('Network Error', 'No response received from server. Please check your internet connection.');
    } else {
      // Something happened in setting up the request
      console.error('Request setup error:', {
        message: error.message,
        stack: error.stack
      });
      Alert.alert('Error', error.message || 'Something went wrong');
    }
  } finally {
    setIsLoading(false);
  }
};


  // Validate billing information
  const validateBillingInfo = () => {
    for (const key in billingInfo) {
      if (!billingInfo[key]) {
        return false;
      }
    }
    return true;
  };

  // Handle billing info changes
  const handleBillingInfoChange = (field, value) => {
    setBillingInfo({
      ...billingInfo,
      [field]: value
    });
  };

  const features = [
    {
      title: "Financial Management",
      icon: "dollar-sign",
      items: [
        "Tax preparation & 1099 forms",
        "Business expense tracking",
        "Income projections & analytics",
        "Digital receipts & invoicing",
        "Payment history & reporting"
      ]
    },
    {
      title: "Marketing Tools",
      icon: "trending-up",
      items: [
        "Client retention campaigns",
        "Social media integration",
        "Automated review requests",
        "Promotional message blasts",
        "Performance tracking dashboard"
      ]
    },
    {
      title: "Business Operations",
      icon: "briefcase",
      items: [
        "Advanced appointment scheduling",
        "Client management system",
        "Service catalog customization",
        "Employee management tools",
        "Chair rental tracking"
      ]
    },
    {
      title: "Client Experience",
      icon: "users",
      items: [
        "Client profiles with preferences",
        "Automated appointment reminders",
        "Client loyalty program",
        "Digital check-in system",
        "Personalized marketing"
      ]
    }
  ];
  
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
        <Text style={styles.title}>Premium Membership</Text>
        <View style={styles.topRightImage}>
          <Image 
            source={require('../assets/clippers1.png')}
            style={{width: 40, height: 40}}
          />
        </View>
      </View>
      
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerContainer}>
          <Text style={styles.mainTitle}>Unlock Your Shop's Full Potential</Text>
          <Text style={styles.subtitle}>
            Start your 14-day free trial today. No charges until trial ends.
          </Text>
        </View>
        
        <View style={styles.pricingContainer}>
          <View style={styles.pricingHeader}>
            <Text style={styles.pricingTitle}>Premium Membership</Text>
            <View style={styles.priceRow}>
              <Text style={styles.currency}>$</Text>
              <Text style={styles.price}>29</Text>
              <View style={styles.periodContainer}>
                <Text style={styles.cents}>.99</Text>
                <Text style={styles.period}>/month</Text>
              </View>
            </View>
            <Text style={styles.billingInfo}>After 14-day free trial</Text>
          </View>
        </View>
        
        {features.map((category, index) => (
          <View key={index} style={styles.featureCategory}>
            <View style={styles.categoryHeader}>
              <Feather name={category.icon} size={24} color="#FF0000" />
              <Text style={styles.categoryTitle}>{category.title}</Text>
            </View>
            
            {category.items.map((item, itemIndex) => (
              <View key={itemIndex} style={styles.featureItem}>
                <Feather name="check" size={18} color="#FF0000" />
                <Text style={styles.featureText}>{item}</Text>
              </View>
            ))}
          </View>
        ))}
        
        {/* Billing Information Section */}
        <View style={styles.cardContainer}>
          <Text style={styles.cardTitle}>Billing Information</Text>
          <Text style={styles.cardDescription}>
            Please provide your billing details for your subscription.
          </Text>
          
          <View style={styles.inputRow}>
            <Text style={styles.fieldLabel}>Full Name</Text>
            <TextInput
              style={styles.input}
              placeholder="John Doe"
              placeholderTextColor="#999999"
              value={billingInfo.name}
              onChangeText={(text) => handleBillingInfoChange('name', text)}
            />
          </View>
          
          <View style={styles.inputRow}>
            <Text style={styles.fieldLabel}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="your@email.com"
              placeholderTextColor="#999999"
              keyboardType="email-address"
              value={billingInfo.email}
              onChangeText={(text) => handleBillingInfoChange('email', text)}
            />
          </View>
          
          <View style={styles.inputRow}>
            <Text style={styles.fieldLabel}>Address</Text>
            <TextInput
              style={styles.input}
              placeholder="123 Main St"
              placeholderTextColor="#999999"
              value={billingInfo.address}
              onChangeText={(text) => handleBillingInfoChange('address', text)}
            />
          </View>
          
          <View style={styles.inputRow}>
            <Text style={styles.fieldLabel}>City</Text>
            <TextInput
              style={styles.input}
              placeholder="New York"
              placeholderTextColor="#999999"
              value={billingInfo.city}
              onChangeText={(text) => handleBillingInfoChange('city', text)}
            />
          </View>
          
          <View style={styles.inputRowHalf}>
            <View style={styles.halfInput}>
              <Text style={styles.fieldLabel}>State</Text>
              <TextInput
                style={styles.input}
                placeholder="NY"
                placeholderTextColor="#999999"
                value={billingInfo.state}
                onChangeText={(text) => handleBillingInfoChange('state', text)}
              />
            </View>
            
            <View style={styles.halfInput}>
              <Text style={styles.fieldLabel}>ZIP Code</Text>
              <TextInput
                style={styles.input}
                placeholder="10001"
                placeholderTextColor="#999999"
                keyboardType="numeric"
                value={billingInfo.zipCode}
                onChangeText={(text) => handleBillingInfoChange('zipCode', text)}
              />
            </View>
          </View>
        </View>
        
        {/* Payment Method Selection */}
        <View style={styles.cardContainer}>
          <Text style={styles.cardTitle}>Payment Method</Text>
          <Text style={styles.cardDescription}>
            Choose your preferred payment method.
          </Text>
          
          <View style={styles.paymentMethodContainer}>
            <TouchableOpacity 
              style={[
                styles.paymentMethodOption,
                paymentMethod === 'card' && styles.selectedPaymentMethod
              ]}
              onPress={() => setPaymentMethod('card')}
            >
              <Feather name="credit-card" size={24} color={paymentMethod === 'card' ? "#FF0000" : "#BBBBBB"} />
              <Text style={[
                styles.paymentMethodText,
                paymentMethod === 'card' && styles.selectedPaymentMethodText
              ]}>Credit Card</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.paymentMethodOption,
                paymentMethod === 'paypal' && styles.selectedPaymentMethod
              ]}
              onPress={() => {
                setPaymentMethod('paypal');
                Alert.alert('Coming Soon', 'PayPal integration will be available soon. Please use a credit card for now.');
                setPaymentMethod('card');
              }}
            >
              <FontAwesome5 name="paypal" size={24} color="#BBBBBB" />
              <Text style={styles.paymentMethodText}>PayPal</Text>
            </TouchableOpacity>
          </View>
          
          {paymentMethod === 'card' && (
            <>
              <Text style={styles.fieldLabel}>Card Details</Text>
              <CardField
                postalCodeEnabled={true}
                placeholder={{
                  number: '4242 4242 4242 4242',
                  expiration: 'MM/YY',
                  cvc: 'CVC',
                  postalCode: 'ZIP',
                }}
                cardStyle={styles.cardStyle}
                style={styles.cardField}
                onCardChange={(cardDetails) => {
                  console.log('Card details:', cardDetails);
                  setCardDetails(cardDetails);
                  setCardComplete(cardDetails.complete);
                }}
              />
            </>
          )}
          
          <View style={styles.securityNote}>
            <Feather name="lock" size={16} color="#BBBBBB" />
            <Text style={styles.securityText}>
              Your payment information is securely processed by Stripe.
            </Text>
          </View>
        </View>
        
        <TouchableOpacity
          style={[
            styles.startTrialButton,
            (!cardComplete || !validateBillingInfo()) && styles.disabledButton,
            isLoading && styles.loadingButton,
          ]}
          onPress={handleSubmit}
          disabled={(!cardComplete || !validateBillingInfo()) || isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.startTrialText}>Start 14-Day Free Trial</Text>
          )}
        </TouchableOpacity>
        
        <View style={styles.guaranteeContainer}>
          <Feather name="shield" size={20} color="#BBBBBB" />
          <Text style={styles.guaranteeText}>
            100% secure payment. Cancel anytime during trial period.
          </Text>
        </View>
      </ScrollView>
      
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
            scrollContent: {
              padding: 20,
              paddingBottom: 40,
            },
            headerContainer: {
              marginBottom: 25,
              alignItems: 'center',
            },
            mainTitle: {
              fontSize: 24,
              fontWeight: 'bold',
              color: '#FFFFFF',
              textAlign: 'center',
              marginBottom: 10,
            },
            subtitle: {
              fontSize: 16,
              color: '#BBBBBB',
              textAlign: 'center',
              lineHeight: 22,
            },
            pricingContainer: {
              backgroundColor: '#000000',
              borderRadius: 12,
              borderWidth: 2,
              borderColor: '#FF0000',
              padding: 20,
              marginBottom: 25,
              alignItems: 'center',
              shadowColor: '#FF0000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.3,
              shadowRadius: 4,
              elevation: 5,
            },
            pricingHeader: {
              alignItems: 'center',
            },
            pricingTitle: {
              fontSize: 20,
              fontWeight: 'bold',
              color: '#FFFFFF',
              marginBottom: 15,
            },
            priceRow: {
              flexDirection: 'row',
              alignItems: 'flex-start',
              justifyContent: 'center',
            },
            currency: {
              fontSize: 24,
              fontWeight: 'bold',
              color: '#FFFFFF',
              marginTop: 5,
            },
            price: {
              fontSize: 48,
              fontWeight: 'bold',
              color: '#FFFFFF',
            },
            periodContainer: {
              flexDirection: 'column',
              alignItems: 'flex-start',
              justifyContent: 'flex-start',
            },
            cents: {
              fontSize: 20,
              fontWeight: 'bold',
              color: '#FFFFFF',
            },
            period: {
              fontSize: 16,
              color: '#BBBBBB',
            },
            billingInfo: {
              fontSize: 14,
              color: '#BBBBBB',
              marginTop: 10,
            },
            featureCategory: {
              backgroundColor: '#000000',
              borderRadius: 12,
              borderWidth: 1,
              borderColor: '#444444',
              padding: 20,
              marginBottom: 20,
            },
            categoryHeader: {
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 15,
            },
            categoryTitle: {
              fontSize: 18,
              fontWeight: 'bold',
              color: '#FFFFFF',
              marginLeft: 10,
            },
            featureItem: {
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 12,
            },
            featureText: {
              fontSize: 15,
              color: '#DDDDDD',
              marginLeft: 10,
            },
            cardContainer: {
              backgroundColor: '#000000',
              borderRadius: 12,
              borderWidth: 1,
              borderColor: '#444444',
              padding: 20,
              marginBottom: 25,
            },
            cardTitle: {
              fontSize: 18,
              fontWeight: 'bold',
              color: '#FFFFFF',
              marginBottom: 10,
            },
            cardDescription: {
              fontSize: 14,
              color: '#BBBBBB',
              marginBottom: 20,
              lineHeight: 20,
            },
            fieldLabel: {
              fontSize: 16,
              fontWeight: '500',
              color: '#FFFFFF',
              marginBottom: 8,
            },
            cardField: {
              width: '100%',
              height: 50,
              marginBottom: 15,
            },
            cardStyle: {
              backgroundColor: '#222222',
              borderRadius: 8,
              borderWidth: 1,
              borderColor: '#444444',
              textColor: '#FFFFFF',
              placeholderColor: '#999999',
              fontSize: 16,
            },
            securityNote: {
              flexDirection: 'row',
              alignItems: 'center',
              marginTop: 5,
            },
            securityText: {
              color: '#BBBBBB',
              fontSize: 14,
              marginLeft: 8,
            },
            startTrialButton: {
              backgroundColor: '#FF0000',
              borderRadius: 10,
              paddingVertical: 16,
              alignItems: 'center',
              marginBottom: 20,
            },
            startTrialText: {
              color: '#FFFFFF',
              fontSize: 18,
              fontWeight: 'bold',
            },
            disabledButton: {
              backgroundColor: '#661111',
              opacity: 0.7,
            },
            loadingButton: {
              backgroundColor: '#FF0000',
              opacity: 0.8,
            },
            guaranteeContainer: {
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 30,
            },
            guaranteeText: {
              color: '#BBBBBB',
              fontSize: 14,
              marginLeft: 8,
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
            // New styles for billing info and payment method selection
            input: {
              backgroundColor: '#222222',
              borderRadius: 8,
              borderWidth: 1,
              borderColor: '#444444',
              color: '#FFFFFF',
              paddingHorizontal: 15,
              paddingVertical: 12,
              fontSize: 16,
              width: '100%',
            },
            inputRow: {
              marginBottom: 15,
            },
            inputRowHalf: {
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginBottom: 15,
            },
            halfInput: {
              width: '48%',
            },
            paymentMethodContainer: {
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginBottom: 20,
            },
            paymentMethodOption: {
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#222222',
              borderRadius: 8,
              borderWidth: 1,
              borderColor: '#444444',
              padding: 15,
              width: '48%',
            },
            selectedPaymentMethod: {
              borderColor: '#FF0000',
              backgroundColor: 'rgba(255, 0, 0, 0.1)',
            },
            paymentMethodText: {
              color: '#FFFFFF',
              fontSize: 16,
              marginLeft: 10,
            },
            selectedPaymentMethodText: {
              color: '#FF0000',
              fontWeight: 'bold',
            },
          });
          
          export default TrialSignup;
          
