import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../context/AuthContext';

const TokenDebugger = () => {
  const { token } = useAuth();
  const [asyncToken, setAsyncToken] = useState(null);
  
  const checkToken = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('userToken');
      setAsyncToken(storedToken);
    } catch (error) {
      console.error('Error checking token:', error);
    }
  };
  
  useEffect(() => {
    checkToken();
  }, []);
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Token Debugger</Text>
      
      <Text style={styles.label}>Context Token:</Text>
      <Text style={styles.tokenText}>
        {token ? `${token.substring(0, 10)}...${token.substring(token.length - 10)}` : 'No token'}
      </Text>
      <Text style={styles.tokenInfo}>Length: {token ? token.length : 0}</Text>
      
      <Text style={styles.label}>AsyncStorage Token:</Text>
      <Text style={styles.tokenText}>
        {asyncToken ? `${asyncToken.substring(0, 10)}...${asyncToken.substring(asyncToken.length - 10)}` : 'No token'}
      </Text>
      <Text style={styles.tokenInfo}>Length: {asyncToken ? asyncToken.length : 0}</Text>
      
      <Button title="Refresh Token Info" onPress={checkToken} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    margin: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 8,
  },
  tokenText: {
    fontSize: 14,
    fontFamily: 'monospace',
    padding: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
  },
  tokenInfo: {
    fontSize: 12,
    marginBottom: 8,
  },
});

export default TokenDebugger;