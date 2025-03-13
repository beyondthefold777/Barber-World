import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ExpensesScreen = () => {
  const [expense, setExpense] = useState({
    description: '',
    amount: '',
    category: '',
    date: new Date(),
    notes: ''
  });

  const [showDatePicker, setShowDatePicker] = useState(false);

  const categories = [
    'Equipment',
    'Supplies',
    'Utilities',
    'Rent',
    'Marketing',
    'Insurance',
    'Other'
  ];

  const handleSubmit = async () => {
    try {
      const userToken = await AsyncStorage.getItem('userToken');
      
      const response = await fetch('https://barber-world.fly.dev/api/expenses', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        },
        body: JSON.stringify(expense),
      });

      const data = await response.json();

      if (data.success) {
        Alert.alert('Success', 'Expense recorded successfully!');
        setExpense({
          description: '',
          amount: '',
          category: '',
          date: new Date(),
          notes: ''
        });
      }
    } catch (error) {
      console.log('Error details:', error);
      Alert.alert('Error', 'Failed to record expense. Please try again.');
    }
};
  return (
    <LinearGradient
      colors={['#000000', '#333333']}
      style={styles.container}
    >
      <ScrollView style={styles.scrollView}>
        <View style={styles.formContainer}>
          <Text style={styles.title}>Record New Expense</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={styles.input}
              value={expense.description}
              onChangeText={(text) => setExpense({...expense, description: text})}
              placeholder="Enter expense description"
              placeholderTextColor="#666"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Amount ($)</Text>
            <TextInput
              style={styles.input}
              value={expense.amount}
              onChangeText={(text) => setExpense({...expense, amount: text})}
              placeholder="0.00"
              keyboardType="decimal-pad"
              placeholderTextColor="#666"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryContainer}>
              {categories.map((cat, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.categoryButton,
                    expense.category === cat && styles.categoryButtonActive
                  ]}
                  onPress={() => setExpense({...expense, category: cat})}
                >
                  <Text style={[
                    styles.categoryText,
                    expense.category === cat && styles.categoryTextActive
                  ]}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Date</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.dateButtonText}>
                {expense.date.toLocaleDateString()}
              </Text>
              <Feather name="calendar" size={20} color="#FF0000" />
            </TouchableOpacity>
          </View>

          {showDatePicker && (
            <DateTimePicker
              value={expense.date}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                setShowDatePicker(false);
                if (selectedDate) {
                  setExpense({...expense, date: selectedDate});
                }
              }}
            />
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Notes</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={expense.notes}
              onChangeText={(text) => setExpense({...expense, notes: text})}
              placeholder="Add any additional notes"
              placeholderTextColor="#666"
              multiline
              numberOfLines={4}
            />
          </View>

          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmit}
          >
            <Text style={styles.submitButtonText}>Record Expense</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  formContainer: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#333333',
    borderRadius: 8,
    padding: 12,
    color: '#FFFFFF',
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  categoryContainer: {
    flexDirection: 'row',
    marginTop: 8,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#333333',
    marginRight: 8,
  },
  categoryButtonActive: {
    backgroundColor: '#FF0000',
  },
  categoryText: {
    color: '#FFFFFF',
  },
  categoryTextActive: {
    fontWeight: 'bold',
  },
  dateButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#333333',
    borderRadius: 8,
    padding: 12,
  },
  dateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: '#FF0000',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default ExpensesScreen;