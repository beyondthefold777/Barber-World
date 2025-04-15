import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';

const PrivacyPolicyScreen = ({ navigation }) => {
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
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.lastUpdated}>
          <Text style={styles.lastUpdatedText}>Last Updated: January 1, 2023</Text>
        </View>

        <Text style={styles.introduction}>
          This privacy policy describes our policies and procedures on the collection, use and disclosure of your information when you use our service and tells you about your privacy rights and how the law protects you.
        </Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. INFORMATION WE COLLECT</Text>
          <Text style={styles.paragraph}>
            We collect several different types of information for various purposes to provide and improve our Service to you.
          </Text>
          
          <Text style={styles.sectionSubtitle}>Personal Data</Text>
          <Text style={styles.paragraph}>
            While using our Service, we may ask you to provide us with certain personally identifiable information that can be used to contact or identify you. Personally identifiable information may include, but is not limited to:
          </Text>
          <Text style={styles.listItem}>• Email address</Text>
          <Text style={styles.listItem}>• First name and last name</Text>
          <Text style={styles.listItem}>• Phone number</Text>
          <Text style={styles.listItem}>• Address, State, Province, ZIP/Postal code, City</Text>
          <Text style={styles.listItem}>• Payment information</Text>
          <Text style={styles.listItem}>• Usage Data</Text>
          
          <Text style={styles.sectionSubtitle}>Usage Data</Text>
          <Text style={styles.paragraph}>
            Usage Data is collected automatically when using the Service. Usage Data may include information such as your device's Internet Protocol address (e.g. IP address), browser type, browser version, the pages of our Service that you visit, the time and date of your visit, the time spent on those pages, unique device identifiers and other diagnostic data.
          </Text>
          
          <Text style={styles.sectionSubtitle}>Location Data</Text>
          <Text style={styles.paragraph}>
            We may use and store information about your location if you give us permission to do so. We use this data to provide features of our Service, to improve and customize our Service.
          </Text>
          
          <Text style={styles.sectionSubtitle}>Tracking Technologies and Cookies</Text>
          <Text style={styles.paragraph}>
            We use Cookies and similar tracking technologies to track the activity on our Service and store certain information. Tracking technologies used are beacons, tags, and scripts to collect and track information and to improve and analyze our Service.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. USE OF YOUR PERSONAL DATA</Text>
          <Text style={styles.paragraph}>
            The Company may use Personal Data for the following purposes:
          </Text>
          <Text style={styles.listItem}>• To provide and maintain our Service, including to monitor the usage of our Service.</Text>
          <Text style={styles.listItem}>• To manage your account: to manage your registration as a user of the Service.</Text>
          <Text style={styles.listItem}>• For the performance of a contract: the development, compliance and undertaking of the purchase contract for the products, items or services you have purchased.</Text>
          <Text style={styles.listItem}>• To contact you: To contact you by email, telephone calls, SMS, or other equivalent forms of electronic communication.</Text>
          <Text style={styles.listItem}>• To provide you with news, special offers and general information about other goods, services and events which we offer.</Text>
          <Text style={styles.listItem}>• To manage your requests: To attend and manage your requests to us.</Text>
          <Text style={styles.listItem}>• For business transfers: We may use your information to evaluate or conduct a merger, divestiture, restructuring, reorganization, dissolution, or other sale or transfer of some or all of our assets.</Text>
          <Text style={styles.listItem}>• For other purposes: We may use your information for other purposes, such as data analysis, identifying usage trends, determining the effectiveness of our promotional campaigns and to evaluate and improve our Service, products, services, marketing and your experience.</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. SHARING OF YOUR PERSONAL DATA</Text>
          <Text style={styles.paragraph}>
            We may share your personal information in the following situations:
          </Text>
          <Text style={styles.listItem}>• With Service Providers: We may share your personal information with Service Providers to monitor and analyze the use of our Service, to process payments, to contact you.</Text>
          <Text style={styles.listItem}>• For business transfers: We may share or transfer your personal information in connection with, or during negotiations of, any merger, sale of Company assets, financing, or acquisition of all or a portion of our business to another company.</Text>
          <Text style={styles.listItem}>• With Affiliates: We may share your information with our affiliates, in which case we will require those affiliates to honor this Privacy Policy.</Text>
          <Text style={styles.listItem}>• With business partners: We may share your information with our business partners to offer you certain products, services or promotions.</Text>
          <Text style={styles.listItem}>• With other users: when you share personal information or otherwise interact in the public areas with other users, such information may be viewed by all users and may be publicly distributed outside.</Text>
          <Text style={styles.listItem}>• With Your consent: We may disclose your personal information for any other purpose with your consent.</Text>
        </View>

        <View style={styles.section}>
        <Text style={styles.sectionTitle}>4. RETENTION OF YOUR PERSONAL DATA</Text>
          <Text style={styles.paragraph}>
            The Company will retain your Personal Data only for as long as is necessary for the purposes set out in this Privacy Policy. We will retain and use your Personal Data to the extent necessary to comply with our legal obligations (for example, if we are required to retain your data to comply with applicable laws), resolve disputes, and enforce our legal agreements and policies.
          </Text>
          <Text style={styles.paragraph}>
            The Company will also retain Usage Data for internal analysis purposes. Usage Data is generally retained for a shorter period of time, except when this data is used to strengthen the security or to improve the functionality of our Service, or we are legally obligated to retain this data for longer time periods.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. TRANSFER OF YOUR PERSONAL DATA</Text>
          <Text style={styles.paragraph}>
            Your information, including Personal Data, is processed at the Company's operating offices and in any other places where the parties involved in the processing are located. It means that this information may be transferred to — and maintained on — computers located outside of your state, province, country or other governmental jurisdiction where the data protection laws may differ than those from your jurisdiction.
          </Text>
          <Text style={styles.paragraph}>
            Your consent to this Privacy Policy followed by your submission of such information represents your agreement to that transfer.
          </Text>
          <Text style={styles.paragraph}>
            The Company will take all steps reasonably necessary to ensure that your data is treated securely and in accordance with this Privacy Policy and no transfer of your Personal Data will take place to an organization or a country unless there are adequate controls in place including the security of your data and other personal information.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>6. DISCLOSURE OF YOUR PERSONAL DATA</Text>
          <Text style={styles.sectionSubtitle}>Business Transactions</Text>
          <Text style={styles.paragraph}>
            If the Company is involved in a merger, acquisition or asset sale, your Personal Data may be transferred. We will provide notice before your Personal Data is transferred and becomes subject to a different Privacy Policy.
          </Text>
          
          <Text style={styles.sectionSubtitle}>Law enforcement</Text>
          <Text style={styles.paragraph}>
            Under certain circumstances, the Company may be required to disclose your Personal Data if required to do so by law or in response to valid requests by public authorities (e.g. a court or a government agency).
          </Text>
          
          <Text style={styles.sectionSubtitle}>Other legal requirements</Text>
          <Text style={styles.paragraph}>
            The Company may disclose your Personal Data in the good faith belief that such action is necessary to:
          </Text>
          <Text style={styles.listItem}>• Comply with a legal obligation</Text>
          <Text style={styles.listItem}>• Protect and defend the rights or property of the Company</Text>
          <Text style={styles.listItem}>• Prevent or investigate possible wrongdoing in connection with the Service</Text>
          <Text style={styles.listItem}>• Protect the personal safety of Users of the Service or the public</Text>
          <Text style={styles.listItem}>• Protect against legal liability</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>7. SECURITY OF YOUR PERSONAL DATA</Text>
          <Text style={styles.paragraph}>
            The security of your Personal Data is important to us, but remember that no method of transmission over the Internet, or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your Personal Data, we cannot guarantee its absolute security.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>8. CHILDREN'S PRIVACY</Text>
          <Text style={styles.paragraph}>
            Our Service does not address anyone under the age of 13. We do not knowingly collect personally identifiable information from anyone under the age of 13. If you are a parent or guardian and you are aware that your child has provided us with Personal Data, please contact us. If we become aware that we have collected Personal Data from anyone under the age of 13 without verification of parental consent, we take steps to remove that information from our servers.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>9. LINKS TO OTHER WEBSITES</Text>
          <Text style={styles.paragraph}>
            Our Service may contain links to other websites that are not operated by us. If you click on a third party link, you will be directed to that third party's site. We strongly advise you to review the Privacy Policy of every site you visit.
          </Text>
          <Text style={styles.paragraph}>
            We have no control over and assume no responsibility for the content, privacy policies or practices of any third party sites or services.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>10. CHANGES TO THIS PRIVACY POLICY</Text>
          <Text style={styles.paragraph}>
            We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page.
          </Text>
          <Text style={styles.paragraph}>
            We will let you know via email and/or a prominent notice on our Service, prior to the change becoming effective and update the "Last updated" date at the top of this Privacy Policy.
          </Text>
          <Text style={styles.paragraph}>
            You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>11. CONTACT US</Text>
          <Text style={styles.paragraph}>
            If you have any questions about this Privacy Policy, you can contact us:
          </Text>
          <Text style={styles.contactInfo}>
            By email: privacy@barbershopapp.com{'\n'}
            By visiting this page on our website: www.barbershopapp.com/privacy{'\n'}
            By phone number: (555) 123-4567{'\n'}
            By mail: 123 Main Street, San Francisco, CA 94105, United States
          </Text>
        </View>
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
  lastUpdated: {
    marginBottom: 15,
  },
  lastUpdatedText: {
    color: '#999',
    fontSize: 14,
    fontStyle: 'italic',
  },
  introduction: {
    color: '#BBB',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 25,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  sectionSubtitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 8,
  },
  paragraph: {
    color: '#BBB',
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 10,
  },
  listItem: {
    color: '#BBB',
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 5,
    paddingLeft: 15,
  },
  contactInfo: {
    color: '#BBB',
    fontSize: 14,
    lineHeight: 22,
    marginTop: 10,
  },
});

export default PrivacyPolicyScreen;
