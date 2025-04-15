import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';

const FeedbackScreen = ({ navigation }) => {
    const [feedbackType, setFeedbackType] = useState('');
    const [rating, setRating] = useState(0);
    const [feedback, setFeedback] = useState('');
    const [loading, setLoading] = useState(false);
  
    const feedbackTypes = [
      'App Experience',
      'Feature Request',
      'Bug Report',
      'Service Quality',
      'Other'
    ];
  
    const handleSubmit = async () => {
      if (!feedbackType) {
        Alert.alert('Error', 'Please select a feedback type');
        return;
      }
  
      if (rating === 0) {
        Alert.alert('Error', 'Please provide a rating');
        return;
      }
  
      if (!feedback.trim()) {
        Alert.alert('Error', 'Please enter your feedback');
        return;
      }
  
      try {
        setLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // In a real app, you would send the feedback to your backend
        // await feedbackService.submitFeedback({ feedbackType, rating, feedback });
        
        Alert.alert(
          'Thank You!',
          'Your feedback has been submitted. We appreciate your input!',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      } catch (error) {
        console.error('Error submitting feedback:', error);
        Alert.alert('Error', 'Failed to submit your feedback. Please try again.');
      } finally {
        setLoading(false);
      }
    };
  
    const renderRatingStars = () => {
      const stars = [];
      for (let i = 1; i <= 5; i++) {
        stars.push(
          <TouchableOpacity 
            key={i}
            onPress={() => setRating(i)}
            style={styles.starContainer}
          >
            <Feather 
              name={i <= rating ? "star" : "star"} 
              size={32} 
              color={i <= rating ? "#FF0000" : "#444"} 
              solid={i <= rating}
            />
          </TouchableOpacity>
        );
      }
      return stars;
    };
  
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
              onPress={() => navigation.goBack()}
            >
              <Feather name="arrow-left" size={24} color="white" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Give Feedback</Text>
            <View style={{ width: 44 }} />
          </View>
  
          <ScrollView style={styles.content}>
            <Text style={styles.description}>
              We value your feedback! Let us know how we're doing and how we can improve your experience.
            </Text>
  
            <View style={styles.formContainer}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Feedback Type</Text>
                <View style={styles.feedbackTypeContainer}>
                  {feedbackTypes.map((type, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.feedbackTypeButton,
                        feedbackType === type && styles.feedbackTypeButtonActive
                      ]}
                      onPress={() => setFeedbackType(type)}
                    >
                      <Text 
                        style={[
                          styles.feedbackTypeText,
                          feedbackType === type && styles.feedbackTypeTextActive
                        ]}
                      >
                        {type}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
  
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Rate Your Experience</Text>
                <View style={styles.ratingContainer}>
                  {renderRatingStars()}
                </View>
                <Text style={styles.ratingText}>
                  {rating === 0 ? 'Tap to rate' : 
                   rating === 1 ? 'Poor' :
                   rating === 2 ? 'Fair' :
                   rating === 3 ? 'Good' :
                   rating === 4 ? 'Very Good' : 'Excellent'}
                </Text>
              </View>
  
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Your Feedback</Text>
                <TextInput
                  style={styles.feedbackInput}
                  value={feedback}
                  onChangeText={setFeedback}
                  placeholder="Tell us what you think..."
                  placeholderTextColor="#999"
                  multiline
                  textAlignVertical="top"
                />
              </View>
            </View>
  
            <TouchableOpacity 
              style={styles.submitButton}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text style={styles.submitButtonText}>Submit Feedback</Text>
              )}
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
    description: {
      color: '#BBB',
      fontSize: 16,
      lineHeight: 24,
      marginBottom: 20,
    },
    formContainer: {
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      borderRadius: 10,
      padding: 15,
      marginBottom: 20,
    },
    inputContainer: {
      marginBottom: 20,
    },
    inputLabel: {
      color: '#999',
      fontSize: 14,
      marginBottom: 12,
    },
    feedbackTypeContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginHorizontal: -5,
    },
    feedbackTypeButton: {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      borderRadius: 20,
      paddingVertical: 8,
      paddingHorizontal: 12,
      marginHorizontal: 5,
      marginBottom: 10,
    },
    feedbackTypeButtonActive: {
      backgroundColor: '#FF0000',
    },
    feedbackTypeText: {
      color: '#BBB',
      fontSize: 14,
    },
    feedbackTypeTextActive: {
      color: 'white',
      fontWeight: 'bold',
    },
    ratingContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginVertical: 10,
    },
    starContainer: {
      marginHorizontal: 8,
    },
    ratingText: {
      color: '#BBB',
      fontSize: 14,
      textAlign: 'center',
      marginTop: 5,
    },
    feedbackInput: {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      color: 'white',
      borderRadius: 5,
      padding: 12,
      fontSize: 16,
      minHeight: 120,
    },
    submitButton: {
      backgroundColor: '#FF0000',
      paddingVertical: 15,
      borderRadius: 8,
      alignItems: 'center',
      marginBottom: 30,
    },
    submitButtonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: 'bold',
    },
  });
  
  export default FeedbackScreen;
  
