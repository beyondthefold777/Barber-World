import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { useState, useEffect } from 'react';
import * as ExpoSplashScreen from 'expo-splash-screen';
import { PaperProvider } from 'react-native-paper';
import { View, Text } from 'react-native';

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

// Import the actual SettingsScreen
import SettingsScreen from './components/settings/SettingsScreen';

// Create placeholder components for the other settings screens
const PaymentMethodsScreen = () => <View style={{flex: 1, backgroundColor: '#121212', justifyContent: 'center', alignItems: 'center'}}><Text style={{color: 'white'}}>Payment Methods Screen</Text></View>;
const ChangePasswordScreen = () => <View style={{flex: 1, backgroundColor: '#121212', justifyContent: 'center', alignItems: 'center'}}><Text style={{color: 'white'}}>Change Password Screen</Text></View>;
const AccountDetailsScreen = () => <View style={{flex: 1, backgroundColor: '#121212', justifyContent: 'center', alignItems: 'center'}}><Text style={{color: 'white'}}>Account Details Screen</Text></View>;
const ContactSupportScreen = () => <View style={{flex: 1, backgroundColor: '#121212', justifyContent: 'center', alignItems: 'center'}}><Text style={{color: 'white'}}>Contact Support Screen</Text></View>;
const HelpCenterScreen = () => <View style={{flex: 1, backgroundColor: '#121212', justifyContent: 'center', alignItems: 'center'}}><Text style={{color: 'white'}}>Help Center Screen</Text></View>;
const ForgotPasswordScreen = () => <View style={{flex: 1, backgroundColor: '#121212', justifyContent: 'center', alignItems: 'center'}}><Text style={{color: 'white'}}>Forgot Password Screen</Text></View>;
const TermsOfServiceScreen = () => <View style={{flex: 1, backgroundColor: '#121212', justifyContent: 'center', alignItems: 'center'}}><Text style={{color: 'white'}}>Terms of Service Screen</Text></View>;
const PrivacyPolicyScreen = () => <View style={{flex: 1, backgroundColor: '#121212', justifyContent: 'center', alignItems: 'center'}}><Text style={{color: 'white'}}>Privacy Policy Screen</Text></View>;
const FeedbackScreen = () => <View style={{flex: 1, backgroundColor: '#121212', justifyContent: 'center', alignItems: 'center'}}><Text style={{color: 'white'}}>Feedback Screen</Text></View>;

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

            {/* Settings Screens */}
            <Stack.Screen name="Settings" component={SettingsScreen} options={{ headerShown: false }} />
            <Stack.Screen name="PaymentMethods" component={PaymentMethodsScreen} options={{ headerShown: true, title: 'Payment Methods' }} />
            <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} options={{ headerShown: true, title: 'Change Password' }} />
            <Stack.Screen name="AccountDetails" component={AccountDetailsScreen} options={{ headerShown: true, title: 'Account Details' }} />
            <Stack.Screen name="ContactSupport" component={ContactSupportScreen} options={{ headerShown: true, title: 'Contact Support' }} />
            <Stack.Screen name="HelpCenter" component={HelpCenterScreen} options={{ headerShown: true, title: 'Help Center' }} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} options={{ headerShown: true, title: 'Forgot Password' }} />
            <Stack.Screen name="TermsOfService" component={TermsOfServiceScreen} options={{ headerShown: true, title: 'Terms of Service' }} />
            <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} options={{ headerShown: true, title: 'Privacy Policy' }} />
            <Stack.Screen name="Feedback" component={FeedbackScreen} options={{ headerShown: true, title: 'Send Feedback' }} />
          </Stack.Navigator>
          <StatusBar style="light" />
        </NavigationContainer>
      </PaperProvider>
    </AuthProvider>
  );
};

export default App;