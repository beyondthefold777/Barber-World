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
import { Feather, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
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

  const sidebarSections = [
    {
      title: "Financial Hub",
      items: [
        {
          label: "1099 Forms & Taxes",
          screen: "TaxForms"
        },
        {
          label: "Product Tax Write-offs",
          screen: "WriteOffs"
        },
        {
          label: "Business Expenses",
          screen: "Expenses"
        },
        {
          label: "Pay Schedule",
          screen: "PaySchedule"
        },
        {
          label: "Projected Income",
          screen: "ProjectedIncome"
        },
        {
          label: "Payment History",
          screen: "PaymentHistory"
        }
      ]
    },
    {
      title: "Marketing Center",
      items: [
        "Promotions Manager",
        {
          label: "Boost Campaigns",
          screen: "BoostCampaign"
        },
        "Social Media Integration",
        "Client Reviews",
        "Message Blasts",
        "Performance Tracker"
      ]
    },
    {
      title: "Shop Settings",
      items: [
        {
          label: "Customize Shop",
          screen: "CustomizeShop"  
        },
        "Cancellation Fees",
        "Reminder Settings",
        "Client Allergies",
        "Service Catalog",
        "Deposit Requirements"
      ]
    },
    {
      title: "Business Tools",
      items: [
        "Digital Receipts",
        "Chair Rental",
        "Utility Tracking",
        "Employee Management",
        "Trial Management",
        "Task Manager"
      ]
    },
    {
      title: "Account",
      items: [
        "Profile Settings",
        "Notifications",
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
                      <View style={styles.logoutItem}>
                        {item.icon && <Feather name={item.icon} size={20} color="#FF0000" />}
                        <Text style={[styles.sidebarItemText, item.icon ? styles.logoutText : null]}>
                          {item.label}
                        </Text>
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
        <Text style={styles.mainTitle}>Grow Your Business With Us</Text>
        
        <View style={styles.benefitsContainer}>
          <View style={styles.benefitItem}>
            <Feather name="trending-up" size={24} color="#FF0000" />
            <View style={styles.benefitContent}>
              <Text style={styles.benefitTitle}>Increase Revenue</Text>
              <Text style={styles.benefitText}>Average 40% boost in monthly bookings</Text>
            </View>
          </View>
          
          <View style={styles.benefitItem}>
            <Feather name="users" size={24} color="#FF0000" />
            <View style={styles.benefitContent}>
              <Text style={styles.benefitTitle}>Client Management</Text>
              <Text style={styles.benefitText}>Smart scheduling & client retention tools</Text>
            </View>
          </View>
          
          <View style={styles.benefitItem}>
            <Feather name="bar-chart-2" size={24} color="#FF0000" />
            <View style={styles.benefitContent}>
              <Text style={styles.benefitTitle}>Smart Analytics</Text>
              <Text style={styles.benefitText}>Real-time business insights & growth tracking</Text>
            </View>
          </View>

          <TouchableOpacity 
            style={styles.subscribeButton}
            onPress={() => navigation.navigate('TrialSignup')}
          >
            <Text style={styles.subscribeButtonText}>Start Free Trial</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={styles.navbar}>
        <TouchableOpacity style={styles.navItem}>
          <Feather name="bell" size={24} color="white" />
          <Text style={styles.navText}>Alerts</Text>
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

        <TouchableOpacity style={styles.navItem}>
          <Feather name="trending-up" size={24} color="white" />
          <Text style={styles.navText}>Analytics</Text>
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
    marginBottom: 20,
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
  mainTitle: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  benefitsContainer: {
    marginTop: 10,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 15,
    backgroundColor: '#000000',
    padding: 15,
    borderRadius: 10,
  },
  benefitContent: {
    marginLeft: 15,
    flex: 1,
  },
  benefitTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  benefitText: {
    color: '#888',
    fontSize: 14,
    marginTop: 5,
  },
  subscribeButton: {
    backgroundColor: '#FF0000',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 20,
    elevation: 5,
  },
  subscribeButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 0.5,
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