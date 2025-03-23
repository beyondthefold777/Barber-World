import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Platform,
  KeyboardAvoidingView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, FontAwesome } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';


const TrialSignup = () => {
  const navigation = useNavigation();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    shopName: '',
    ownerName: '',
    email: '',
    phone: '',
    address: '',
    numberOfChairs: '',
    paymentMethod: null,
    cardNumber: '',
    cardExpiry: '',
    cardCVC: '',
    cardName: ''
  });


  const features = [
    {
      title: "Complete Business Suite",
      description: "All-in-one management platform for modern barbershops",
      icon: "briefcase"
    },
    {
      title: "Smart Scheduling",
      description: "AI-powered booking system with client management",
      icon: "calendar"
    },
    {
      title: "Financial Tools",
      description: "Track revenue, expenses, and tax documentation",
      icon: "dollar-sign"
    },
    {
      title: "Marketing Suite",
      description: "Social media integration and client engagement tools",
      icon: "trending-up"
    },
    {
      title: "Premium Support",
      description: "24/7 dedicated customer service for your business",
      icon: "headphones"
    }
  ];


  const handlePaymentSelection = (method) => {
    setFormData({...formData, paymentMethod: method});
  };


  const handleNextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      // Handle trial activation
      navigation.replace('Dashboard');
    }
  };


  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const formatCardNumber = (text) => {
    // Remove any non-digit characters
    const cleaned = text.replace(/\D/g, '');
    // Add space after every 4 digits
    const formatted = cleaned.replace(/(\d{4})(?=\d)/g, '$1 ');
    // Limit to 19 characters (16 digits + 3 spaces)
    return formatted.slice(0, 19);
  };

  const formatExpiry = (text) => {
    // Remove any non-digit characters
    const cleaned = text.replace(/\D/g, '');
    // Format as MM/YY
    if (cleaned.length > 2) {
      return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`;
    }
    return cleaned;
  };

  const renderStep = () => {
    switch(currentStep) {
      case 1:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Start Your Success Story</Text>
            <Text style={styles.stepSubtitle}>14-Day Free Trial • Then $25/month</Text>
            
            <View style={styles.featuresList}>
              {features.map((feature, index) => (
                <View key={index} style={styles.featureItem}>
                  <View style={styles.featureIcon}>
                    <Feather name={feature.icon} size={24} color="#FF0000" />
                  </View>
                  <View style={styles.featureContent}>
                    <Text style={styles.featureTitle}>{feature.title}</Text>
                    <Text style={styles.featureDescription}>{feature.description}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        );
      
      case 2:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Shop Details</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Shop Name"
                placeholderTextColor="#666"
                value={formData.shopName}
                onChangeText={(text) => setFormData({...formData, shopName: text})}
              />
              <TextInput
                style={styles.input}
                placeholder="Owner Name"
                placeholderTextColor="#666"
                value={formData.ownerName}
                onChangeText={(text) => setFormData({...formData, ownerName: text})}
              />
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#666"
                keyboardType="email-address"
                value={formData.email}
                onChangeText={(text) => setFormData({...formData, email: text})}
              />
              <TextInput
                style={styles.input}
                placeholder="Phone"
                placeholderTextColor="#666"
                keyboardType="phone-pad"
                value={formData.phone}
                onChangeText={(text) => setFormData({...formData, phone: text})}
              />
              <TextInput
                style={styles.input}
                placeholder="Address"
                placeholderTextColor="#666"
                value={formData.address}
                onChangeText={(text) => setFormData({...formData, address: text})}
              />
              <TextInput
                style={styles.input}
                placeholder="Number of Chairs"
                placeholderTextColor="#666"
                keyboardType="numeric"
                value={formData.numberOfChairs}
                onChangeText={(text) => setFormData({...formData, numberOfChairs: text})}
              />
            </View>
          </View>
        );
      
      case 3:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Payment Method</Text>
            <Text style={styles.paymentNote}>Your card won't be charged until after your 14-day free trial</Text>
            
            <View style={styles.cardContainer}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardHeaderText}>Credit/Debit Card</Text>
                <View style={styles.cardTypes}>
                  <FontAwesome name="cc-visa" size={24} color="#1A1F71" style={styles.cardIcon} />
                  <FontAwesome name="cc-mastercard" size={24} color="#EB001B" style={styles.cardIcon} />
                  <FontAwesome name="cc-amex" size={24} color="#006FCF" style={styles.cardIcon} />
                  <FontAwesome name="cc-discover" size={24} color="#FF6600" style={styles.cardIcon} />
                </View>
              </View>
              
              <TextInput
                style={styles.cardInput}
                placeholder="Card Number"
                placeholderTextColor="#666"
                keyboardType="numeric"
                value={formData.cardNumber}
                onChangeText={(text) => {
                  const formatted = formatCardNumber(text);
                  setFormData({...formData, cardNumber: formatted});
                }}
                maxLength={19}
              />
              
              <View style={styles.cardRow}>
                <TextInput
                  style={[styles.cardInput, styles.cardHalf]}
                  placeholder="MM/YY"
                  placeholderTextColor="#666"
                  keyboardType="numeric"
                  value={formData.cardExpiry}
                  onChangeText={(text) => {
                    const formatted = formatExpiry(text);
                    setFormData({...formData, cardExpiry: formatted});
                  }}
                  maxLength={5}
                />
                <TextInput
                  style={[styles.cardInput, styles.cardHalf]}
                  placeholder="CVC"
                  placeholderTextColor="#666"
                  keyboardType="numeric"
                  value={formData.cardCVC}
                  onChangeText={(text) => setFormData({...formData, cardCVC: text.replace(/\D/g, '')})}
                  maxLength={4}
                  secureTextEntry={true}
                />
              </View>
              
              <TextInput
                style={styles.cardInput}
                placeholder="Name on Card"
                placeholderTextColor="#666"
                value={formData.cardName}
                onChangeText={(text) => setFormData({...formData, cardName: text})}
              />
            </View>
            
            <View style={styles.termsContainer}>
              <Text style={styles.termsText}>
                By starting your trial, you agree to our{' '}
                <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
                <Text style={styles.termsLink}>Privacy Policy</Text>
              </Text>
            </View>
          </View>
        );
    }
  };


  return (
    <LinearGradient
      colors={['#000000', '#333333']}
      style={styles.container}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <ScrollView style={styles.scrollView}>
          <View style={styles.header}>
            <TouchableOpacity onPress={handlePreviousStep}>
              {currentStep > 1 && (
                <Feather name="arrow-left" size={24} color="white" />
              )}
            </TouchableOpacity>
            <View style={styles.stepIndicator}>
              {[1, 2, 3].map((step) => (
                <View 
                  key={step}
                  style={[
                    styles.stepDot,
                    currentStep >= step && styles.activeDot
                  ]}
                />
              ))}
            </View>
            <View style={styles.headerRight} />
          </View>


          {renderStep()}


          <TouchableOpacity 
            style={styles.nextButton}
            onPress={handleNextStep}
          >
            <Text style={styles.nextButtonText}>
              {currentStep === 3 ? 'Start Free Trial' : 'Next'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 50,
    marginBottom: 30,
  },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#333',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#FF0000',
    width: 10,
    height: 10,
  },
  headerRight: {
    width: 24,
  },
  stepContainer: {
    flex: 1,
    paddingVertical: 20,
  },
  stepTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 10,
  },
  stepSubtitle: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginBottom: 30,
  },
  featuresList: {
    marginTop: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#000000',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureContent: {
    marginLeft: 15,
    flex: 1,
  },
  featureTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  featureDescription: {
    color: '#888',
    fontSize: 14,
    marginTop: 5,
  },
  inputContainer: {
    marginTop: 20,
  },
  input: {
    backgroundColor: '#000000',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    color: 'white',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  paymentNote: {
    color: '#888',
    textAlign: 'center',
    marginBottom: 20,
    fontSize: 16,
  },
  cardContainer: {
    backgroundColor: '#111',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  cardHeaderText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  cardTypes: {
    flexDirection: 'row',
  },
  cardIcon: {
    marginLeft: 8,
  },
  cardInput: {
    backgroundColor: '#000',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    color: 'white',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardHalf: {
    width: '48%',
  },
  termsContainer: {
    marginTop: 10,
    marginBottom: 20,
  },
  termsText: {
    color: '#888',
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20,
  },
  termsLink: {
    color: '#FF0000',
    textDecorationLine: 'underline',
  },
  nextButton: {
    backgroundColor: '#FF0000',
    padding: 18,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 30,
  },
  nextButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});


export default TrialSignup;
