import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { useState, useEffect } from 'react';
import * as ExpoSplashScreen from 'expo-splash-screen';
import { PaperProvider } from 'react-native-paper';
import { View, Text } from 'react-native';
// Keep this import for manual deep linking in components
import * as Linking from 'expo-linking';

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

// Import Email Verification Screens
import EmailVerificationScreen from './components/EmailVerificationScreen';
import VerificationSuccessScreen from './components/VerificationSuccessScreen';

// Import actual settings screens from the correct path
import AccountDetailsScreen from './components/settings/AccountDetailsScreen';
import PaymentMethodScreen from './components/settings/PaymentMethodScreen';
import ChangePasswordScreen from './components/settings/ChangePasswordScreen';
import ContactSupportScreen from './components/settings/ContactSupportScreen';
import HelpCenterScreen from './components/settings/HelpCenterScreen';
import TermsOfServiceScreen from './components/settings/TermsOfServiceScreen';
import PrivacyPolicyScreen from './components/settings/PrivacyPolicyScreen';
import FeedbackScreen from './components/settings/FeedbackScreen';

// Import password reset screens from main components directory
import ForgotPasswordScreen from './components/ForgotPasswordScreen';
import ResetPasswordScreen from './components/ResetPasswordScreen';

const Stack = createStackNavigator();

// Simple linking configuration - just define the prefixes
const linking = {
  prefixes: ['barberworld://', 'https://barber-world.fly.dev']
};

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
        <NavigationContainer linking={linking}>
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
            
            {/* Password Reset Screens - Moved out of settings */}
            <Stack.Screen 
              name="ForgotPassword"
              component={ForgotPasswordScreen}
              options={{
                headerShown: true,
                title: 'Forgot Password',
                headerStyle: {
                  backgroundColor: '#000000',
                }
              }}
            />
            <Stack.Screen 
              name="ResetPassword"
              component={ResetPasswordScreen}
              options={{
                headerShown: true,
                title: 'Reset Password',
                headerStyle: {
                  backgroundColor: '#000000',
                }
              }}
            />
            
            {/* Rest of your screens... */}
            {/* Email Verification Screens */}
            <Stack.Screen 
              name="EmailVerification"
              component={EmailVerificationScreen}
              options={{
                headerShown: true,
                title: 'Verify Your Email',
                headerStyle: {
                  backgroundColor: '#000000',
                }
              }}
            />
            <Stack.Screen 
              name="VerificationSuccess"
              component={VerificationSuccessScreen}
              options={{
                headerShown: false
              }}
            />
            
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
            <Stack.Screen name="PaymentMethod" component={PaymentMethodScreen} options={{ headerShown: true, title: 'Payment Methods' }} />
            <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} options={{ headerShown: true, title: 'Change Password' }} />
            <Stack.Screen name="AccountDetails" component={AccountDetailsScreen} options={{ headerShown: true, title: 'Account Details' }} />
            <Stack.Screen name="ContactSupport" component={ContactSupportScreen} options={{ headerShown: true, title: 'Contact Support' }} />
            <Stack.Screen name="HelpCenter" component={HelpCenterScreen} options={{ headerShown: true, title: 'Help Center' }} />
            <Stack.Screen name="TermsOfService" component={TermsOfServiceScreen} options={{ headerShown: true, title: 'Terms of Service' }} />
            <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} options={{ headerShown: true, title: 'Privacy Policy' }} />
            <Stack.Screen name="Feedback" component={FeedbackScreen} options={{ headerShown: true, title: 'Feedback' }} />
          </Stack.Navigator>
          <StatusBar style="light" />
        </NavigationContainer>
      </PaperProvider>
    </AuthProvider>
  );
};

export default App;
