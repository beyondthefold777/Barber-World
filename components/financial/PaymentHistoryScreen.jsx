import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';

const PaymentHistoryScreen = () => {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedPeriod, setSelectedPeriod] = useState('week');

  // Sample data - replace with your API call
  const transactions = [
    {
      id: '1',
      client: 'John Smith',
      amount: 45.00,
      date: '2024-01-15',
      service: 'Haircut',
      status: 'completed',
      paymentMethod: 'credit'
    },
    {
      id: '2',
      client: 'Mike Johnson',
      amount: 65.00,
      date: '2024-01-14',
      service: 'Haircut & Beard',
      status: 'completed',
      paymentMethod: 'cash'
    },
    // Add more transactions
  ];

  const analytics = {
    totalRevenue: 2450.00,
    averageTransaction: 55.00,
    totalTransactions: 45,
    cashPayments: 15,
    cardPayments: 30
  };

  const renderTransaction = ({ item }) => (
    <TouchableOpacity style={styles.transactionCard}>
      <View style={styles.transactionHeader}>
        <Text style={styles.clientName}>{item.client}</Text>
        <Text style={styles.amount}>${item.amount.toFixed(2)}</Text>
      </View>
      
      <View style={styles.transactionDetails}>
        <View style={styles.detailRow}>
          <Feather name="calendar" size={16} color="#666" />
          <Text style={styles.detailText}>{item.date}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Feather name="scissors" size={16} color="#666" />
          <Text style={styles.detailText}>{item.service}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Feather 
            name={item.paymentMethod === 'cash' ? 'dollar-sign' : 'credit-card'} 
            size={16} 
            color="#666" 
          />
          <Text style={styles.detailText}>
            {item.paymentMethod === 'cash' ? 'Cash' : 'Card'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <LinearGradient
      colors={['#000000', '#333333']}
      style={styles.container}
    >
      <ScrollView style={styles.analyticsContainer}>
        <Text style={styles.title}>Payment Analytics</Text>
        
        <View style={styles.periodSelector}>
          <TouchableOpacity 
            style={[styles.periodButton, selectedPeriod === 'week' && styles.periodButtonActive]}
            onPress={() => setSelectedPeriod('week')}
          >
            <Text style={styles.periodButtonText}>Week</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.periodButton, selectedPeriod === 'month' && styles.periodButtonActive]}
            onPress={() => setSelectedPeriod('month')}
          >
            <Text style={styles.periodButtonText}>Month</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.periodButton, selectedPeriod === 'year' && styles.periodButtonActive]}
            onPress={() => setSelectedPeriod('year')}
          >
            <Text style={styles.periodButtonText}>Year</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Total Revenue</Text>
            <Text style={styles.statValue}>${analytics.totalRevenue}</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Avg. Transaction</Text>
            <Text style={styles.statValue}>${analytics.averageTransaction}</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Transactions</Text>
            <Text style={styles.statValue}>{analytics.totalTransactions}</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Cash/Card Split</Text>
            <Text style={styles.statValue}>
              {analytics.cashPayments}/{analytics.cardPayments}
            </Text>
          </View>
        </View>

        <View style={styles.transactionsList}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.filterContainer}
          >
            <TouchableOpacity 
              style={[styles.filterButton, selectedFilter === 'all' && styles.filterButtonActive]}
              onPress={() => setSelectedFilter('all')}
            >
              <Text style={styles.filterButtonText}>All</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.filterButton, selectedFilter === 'cash' && styles.filterButtonActive]}
              onPress={() => setSelectedFilter('cash')}
            >
              <Text style={styles.filterButtonText}>Cash</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.filterButton, selectedFilter === 'card' && styles.filterButtonActive]}
              onPress={() => setSelectedFilter('card')}
            >
              <Text style={styles.filterButtonText}>Card</Text>
            </TouchableOpacity>
          </ScrollView>

          <FlatList
            data={transactions}
            renderItem={renderTransaction}
            keyExtractor={item => item.id}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  analyticsContainer: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginBottom: 20,
  },
  periodSelector: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  periodButton: {
    flex: 1,
    padding: 10,
    alignItems: 'center',
    backgroundColor: '#333333',
    marginHorizontal: 5,
    borderRadius: 8,
  },
  periodButtonActive: {
    backgroundColor: '#FF0000',
  },
  periodButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#333333',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  statLabel: {
    color: '#666',
    fontSize: 14,
  },
  statValue: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 5,
  },
  sectionTitle: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginBottom: 15,
  },
  filterContainer: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  filterButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: '#333333',
    borderRadius: 20,
    marginRight: 10,
  },
  filterButtonActive: {
    backgroundColor: '#FF0000',
  },
  filterButtonText: {
    color: '#FFFFFF',
  },
  transactionCard: {
    backgroundColor: '#333333',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  clientName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  amount: {
    color: '#FF0000',
    fontSize: 18,
    fontWeight: 'bold',
  },
  transactionDetails: {
    borderTopWidth: 1,
    borderTopColor: '#444',
    paddingTop: 10,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  detailText: {
    color: '#666',
    marginLeft: 8,
  },
});

export default PaymentHistoryScreen;