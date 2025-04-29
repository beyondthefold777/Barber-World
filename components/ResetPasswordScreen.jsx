import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Linking
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import axios from 'axios';
import env from '../config/environment';

const ResetPasswordScreen = ({ route, navigation }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [token, setToken] = useState('');
  const [tokenChecked, setTokenChecked] = useState(false);

  // Function to extract token from URL
  const extractTokenFromUrl = (url) => {
    if (!url) return null;
    const tokenMatch = url.match(/[?&]token=([^&]+)/);
    return tokenMatch ? tokenMatch[1] : null;
  };

  // Handle deep linking
  useEffect(() => {
    // Handle initial URL (app opened via deep link)
    const getInitialURL = async () => {
      const initialUrl = await Linking.getInitialURL();
      if (initialUrl) {
        const extractedToken = extractTokenFromUrl(initialUrl);
        if (extractedToken) {
          setToken(extractedToken);
        }
      }
      setTokenChecked(true);
    };

    getInitialURL();

    // Handle deep link when app is already open
    const subscription = Linking.addEventListener('url', ({ url }) => {
      const extractedToken = extractTokenFromUrl(url);
      if (extractedToken) {
        setToken(extractedToken);
      }
    });

    return () => subscription.remove();
  }, []);

  // Handle token from route params (navigation)
  useEffect(() => {
    if (route.params?.token) {
      setToken(route.params.token);
    }
    setTokenChecked(true);
  }, [route.params]);

  const handleResetPassword = async () => {
    // Validate inputs
    if (!newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    if (!token) {
      Alert.alert('Error', 'Invalid or missing reset token');
      return;
    }

    try {
      setLoading(true);
      
      // Make API call to reset password
      const response = await axios.post(`${env.apiUrl}/api/reset-password`, {
        token,
        newPassword
      });
      
      if (response.data.success) {
        setResetSuccess(true);
      } else {
        Alert.alert('Error', response.data.message || 'Failed to reset password');
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      
      if (error.response) {
        Alert.alert('Error', error.response.data.message || 'Failed to reset password');
      } else if (error.request) {
        Alert.alert('Network Error', 'Unable to connect to the server. Please check your internet connection.');
      } else {
        Alert.alert('Error', 'An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Show loading indicator until we've checked for token
  if (!tokenChecked) {
    return (
      <LinearGradient
        colors={['#000000', '#333333']}
        style={[styles.container, styles.loadingContainer]}
      >
        <ActivityIndicator size="large" color="#FF0000" />
        <Text style={styles.loadingText}>Loading reset information...</Text>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={['#000000', '#333333']}
      style={styles.container}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingContainer}
      >
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.navigate('Login')}
          >
            <Feather name="arrow-left" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Reset Password</Text>
          <View style={{ width: 44 }} />
        </View>
        <ScrollView style={styles.content}>
          {!token ? (
            <View style={styles.errorContainer}>
              <Feather name="alert-circle" size={60} color="#FF0000" />
              <Text style={styles.errorTitle}>Invalid Reset Link</Text>
              <Text style={styles.errorDescription}>
                The password reset link is invalid or has expired. Please request a new password reset link.
              </Text>
              <TouchableOpacity 
                style={styles.resetButton}
                onPress={() => navigation.navigate('ForgotPassword')}
              >
                <Text style={styles.resetButtonText}>Request New Link</Text>
              </TouchableOpacity>
            </View>
          ) : !resetSuccess ? (
            <>
              <View style={styles.iconContainer}>
                <Feather name="lock" size={60} color="#FF0000" />
              </View>
              
              <Text style={styles.title}>Create New Password</Text>
              
              <Text style={styles.description}>
                Your new password must be different from previously used passwords.
              </Text>
              
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>New Password</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    value={newPassword}
                    onChangeText={setNewPassword}
                    placeholder="Enter new password"
                    placeholderTextColor="#999"
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    style={styles.eyeIcon}
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Feather 
                      name={showPassword ? "eye-off" : "eye"}
                      size={20}
                      color="#999"
                    />
                  </TouchableOpacity>
                </View>
              </View>
              
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Confirm Password</Text>
                <TextInput
                  style={styles.input}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Confirm new password"
                  placeholderTextColor="#999"
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
              </View>
              
              <View style={styles.passwordRequirements}>
                <Text style={styles.requirementsTitle}>Password requirements:</Text>
                <View style={styles.requirementItem}>
                  <Feather 
                    name={newPassword.length >= 6 ? "check-circle" : "circle"}
                    size={16}
                    color={newPassword.length >= 6 ? "#00C853" : "#999"}
                  />
                  <Text style={[
                    styles.requirementText,
                    newPassword.length >= 6 && styles.requirementMet
                  ]}>
                    At least 6 characters
                  </Text>
                </View>
                <View style={styles.requirementItem}>
                  <Feather 
                    name={newPassword === confirmPassword && newPassword !== "" ? "check-circle" : "circle"}
                    size={16}
                    color={newPassword === confirmPassword && newPassword !== "" ? "#00C853" : "#999"}
                  />
                  <Text style={[
                    styles.requirementText,
                    newPassword === confirmPassword && newPassword !== "" && styles.requirementMet
                  ]}>
                    Passwords match
                  </Text>
                </View>
              </View>
              
              <TouchableOpacity 
                style={[
                  styles.resetButton,
                  (newPassword.length < 6 || newPassword !== confirmPassword) && styles.resetButtonDisabled
                ]}
                onPress={handleResetPassword}
                disabled={loading || newPassword.length < 6 || newPassword !== confirmPassword}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text style={styles.resetButtonText}>Reset Password</Text>
                )}
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.backToLoginButton}
                onPress={() => navigation.navigate('Login')}
              >
                <Text style={styles.backToLoginText}>Back to Login</Text>
              </TouchableOpacity>
            </>
          ) : (
            <View style={styles.successContainer}>
              <View style={styles.successIconContainer}>
                <Feather name="check-circle" size={80} color="#FF0000" />
              </View>
              
              <Text style={styles.successTitle}>Password Reset Successful</Text>
              
              <Text style={styles.successDescription}>
                Your password has been reset successfully. You can now log in with your new password.
              </Text>
              
              <TouchableOpacity 
                style={styles.resetButton}
                onPress={() => navigation.navigate('Login')}
              >
                <Text style={styles.resetButtonText}>Go to Login</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
      </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoidingContainer: {
    flex: 1,
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
  iconContainer: {
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 20,
  },
  title: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
  },
  description: {
    color: '#BBB',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    color: '#999',
    fontSize: 14,
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    color: 'white',
    borderRadius: 5,
    padding: 15,
    fontSize: 16,
  },
  passwordContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 5,
    alignItems: 'center',
  },
  passwordInput: {
    flex: 1,
    color: 'white',
    padding: 15,
    fontSize: 16,
  },
  eyeIcon: {
    padding: 15,
  },
  passwordRequirements: {
    marginBottom: 25,
  },
  requirementsTitle: {
    color: '#999',
    fontSize: 14,
    marginBottom: 10,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  requirementText: {
    color: '#999',
    fontSize: 14,
    marginLeft: 10,
  },
  requirementMet: {
    color: '#00C853',
  },
  resetButton: {
    backgroundColor: '#FF0000',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  resetButtonDisabled: {
    backgroundColor: 'rgba(255, 0, 0, 0.5)',
  },
  resetButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backToLoginButton: {
    paddingVertical: 15,
    alignItems: 'center',
  },
  backToLoginText: {
    color: '#BBB',
    fontSize: 16,
  },
  successContainer: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 40,
    paddingHorizontal: 20,
  },
  successIconContainer: {
    marginBottom: 25,
  },
  successTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  successDescription: {
    color: '#BBB',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 30,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 40,
    paddingHorizontal: 20,
  },
  errorTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 15,
  },
  errorDescription: {
    color: '#BBB',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 30,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: 'white',
    marginTop: 20,
    fontSize: 16,
  },
});

export default ResetPasswordScreen;
