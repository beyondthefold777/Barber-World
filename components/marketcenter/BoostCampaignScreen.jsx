import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Animated,
  ScrollView,
  Alert,
  TextInput,
  Image,
  Switch
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, MaterialIcons, FontAwesome5, Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';

const BoostCampaignScreen = () => {
  const navigation = useNavigation();
  const [isOpen, setIsOpen] = useState(false);
  const slideAnim = useRef(new Animated.Value(-300)).current;
  
  // Campaign state
  const [campaigns, setCampaigns] = useState([
    {
      id: '1',
      title: 'Summer Fade Special',
      description: 'Get 15% off all fade haircuts this summer',
      image: 'https://example.com/fade.jpg',
      status: 'active',
      audience: 'All clients',
      budget: 50,
      reach: 1250,
      clicks: 78,
      bookings: 12,
      startDate: '2023-06-01',
      endDate: '2023-08-31'
    },
    {
      id: '2',
      title: 'Back to School Discount',
      description: 'Students get 20% off any haircut',
      image: 'https://example.com/student.jpg',
      status: 'scheduled',
      audience: 'Students',
      budget: 75,
      reach: 0,
      clicks: 0,
      bookings: 0,
      startDate: '2023-08-15',
      endDate: '2023-09-15'
    },
    {
      id: '3',
      title: 'Father\'s Day Special',
      description: 'Father & son combo discount',
      image: 'https://example.com/father.jpg',
      status: 'ended',
      audience: 'Male clients',
      budget: 100,
      reach: 2100,
      clicks: 145,
      bookings: 32,
      startDate: '2023-06-01',
      endDate: '2023-06-18'
    }
  ]);
  
  const [newCampaign, setNewCampaign] = useState({
    title: '',
    description: '',
    image: null,
    audience: 'All clients',
    budget: 50,
    startDate: '',
    endDate: ''
  });
  
  const [showNewCampaignForm, setShowNewCampaignForm] = useState(false);
  const [activeTab, setActiveTab] = useState('active');
  
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
  
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setNewCampaign({...newCampaign, image: result.assets[0].uri});
    }
  };
  
  const createCampaign = () => {
    if (!newCampaign.title || !newCampaign.description) {
      Alert.alert('Missing Information', 'Please fill in all required fields');
      return;
    }
    
    const campaign = {
      id: Date.now().toString(),
      ...newCampaign,
      status: 'scheduled',
      reach: 0,
      clicks: 0,
      bookings: 0
    };
    
    setCampaigns([campaign, ...campaigns]);
    setNewCampaign({
      title: '',
      description: '',
      image: null,
      audience: 'All clients',
      budget: 50,
      startDate: '',
      endDate: ''
    });
    setShowNewCampaignForm(false);
    Alert.alert('Success', 'Your campaign has been created and scheduled!');
  };
  
  const getFilteredCampaigns = () => {
    return campaigns.filter(campaign => campaign.status === activeTab);
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
        <Text style={styles.mainTitle}>Boost Campaigns</Text>
        
        <View style={styles.campaignHeader}>
          <Text style={styles.campaignSubtitle}>
            Create targeted promotions to attract new clients and boost your business
          </Text>
          
          {!showNewCampaignForm && (
            <TouchableOpacity 
              style={styles.createButton}
              onPress={() => setShowNewCampaignForm(true)}
            >
              <Feather name="plus" size={20} color="white" />
              <Text style={styles.createButtonText}>New Campaign</Text>
            </TouchableOpacity>
          )}
        </View>
        
        {showNewCampaignForm ? (
          <View style={styles.formContainer}>
            <Text style={styles.formTitle}>Create New Campaign</Text>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Campaign Title*</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Summer Special Offer"
                placeholderTextColor="#666"
                value={newCampaign.title}
                onChangeText={(text) => setNewCampaign({...newCampaign, title: text})}
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Description*</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Describe your offer..."
                placeholderTextColor="#666"
                multiline
                numberOfLines={4}
                value={newCampaign.description}
                onChangeText={(text) => setNewCampaign({...newCampaign, description: text})}
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Campaign Image</Text>
              <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
                {newCampaign.image ? (
                  <Image source={{ uri: newCampaign.image }} style={styles.previewImage} />
                ) : (
                  <View style={styles.uploadPlaceholder}>
                    <Feather name="image" size={24} color="#666" />
                    <Text style={styles.uploadText}>Upload Image</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Target Audience</Text>
              <View style={styles.audienceSelector}>
                <TouchableOpacity 
                  style={[
                    styles.audienceOption, 
                    newCampaign.audience === 'All clients' && styles.audienceOptionSelected
                  ]}
                  onPress={() => setNewCampaign({...newCampaign, audience: 'All clients'})}
                >
                  <Text style={[
                    styles.audienceText,
                    newCampaign.audience === 'All clients' && styles.audienceTextSelected
                  ]}>All Clients</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[
                    styles.audienceOption, 
                    newCampaign.audience === 'New clients' && styles.audienceOptionSelected
                  ]}
                  onPress={() => setNewCampaign({...newCampaign, audience: 'New clients'})}
                >
                  <Text style={[
                    styles.audienceText,
                    newCampaign.audience === 'New clients' && styles.audienceTextSelected
                  ]}>New Clients</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[
                    styles.audienceOption, 
                    newCampaign.audience === 'Returning clients' && styles.audienceOptionSelected
                  ]}
                  onPress={() => setNewCampaign({...newCampaign, audience: 'Returning clients'})}
                >
                  <Text style={[
                    styles.audienceText,
                    newCampaign.audience === 'Returning clients' && styles.audienceTextSelected
                  ]}>Returning</Text>
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Budget: ${newCampaign.budget}</Text>
              <View style={styles.sliderContainer}>
                <Text style={styles.sliderLabel}>$25</Text>
                <View style={styles.slider}>
                  <View style={[styles.sliderFill, { width: `${(newCampaign.budget - 25) / 1.75}%` }]} />
                </View>
                <Text style={styles.sliderLabel}>$200</Text>
              </View>
              <View style={styles.budgetButtons}>
                <TouchableOpacity 
                  style={styles.budgetButton}
                  onPress={() => setNewCampaign({...newCampaign, budget: Math.max(25, newCampaign.budget - 25)})}
                >
                  <Text style={styles.budgetButtonText}>-$25</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.budgetButton}
                  onPress={() => setNewCampaign({...newCampaign, budget: Math.min(200, newCampaign.budget + 25)})}
                >
                  <Text style={styles.budgetButtonText}>+$25</Text>
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Campaign Dates</Text>
              <View style={styles.dateContainer}>
                <View style={styles.dateInput}>
                  <Text style={styles.dateLabel}>Start Date</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="MM/DD/YYYY"
                    placeholderTextColor="#666"
                    value={newCampaign.startDate}
                    onChangeText={(text) => setNewCampaign({...newCampaign, startDate: text})}
                  />
                </View>
                <View style={styles.dateInput}>
                  <Text style={styles.dateLabel}>End Date</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="MM/DD/YYYY"
                    placeholderTextColor="#666"
                    value={newCampaign.endDate}
                    onChangeText={(text) => setNewCampaign({...newCampaign, endDate: text})}
                  />
                </View>
              </View>
            </View>
            
            <View style={styles.formActions}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setShowNewCampaignForm(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.submitButton}
                onPress={createCampaign}
              >
                <Text style={styles.submitButtonText}>Create Campaign</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <>
            <View style={styles.tabContainer}>
              <TouchableOpacity 
                style={[styles.tab, activeTab === 'active' && styles.activeTab]}
                onPress={() => setActiveTab('active')}
              >
                <Text style={[styles.tabText, activeTab === 'active' && styles.activeTabText]}>
                  Active
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.tab, activeTab === 'scheduled' && styles.activeTab]}
                onPress={() => setActiveTab('scheduled')}
              >
                <Text style={[styles.tabText, activeTab === 'scheduled' && styles.activeTabText]}>
                  Scheduled
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.tab, activeTab === 'ended' && styles.activeTab]}
                onPress={() => setActiveTab('ended')}
              >
                <Text style={[styles.tabText, activeTab === 'ended' && styles.activeTabText]}>
                  Ended
                </Text>
              </TouchableOpacity>
            </View>
            
            {getFilteredCampaigns().length > 0 ? (
              getFilteredCampaigns().map(campaign => (
                <TouchableOpacity 
                  key={campaign.id}
                  style={styles.campaignCard}
                  onPress={() => navigation.navigate('CampaignDetail', { campaignId: campaign.id })}
                >
                  <View style={styles.campaignHeader}>
                    <View>
                      <Text style={styles.campaignTitle}>{campaign.title}</Text>
                      <Text style={styles.campaignDates}>
                        {new Date(campaign.startDate).toLocaleDateString()} - {new Date(campaign.endDate).toLocaleDateString()}
                      </Text>
                    </View>
                    <View style={[
                      styles.statusBadge, 
                      campaign.status === 'active' ? styles.activeBadge : 
                      campaign.status === 'scheduled' ? styles.scheduledBadge : styles.endedBadge
                    ]}>
                      <Text style={styles.statusText}>
                        {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                      </Text>
                    </View>
                  </View>
                  
                  <Text style={styles.campaignDescription}>{campaign.description}</Text>
                  
                  <View style={styles.campaignStats}>
                    <View style={styles.statItem}>
                      <Text style={styles.statValue}>${campaign.budget}</Text>
                      <Text style={styles.statLabel}>Budget</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={styles.statValue}>{campaign.reach.toLocaleString()}</Text>
                      <Text style={styles.statLabel}>Reach</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={styles.statValue}>{campaign.clicks}</Text>
                      <Text style={styles.statLabel}>Clicks</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={styles.statValue}>{campaign.bookings}</Text>
                      <Text style={styles.statLabel}>Bookings</Text>
                    </View>
                  </View>
                  
                  {campaign.status === 'active' && (
                    <View style={styles.campaignActions}>
                      <TouchableOpacity style={styles.actionButton}>
                        <Feather name="edit-2" size={16} color="white" />
                        <Text style={styles.actionButtonText}>Edit</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={[styles.actionButton, styles.pauseButton]}>
                        <Feather name="pause" size={16} color="white" />
                        <Text style={styles.actionButtonText}>Pause</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                  
                  {campaign.status === 'scheduled' && (
                    <View style={styles.campaignActions}>
                      <TouchableOpacity style={styles.actionButton}>
                        <Feather name="edit-2" size={16} color="white" />
                        <Text style={styles.actionButtonText}>Edit</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={[styles.actionButton, styles.cancelCampaignButton]}>
                        <Feather name="x" size={16} color="white" />
                        <Text style={styles.actionButtonText}>Cancel</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                  
                  {campaign.status === 'ended' && (
                    <View style={styles.campaignActions}>
                      <TouchableOpacity style={styles.actionButton}>
                        <Feather name="bar-chart-2" size={16} color="white" />
                        <Text style={styles.actionButtonText}>Full Report</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.actionButton}>
                        <Feather name="refresh-cw" size={16} color="white" />
                        <Text style={styles.actionButtonText}>Run Again</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Feather name="inbox" size={50} color="#666" />
                <Text style={styles.emptyStateText}>
                  No {activeTab} campaigns found
                </Text>
                <Text style={styles.emptyStateSubtext}>
                  Create a new campaign to start promoting your services
                </Text>
              </View>
            )}
          </>
        )}
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
    paddingBottom: 80,
  },
  mainTitle: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  campaignHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  campaignSubtitle: {
    color: '#CCC',
    fontSize: 14,
    flex: 1,
    marginRight: 10,
  },
  createButton: {
    backgroundColor: '#FF0000',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
  },
  createButtonText: {
    color: 'white',
    marginLeft: 5,
    fontWeight: 'bold',
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#444',
  },
  tab: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginRight: 10,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#FF0000',
  },
  tabText: {
    color: '#AAA',
    fontSize: 16,
  },
  activeTabText: {
    color: 'white',
    fontWeight: 'bold',
  },
  campaignCard: {
    backgroundColor: '#222',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  campaignTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  campaignDates: {
    color: '#AAA',
    fontSize: 12,
    marginTop: 2,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  activeBadge: {
    backgroundColor: '#4CAF50',
  },
  scheduledBadge: {
    backgroundColor: '#2196F3',
  },
  endedBadge: {
    backgroundColor: '#9E9E9E',
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  campaignDescription: {
    color: '#CCC',
    fontSize: 14,
    marginTop: 10,
    marginBottom: 15,
  },
  campaignStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  statLabel: {
    color: '#AAA',
    fontSize: 12,
    marginTop: 2,
  },
  campaignActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    backgroundColor: '#444',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
    flex: 1,
    marginHorizontal: 5,
  },
  pauseButton: {
    backgroundColor: '#FF9800',
  },
  cancelCampaignButton: {
    backgroundColor: '#F44336',
  },
  actionButtonText: {
    color: 'white',
    marginLeft: 5,
    fontSize: 14,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  emptyStateText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 15,
  },
  emptyStateSubtext: {
    color: '#AAA',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 5,
  },
  formContainer: {
    backgroundColor: '#222',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
  },
  formTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    color: 'white',
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#333',
    borderRadius: 5,
    padding: 12,
    color: 'white',
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  imagePicker: {
    backgroundColor: '#333',
    borderRadius: 5,
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  uploadPlaceholder: {
    alignItems: 'center',
  },
  uploadText: {
    color: '#666',
    marginTop: 10,
  },
  audienceSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  audienceOption: {
    flex: 1,
    backgroundColor: '#333',
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  audienceOptionSelected: {
    backgroundColor: '#FF0000',
  },
  audienceText: {
    color: '#AAA',
    fontSize: 14,
  },
  audienceTextSelected: {
    color: 'white',
    fontWeight: 'bold',
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  sliderLabel: {
    color: '#AAA',
    fontSize: 14,
    width: 40,
  },
  slider: {
    flex: 1,
    height: 10,
    backgroundColor: '#333',
    borderRadius: 5,
    marginHorizontal: 10,
  },
  sliderFill: {
    height: 10,
    backgroundColor: '#FF0000',
    borderRadius: 5,
  },
  budgetButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  budgetButton: {
    backgroundColor: '#333',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  budgetButtonText: {
    color: 'white',
  },
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dateInput: {
    flex: 1,
    marginHorizontal: 5,
  },
  dateLabel: {
    color: '#AAA',
    fontSize: 14,
    marginBottom: 5,
  },
  formActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  cancelButton: {
    backgroundColor: '#333',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 5,
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: '#FF0000',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 5,
    flex: 2,
    alignItems: 'center',
  },
  submitButtonText: {
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
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
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

export default BoostCampaignScreen;
