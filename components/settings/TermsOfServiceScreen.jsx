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

const TermsOfServiceScreen = ({ navigation }) => {
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
        <Text style={styles.headerTitle}>Terms of Service</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.lastUpdated}>
          <Text style={styles.lastUpdatedText}>Last Updated: January 1, 2023</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. AGREEMENT TO TERMS</Text>
          <Text style={styles.paragraph}>
            These Terms of Service constitute a legally binding agreement made between you and Barbershop App, concerning your access to and use of our mobile application and website. You agree that by accessing the App, you have read, understood, and agree to be bound by all of these Terms of Service.
          </Text>
          <Text style={styles.paragraph}>
            IF YOU DO NOT AGREE WITH ALL OF THESE TERMS OF SERVICE, THEN YOU ARE EXPRESSLY PROHIBITED FROM USING THE APP AND YOU MUST DISCONTINUE USE IMMEDIATELY.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. INTELLECTUAL PROPERTY RIGHTS</Text>
          <Text style={styles.paragraph}>
            Unless otherwise indicated, the App is our proprietary property and all source code, databases, functionality, software, website designs, audio, video, text, photographs, and graphics on the App (collectively, the "Content") and the trademarks, service marks, and logos contained therein (the "Marks") are owned or controlled by us or licensed to us, and are protected by copyright and trademark laws and various other intellectual property rights.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. USER REPRESENTATIONS</Text>
          <Text style={styles.paragraph}>
            By using the App, you represent and warrant that: (1) you have the legal capacity to agree to these Terms of Service; (2) you are not a minor in the jurisdiction in which you reside; (3) you will not access the App through automated or non-human means; (4) you will not use the App for any illegal or unauthorized purpose; and (5) your use of the App will not violate any applicable law or regulation.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. USER REGISTRATION</Text>
          <Text style={styles.paragraph}>
            You may be required to register with the App. You agree to keep your password confidential and will be responsible for all use of your account and password. We reserve the right to remove, reclaim, or change a username you select if we determine, in our sole discretion, that such username is inappropriate, obscene, or otherwise objectionable.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. PROHIBITED ACTIVITIES</Text>
          <Text style={styles.paragraph}>
            You may not access or use the App for any purpose other than that for which we make the App available. The App may not be used in connection with any commercial endeavors except those that are specifically endorsed or approved by us.
          </Text>
          <Text style={styles.paragraph}>
            As a user of the App, you agree not to:
          </Text>
          <Text style={styles.listItem}>• Systematically retrieve data or other content from the App to create or compile, directly or indirectly, a collection, compilation, database, or directory.</Text>
          <Text style={styles.listItem}>• Trick, defraud, or mislead us and other users, especially in any attempt to learn sensitive account information.</Text>
          <Text style={styles.listItem}>• Circumvent, disable, or otherwise interfere with security-related features of the App.</Text>
          <Text style={styles.listItem}>• Disparage, tarnish, or otherwise harm, in our opinion, us and/or the App.</Text>
          <Text style={styles.listItem}>• Use any information obtained from the App in order to harass, abuse, or harm another person.</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>6. USER GENERATED CONTRIBUTIONS</Text>
          <Text style={styles.paragraph}>
            The App may invite you to chat, contribute to, or participate in blogs, message boards, online forums, and other functionality, and may provide you with the opportunity to create, submit, post, display, transmit, perform, publish, distribute, or broadcast content and materials to us or on the App, including but not limited to text, writings, video, audio, photographs, graphics, comments, suggestions, or personal information or other material (collectively, "Contributions").
          </Text>
          <Text style={styles.paragraph}>
            Any Contribution you post to the App will be considered non-confidential and non-proprietary. By posting any Contribution to the App, you grant us an unrestricted, unlimited, irrevocable, perpetual, non-exclusive, transferable, royalty-free, fully-paid, worldwide right, and license to host, use, copy, reproduce, disclose, sell, resell, publish, broadcast, retitle, archive, store, cache, publicly perform, publicly display, reformat, translate, transmit, excerpt (in whole or in part), and distribute such Contributions for any purpose, commercial, advertising, or otherwise, and to prepare derivative works of, or incorporate into other works, such Contributions, and grant and authorize sublicenses of the foregoing.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>7. MOBILE APPLICATION LICENSE</Text>
          <Text style={styles.sectionSubtitle}>Use License</Text>
          <Text style={styles.paragraph}>
            If you access the App via a mobile application, then we grant you a revocable, non-exclusive, non-transferable, limited right to install and use the mobile application on wireless electronic devices owned or controlled by you, and to access and use the mobile application on such devices strictly in accordance with the terms and conditions of this mobile application license contained in these Terms of Service.
          </Text>
          <Text style={styles.sectionSubtitle}>Apple and Android Devices</Text>
          <Text style={styles.paragraph}>
                      The following terms apply when you use a mobile application obtained from either the Apple Store or Google Play (each an "App Distributor") to access the App: (1) the license granted to you for our mobile application is limited to a non-transferable license to use the application on a device that utilizes the Apple iOS or Android operating systems, as applicable, and in accordance with the usage rules set forth in the applicable App Distributor's terms of service; (2) we are responsible for providing any maintenance and support services with respect to the mobile application as specified in the terms and conditions of this mobile application license contained in these Terms of Service or as otherwise required under applicable law, and you acknowledge that each App Distributor has no obligation whatsoever to furnish any maintenance and support services with respect to the mobile application; (3) in the event of any failure of the mobile application to conform to any applicable warranty, you may notify the applicable App Distributor, and the App Distributor, in accordance with its terms and policies, may refund the purchase price, if any, paid for the mobile application, and to the maximum extent permitted by applicable law, the App Distributor will have no other warranty obligation whatsoever with respect to the mobile application; (4) you represent and warrant that (i) you are not located in a country that is subject to a U.S. government embargo, or that has been designated by the U.S. government as a "terrorist supporting" country and (ii) you are not listed on any U.S. government list of prohibited or restricted parties; (5) you must comply with applicable third-party terms of agreement when using the mobile application, e.g., if you have a VoIP application, then you must not be in violation of their wireless data service agreement when using the mobile application; and (6) you acknowledge and agree that the App Distributors are third-party beneficiaries of the terms and conditions in this mobile application license contained in these Terms of Service, and that each App Distributor will have the right (and will be deemed to have accepted the right) to enforce the terms and conditions in this mobile application license contained in these Terms of Service against you as a third-party beneficiary thereof.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>8. TERM AND TERMINATION</Text>
          <Text style={styles.paragraph}>
            These Terms of Service shall remain in full force and effect while you use the App. WITHOUT LIMITING ANY OTHER PROVISION OF THESE TERMS OF SERVICE, WE RESERVE THE RIGHT TO, IN OUR SOLE DISCRETION AND WITHOUT NOTICE OR LIABILITY, DENY ACCESS TO AND USE OF THE APP (INCLUDING BLOCKING CERTAIN IP ADDRESSES), TO ANY PERSON FOR ANY REASON OR FOR NO REASON, INCLUDING WITHOUT LIMITATION FOR BREACH OF ANY REPRESENTATION, WARRANTY, OR COVENANT CONTAINED IN THESE TERMS OF SERVICE OR OF ANY APPLICABLE LAW OR REGULATION. WE MAY TERMINATE YOUR USE OR PARTICIPATION IN THE APP OR DELETE YOUR ACCOUNT AND ANY CONTENT OR INFORMATION THAT YOU POSTED AT ANY TIME, WITHOUT WARNING, IN OUR SOLE DISCRETION.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>9. MODIFICATIONS AND INTERRUPTIONS</Text>
          <Text style={styles.paragraph}>
            We reserve the right to change, modify, or remove the contents of the App at any time or for any reason at our sole discretion without notice. However, we have no obligation to update any information on our App. We also reserve the right to modify or discontinue all or part of the App without notice at any time. We will not be liable to you or any third party for any modification, price change, suspension, or discontinuance of the App.
          </Text>
          <Text style={styles.paragraph}>
            We cannot guarantee the App will be available at all times. We may experience hardware, software, or other problems or need to perform maintenance related to the App, resulting in interruptions, delays, or errors. We reserve the right to change, revise, update, suspend, discontinue, or otherwise modify the App at any time or for any reason without notice to you. You agree that we have no liability whatsoever for any loss, damage, or inconvenience caused by your inability to access or use the App during any downtime or discontinuance of the App. Nothing in these Terms of Service will be construed to obligate us to maintain and support the App or to supply any corrections, updates, or releases in connection therewith.
          </Text>
          </View>

<View style={styles.section}>
  <Text style={styles.sectionTitle}>10. GOVERNING LAW</Text>
  <Text style={styles.paragraph}>
    These Terms of Service and your use of the App are governed by and construed in accordance with the laws of the State of California applicable to agreements made and to be entirely performed within the State of California, without regard to its conflict of law principles.
  </Text>
</View>

<View style={styles.section}>
  <Text style={styles.sectionTitle}>11. DISPUTE RESOLUTION</Text>
  <Text style={styles.sectionSubtitle}>Informal Negotiations</Text>
  <Text style={styles.paragraph}>
    To expedite resolution and control the cost of any dispute, controversy, or claim related to these Terms of Service (each a "Dispute" and collectively, the "Disputes") brought by either you or us (individually, a "Party" and collectively, the "Parties"), the Parties agree to first attempt to negotiate any Dispute (except those Disputes expressly provided below) informally for at least thirty (30) days before initiating arbitration. Such informal negotiations commence upon written notice from one Party to the other Party.
  </Text>
  <Text style={styles.sectionSubtitle}>Binding Arbitration</Text>
  <Text style={styles.paragraph}>
    If the Parties are unable to resolve a Dispute through informal negotiations, the Dispute (except those Disputes expressly excluded below) will be finally and exclusively resolved by binding arbitration. YOU UNDERSTAND THAT WITHOUT THIS PROVISION, YOU WOULD HAVE THE RIGHT TO SUE IN COURT AND HAVE A JURY TRIAL. The arbitration shall be commenced and conducted under the Commercial Arbitration Rules of the American Arbitration Association ("AAA") and, where appropriate, the AAA's Supplementary Procedures for Consumer Related Disputes ("AAA Consumer Rules"), both of which are available at the AAA website www.adr.org.
  </Text>
</View>

<View style={styles.section}>
  <Text style={styles.sectionTitle}>12. CORRECTIONS</Text>
  <Text style={styles.paragraph}>
    There may be information on the App that contains typographical errors, inaccuracies, or omissions, including descriptions, pricing, availability, and various other information. We reserve the right to correct any errors, inaccuracies, or omissions and to change or update the information on the App at any time, without prior notice.
  </Text>
</View>

<View style={styles.section}>
  <Text style={styles.sectionTitle}>13. DISCLAIMER</Text>
  <Text style={styles.paragraph}>
    THE APP IS PROVIDED ON AN AS-IS AND AS-AVAILABLE BASIS. YOU AGREE THAT YOUR USE OF THE APP AND OUR SERVICES WILL BE AT YOUR SOLE RISK. TO THE FULLEST EXTENT PERMITTED BY LAW, WE DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED, IN CONNECTION WITH THE APP AND YOUR USE THEREOF, INCLUDING, WITHOUT LIMITATION, THE IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. WE MAKE NO WARRANTIES OR REPRESENTATIONS ABOUT THE ACCURACY OR COMPLETENESS OF THE APP'S CONTENT OR THE CONTENT OF ANY WEBSITES LINKED TO THE APP AND WE WILL ASSUME NO LIABILITY OR RESPONSIBILITY FOR ANY (1) ERRORS, MISTAKES, OR INACCURACIES OF CONTENT AND MATERIALS, (2) PERSONAL INJURY OR PROPERTY DAMAGE, OF ANY NATURE WHATSOEVER, RESULTING FROM YOUR ACCESS TO AND USE OF THE APP, (3) ANY UNAUTHORIZED ACCESS TO OR USE OF OUR SECURE SERVERS AND/OR ANY AND ALL PERSONAL INFORMATION AND/OR FINANCIAL INFORMATION STORED THEREIN, (4) ANY INTERRUPTION OR CESSATION OF TRANSMISSION TO OR FROM THE APP, (5) ANY BUGS, VIRUSES, TROJAN HORSES, OR THE LIKE WHICH MAY BE TRANSMITTED TO OR THROUGH THE APP BY ANY THIRD PARTY, AND/OR (6) ANY ERRORS OR OMISSIONS IN ANY CONTENT AND MATERIALS OR FOR ANY LOSS OR DAMAGE OF ANY KIND INCURRED AS A RESULT OF THE USE OF ANY CONTENT POSTED, TRANSMITTED, OR OTHERWISE MADE AVAILABLE VIA THE APP. WE DO NOT WARRANT, ENDORSE, GUARANTEE, OR ASSUME RESPONSIBILITY FOR ANY PRODUCT OR SERVICE ADVERTISED OR OFFERED BY A THIRD PARTY THROUGH THE APP, ANY HYPERLINKED WEBSITE, OR ANY WEBSITE OR MOBILE APPLICATION FEATURED IN ANY BANNER OR OTHER ADVERTISING, AND WE WILL NOT BE A PARTY TO OR IN ANY WAY BE RESPONSIBLE FOR MONITORING ANY TRANSACTION BETWEEN YOU AND ANY THIRD-PARTY PROVIDERS OF PRODUCTS OR SERVICES.
  </Text>
</View>

<View style={styles.section}>
  <Text style={styles.sectionTitle}>14. LIMITATIONS OF LIABILITY</Text>
  <Text style={styles.paragraph}>
    IN NO EVENT WILL WE OR OUR DIRECTORS, EMPLOYEES, OR AGENTS BE LIABLE TO YOU OR ANY THIRD PARTY FOR ANY DIRECT, INDIRECT, CONSEQUENTIAL, EXEMPLARY, INCIDENTAL, SPECIAL, OR PUNITIVE DAMAGES, INCLUDING LOST PROFIT, LOST REVENUE, LOSS OF DATA, OR OTHER DAMAGES ARISING FROM YOUR USE OF THE APP, EVEN IF WE HAVE BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
  </Text>
</View>

<View style={styles.section}>
  <Text style={styles.sectionTitle}>15. INDEMNIFICATION</Text>
  <Text style={styles.paragraph}>
    You agree to defend, indemnify, and hold us harmless, including our subsidiaries, affiliates, and all of our respective officers, agents, partners, and employees, from and against any loss, damage, liability, claim, or demand, including reasonable attorneys' fees and expenses, made by any third party due to or arising out of: (1) your Contributions; (2) use of the App; (3) breach of these Terms of Service; (4) any breach of your representations and warranties set forth in these Terms of Service; (5) your violation of the rights of a third party, including but not limited to intellectual property rights; or (6) any overt harmful act toward any other user of the App with whom you connected via the App.
  </Text>
</View>

<View style={styles.section}>
  <Text style={styles.sectionTitle}>16. USER DATA</Text>
  <Text style={styles.paragraph}>
    We will maintain certain data that you transmit to the App for the purpose of managing the performance of the App, as well as data relating to your use of the App. Although we perform regular routine backups of data, you are solely responsible for all data that you transmit or that relates to any activity you have undertaken using the App. You agree that we shall have no liability to you for any loss or corruption of any such data, and you hereby waive any right of action against us arising from any such loss or corruption of such data.
  </Text>
</View>

<View style={styles.section}>
  <Text style={styles.sectionTitle}>17. CONTACT US</Text>
  <Text style={styles.paragraph}>
    In order to resolve a complaint regarding the App or to receive further information regarding use of the App, please contact us at:
  </Text>
  <Text style={styles.contactInfo}>
    Barbershop App{'\n'}
    123 Main Street{'\n'}
    San Francisco, CA 94105{'\n'}
    United States{'\n'}
    support@barbershopapp.com
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
marginBottom: 20,
},
lastUpdatedText: {
color: '#999',
fontSize: 14,
fontStyle: 'italic',
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

export default TermsOfServiceScreen;
