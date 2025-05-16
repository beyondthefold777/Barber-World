import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { useState, useEffect, useCallback } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { PaperProvider } from 'react-native-paper';
import { View, StyleSheet } from 'react-native';

// Import AuthProvider
import { AuthProvider } from './context/AuthContext';
// Import UnreadMessagesProvider
import { UnreadMessagesProvider } from './context/UnreadMessagesContext';

// Existing imports
import SplashScreenComponent from './components/SplashScreen';
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

// Import ChatScreen
import ChatScreen from './components/ChatScreen';

// Import MessagesScreen
import MessagesScreen from './components/MessagesScreen';

// Import new Terms and Privacy components
import TermsOfService from './components/TermsOfService';
import PrivacyPolicy from './components/PrivacyPolicy';

// Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

const Stack = createStackNavigator();

const App = () => {
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // Pre-load fonts, make API calls, etc.
        // Artificial delay - you can remove this in production
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (e) {
        console.warn(e);
      } finally {
        // Tell the application to render
        setAppIsReady(true);
      }
    }
    prepare();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      // This tells the splash screen to hide immediately
      await SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return null;
  }

  return (
    <View style={styles.container} onLayout={onLayoutRootView}>
      <AuthProvider>
        <UnreadMessagesProvider>
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
                <Stack.Screen name="Splash" component={SplashScreenComponent} />
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
                
                {/* Add MessagesScreen */}
                <Stack.Screen 
                  name="MessagesScreen"
                  component={MessagesScreen}
                  options={{
                    headerShown: true,
                    title: 'Messages',
                    headerStyle: {
                      backgroundColor: '#000000',
                    }
                  }}
                />
                
                {/* Add ChatScreen */}
                <Stack.Screen 
                  name="ChatScreen"
                  component={ChatScreen}
                  options={{
                    headerShown: true,
                    title: 'Chat',
                    headerStyle: {
                      backgroundColor: '#000000',
                    }
                  }}
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
                <Stack.Screen name="ContactSupport" component={ContactSupportScreen} options={{ headerShown: false, title: 'Contact Support' }} />
                <Stack.Screen name="HelpCenter" component={HelpCenterScreen} options={{ headerShown: true, title: 'Help Center' }} />
                
                {/* Update the existing Terms and Privacy screens to use the new components */}
                <Stack.Screen 
                  name="TermsOfService" 
                  component={TermsOfService}
                  options={{ headerShown: false }}
                />
                <Stack.Screen 
                  name="PrivacyPolicy" 
                  component={PrivacyPolicy}
                  options={{ headerShown: false }}
                />
                
                <Stack.Screen name="Feedback" component={FeedbackScreen} options={{ headerShown: true, title: 'Feedback' }} />
              </Stack.Navigator>
              <StatusBar style="light" />
            </NavigationContainer>
          </PaperProvider>
        </UnreadMessagesProvider>
      </AuthProvider>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212', // Match the color in app.json
  },
});

export default App;
