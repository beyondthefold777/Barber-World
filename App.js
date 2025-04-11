import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { useState, useEffect } from 'react';
import * as ExpoSplashScreen from 'expo-splash-screen';
import { PaperProvider } from 'react-native-paper';
import { StripeProvider } from '@stripe/stripe-react-native';

// Import AuthProvider
import { AuthProvider } from './context/AuthContext';

// Existing imports
import SplashScreen from './components/SplashScreen';
import LandingPage from './components/LandingPage';
import GuestLandingPage from './components/GuestLandingPage';
import SchedulingScreen from './components/SchedulingScreen';
import LoginScreen from './components/LoginScreen';
import RegisterScreen from './components/RegisterScreen';
import BarbershopDashboard from './components/BarbershopDashboard';
import TrialSignup from './components/TrialSignup';
import AppointmentList from './components/AppointmentList';

// Import the new AppointmentsScreen
import AppointmentsScreen from './components/AppointmentsScreen';

// Import the BarbershopDetail screen from shopsettings directory
import BarbershopDetail from './components/shopsettings/BarbershopDetail';

// Financial Hub Screens
import TaxFormsScreen from './components/financial/TaxFormsScreen';
import WriteOffsScreen from './components/financial/WriteOffsScreen';
import ExpensesScreen from './components/financial/ExpensesScreen';
import PayScheduleScreen from './components/financial/PayScheduleScreen';
import ProjectedIncomeScreen from './components/financial/ProjectedIncomeScreen';
import PaymentHistoryScreen from './components/financial/PaymentHistoryScreen';

// Shop Settings Screens
import CustomizeShopScreen from './components/shopsettings/CustomizeShopScreen';

// Marketing Center Screens
import BoostCampaignScreen from './components/marketcenter/BoostCampaignScreen';

// Stripe publishable key - replace with your actual key
const STRIPE_PUBLISHABLE_KEY = "pk_live_51R84BeG26bbnswX58Tc2UsjudsmU18MUdLXNNmFfd9Rdl3cGu0aKK0qLHBgZilHqoVRRYxtqWw5KP6UuZWT3hPXr00nH8YHsqC";

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
    <StripeProvider publishableKey={STRIPE_PUBLISHABLE_KEY}>
      <AuthProvider>
        <PaperProvider>
          <NavigationContainer>
            <Stack.Navigator 
              initialRouteName="Splash"
              screenOptions={{
                headerShown: false,
                headerStyle: {
                  backgroundColor: '#000000',
                },
                headerTintColor: '#FFFFFF',
                headerTitleStyle: {
                  fontWeight: 'bold',
                },
              }}
            >
              <Stack.Screen name="Splash" component={SplashScreen} />
              <Stack.Screen name="Register" component={RegisterScreen} />
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="GuestLandingPage" component={GuestLandingPage} />
              <Stack.Screen name="LandingPage" component={LandingPage} />
              <Stack.Screen name="SchedulingScreen" component={SchedulingScreen} />
              <Stack.Screen name="BarbershopDashboard" component={BarbershopDashboard} />
              <Stack.Screen name="TrialSignup" component={TrialSignup} />
              <Stack.Screen 
                name="AppointmentList"
                component={AppointmentList}
                options={{
                  headerShown: true,
                  title: 'Appointments'
                }}
              />
              
              {/* Add AppointmentsScreen */}
              <Stack.Screen 
                name="AppointmentsScreen"
                component={AppointmentsScreen}
                options={{ headerShown: false }}
              />
              
              {/* Add BarbershopDetail Screen */}
              <Stack.Screen 
                name="BarbershopDetail"
                component={BarbershopDetail}
                options={{ headerShown: false }}
              />

              {/* Financial Hub Screens */}
              <Stack.Screen name="TaxForms" component={TaxFormsScreen} options={{ headerShown: true }} />
              <Stack.Screen name="WriteOffs" component={WriteOffsScreen} options={{ headerShown: true }} />
              <Stack.Screen name="Expenses" component={ExpensesScreen} options={{ headerShown: true }} />
              <Stack.Screen name="PaySchedule" component={PayScheduleScreen} options={{ headerShown: true }} />
              <Stack.Screen name="ProjectedIncome" component={ProjectedIncomeScreen} options={{ headerShown: true }} />
              <Stack.Screen name="PaymentHistory" component={PaymentHistoryScreen} options={{ headerShown: true }} />

              {/* Shop Settings Screens */}
              <Stack.Screen 
                name="CustomizeShop"
                component={CustomizeShopScreen}
                options={{
                  headerShown: true,
                  title: 'Customize Shop'
                }}
              />
              
              {/* Marketing Center Screens */}
              <Stack.Screen 
                name="BoostCampaign"
                component={BoostCampaignScreen}
                options={{
                  headerShown: true,
                  title: 'Boost Campaigns'
                }}
              />
            </Stack.Navigator>
            <StatusBar style="light" />
          </NavigationContainer>
        </PaperProvider>
      </AuthProvider>
    </StripeProvider>
  );
};

export default App;
