import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Create the context
const AuthContext = createContext();

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load token from storage on app start
  useEffect(() => {
    const loadToken = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('userToken');
        if (storedToken) {
          setToken(storedToken);
          
          // Also load user data if available
          const userData = await AsyncStorage.getItem('userData');
          if (userData) {
            setUser(JSON.parse(userData));
          }
        }
      } catch (e) {
        console.error('Failed to load auth token', e);
      } finally {
        setLoading(false);
      }
    };

    loadToken();
  }, []);

  // Login function - store token in AsyncStorage and state
  const login = async (newToken) => {
    try {
      if (!newToken) {
        console.error('No token provided to login function');
        return false;
      }
      
      console.log('Storing token in AuthContext:', newToken.substring(0, 10) + '...');
      await AsyncStorage.setItem('userToken', newToken);
      setToken(newToken);
      
      return true;
    } catch (error) {
      console.error('Failed to save auth token', error);
      return false;
    }
  };

  // Logout function - remove token from AsyncStorage and state
  const logout = async () => {
    try {
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userData');
      await AsyncStorage.removeItem('userRole');
      setToken(null);
      setUser(null);
      return true;
    } catch (error) {
      console.error('Failed to remove auth token', error);
      return false;
    }
  };

  // The context value that will be supplied to any descendants of this provider
  const value = {
    token,
    user,
    loading,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;