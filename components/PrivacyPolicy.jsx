import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';

const PrivacyPolicy = ({ navigation }) => {
  return (
    <LinearGradient
      colors={['#000000', '#333333']}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" translucent={true} backgroundColor="transparent" />
      
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Feather name="arrow-left" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <View style={styles.placeholderRight} />
      </View>
      
      <ScrollView style={styles.content}>
        <Text style={styles.lastUpdated}>Last Updated: {new Date().toLocaleDateString()}</Text>
        
        <Text style={styles.paragraph}>
          This Privacy Policy describes how BarberWorld ("we", "us", or "our") collects, uses, and shares your personal information when you use our mobile application and services (collectively, the "Service").
        </Text>
        
        <Text style={styles.sectionTitle}>1. Information We Collect</Text>
        <Text style={styles.paragraph}>
          <Text style={styles.subsectionTitle}>1.1 Information You Provide to Us</Text>{'\n'}
          We collect information you provide directly to us when you:{'\n'}
          • Create or modify your account{'\n'}
          • Complete a form or profile{'\n'}
          • Make an appointment{'\n'}
          • Communicate with us or other users{'\n'}
          • Post content in our Service
          
          {'\n\n'}<Text style={styles.subsectionTitle}>1.2 Types of Data Collected</Text>{'\n'}
          This information may include:{'\n'}
          • Contact information (name, email address, phone number){'\n'}
          • Profile information (profile picture, preferences){'\n'}
          • Location information (city, state, ZIP code){'\n'}
          • For barbershop owners: business information (business name, address, services offered)
          
          {'\n\n'}<Text style={styles.subsectionTitle}>1.3 Automatically Collected Information</Text>{'\n'}
          When you use our Service, we may automatically collect certain information, including:{'\n'}
          • Device information (device type, operating system){'\n'}
          • Log information (how you interact with our Service){'\n'}
          • Location information (with your permission){'\n'}
          • Usage information (features you use, time spent on the Service)
        </Text>
        
        <Text style={styles.sectionTitle}>2. How We Use Your Information</Text>
        <Text style={styles.paragraph}>
          We use the information we collect to:{'\n'}
          • Provide, maintain, and improve our Service{'\n'}
          • Process transactions and send related information{'\n'}
          • Send you technical notices, updates, and support messages{'\n'}
          • Respond to your comments and questions{'\n'}
          • Connect clients with barbershops{'\n'}
          • Develop new products and services{'\n'}
          • Detect and prevent fraudulent or unauthorized activity
        </Text>
        
        <Text style={styles.sectionTitle}>3. How We Share Your Information</Text>
        <Text style={styles.paragraph}>
          <Text style={styles.subsectionTitle}>3.1 With Other Users</Text>{'\n'}
          When you use our Service, certain information may be shared with other users:{'\n'}
          • For clients: Your name, profile picture, and appointment details may be shared with barbershops you book with{'\n'}
          • For barbershop owners: Your business information, services, and availability will be visible to potential clients
          
          {'\n\n'}<Text style={styles.subsectionTitle}>3.2 With Service Providers</Text>{'\n'}
          We may share your information with third-party vendors and service providers who perform services on our behalf, such as payment processing, data analysis, email delivery, and hosting services.
          
          {'\n\n'}<Text style={styles.subsectionTitle}>3.3 For Legal Reasons</Text>{'\n'}
          We may share information if we believe it is necessary to:{'\n'}
          • Comply with applicable laws and regulations{'\n'}
          • Respond to a subpoena, court order, or legal process{'\n'}
          • Protect the safety, rights, or property of BarberWorld, our users, or the public
        </Text>
        
        <Text style={styles.sectionTitle}>4. Your Choices</Text>
        <Text style={styles.paragraph}>
          <Text style={styles.subsectionTitle}>4.1 Account Information</Text>{'\n'}
          You can update, correct, or delete your account information at any time by logging into your account settings. If you wish to delete your account, please contact us.
          
          {'\n\n'}<Text style={styles.subsectionTitle}>4.2 Location Information</Text>{'\n'}
          You can prevent our app from accessing your device's location by adjusting your device settings, but this may limit your ability to use certain features of our Service.
          
          {'\n\n'}<Text style={styles.subsectionTitle}>4.3 Push Notifications</Text>{'\n'}
          You can opt out of receiving push notifications by adjusting your device settings.
          
          {'\n\n'}<Text style={styles.subsectionTitle}>4.4 Marketing Communications</Text>{'\n'}
          You can opt out of receiving promotional emails by following the instructions in those emails or by contacting us.
        </Text>
        
        <Text style={styles.sectionTitle}>5. Data Security</Text>
        <Text style={styles.paragraph}>
          We take reasonable measures to help protect your personal information from loss, theft, misuse, unauthorized access, disclosure, alteration, and destruction. However, no security system is impenetrable, and we cannot guarantee the security of our systems.
        </Text>
        
        <Text style={styles.sectionTitle}>6. Children's Privacy</Text>
        <Text style={styles.paragraph}>
          Our Service is not directed to children under the age of 18. We do not knowingly collect personal information from children under 18. If we learn that we have collected personal information from a child under 18, we will take steps to delete that information as quickly as possible.
        </Text>
        
        <Text style={styles.sectionTitle}>7. Changes to This Privacy Policy</Text>
        <Text style={styles.paragraph}>
          We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date. You are advised to review this Privacy Policy periodically for any changes.
        </Text>
        
        <Text style={styles.sectionTitle}>8. International Data Transfers</Text>
        <Text style={styles.paragraph}>
          Your information may be transferred to, and maintained on, computers located outside of your state, province, country, or other governmental jurisdiction where the data protection laws may differ from those in your jurisdiction.
        </Text>
        
        <Text style={styles.sectionTitle}>9. Cookies and Similar Technologies</Text>
        <Text style={styles.paragraph}>
          We may use cookies, pixel tags, and similar technologies to collect information about your interactions with our Service. You can set your browser to refuse all or some browser cookies, but this may limit your ability to use certain features of our Service.
        </Text>
        
        <Text style={styles.sectionTitle}>10. Contact Us</Text>
        <Text style={styles.paragraph}>
          If you have any questions about this Privacy Policy, please contact us at:{'\n'}
          support@barberworld.com
        </Text>
        
        <Text style={styles.lastUpdated}>Last Updated: {new Date().toLocaleDateString()}</Text>
      </ScrollView>
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
    paddingBottom: 15,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  backButton: {
    padding: 10,
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  placeholderRight: {
    width: 44, // Same width as back button for centering the title
  },
  content: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    color: '#FF0000',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  subsectionTitle: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  paragraph: {
    color: '#DDDDDD',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 15,
  },
  lastUpdated: {
    color: '#999999',
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    marginVertical: 20,
  },
});

export default PrivacyPolicy;
