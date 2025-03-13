import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TaxFormsScreen = () => {
  const [documents, setDocuments] = useState([
    {
      id: '1',
      name: '1099-NEC 2025',
      status: 'pending',
      dueDate: '04/31/2025'
    },
    {
      id: '2',
      name: 'W-9 Form',
      status: 'completed',
      dueDate: 'Submitted'
    },
    {
      id: '3',
      name: 'Quarterly Estimates Q4',
      status: 'pending',
      dueDate: '04/15/2025'
    }
  ]);

  const pickDocument = async () => {
    try {
      const userToken = await AsyncStorage.getItem('userToken');
      console.log('Starting document upload process...');
      
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true
      });
      
      if (result.type === 'success') {
        const formData = new FormData();
        formData.append('document', {
          uri: result.assets[0].uri,
          type: result.assets[0].mimeType,
          name: result.assets[0].name
        });
  
        const response = await fetch('https://barber-world.fly.dev/api/test.documents', {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${userToken}`
          },
          body: formData
        });
  
        const data = await response.json();
  
        if (data.success) {
          Alert.alert('Success', 'Document uploaded successfully!');
          setDocuments(current => [...current, {
            id: Date.now().toString(),
            name: result.assets[0].name,
            status: 'pending',
            dueDate: new Date().toLocaleDateString()
          }]);
        }
      }
    } catch (error) {
      console.log('Error details:', error);
      Alert.alert('Error', 'Failed to upload document. Please try again.');
    }
  };

  const renderStatusBadge = (status) => {
    const badgeStyle = status === 'completed' 
      ? styles.completedBadge 
      : styles.pendingBadge;
    
    return (
      <View style={[styles.statusBadge, badgeStyle]}>
        <Text style={styles.statusText}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Text>
      </View>
    );
  };

  return (
    <LinearGradient
      colors={['#000000', '#333333']}
      style={styles.container}
    >
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>Tax Documents</Text>
          <TouchableOpacity 
            style={styles.uploadButton}
            onPress={pickDocument}
          >
            <Feather name="upload" size={20} color="#FFFFFF" />
            <Text style={styles.uploadButtonText}>Upload</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Required Forms</Text>
          {documents.map((doc) => (
            <TouchableOpacity key={doc.id} style={styles.documentCard}>
              <View style={styles.documentIcon}>
                <Feather name="file-text" size={24} color="#FF0000" />
              </View>
              
              <View style={styles.documentInfo}>
                <Text style={styles.documentName}>{doc.name}</Text>
                <Text style={styles.documentDate}>Due: {doc.dueDate}</Text>
              </View>
              
              {renderStatusBadge(doc.status)}
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tax Resources</Text>
          
          <TouchableOpacity style={styles.resourceCard}>
            <Feather name="book-open" size={24} color="#FF0000" />
            <View style={styles.resourceInfo}>
              <Text style={styles.resourceTitle}>Self-Employment Guide</Text>
              <Text style={styles.resourceDescription}>
                Learn about tax obligations for barbers
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.resourceCard}>
            <Feather name="calendar" size={24} color="#FF0000" />
            <View style={styles.resourceInfo}>
              <Text style={styles.resourceTitle}>Tax Calendar</Text>
              <Text style={styles.resourceDescription}>
                Important dates and deadlines
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.resourceCard}>
            <Feather name="percent" size={24} color="#FF0000" />
            <View style={styles.resourceInfo}>
              <Text style={styles.resourceTitle}>Deduction Calculator</Text>
              <Text style={styles.resourceDescription}>
                Calculate your eligible deductions
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Need Help?</Text>
          <TouchableOpacity style={styles.helpButton}>
            <Feather name="phone" size={20} color="#FFFFFF" />
            <Text style={styles.helpButtonText}>Contact Tax Support</Text>
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
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF0000',
    padding: 10,
    borderRadius: 8,
  },
  uploadButtonText: {
    color: '#FFFFFF',
    marginLeft: 8,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginBottom: 15,
  },
  documentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333333',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  documentIcon: {
    marginRight: 15,
  },
  documentInfo: {
    flex: 1,
  },
  documentName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  documentDate: {
    color: '#666',
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  completedBadge: {
    backgroundColor: '#FF0000',
  },
  pendingBadge: {
    backgroundColor: '#0000ff',
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  resourceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333333',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  resourceInfo: {
    marginLeft: 15,
  },
  resourceTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resourceDescription: {
    color: '#666',
    marginTop: 4,
  },
  helpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#333333',
    padding: 15,
    borderRadius: 8,
  },
  helpButtonText: {
    color: '#FFFFFF',
    marginLeft: 8,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default TaxFormsScreen;