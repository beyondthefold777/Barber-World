import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';

const WriteOffsScreen = () => {
  const [writeOffs, setWriteOffs] = useState([
    { id: 1, category: 'Equipment', item: 'Professional Clippers', amount: 299.99, date: '2023-10-15' },
    { id: 2, category: 'Supplies', item: 'Hair Products', amount: 150.00, date: '2023-10-10' },
    { id: 3, category: 'Furniture', item: 'Barber Chair', amount: 899.99, date: '2023-09-28' }
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState({
    category: '',
    item: '',
    amount: '',
    date: new Date().toISOString().split('T')[0]
  });

  const addWriteOff = () => {
    if (newItem.category && newItem.item && newItem.amount) {
      setWriteOffs([
        ...writeOffs,
        {
          id: writeOffs.length + 1,
          ...newItem,
          amount: parseFloat(newItem.amount)
        }
      ]);
      setShowAddForm(false);
      setNewItem({
        category: '',
        item: '',
        amount: '',
        date: new Date().toISOString().split('T')[0]
      });
    }
  };

  return (
    <LinearGradient colors={['#000000', '#333333']} style={styles.container}>
      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Tax Write-offs</Text>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => setShowAddForm(!showAddForm)}
          >
            <Feather name={showAddForm ? 'x' : 'plus'} size={24} color="white" />
          </TouchableOpacity>
        </View>

        {showAddForm && (
          <View style={styles.addForm}>
            <TextInput
              style={styles.input}
              placeholder="Category"
              placeholderTextColor="#888"
              value={newItem.category}
              onChangeText={(text) => setNewItem({...newItem, category: text})}
            />
            <TextInput
              style={styles.input}
              placeholder="Item Description"
              placeholderTextColor="#888"
              value={newItem.item}
              onChangeText={(text) => setNewItem({...newItem, item: text})}
            />
            <TextInput
              style={styles.input}
              placeholder="Amount"
              placeholderTextColor="#888"
              keyboardType="numeric"
              value={newItem.amount}
              onChangeText={(text) => setNewItem({...newItem, amount: text})}
            />
            <TouchableOpacity style={styles.submitButton} onPress={addWriteOff}>
              <Text style={styles.submitButtonText}>Add Write-off</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Total Write-offs:</Text>
          <Text style={styles.totalAmount}>
            ${writeOffs.reduce((sum, item) => sum + item.amount, 0).toFixed(2)}
          </Text>
        </View>

        {writeOffs.map((item) => (
          <View key={item.id} style={styles.writeOffItem}>
            <View style={styles.itemHeader}>
              <Text style={styles.category}>{item.category}</Text>
              <Text style={styles.date}>{item.date}</Text>
            </View>
            <Text style={styles.itemName}>{item.item}</Text>
            <Text style={styles.amount}>${item.amount.toFixed(2)}</Text>
          </View>
        ))}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  addButton: {
    padding: 10,
    backgroundColor: '#FF0000',
    borderRadius: 25,
  },
  addForm: {
    backgroundColor: '#222',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#333',
    padding: 12,
    borderRadius: 5,
    color: 'white',
    marginBottom: 10,
  },
  submitButton: {
    backgroundColor: '#FF0000',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#222',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  totalLabel: {
    color: 'white',
    fontSize: 18,
  },
  totalAmount: {
    color: '#FF0000',
    fontSize: 18,
    fontWeight: 'bold',
  },
  writeOffItem: {
    backgroundColor: '#222',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  category: {
    color: '#FF0000',
    fontWeight: 'bold',
  },
  date: {
    color: '#888',
  },
  itemName: {
    color: 'white',
    fontSize: 16,
    marginBottom: 5,
  },
  amount: {
    color: '#00FF00',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default WriteOffsScreen;