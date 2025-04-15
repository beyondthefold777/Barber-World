import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons';
import { authService } from '../../services/api';

const PaymentMethodsScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [defaultMethod, setDefaultMethod] = useState(null);

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  const fetchPaymentMethods = async () => {
    try {
      setLoading(true);
      // In a real app, you would fetch payment methods from your API
      const response = await authService.getPaymentMethods();
      setPaymentMethods(response.paymentMethods || []);
      setDefaultMethod(response.defaultMethod || null);
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      Alert.alert('Error', 'Failed to load your payment methods');
    } finally {
      setLoading(false);
    }
  };

  const handleSetDefault = async (id) => {
    try {
      setLoading(true);
      await authService.setDefaultPaymentMethod(id);
      setDefaultMethod(id);
      Alert.alert('Success', 'Default payment method updated');
    } catch (error) {
      console.error('Error setting default payment method:', error);
      Alert.alert('Error', 'Failed to update default payment method');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePaymentMethod = async (id) => {
    Alert.alert(
      'Delete Payment Method',
      'Are you sure you want to remove this payment method?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await authService.deletePaymentMethod(id);
              // Remove from local state
              setPaymentMethods(paymentMethods.filter(method => method.id !== id));
              if (defaultMethod === id) {
                setDefaultMethod(null);
              }
              Alert.alert('Success', 'Payment method removed');
            } catch (error) {
              console.error('Error deleting payment method:', error);
              Alert.alert('Error', 'Failed to remove payment method');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const getCardIcon = (brand) => {
    switch (brand.toLowerCase()) {
      case 'visa':
        return <FontAwesome name="cc-visa" size={24} color="#1A1F71" />;
      case 'mastercard':
        return <FontAwesome name="cc-mastercard" size={24} color="#EB001B" />;
      case 'amex':
        return <FontAwesome name="cc-amex" size={24} color="#006FCF" />;
      case 'discover':
        return <FontAwesome name="cc-discover" size={24} color="#FF6600" />;
      case 'apple pay':
        return <FontAwesome name="apple" size={24} color="#000" />;
      case 'google pay':
        return <FontAwesome name="google" size={24} color="#4285F4" />;
      default:
        return <FontAwesome name="credit-card" size={24} color="#888" />;
    }
  };

  const renderPaymentMethod = (method) => {
    const isDefault = method.id === defaultMethod;
    
    return (
      <View key={method.id} style={styles.paymentMethodCard}>
        <View style={styles.cardHeader}>
          <View style={styles.cardBrandContainer}>
            {getCardIcon(method.brand)}
            <Text style={styles.cardBrand}>{method.brand}</Text>
          </View>
          {isDefault && (
            <View style={styles.defaultBadge}>
              <Text style={styles.defaultText}>Default</Text>
            </View>
          )}
        </View>
        
        <View style={styles.cardDetails}>
          <Text style={styles.cardNumber}>•••• •••• •••• {method.last4}</Text>
          <Text style={styles.cardExpiry}>Expires {method.expMonth}/{method.expYear}</Text>
        </View>
        
        <View style={styles.cardActions}>
          {!isDefault && (
            <TouchableOpacity 
              style={styles.cardAction}
              onPress={() => handleSetDefault(method.id)}
            >
              <Feather name="check-circle" size={18} color="#FF0000" />
              <Text style={styles.cardActionText}>Set as Default</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity 
            style={styles.cardAction}
            onPress={() => handleDeletePaymentMethod(method.id)}
          >
            <Feather name="trash-2" size={18} color="#FF0000" />
            <Text style={styles.cardActionText}>Remove</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <LinearGradient
      colors={['#000000', '#333333']}
      style={styles.container}
    >
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Feather name="arrow-left" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment Methods</Text>
        <View style={{ width: 44 }} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF0000" />
          <Text style={styles.loadingText}>Loading payment methods...</Text>
        </View>
      ) : (
        <ScrollView style={styles.content}>
          {paymentMethods.length > 0 ? (
            <View style={styles.paymentMethodsContainer}>
              {paymentMethods.map(method => renderPaymentMethod(method))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="credit-card-outline" size={60} color="#666" />
              <Text style={styles.emptyStateTitle}>No Payment Methods</Text>
              <Text style={styles.emptyStateText}>
                You haven't added any payment methods yet.
              </Text>
            </View>
          )}
          
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => navigation.navigate('AddPaymentMethod')}
          >
            <Feather name="plus" size={20} color="white" />
            <Text style={styles.addButtonText}>Add Payment Method</Text>
          </TouchableOpacity>
        </ScrollView>
      )}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  backButton: {
    padding: 10,
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  paymentMethodsContainer: {
    marginBottom: 20,
  },
  paymentMethodCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  cardBrandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardBrand: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  defaultBadge: {
    backgroundColor: '#FF0000',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  defaultText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  cardDetails: {
    marginBottom: 15,
  },
  cardNumber: {
    color: 'white',
    fontSize: 18,
    marginBottom: 5,
  },
  cardExpiry: {
    color: '#BBB',
    fontSize: 14,
  },
  cardActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    paddingTop: 15,
  },
  cardAction: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  cardActionText: {
    color: '#FF0000',
    fontSize: 14,
    marginLeft: 5,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  emptyStateTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 10,
  },
  emptyStateText: {
    color: '#BBB',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF0000',
    padding: 15,
    borderRadius: 8,
    marginBottom: 30,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
});

export default PaymentMethodsScreen;
