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

const TermsOfService = ({ navigation }) => {
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
        <Text style={styles.headerTitle}>Terms of Service</Text>
        <View style={styles.placeholderRight} />
      </View>
      
      <ScrollView style={styles.content}>
        <Text style={styles.sectionTitle}>1. Introduction</Text>
        <Text style={styles.paragraph}>
          Welcome to BarberWorld, a mobile application designed to connect clients with barbershops while providing shop owners with business management tools. These Terms of Service ("Terms") govern your access to and use of the BarberWorld application, services, and website (collectively, the "Service"). By accessing or using the Service, you agree to be bound by these Terms.
        </Text>
        
        <Text style={styles.sectionTitle}>2. Definitions</Text>
        <Text style={styles.paragraph}>
          • "BarberWorld," "we," "us," and "our" refer to the operators of BarberWorld.{'\n'}
          • "User," "you," and "your" refer to individuals who access or use the Service.{'\n'}
          • "Barbershop Owner" refers to users who register as barbershop owners or managers.{'\n'}
          • "Client" refers to users who register to book appointments with barbershops.{'\n'}
          • "Content" refers to information, text, graphics, photos, or other materials uploaded, downloaded, or appearing on the Service.
        </Text>
        
        <Text style={styles.sectionTitle}>3. Eligibility</Text>
        <Text style={styles.paragraph}>
          You must be at least 18 years old to use the Service. By using the Service, you represent and warrant that you have the right, authority, and capacity to enter into these Terms and to abide by all of the terms and conditions set forth herein.
        </Text>
        
        <Text style={styles.sectionTitle}>4. Account Registration</Text>
        <Text style={styles.paragraph}>
          <Text style={styles.subsectionTitle}>4.1 Account Creation</Text>{'\n'}
          To access certain features of the Service, you must register for an account. You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate, current, and complete.
          
          {'\n\n'}<Text style={styles.subsectionTitle}>4.2 Account Security</Text>{'\n'}
          You are responsible for safeguarding your password and for all activities that occur under your account. You agree to notify BarberWorld immediately of any unauthorized use of your account.
          
          {'\n\n'}<Text style={styles.subsectionTitle}>4.3 Account Types</Text>{'\n'}
          The Service offers two types of accounts:{'\n'}
          • Client accounts for individuals seeking barbershop services{'\n'}
          • Barbershop accounts for business owners and managers
        </Text>
        
        <Text style={styles.sectionTitle}>5. Service Description</Text>
        <Text style={styles.paragraph}>
          <Text style={styles.subsectionTitle}>5.1 For Clients</Text>{'\n'}
          The Service allows Clients to:{'\n'}
          • Search for barbershops by location{'\n'}
          • View barbershop profiles and available services{'\n'}
          • Book appointments with barbershops{'\n'}
          • Manage personal profiles and appointment history
          
          {'\n\n'}<Text style={styles.subsectionTitle}>5.2 For Barbershop Owners</Text>{'\n'}
          The Service allows Barbershop Owners to:{'\n'}
          • Create and manage business profiles{'\n'}
          • Manage appointment scheduling{'\n'}
          • Access business management tools{'\n'}
          • View analytics and reports{'\n'}
          • Manage business information
        </Text>
        
        <Text style={styles.sectionTitle}>6. User Conduct</Text>
        <Text style={styles.paragraph}>
          <Text style={styles.subsectionTitle}>6.1 Prohibited Activities</Text>{'\n'}
          You agree not to engage in any of the following prohibited activities:{'\n'}
          • Violating any applicable laws or regulations{'\n'}
          • Impersonating any person or entity{'\n'}
          • Harassing, threatening, or intimidating any other users{'\n'}
          • Posting false, misleading, or deceptive content{'\n'}
          • Attempting to access accounts or data not belonging to you{'\n'}
          • Using the Service for any illegal purpose{'\n'}
          • Interfering with or disrupting the Service
          
          {'\n\n'}<Text style={styles.subsectionTitle}>6.2 Content Guidelines</Text>{'\n'}
          You are solely responsible for any Content you post on the Service. You agree not to post Content that:{'\n'}
          • Infringes on intellectual property rights{'\n'}
          • Contains offensive, harmful, or inappropriate material{'\n'}
          • Contains personal or sensitive information about others without their consent{'\n'}
          • Is false, misleading, or deceptive
        </Text>
        
        <Text style={styles.sectionTitle}>7. Intellectual Property Rights</Text>
        <Text style={styles.paragraph}>
          <Text style={styles.subsectionTitle}>7.1 BarberWorld Content</Text>{'\n'}
          The Service and its original content, features, and functionality are owned by BarberWorld and are protected by copyright, trademark, and other intellectual property laws.
          
          {'\n\n'}<Text style={styles.subsectionTitle}>7.2 User Content</Text>{'\n'}
          By posting Content on the Service, you grant BarberWorld a non-exclusive, royalty-free, transferable, sublicensable, worldwide license to use, display, reproduce, and distribute such Content on and through the Service.
        </Text>
        
        <Text style={styles.sectionTitle}>8. Future Premium Features</Text>
        <Text style={styles.paragraph}>
          <Text style={styles.subsectionTitle}>8.1 Premium Services</Text>{'\n'}
          BarberWorld may offer premium features or subscription services in the future. These features are not currently available.
          
          {'\n\n'}<Text style={styles.subsectionTitle}>8.2 Notice of Changes</Text>{'\n'}
          Before implementing any paid services or features, BarberWorld will provide notice to users and update these Terms of Service. You will have the opportunity to review and accept any new terms related to premium features before being charged for any services.
        </Text>
        
        <Text style={styles.sectionTitle}>9. Termination</Text>
        <Text style={styles.paragraph}>
          <Text style={styles.subsectionTitle}>9.1 Termination by BarberWorld</Text>{'\n'}
          BarberWorld reserves the right to suspend or terminate your account and access to the Service at any time for any reason, including but not limited to a violation of these Terms.
          
          {'\n\n'}<Text style={styles.subsectionTitle}>9.2 Termination by User</Text>{'\n'}
          You may terminate your account at any time by following the instructions on the Service or by contacting us.
        </Text>
        
        <Text style={styles.sectionTitle}>10. Disclaimers</Text>
        <Text style={styles.paragraph}>
          <Text style={styles.subsectionTitle}>10.1 Service Provided "As Is"</Text>{'\n'}
          The Service is provided on an "as is" and "as available" basis. BarberWorld makes no warranties, expressed or implied, regarding the operation of the Service or the information, content, or materials included on the Service.
          
          {'\n\n'}<Text style={styles.subsectionTitle}>10.2 Third-Party Services</Text>{'\n'}
          BarberWorld is not responsible for the actions, content, information, or data of third parties, including Barbershop Owners and Clients.
        </Text>
        
        <Text style={styles.sectionTitle}>11. Limitation of Liability</Text>
        <Text style={styles.paragraph}>
          To the maximum extent permitted by law, BarberWorld shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the Service.
        </Text>
        
        <Text style={styles.sectionTitle}>12. Indemnification</Text>
        <Text style={styles.paragraph}>
          You agree to indemnify, defend, and hold harmless BarberWorld and its officers, directors, employees, and agents from and against any claims, liabilities, damages, losses, and expenses arising out of or in any way connected with your access to or use of the Service.
        </Text>
        
        <Text style={styles.sectionTitle}>13. Changes to Terms</Text>
        <Text style={styles.paragraph}>
          BarberWorld reserves the right to modify these Terms at any time. We will provide notice of significant changes by posting the new Terms on the Service and updating the "Last Updated" date. Your continued use of the Service after such changes constitutes your acceptance of the new Terms.
        </Text>
        
        <Text style={styles.sectionTitle}>14. Governing Law</Text>
        <Text style={styles.paragraph}>
          These Terms shall be governed by and construed in accordance with the laws of the United States, without regard to its conflict of law provisions.
        </Text>
        
        <Text style={styles.sectionTitle}>15. Contact Information</Text>
        <Text style={styles.paragraph}>
          If you have any questions about these Terms, please contact us at:{'\n'}
          support@barberworld.com
        </Text>
        
        <Text style={styles.sectionTitle}>16. Entire Agreement</Text>
        <Text style={styles.paragraph}>
          These Terms constitute the entire agreement between you and BarberWorld regarding the use of the Service, superseding any prior agreements between you and BarberWorld.
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
    marginTop: 30,
    marginBottom: 50,
  },
});

export default TermsOfService;
