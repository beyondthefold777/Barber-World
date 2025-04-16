import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';

// Sample FAQ data
const faqs = [
  {
    id: '1',
    question: 'How do I schedule an appointment?',
    answer: 'You can schedule an appointment by navigating to the Appointments tab and tapping on the "+" button. Follow the prompts to select a barber, service, date, and time.'
  },
  {
    id: '2',
    question: 'How do I cancel or reschedule an appointment?',
    answer: 'To cancel or reschedule, go to the Appointments tab, find your appointment, and tap on it. You\'ll see options to cancel or reschedule. Please note that cancellations may be subject to the shop\'s cancellation policy.'
  },
  {
    id: '3',
    question: 'How do I update my payment information?',
    answer: 'Go to Settings > Payment Methods to add, edit, or remove payment methods. You can set a default payment method for future appointments.'
  },
  {
    id: '4',
    question: 'How do I change my profile information?',
    answer: 'Go to Settings > Account Details to update your personal information, including name, email, phone number, and address.'
  },
  {
    id: '5',
    question: 'Is my personal information secure?',
    answer: 'Yes, we take security seriously. Your personal and payment information is encrypted and stored securely. You can review our privacy policy for more details on how we protect your data.'
  },
  {
    id: '6',
    question: 'How do I leave a review for a barber?',
    answer: 'After your appointment, you\'ll receive a notification asking you to rate your experience. You can also go to the barber\'s profile and tap on "Leave a Review".'
  },
  {
    id: '7',
    question: 'What if I\'m late for my appointment?',
    answer: 'If you\'re running late, please contact the barbershop directly. Policies regarding late arrivals vary by shop, but most shops will try to accommodate you if possible.'
  },
  {
    id: '8',
    question: 'How do I delete my account?',
    answer: 'Go to Settings > Privacy & Security > Delete Account. Please note that this action is permanent and will delete all your data from our system.'
  }
];

const HelpCenterScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaq, setExpandedFaq] = useState(null);

  const filteredFaqs = searchQuery 
    ? faqs.filter(faq => 
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : faqs;

  const toggleFaq = (id) => {
    setExpandedFaq(expandedFaq === id ? null : id);
  };

  const renderFaqItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.faqItem}
      onPress={() => toggleFaq(item.id)}
    >
      <View style={styles.faqHeader}>
        <Text style={styles.faqQuestion}>{item.question}</Text>
        <Feather 
          name={expandedFaq === item.id ? "chevron-up" : "chevron-down"} 
          size={20} 
          color="#FF0000" 
        />
      </View>
      
      {expandedFaq === item.id && (
        <Text style={styles.faqAnswer}>{item.answer}</Text>
      )}
    </TouchableOpacity>
  );

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
        <Text style={styles.headerTitle}>Help Center</Text>
        <View style={{ width: 44 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.searchContainer}>
          <Feather name="search" size={20} color="#999" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for help..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity 
              style={styles.clearButton}
              onPress={() => setSearchQuery('')}
            >
              <Feather name="x" size={20} color="#999" />
            </TouchableOpacity>
          ) : null}
        </View>

        <View style={styles.supportOptions}>
          <TouchableOpacity 
            style={styles.supportOption}
            onPress={() => navigation.navigate('ContactSupport')}
          >
            <View style={styles.supportIconContainer}>
              <Feather name="message-circle" size={24} color="white" />
            </View>
            <Text style={styles.supportOptionText}>Contact Support</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.supportOption}
            onPress={() => navigation.navigate('Feedback')}
          >
            <View style={styles.supportIconContainer}>
              <Feather name="star" size={24} color="white" />
            </View>
            <Text style={styles.supportOptionText}>Give Feedback</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
        
        {filteredFaqs.length > 0 ? (
          <FlatList
            data={filteredFaqs}
            renderItem={renderFaqItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.faqList}
          />
        ) : (
          <View style={styles.noResultsContainer}>
            <Feather name="search" size={50} color="#666" />
            <Text style={styles.noResultsText}>No results found</Text>
            <Text style={styles.noResultsSubtext}>
              Try different keywords or contact our support team for help
            </Text>
          </View>
        )}
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 20,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: 'white',
    paddingVertical: 12,
    fontSize: 16,
  },
  clearButton: {
    padding: 8,
  },
  supportOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  supportOption: {
    flex: 1,
    backgroundColor: '#FF0000',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  supportIconContainer: {
    marginBottom: 8,
  },
  supportOptionText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  sectionTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  faqList: {
    paddingBottom: 20,
  },
  faqItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqQuestion: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 10,
  },
  faqAnswer: {
    color: '#BBB',
    fontSize: 14,
    lineHeight: 22,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  noResultsText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 10,
  },
  noResultsSubtext: {
    color: '#BBB',
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});

export default HelpCenterScreen;