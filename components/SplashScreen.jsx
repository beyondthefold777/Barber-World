import React, { useEffect } from 'react';
import { View, Image, StyleSheet, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

// Get the screen dimensions
const { width, height } = Dimensions.get('window');

const SplashScreen = () => {
  const navigation = useNavigation();
  
  useEffect(() => {
    const timeout = setTimeout(() => {
      navigation.replace('Register');
    }, 3000);
    return () => clearTimeout(timeout);
  }, [navigation]);

  return (
    <LinearGradient
      colors={['#000000', '#333333']}
      style={styles.container}
    >
      <Image
        source={require('../assets/barberworldofficial.png')}
        style={styles.logo}
      />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: width * 0.6, // 60% of screen width
    height: height * 0.3, // 30% of screen height
    resizeMode: 'contain',
  },
});

export default SplashScreen;
