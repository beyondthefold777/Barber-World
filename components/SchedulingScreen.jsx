import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, SafeAreaView } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { Button, Menu } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { appointmentService } from '../services/api.js';

const HAIRSTYLES = [
  { label: 'Classic Fade', value: 'fade', price: '$30' },
  { label: 'Taper Cut', value: 'taper', price: '$25' },
  { label: 'Lineup', value: 'lineup', price: '$20' },
  { label: 'Wave Style', value: 'waves', price: '$35' },
  { label: 'Textured Cut', value: 'textured', price: '$35' },
  { label: 'Regular Cut', value: 'pompadour', price: '$40' },
  { label: 'Crew Cut', value: 'crew', price: '$25' },
  { label: 'Scissor Cut', value: 'scissor', price: '$30' },
  { label: 'Designer Cut', value: 'designer', price: '$45' },
  { label: 'Buzz Cut', value: 'buzz', price: '$20' },
  { label: 'Undercut Style', value: 'undercut', price: '$35' },
  { label: 'Custom Style', value: 'custom', price: '$50' }
];

const SchedulingScreen = ({ route, navigation }) => {
  // Extract shop information from route params
  const shopId = route.params?.shopId;
  const shopName = route.params?.shopName || 'Barbershop';
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedStyle, setSelectedStyle] = useState({ value: '', label: '', price: '' });
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedStyleLabel, setSelectedStyleLabel] = useState('Select Style');
  const [loading, setLoading] = useState(false);
  const [fetchingSlots, setFetchingSlots] = useState(false);
  const [timeSlots, setTimeSlots] = useState([]);
  
  // Default time slots if API fails
  const defaultTimeSlots = [
    { timeSlot: '9:00 AM', isBooked: false, status: 'available' },
    { timeSlot: '10:00 AM', isBooked: false, status: 'available' },
    { timeSlot: '11:00 AM', isBooked: false, status: 'available' },
    { timeSlot: '1:00 PM', isBooked: false, status: 'available' },
    { timeSlot: '2:00 PM', isBooked: false, status: 'available' },
    { timeSlot: '3:00 PM', isBooked: false, status: 'available' },
    { timeSlot: '4:00 PM', isBooked: false, status: 'available' }
  ];

  useEffect(() => {
    // Validate that we have a shop ID
    if (!shopId) {
      Alert.alert(
        'Error',
        'No barbershop selected. Please go back and select a barbershop.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
      return;
    }
    // Set the navigation title
    navigation.setOptions({
      title: `Book at ${shopName}`
    });
    // Fetch available slots if date is selected
    if (selectedDate) {
      fetchTimeSlots(selectedDate);
    }
  }, [shopId, shopName, selectedDate, navigation]);

  const openMenu = () => setMenuVisible(true);
  const closeMenu = () => setMenuVisible(false);

  const handleStyleSelect = (style) => {
    setSelectedStyle({
      value: style.value,
      label: style.label,
      price: style.price
    });
    setSelectedStyleLabel(`${style.label} - ${style.price}`);
    closeMenu();
  };

  const fetchTimeSlots = async (date) => {
    setFetchingSlots(true);
    try {
      console.log(`Fetching time slots for date: ${date} and shop: ${shopId}`);
      
      // Pass the shopid to get time slots for this specific shop
      const response = await appointmentService.getTimeSlots(date, shopId);
      console.log('Time slots API response:', JSON.stringify(response));
      
      // Check if we have a valid response with time slots
      if (response && Array.isArray(response)) {
        console.log('Successfully parsed time slots');
        
        // Make sure to mark all booked slots as unavailable
        const processedSlots = response.map(slot => ({
          ...slot,
          // Ensure any slot marked as booked is treated as unavailable
          isBooked: slot.isBooked || slot.status === 'booked' || slot.isUserBooked
        }));
        
        setTimeSlots(processedSlots);
      } else {
        console.log('Invalid response format, using defaults');
        // Fallback to default slots if API doesn't return expected format
        setTimeSlots(defaultTimeSlots);
      }
    } catch (error) {
      console.log('Error fetching time slots:', error);
      // Fallback to default slots on error
      setTimeSlots(defaultTimeSlots);
    } finally {
      setFetchingSlots(false);
    }
  };

  const handleBooking = async () => {
    if (!selectedDate || !selectedTime || !selectedStyle.value) {
      Alert.alert('Please select date, time, and hairstyle');
      return;
    }
    if (!shopId) {
      Alert.alert('Error', 'No barbershop selected for booking');
      return;
    }
    setLoading(true);
    try {
      const appointmentData = {
        shopId: shopId,
        date: selectedDate,
        timeSlot: selectedTime,
        service: selectedStyle.label
      };
      
      const result = await appointmentService.bookAppointment(appointmentData);
      console.log('Booking result:', result);
      
      Alert.alert(
        'Success! 💈', 
        `Your appointment at ${shopName} has been booked!`,
        [{ text: 'OK', onPress: () => navigation.navigate('AppointmentsScreen') }]
      );
      
      // Update the time slots to reflect the new booking
      setTimeSlots(prev => 
        prev.map(slot =>
          slot.timeSlot === selectedTime
            ? { ...slot, isBooked: true, status: 'booked', isUserBooked: true }
            : slot
        )
      );
      
      // Reset form
      setSelectedDate('');
      setSelectedTime('');
      setSelectedStyle({ value: '', label: '', price: '' });
      setSelectedStyleLabel('Select Style');
    } catch (error) {
      console.error('Booking error:', error);
      Alert.alert('Booking Update', 'We could not process your booking at this time');
    } finally {
      setLoading(false);
    }
  };

  // Sort time slots chronologically
  const sortedTimeSlots = [...timeSlots].sort((a, b) => {
    return new Date(`01/01/2023 ${a.timeSlot}`) - new Date(`01/01/2023 ${b.timeSlot}`);
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient colors={['#000000', '#333333']} style={styles.container}>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollViewContent}>
          <View style={styles.contentContainer}>
            <Text style={styles.title}>Book Your Appointment at {shopName}</Text>
            
            <Calendar
              style={styles.calendar}
              onDayPress={day => {
                console.log('Selected date:', day.dateString);
                setSelectedDate(day.dateString);
                setSelectedTime(''); // Clear selected time when date changes
              }}
              markedDates={{
                [selectedDate]: {selected: true, selectedColor: '#FF0000'}
              }}
              minDate={new Date().toISOString().split('T')[0]}
              theme={{
                backgroundColor: 'transparent',
                calendarBackground: 'transparent',
                textSectionTitleColor: '#ffffff',
                selectedDayBackgroundColor: '#FF0000',
                selectedDayTextColor: '#ffffff',
                todayTextColor: '#FF0000',
                dayTextColor: '#ffffff',
                textDisabledColor: '#444444',
                monthTextColor: '#ffffff',
                arrowColor: '#ffffff',
              }}
            />
            <View style={styles.styleContainer}>
              <Text style={styles.subtitle}>Select Style</Text>
              <Menu
                visible={menuVisible}
                onDismiss={closeMenu}
                anchor={
                  <Button
                    mode="outlined"
                    onPress={openMenu}
                    style={[styles.dropdownButton, menuVisible && styles.dropdownButtonActive]}
                    labelStyle={styles.dropdownButtonText}
                    contentStyle={styles.dropdownButtonContent}
                    textColor="#ffffff"
                  >
                    {selectedStyleLabel}
                  </Button>
                }
                style={styles.menu}
                contentStyle={styles.menuContent}
              >
                {HAIRSTYLES.map((style) => (
                  <Menu.Item
                    key={style.value}
                    onPress={() => handleStyleSelect(style)}
                    title={`${style.label} - ${style.price}`}
                    titleStyle={styles.menuItemText}
                    style={styles.menuItem}
                  />
                ))}
              </Menu>
            </View>
            <View style={styles.timeContainer}>
              <Text style={styles.subtitle}>Available Times</Text>
              {fetchingSlots ? (
                <Text style={styles.loadingText}>Loading available times...</Text>
              ) : (
                <>
                  {selectedDate ? (
                    <>
                      <Text style={styles.timeInfoText}>
                        Red slots are available. Gray slots are booked.
                      </Text>
                      <View style={styles.timeGrid}>
                        {sortedTimeSlots.length > 0 ? (
                          sortedTimeSlots.map((slot) => {
                            // Consider a slot booked if any of these conditions are true
                            const isBooked = slot.isBooked ||
                                            slot.status === 'booked' ||
                                            slot.isUserBooked;
                            
                            return (
                              <Button
                                key={slot.timeSlot}
                                mode={selectedTime === slot.timeSlot ? 'contained' : 'outlined'}
                                onPress={() => !isBooked && setSelectedTime(slot.timeSlot)}
                                style={[
                                  styles.timeButton,
                                  isBooked ? styles.bookedTimeButton : styles.availableTimeButton,
                                  selectedTime === slot.timeSlot && styles.selectedTimeButton
                                ]}
                                textColor={isBooked ? '#999999' : '#ffffff'}
                                buttonColor={selectedTime === slot.timeSlot ? '#FF0000' : 'transparent'}
                                disabled={loading || isBooked}
                              >
                                {slot.timeSlot}
                                {isBooked && <Text style={styles.bookedText}> (Booked)</Text>}
                              </Button>
                            );
                          })
                        ) : (
                          <Text style={styles.noTimesText}>No time slots available for this date</Text>
                        )}
                      </View>
                    </>
                  ) : (
                    <Text style={styles.selectDateText}>Please select a date to see available times</Text>
                  )}
                </>
              )}
            </View>
            <Button
              mode="contained"
              style={styles.bookButton}
              onPress={handleBooking}
              loading={loading}
              disabled={loading || !selectedDate || !selectedTime || !selectedStyle.value}
              buttonColor="#FF0000"
               textColor="#FFFFFF"
            >
              {loading ? 'Booking...' : 'Book Appointment'}
            </Button>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000000',
  },
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  contentContainer: {
    padding: 15,
    paddingTop: 50,
    minHeight: '100%',
  },
  calendar: {
    marginBottom: 20,
    height: 350,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#ffffff',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    marginVertical: 15,
    color: '#ffffff',
  },
  styleContainer: {
    marginBottom: 20,
    zIndex: 1,
  },
  dropdownButton: {
    borderColor: '#ffffff',
    borderWidth: 1,
    borderRadius: 8,
    width: '100%',
    marginTop: 10,
    backgroundColor: 'transparent',
  },
  dropdownButtonActive: {
    borderColor: '#FF0000',
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
  },
  dropdownButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  dropdownButtonContent: {
    height: 50,
  },
  menu: {
    backgroundColor: '#222222',
    marginTop: 45,
    borderRadius: 8,
    width: '90%',
  },
  menuContent: {
    backgroundColor: '#222222',
  },
  menuItem: {
    height: 50,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  menuItemText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
  },
  timeContainer: {
    marginTop: 20,
  },
  timeInfoText: {
    color: '#ffffff',
    marginBottom: 10,
    textAlign: 'center',
    fontSize: 14,
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  timeButton: {
    width: '48%',
    marginBottom: 10,
    borderColor: '#ffffff',
  },
  bookedTimeButton: {
    borderColor: '#666666',
    backgroundColor: 'rgba(100, 100, 100, 0.3)',
  },
  availableTimeButton: {
    borderColor: '#FF0000',
    borderWidth: 2,
  },
  selectedTimeButton: {
    borderColor: '#FF0000',
    backgroundColor: '#FF0000',
  },
  bookedText: {
    fontSize: 12,
    color: '#999999',
  },
   bookButton: {
    marginTop: 30,
    marginBottom: 20,
    padding: 5,
  },
  loadingText: {
    color: '#ffffff',
    textAlign: 'center',
    marginVertical: 20,
    fontStyle: 'italic',
  },
  noTimesText: {
    color: '#ffffff',
    textAlign: 'center',
    marginVertical: 20,
    fontStyle: 'italic',
  },
  selectDateText: {
    color: '#ffffff',
    textAlign: 'center',
    marginVertical: 20,
    fontStyle: 'italic',
  },
});

export default SchedulingScreen;
