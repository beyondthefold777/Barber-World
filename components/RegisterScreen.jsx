import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { authService } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const RegisterScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
    phoneNumber: '',
    businessName: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    role: '',
    adminCode: ''
  });
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!formData.email || !formData.password || !formData.role) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }
    if (formData.role === 'client' && (!formData.username || !formData.phoneNumber)) {
      Alert.alert('Error', 'Username and phone number are required for clients');
      return;
    }
    if (formData.role === 'barbershop' &&
        (!formData.businessName || !formData.address || !formData.city || !formData.state || !formData.zipCode)) {
      Alert.alert('Error', 'All business information is required for barbershops');
      return;
    }

    try {
      setLoading(true);
      const response = await authService.register(formData);
      
      // Store token and user role
      await AsyncStorage.setItem('userToken', response.token);
      await AsyncStorage.setItem('userRole', response.user.role);
      
      // Navigate based on user role
      if (formData.role === 'client') {
        navigation.replace('GuestLandingPage');
      } else {
        navigation.replace('BarbershopDashboard');
      }
      
      // Show success message
      Alert.alert(
        'Registration Successful', 
        'Your account has been created successfully.',
        [{ text: 'OK' }]
      );
      
    } catch (error) {
      Alert.alert('Registration Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  return (
    <LinearGradient
      colors={['#000000', '#333333']}
      style={styles.container}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Create an Account</Text>
        <View style={styles.roleContainer}>
          {['client', 'barbershop'].map((role) => (
            <TouchableOpacity 
              key={role}
              style={[
                styles.roleButton, 
                formData.role === role && styles.selectedRole
              ]}
              onPress={() => updateFormData('role', role)}
            >
              <Text style={styles.roleText}>
                {role === 'client' ? 'New Clients' :
                role.charAt(0).toUpperCase() + role.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        
        {!formData.role ? (
          <View style={styles.imageContainer}>
            <Image 
              source={require('../assets/barberworldofficial.png')}
              style={styles.image}
              resizeMode="contain"
            />
          </View>
        ) : (
          <View style={styles.inputContainer}>
            {formData.role === 'client' && (
              <>
                <TextInput
                  style={styles.input}
                  placeholder="Username"
                  placeholderTextColor="#999"
                  value={formData.username}
                  onChangeText={(value) => updateFormData('username', value)}
                  autoCapitalize="none"
                />
                <TextInput
                  style={styles.input}
                  placeholder="Phone Number"
                  placeholderTextColor="#999"
                  value={formData.phoneNumber}
                  onChangeText={(value) => updateFormData('phoneNumber', value)}
                  keyboardType="phone-pad"
                />
              </>
            )}
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#999"
              value={formData.email}
              onChangeText={(value) => updateFormData('email', value)}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#999"
              value={formData.password}
              onChangeText={(value) => updateFormData('password', value)}
              secureTextEntry
            />
            {formData.role === 'barbershop' && (
              <>
                <TextInput
                  style={styles.input}
                  placeholder="Business Name"
                  placeholderTextColor="#999"
                  value={formData.businessName}
                  onChangeText={(value) => updateFormData('businessName', value)}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Street Address"
                  placeholderTextColor="#999"
                  value={formData.address}
                  onChangeText={(value) => updateFormData('address', value)}
                />
                <TextInput
                  style={styles.input}
                  placeholder="City"
                  placeholderTextColor="#999"
                  value={formData.city}
                  onChangeText={(value) => updateFormData('city', value)}
                />
                <TextInput
                  style={styles.input}
                  placeholder="State"
                  placeholderTextColor="#999"
                  value={formData.state}
                  onChangeText={(value) => updateFormData('state', value)}
                />
                <TextInput
                  style={styles.input}
                  placeholder="ZIP Code"
                  placeholderTextColor="#999"
                  value={formData.zipCode}
                  onChangeText={(value) => updateFormData('zipCode', value)}
                  keyboardType="numeric"
                />
              </>
            )}
            
            <TouchableOpacity 
              style={[styles.registerButton, loading && styles.disabledButton]}
              onPress={handleRegister}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? 'Creating Account...' : 'Register'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
        
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.loginText}>Already have an account? Login</Text>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    color: 'white',
    fontSize: 32,
    fontWeight: 'bold',
    marginTop: 60,
    marginBottom: 40,
    textAlign: 'center',
  },
  roleContainer: {
    flexDirection: 'column',
    marginBottom: 30,
  },
  roleButton: {
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'white',
    marginBottom: 10,
  },
  selectedRole: {
    backgroundColor: '#FF0000',
    borderColor: '#FF0000',
  },
  roleText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  imageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  image: {
    width: '100%',
    height: 250,
  },
  inputContainer: {
    marginBottom: 30,
  },
  input: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    fontSize: 16,
  },
  registerButton: {
    backgroundColor: '#FF0000',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  disabledButton: {
    opacity: 0.7,
    backgroundColor: '#FF0000',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loginText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    marginBottom: 20,
  },
});

export default RegisterScreen;
