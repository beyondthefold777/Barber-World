import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { useState, useEffect } from 'react';
import * as ExpoSplashScreen from 'expo-splash-screen';
import { PaperProvider } from 'react-native-paper';

import SplashScreen from './components/SplashScreen';
import LandingPage from './components/LandingPage';
import SchedulingScreen from './components/SchedulingScreen';
import LoginScreen from './components/LoginScreen';
import RegisterScreen from './components/RegisterScreen';

const Stack = createStackNavigator();

const App = () => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        await ExpoSplashScreen.preventAutoHideAsync();
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (e) {
        console.warn(e);
      } finally {
        setIsReady(true);
        await ExpoSplashScreen.hideAsync();
      }
    }
    prepare();
  }, []);

  if (!isReady) {
    return null;
  }

  return (
    <PaperProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Splash" component={SplashScreen} />
          <Stack.Screen name="LandingPage" component={LandingPage} />
          <Stack.Screen name="SchedulingScreen" component={SchedulingScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </Stack.Navigator>
        <StatusBar style="light" />
      </NavigationContainer>
    </PaperProvider>
  );
};

export default App;