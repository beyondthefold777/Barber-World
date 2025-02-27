import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, SafeAreaView } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { Button } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { appointmentService } from '../services/api.js';

const SchedulingScreen = () => {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [availableTimeSlots, setAvailableTimeSlots] = useState([
    '9:00 AM', '10:00 AM', '11:00 AM',
    '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM'
  ]);

  useEffect(() => {
    if (selectedDate) {
      fetchAvailableSlots(selectedDate);
    }
  }, [selectedDate]);

  const fetchAvailableSlots = async (date) => {
    try {
      const response = await appointmentService.getTimeSlots(date);
      const slots = response?.availableSlots || [
        '9:00 AM', '10:00 AM', '11:00 AM',
        '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM'
      ];
      setAvailableTimeSlots(slots);
    } catch (error) {
      console.log('Error fetching time slots:', error);
      setAvailableTimeSlots([
        '9:00 AM', '10:00 AM', '11:00 AM',
        '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM'
      ]);
    }
  };

  const handleBooking = async () => {
    if (!selectedDate || !selectedTime) {
      Alert.alert('Please select both date and time');
      return;
    }
  
    setLoading(true);
    try {
      const appointmentData = {
        date: selectedDate,
        time: selectedTime,
        service: 'Regular Haircut'
      };
      
      console.log('Sending appointment data:', appointmentData);
      const result = await appointmentService.bookAppointment(appointmentData);
      console.log('Booking response:', result);
  
      Alert.alert('Success! 💈', 'Your appointment has been booked!');
      setSelectedDate('');
      setSelectedTime('');
    } catch (error) {
      console.log('Booking error details:', error);
      Alert.alert('Booking Update', 'We could not process your booking at this time');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient
        colors={['#000000', '#333333']}
        style={styles.container}
      >
        <ScrollView style={styles.scrollView}>
          <View style={styles.contentContainer}>
            <Text style={styles.title}>Book Your Appointment</Text>
            
            <Calendar
              onDayPress={day => setSelectedDate(day.dateString)}
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

            <View style={styles.timeContainer}>
              <Text style={styles.subtitle}>Available Times</Text>
              <View style={styles.timeGrid}>
                {availableTimeSlots.map((time) => (
                  <Button
                    key={time}
                    mode={selectedTime === time ? 'contained' : 'outlined'}
                    onPress={() => setSelectedTime(time)}
                    style={styles.timeButton}
                    textColor="#ffffff"
                    buttonColor={selectedTime === time ? '#FF0000' : 'transparent'}
                    disabled={loading}
                  >
                    {time}
                  </Button>
                ))}
              </View>
            </View>

            <Button
              mode="contained"
              style={styles.bookButton}
              onPress={handleBooking}
              loading={loading}
              disabled={loading || !selectedDate || !selectedTime}
              buttonColor="#FF0000"
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
  contentContainer: {
    padding: 15,
    paddingTop: 50, // Added extra padding at the top
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
  timeContainer: {
    marginTop: 20,
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
  bookButton: {
    marginTop: 30,
    marginBottom: 20,
    padding: 5,
  },
});

export default SchedulingScreen;
