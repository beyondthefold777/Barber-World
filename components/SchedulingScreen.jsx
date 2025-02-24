import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { Button } from 'react-native-paper';

const SchedulingScreen = () => {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');

  const timeSlots = [
    '9:00 AM', '10:00 AM', '11:00 AM',
    '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM'
  ];

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Book Your Appointment</Text>
      
      <Calendar
        onDayPress={day => setSelectedDate(day.dateString)}
        markedDates={{
          [selectedDate]: {selected: true, selectedColor: '#2196F3'}
        }}
        minDate={new Date().toISOString().split('T')[0]}
      />

      <View style={styles.timeContainer}>
        <Text style={styles.subtitle}>Available Times</Text>
        <View style={styles.timeGrid}>
          {timeSlots.map((time) => (
            <Button
              key={time}
              mode={selectedTime === time ? 'contained' : 'outlined'}
              onPress={() => setSelectedTime(time)}
              style={styles.timeButton}
            >
              {time}
            </Button>
          ))}
        </View>
      </View>

      <Button
        mode="contained"
        style={styles.bookButton}
        onPress={() => console.log('Booking:', selectedDate, selectedTime)}
      >
        Book Appointment
      </Button>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    marginVertical: 15,
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
  },
  bookButton: {
    marginTop: 30,
    marginBottom: 20,
    padding: 5,
  },
});

export default SchedulingScreen;
