import React, { useRef, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  StatusBar,
  Animated,
  ScrollView,
  Dimensions 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const GuestLandingPage = () => {
  const navigation = useNavigation();
  const [isOpen, setIsOpen] = useState(false);
  const slideAnim = useRef(new Animated.Value(-300)).current;

  const toggleMenu = () => {
    const toValue = isOpen ? -300 : 0;
    Animated.timing(slideAnim, {
      toValue,
      duration: 300,
      useNativeDriver: true,
    }).start();
    setIsOpen(!isOpen);
  };

  const SidebarItem = ({ icon, title, onPress }) => (
    <TouchableOpacity 
      style={styles.sidebarItem} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      {icon}
      <Text style={styles.sidebarText}>{title}</Text>
    </TouchableOpacity>
  );

  return (
    <LinearGradient
      colors={['#000000', '#333333']}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" translucent={true} backgroundColor="transparent" />

      {/* Hamburger Menu Button */}
      <TouchableOpacity 
        style={styles.menuButton}
        onPress={toggleMenu}
      >
        <Feather name="menu" size={24} color="white" />
      </TouchableOpacity>

      {/* Animated Sidebar */}
      <Animated.View 
        style={[
          styles.sidebar,
          {
            transform: [{ translateX: slideAnim }],
          },
        ]}
      >
        <LinearGradient
          colors={['#000000', '#333333']}
          style={styles.sidebarGradient}
        >
          <TouchableOpacity onPress={toggleMenu} style={styles.closeButton}>
            <Feather name="x" size={24} color="white" />
          </TouchableOpacity>

          <View style={styles.sidebarHeader}>
            <Text style={styles.sidebarTitle}>Guest Menu</Text>
            <View style={styles.titleUnderline} />
          </View>

          <View style={styles.sidebarContent}>
            <ScrollView 
              showsVerticalScrollIndicator={true}
              indicatorStyle="white"
            >
              {/* Profile Section */}
              <Text style={styles.sidebarSection}>Profile</Text>
              <TouchableOpacity style={styles.sidebarItem}>
                <Feather name="user" size={20} color="white" />
                <Text style={styles.sidebarItemText}>My Account</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.sidebarItem}>
                <Feather name="settings" size={20} color="white" />
                <Text style={styles.sidebarItemText}>Preferences</Text>
              </TouchableOpacity>

              {/* Appointments Section */}
              <Text style={styles.sidebarSection}>Appointments</Text>
              <TouchableOpacity style={styles.sidebarItem}>
                <Feather name="calendar" size={20} color="white" />
                <Text style={styles.sidebarItemText}>Book Now</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.sidebarItem}>
                <Feather name="clock" size={20} color="white" />
                <Text style={styles.sidebarItemText}>Upcoming</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.sidebarItem}>
                <Feather name="archive" size={20} color="white" />
                <Text style={styles.sidebarItemText}>History</Text>
              </TouchableOpacity>

              {/* Favorites Section */}
              <Text style={styles.sidebarSection}>Favorites</Text>
              <TouchableOpacity style={styles.sidebarItem}>
                <Feather name="heart" size={20} color="white" />
                <Text style={styles.sidebarItemText}>Saved Barbers</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.sidebarItem}>
                <Feather name="bookmark" size={20} color="white" />
                <Text style={styles.sidebarItemText}>Saved Styles</Text>
              </TouchableOpacity>

              {/* Payments Section */}
              <Text style={styles.sidebarSection}>Payments</Text>
              <TouchableOpacity style={styles.sidebarItem}>
                <Feather name="credit-card" size={20} color="white" />
                <Text style={styles.sidebarItemText}>Payment Methods</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.sidebarItem}>
                <Feather name="file-text" size={20} color="white" />
                <Text style={styles.sidebarItemText}>Transaction History</Text>
              </TouchableOpacity>

              {/* Support Section */}
              <Text style={styles.sidebarSection}>Support</Text>
              <TouchableOpacity style={styles.sidebarItem}>
                <Feather name="help-circle" size={20} color="white" />
                <Text style={styles.sidebarItemText}>Help Center</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.sidebarItem}>
                <Feather name="message-circle" size={20} color="white" />
                <Text style={styles.sidebarItemText}>Contact Support</Text>
              </TouchableOpacity>
                            {/* Footer Links */}
                            <View style={styles.sidebarFooter}>
                <TouchableOpacity style={styles.footerLink}>
                  <Text style={styles.footerText}>Terms of Service</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.footerLink}>
                  <Text style={styles.footerText}>Privacy Policy</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.footerLink}>
                  <Text style={styles.footerText}>About Us</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </LinearGradient>
      </Animated.View>

      {/* Top Right Image */}
      <View style={styles.topRightImage}>
        <Image 
          source={require('../assets/clippers1.png')}
          style={{width: 50, height: 50}}
        />
      </View>

      {/* Main Content Area */}
      <View style={styles.content}>
        <View style={styles.featuredSection}>
          <Text style={styles.sectionTitle}>Featured Barbershops</Text>
        </View>

        <View style={styles.promoSection}>
          <Text style={styles.promoTitle}>Special Offer!</Text>
          <Text style={styles.promoText}>Get 25% Off Your First Cut</Text>
          <Text style={styles.promoSubtext}>When you book today</Text>
          <TouchableOpacity 
            style={styles.promoButton}
            onPress={() => navigation.navigate('BookingScreen')}
          >
            <Text style={styles.promoButtonText}>Book Now</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Bottom Navigation Bar */}
      <View style={styles.navbar}>
        <TouchableOpacity style={styles.navItem}>
          <Feather name="home" size={24} color="white" />
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => navigation.navigate('SchedulingScreen')}
        >
          <Feather name="calendar" size={24} color="white" />
          <Text style={styles.navText}>Book</Text>
        </TouchableOpacity>

        <TouchableOpacity>
          <LinearGradient
            colors={['#FF0000', '#FFFFFF', '#0000FF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.clipperButton}
          />
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem}>
          <Feather name="search" size={24} color="white" />
          <Text style={styles.navText}>Find Shops</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem}>
          <Feather name="user" size={24} color="white" />
          <Text style={styles.navText}>Profile</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  menuButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 2,
    padding: 10,
  },
  sidebar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 300,
    backgroundColor: '#000',
    zIndex: 999,
  },
  sidebarGradient: {
    flex: 1,
    padding: 20,
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    padding: 10,
    zIndex: 3,
  },
  sidebarHeader: {
    paddingTop: 60,
    marginBottom: 10,
    alignItems: 'flex-start',
  },
  sidebarTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  titleUnderline: {
    height: 2,
    backgroundColor: '#FFFFFF',
    width: '100%',
    marginBottom: 10,
  },
  sidebarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  sidebarItemText: {
    color: 'white',
    marginLeft: 12,
    fontSize: 16,
  },
  sidebarSection: {
    color: '#FF0000',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  sidebarFooter: {
    marginTop: 30,
    borderTopWidth: 1,
    borderTopColor: '#444',
    paddingTop: 20,
  },
  footerLink: {
    padding: 8,
  },
  footerText: {
    color: '#888',
    fontSize: 14,
  },
  topRightImage: {
    position: 'absolute',
    top: 120,
    right: 20,
    zIndex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    paddingTop: 100,
  },
  featuredSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  promoSection: {
    padding: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FFFFFF',
    alignItems: 'center',
  },
  promoTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  promoText: {
    color: '#FF0000',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  promoSubtext: {
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 15,
  },
  promoButton: {
    backgroundColor: '#FF0000',
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  promoButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#000000',
    paddingBottom: 20,
    paddingTop: 10,
  },
  navItem: {
    alignItems: 'center',
  },
  navText: {
    color: 'white',
    fontSize: 12,
    marginTop: 5,
  },
  clipperButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -25,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
});

export default GuestLandingPage;

