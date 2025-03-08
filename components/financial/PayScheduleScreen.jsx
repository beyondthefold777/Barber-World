import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';

const PayScheduleScreen = () => {
  const [scheduleType, setScheduleType] = useState('weekly');
  const [autoPayEnabled, setAutoPayEnabled] = useState(true);
  const [selectedDays, setSelectedDays] = useState(['Friday']);

  const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const toggleDay = (day) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter(d => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  return (
    <LinearGradient colors={['#000000', '#333333']} style={styles.container}>
      <ScrollView style={styles.content}>
        <Text style={styles.title}>Pay Schedule</Text>

        <View style={styles.scheduleTypeContainer}>
          <Text style={styles.sectionTitle}>Payment Frequency</Text>
          <View style={styles.scheduleButtons}>
            <TouchableOpacity 
              style={[styles.scheduleButton, scheduleType === 'weekly' && styles.activeSchedule]}
              onPress={() => setScheduleType('weekly')}
            >
              <Text style={[styles.scheduleButtonText, scheduleType === 'weekly' && styles.activeText]}>Weekly</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.scheduleButton, scheduleType === 'biweekly' && styles.activeSchedule]}
              onPress={() => setScheduleType('biweekly')}
            >
              <Text style={[styles.scheduleButtonText, scheduleType === 'biweekly' && styles.activeText]}>Bi-weekly</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.scheduleButton, scheduleType === 'monthly' && styles.activeSchedule]}
              onPress={() => setScheduleType('monthly')}
            >
              <Text style={[styles.scheduleButtonText, scheduleType === 'monthly' && styles.activeText]}>Monthly</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Days</Text>
          <View style={styles.daysContainer}>
            {weekDays.map((day) => (
              <TouchableOpacity 
                key={day}
                style={[styles.dayButton, selectedDays.includes(day) && styles.selectedDay]}
                onPress={() => toggleDay(day)}
              >
                <Text style={[styles.dayText, selectedDays.includes(day) && styles.selectedDayText]}>
                  {day.substring(0, 3)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.settingRow}>
            <Text style={styles.settingText}>Automatic Payments</Text>
            <Switch
              value={autoPayEnabled}
              onValueChange={setAutoPayEnabled}
              trackColor={{ false: '#767577', true: '#FF0000' }}
              thumbColor={autoPayEnabled ? '#ffffff' : '#f4f3f4'}
            />
          </View>
        </View>

        <View style={styles.infoBox}>
          <Feather name="info" size={24} color="#FF0000" style={styles.infoIcon} />
          <Text style={styles.infoText}>
            Your next payment is scheduled for {selectedDays[0]}, {new Date().toLocaleDateString()}
          </Text>
        </View>

        <TouchableOpacity style={styles.saveButton}>
          <Text style={styles.saveButtonText}>Save Schedule</Text>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 20,
  },
  scheduleTypeContainer: {
    marginBottom: 20,
  },
  scheduleButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  scheduleButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#222',
    marginHorizontal: 5,
    alignItems: 'center',
  },
  activeSchedule: {
    backgroundColor: '#FF0000',
  },
  scheduleButtonText: {
    color: '#888',
    fontWeight: 'bold',
  },
  activeText: {
    color: 'white',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    color: 'white',
    marginBottom: 10,
  },
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  dayButton: {
    width: '13%',
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#222',
    alignItems: 'center',
    marginBottom: 10,
  },
  selectedDay: {
    backgroundColor: '#FF0000',
  },
  dayText: {
    color: '#888',
    fontSize: 12,
  },
  selectedDayText: {
    color: 'white',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#222',
    padding: 15,
    borderRadius: 8,
  },
  settingText: {
    color: 'white',
    fontSize: 16,
  },
  infoBox: {
    backgroundColor: '#222',
    padding: 15,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  infoIcon: {
    marginRight: 10,
  },
  infoText: {
    color: 'white',
    flex: 1,
  },
  saveButton: {
    backgroundColor: '#FF0000',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default PayScheduleScreen;