import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';

const ProjectedIncomeScreen = () => {
  const [timeFrame, setTimeFrame] = useState('weekly');
  const [averageClients, setAverageClients] = useState('25');
  const [averageService, setAverageService] = useState('45');
  const [workingDays, setWorkingDays] = useState('5');

  const chartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
      data: [2500, 3000, 2800, 3500, 3200, 3800],
    }],
  };

  const calculateProjection = () => {
    const clients = parseInt(averageClients);
    const service = parseInt(averageService);
    const days = parseInt(workingDays);
    
    const weeklyIncome = clients * service * days;
    const monthlyIncome = weeklyIncome * 4;
    const yearlyIncome = monthlyIncome * 12;

    return {
      weekly: weeklyIncome,
      monthly: monthlyIncome,
      yearly: yearlyIncome
    };
  };

  const projections = calculateProjection();

  return (
    <LinearGradient
      colors={['#000000', '#333333']}
      style={styles.container}
    >
      <ScrollView style={styles.scrollView}>
        <Text style={styles.title}>Income Projections</Text>

        <View style={styles.chartContainer}>
          <LineChart
            data={chartData}
            width={350}
            height={200}
            chartConfig={{
              backgroundColor: '#000000',
              backgroundGradientFrom: '#333333',
              backgroundGradientTo: '#000000',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(255, 0, 0, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              style: {
                borderRadius: 16,
              },
            }}
            bezier
            style={styles.chart}
          />
        </View>

        <View style={styles.inputSection}>
          <Text style={styles.sectionTitle}>Calculate Your Projections</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Average Clients Per Day</Text>
            <TextInput
              style={styles.input}
              value={averageClients}
              onChangeText={setAverageClients}
              keyboardType="numeric"
              placeholderTextColor="#666"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Average Service Price ($)</Text>
            <TextInput
              style={styles.input}
              value={averageService}
              onChangeText={setAverageService}
              keyboardType="numeric"
              placeholderTextColor="#666"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Working Days Per Week</Text>
            <TextInput
              style={styles.input}
              value={workingDays}
              onChangeText={setWorkingDays}
              keyboardType="numeric"
              placeholderTextColor="#666"
            />
          </View>
        </View>

        <View style={styles.projectionCards}>
          <View style={styles.projectionCard}>
            <Feather name="calendar" size={24} color="#FF0000" />
            <Text style={styles.projectionLabel}>Weekly</Text>
            <Text style={styles.projectionAmount}>
              ${projections.weekly.toLocaleString()}
            </Text>
          </View>

          <View style={styles.projectionCard}>
            <Feather name="bar-chart" size={24} color="#FF0000" />
            <Text style={styles.projectionLabel}>Monthly</Text>
            <Text style={styles.projectionAmount}>
              ${projections.monthly.toLocaleString()}
            </Text>
          </View>

          <View style={styles.projectionCard}>
            <Feather name="trending-up" size={24} color="#FF0000" />
            <Text style={styles.projectionLabel}>Yearly</Text>
            <Text style={styles.projectionAmount}>
              ${projections.yearly.toLocaleString()}
            </Text>
          </View>
        </View>

        <View style={styles.tipsSection}>
          <Text style={styles.tipsTitle}>Income Growth Tips</Text>
          
          <View style={styles.tipCard}>
            <Feather name="users" size={20} color="#FF0000" />
            <Text style={styles.tipText}>
              Increase client retention through loyalty programs
            </Text>
          </View>

          <View style={styles.tipCard}>
            <Feather name="dollar-sign" size={20} color="#FF0000" />
            <Text style={styles.tipText}>
              Optimize your service pricing strategy
            </Text>
          </View>

          <View style={styles.tipCard}>
            <Feather name="clock" size={20} color="#FF0000" />
            <Text style={styles.tipText}>
              Maximize efficiency during peak hours
            </Text>
          </View>
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
    padding: 20,
  },
  title: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginBottom: 20,
  },
  chartContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  chart: {
    borderRadius: 16,
    marginVertical: 8,
  },
  inputSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginBottom: 15,
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    color: '#FFFFFF',
    marginBottom: 5,
  },
  input: {
    backgroundColor: '#333333',
    borderRadius: 8,
    padding: 12,
    color: '#FFFFFF',
    fontSize: 16,
  },
  projectionCards: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  projectionCard: {
    backgroundColor: '#333333',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    width: '30%',
  },
  projectionLabel: {
    color: '#666',
    marginVertical: 5,
  },
  projectionAmount: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  tipsSection: {
    marginBottom: 20,
  },
  tipsTitle: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginBottom: 15,
  },
  tipCard: {
    backgroundColor: '#333333',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  tipText: {
    color: '#FFFFFF',
    marginLeft: 10,
    flex: 1,
  },
});

export default ProjectedIncomeScreen;