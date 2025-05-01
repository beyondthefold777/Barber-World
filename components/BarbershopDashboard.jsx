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
  Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, MaterialIcons, FontAwesome5, Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BarbershopDashboard = () => {
  const navigation = useNavigation();
  const [isOpen, setIsOpen] = useState(false);
  const slideAnim = useRef(new Animated.Value(-300)).current;

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userRole');
      navigation.replace('Login');
    } catch (error) {
      Alert.alert('Logout Failed', 'Please try again');
    }
  };

  const toggleMenu = () => {
    const toValue = isOpen ? -300 : 0;
    Animated.timing(slideAnim, {
      toValue,
      duration: 300,
      useNativeDriver: true,
    }).start();
    setIsOpen(!isOpen);
  };
  
  const showPremiumFeatureAlert = () => {
    Alert.alert(
      "Premium Feature",
      "This premium feature is coming soon. Stay tuned!",
      [{ text: "OK", style: "default" }]
    );
  };

  const sidebarSections = [
    {
      title: "Financial Hub",
      items: [
        {
          label: "1099 Forms & Taxes",
          isPremium: true,
          onPress: showPremiumFeatureAlert
        },
        {
          label: "Product Tax Write-offs",
          isPremium: true,
          onPress: showPremiumFeatureAlert
        },
        {
          label: "Business Expenses",
          isPremium: true,
          onPress: showPremiumFeatureAlert
        },
        {
          label: "Pay Schedule",
          isPremium: true,
          onPress: showPremiumFeatureAlert
        },
        {
          label: "Projected Income",
          isPremium: true,
          onPress: showPremiumFeatureAlert
        },
        {
          label: "Payment History",
          isPremium: true,
          onPress: showPremiumFeatureAlert
        }
      ]
    },
    {
      title: "Marketing Center",
      items: [
        {
          label: "Promotions Manager",
          isPremium: true,
          onPress: showPremiumFeatureAlert
        },
        {
          label: "Boost Campaigns",
          isPremium: true,
          onPress: showPremiumFeatureAlert
        },
        {
          label: "Social Media Integration",
          isPremium: true,
          onPress: showPremiumFeatureAlert
        },
        {
          label: "Message Blasts",
          isPremium: true,
          onPress: showPremiumFeatureAlert
        },
        {
          label: "Performance Tracker",
          isPremium: true,
          onPress: showPremiumFeatureAlert
        }
      ]
    },
    {
      title: "Shop Settings",
      items: [
        {
          label: "Customize Shop",
          screen: "CustomizeShop"
        },
        {
          label: "Cancellation Fees",
          isPremium: true,
          onPress: showPremiumFeatureAlert
        },
        {
          label: "Client Allergies",
          isPremium: true,
          onPress: showPremiumFeatureAlert
        },
        {
          label: "Deposit Requirements",
          isPremium: true,
          onPress: showPremiumFeatureAlert
        }
      ]
    },
    {
      title: "Business Tools",
      items: [
        {
          label: "Digital Receipts",
          isPremium: true,
          onPress: showPremiumFeatureAlert
        },
        {
          label: "Chair Rental",
          isPremium: true,
          onPress: showPremiumFeatureAlert
        },
        {
          label: "Utility Tracking",
          isPremium: true,
          onPress: showPremiumFeatureAlert
        },
        {
          label: "Employee Management",
          isPremium: true,
          onPress: showPremiumFeatureAlert
        },
        {
          label: "Trial Management",
          isPremium: true,
          onPress: showPremiumFeatureAlert
        }
      ]
    },
    {
      title: "Account",
      items: [
        {
          label: "Profile Settings",
          screen: "ProfileSettings"
        },
        {
          label: "Notifications",
          screen: "Notifications"
        },
        {
          label: "Logout",
          onPress: handleLogout,
          icon: "log-out"
        }
      ]
    }
  ];

  return (
    <LinearGradient
      colors={['#000000', '#333333']}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" translucent={true} backgroundColor="transparent" />
      <TouchableOpacity 
        style={styles.menuButton}
        onPress={toggleMenu}
      >
        <Feather name="menu" size={24} color="white" />
      </TouchableOpacity>
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
            <Text style={styles.sidebarTitle}>Business Center</Text>
            <View style={styles.titleUnderline} />
          </View>
          
          <View style={styles.sidebarLegend}>
            <Text style={styles.legendText}>
              Features marked with <Ionicons name="star" size={14} color="#FF0000" /> are premium features coming soon
            </Text>
          </View>
          
          <ScrollView 
            style={styles.sidebarContent}
            showsVerticalScrollIndicator={true}
            indicatorStyle="white"
          >
            {sidebarSections.map((section, index) => (
              <View key={index}>
                <Text style={styles.sidebarSection}>{section.title}</Text>
                {section.items.map((item, itemIndex) => (
                  <TouchableOpacity 
                    key={itemIndex}
                    style={styles.sidebarItem}
                    onPress={() => {
                      if (typeof item === 'object') {
                        if (item.screen) {
                          navigation.navigate(item.screen);
                          toggleMenu();
                        } else if (item.onPress) {
                          item.onPress();
                        }
                      }
                    }}
                  >
                    {typeof item === 'object' ? (
                      <View style={styles.sidebarItemRow}>
                        <View style={styles.logoutItem}>
                          {item.icon && <Feather name={item.icon} size={20} color="#FF0000" />}
                          <Text style={[styles.sidebarItemText, item.icon ? styles.logoutText : null]}>
                            {item.label}
                          </Text>
                        </View>
                        {item.isPremium && (
                          <Ionicons name="star" size={16} color="#FF0000" />
                        )}
                      </View>
                    ) : (
                      <Text style={styles.sidebarItemText}>{item}</Text>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            ))}
          </ScrollView>
        </LinearGradient>
      </Animated.View>
      <ScrollView style={styles.content}>
        <View style={styles.welcomeContainer}>
          <Text style={styles.mainTitle}>Welcome to Your Shop!</Text>
          <Text style={styles.welcomeText}>
            Premium features marked with a <Ionicons name="star" size={14} color="#FF0000" /> are coming soon.
            All other features are available now.
          </Text>
          
          <View style={styles.featuresList}>
            <View style={styles.featureItem}>
              <Feather name="message-square" size={20} color="#FF0000" />
              <Text style={styles.featureText}>In-app messaging between shop and clients</Text>
            </View>
            
            <View style={styles.featureItem}>
              <Feather name="calendar" size={20} color="#FF0000" />
              <Text style={styles.featureText}>Appointment tracking and management</Text>
            </View>
            
            <View style={styles.featureItem}>
              <Feather name="edit" size={20} color="#FF0000" />
              <Text style={styles.featureText}>Customizable shop profile</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.setupProfileCard}>
          <View style={styles.setupProfileContent}>
            <Feather name="scissors" size={40} color="white" />
            <Text style={styles.setupProfileTitle}>Get Started Now!</Text>
            <Text style={styles.setupProfileText}>
              Set up your shop profile to start attracting clients
            </Text>
            <TouchableOpacity 
              style={styles.setupProfileButton}
              onPress={() => navigation.navigate('CustomizeShop')}
            >
              <Text style={styles.setupProfileButtonText}>Customize Your Shop</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      <View style={styles.navbar}>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => navigation.navigate('MessagesScreen')}
        >
          <Feather name="message-square" size={24} color="white" />
          <Text style={styles.navText}>Messages</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => navigation.navigate('AppointmentList')}
        >
          <Feather name="calendar" size={24} color="white" />
          <Text style={styles.navText}>Appointments</Text>
        </TouchableOpacity>
        
        <TouchableOpacity>
          <LinearGradient
            colors={['#FF0000', '#FFFFFF', '#0000FF', '#FF0000', '#FFFFFF', '#0000FF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.clipperButton}
          />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.navItem}
          onPress={showPremiumFeatureAlert}
        >
          <Feather name="trending-up" size={24} color="white" />
          <Text style={styles.navText}>Analytics</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => navigation.navigate('CustomizeShop')}
        >
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
  },
  sidebarTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  titleUnderline: {
    height: 2,
    backgroundColor: '#FFFFFF',
    width: '100%',
    marginTop: 10,
  },
  sidebarLegend: {
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  legendText: {
    color: 'white',
    fontSize: 12,
  },
  sidebarContent: {
    flex: 1,
    marginTop: 20,
  },
  sidebarSection: {
    color: '#FF0000',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  sidebarItem: {
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  sidebarItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sidebarItemText: {
    color: 'white',
    fontSize: 16,
  },
  logoutItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoutText: {
    marginLeft: 10,
    color: '#FF0000',
    fontWeight: 'bold'
  },
  content: {
    flex: 1,
    paddingTop: 100,
    paddingHorizontal: 20,
  },
  welcomeContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  mainTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  welcomeText: {
    color: '#DDD',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 15,
    lineHeight: 20,
  },
  featuresList: {
    marginTop: 5,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureText: {
    color: 'white',
    fontSize: 14,
    marginLeft: 10,
  },
  setupProfileCard: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 15,
    overflow: 'hidden',
    marginBottom: 25,
    elevation: 5,
  },
  setupProfileContent: {
    padding: 25,
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  setupProfileTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 10,
    textAlign: 'center',
  },
  setupProfileText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    opacity: 0.9,
  },
  setupProfileButton: {
    backgroundColor: '#FF0000',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 25,
    marginTop: 5,
  },
  setupProfileButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#000000',
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: '#333',
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

export default BarbershopDashboard;
