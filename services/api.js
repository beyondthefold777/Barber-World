import config from '../config/environment';
import AsyncStorage from '@react-native-async-storage/async-storage';
import jwtDecode from 'jwt-decode';

const API_URL = config.apiUrl;

// Helper function to decode JWT token
const decodeToken = (token) => {
  try {
    return jwtDecode(token);
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

export const appointmentService = {
  getBarbershopAppointments: async (userToken) => {
    console.log('\n========== APPOINTMENT SERVICE: GET BARBERSHOP APPOINTMENTS ==========');
    console.log('1. Function called at:', new Date().toISOString());
    
    if (!userToken) {
      console.log('2. ERROR: No user token provided');
      console.log('========== APPOINTMENT SERVICE: ENDING WITH ERROR ==========\n');
      throw new Error('No authentication token provided');
    }
    
    console.log('2. User token available:', userToken ? `${userToken.substring(0, 5)}...${userToken.substring(userToken.length - 5)}` : 'null');
    
    try {
      // First, try to get user info from AsyncStorage
      console.log('3. Attempting to get user info from AsyncStorage...');
      let userInfo = null;
      
      try {
        const userDataString = await AsyncStorage.getItem('userData');
        if (userDataString) {
          userInfo = JSON.parse(userDataString);
          console.log('4. User info retrieved from AsyncStorage');
          console.log(`   User role: ${userInfo.role}`);
          console.log(`   User ID: ${userInfo.id || userInfo._id}`);
        } else {
          console.log('4. No user info in AsyncStorage');
        }
      } catch (storageError) {
        console.log('4. ERROR getting user info from AsyncStorage:', storageError.message);
      }
      
      // If no user info in AsyncStorage, try to decode from token
      if (!userInfo) {
        console.log('5. Attempting to decode user info from token...');
        try {
          const decoded = decodeToken(userToken);
          if (decoded && decoded.id) {
            userInfo = {
              _id: decoded.id,
              id: decoded.id,
              role: decoded.role
            };
            console.log('6. User info decoded from token');
            console.log(`   User role: ${userInfo.role}`);
            console.log(`   User ID: ${userInfo._id || userInfo.id}`);
          } else {
            console.log('6. Failed to decode valid user info from token');
          }
        } catch (decodeError) {
          console.log('6. ERROR decoding token:', decodeError.message);
        }
      }
      
      // If still no user info, try to fetch from API
      if (!userInfo) {
        console.log('7. Fetching user info from API...');
        try {
          const userResponse = await fetch(`${API_URL}/api/auth/me`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${userToken}`,
              'Accept': 'application/json'
            }
          });
          
          if (!userResponse.ok) {
            console.log(`8. Failed to get user info from API: ${userResponse.status}`);
            throw new Error('Failed to get user information');
          }
          
          userInfo = await userResponse.json();
          console.log('8. User info retrieved successfully from API');
          console.log(`   User role: ${userInfo.role}`);
          console.log(`   User ID: ${userInfo._id || userInfo.id}`);
          
          // Save to AsyncStorage for future use
          await AsyncStorage.setItem('userData', JSON.stringify(userInfo));
          console.log('   User info saved to AsyncStorage');
        } catch (userError) {
          console.log('8. ERROR getting user info from API:', userError.message);
          console.log('   Cannot proceed without user information');
          throw new Error('Failed to get user information');
        }
      }
      
      // Ensure we have user info and it's a barbershop
      if (!userInfo || (userInfo.role !== 'barbershop' && userInfo.role !== 'mainBarbershop')) {
        console.log('9. User is not a barbershop, cannot fetch barbershop appointments');
        throw new Error('User is not a barbershop');
      }
      
      // Try to get shop data from API
      console.log('10. Fetching shop data from API...');
      let shopId = null;
      
      try {
        const shopResponse = await fetch(`${API_URL}/api/shops/user/${userInfo.id || userInfo._id}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${userToken}`,
            'Accept': 'application/json'
          }
        });
        
        if (shopResponse.ok) {
          const shopData = await shopResponse.json();
          console.log('11. Shop data response:', JSON.stringify(shopData).substring(0, 100) + '...');
          
          if (Array.isArray(shopData) && shopData.length > 0) {
            shopId = shopData[0]._id;
            console.log(`12. Found shop ID from array: ${shopId}`);
          } else if (shopData && shopData._id) {
            shopId = shopData._id;
            console.log(`12. Found shop ID from object: ${shopId}`);
          } else if (shopData && shopData.shop && shopData.shop._id) {
            shopId = shopData.shop._id;
            console.log(`12. Found shop ID from nested object: ${shopId}`);
          } else {
            console.log('12. Could not find shop ID in response');
          }
        } else {
          console.log(`11. Failed to get shop data: ${shopResponse.status}`);
        }
      } catch (shopError) {
        console.log('11. ERROR fetching shop data:', shopError.message);
      }
      
      // If we couldn't get the shop ID, try alternative endpoints
      if (!shopId) {
        console.log('13. Trying alternative shop endpoint...');
        try {
          const altShopResponse = await fetch(`${API_URL}/api/shop`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${userToken}`,
              'Accept': 'application/json'
            }
          });
          
          if (altShopResponse.ok) {
            const altShopData = await altShopResponse.json();
            console.log('14. Alternative shop data response:', JSON.stringify(altShopData).substring(0, 100) + '...');
            
            if (altShopData && altShopData._id) {
              shopId = altShopData._id;
              console.log(`15. Found shop ID from alt endpoint: ${shopId}`);
            } else if (altShopData && altShopData.shop && altShopData.shop._id) {
              shopId = altShopData.shop._id;
              console.log(`15. Found shop ID from nested alt object: ${shopId}`);
            } else {
              console.log('15. Could not find shop ID in alt response');
            }
          } else {
            console.log(`14. Failed to get alt shop data: ${altShopResponse.status}`);
          }
        } catch (altShopError) {
          console.log('14. ERROR fetching alt shop data:', altShopError.message);
        }
      }
      
      // If we still don't have a shop ID, use the user ID as fallback
      if (!shopId) {
        console.log('16. No shop ID found, fetching all appointments and filtering by user ID');
        shopId = userInfo.id || userInfo._id;
        console.log(`    Using user ID as fallback: ${shopId}`);
      }
      
      // Check if we have cached appointments
      const cacheKey = `appointments_shop_${shopId}`;
      
      console.log('17. Checking for cached appointments...');
      try {
        const cachedData = await AsyncStorage.getItem(cacheKey);
        if (cachedData) {
          const { appointments, timestamp } = JSON.parse(cachedData);
          const cacheAge = Date.now() - timestamp;
          
          // Use cache if it's less than 5 minutes old
          if (cacheAge < 5 * 60 * 1000) {
            console.log(`18. Using cached appointments (${appointments.length} items, ${Math.round(cacheAge/1000)}s old)`);
            console.log('========== APPOINTMENT SERVICE: COMPLETED FROM CACHE ==========\n');
            return appointments;
          }
          console.log(`18. Cache expired (${Math.round(cacheAge/1000)}s old), fetching fresh data`);
        } else {
          console.log('18. No cached appointments found');
        }
      } catch (cacheError) {
        console.log('18. ERROR checking cache:', cacheError.message);
      }
      
      // Clear cache for testing
      console.log('19. Clearing appointment cache for testing...');
      await AsyncStorage.removeItem(cacheKey);
      console.log('    Cache cleared');
      
      // Fetch all appointments and filter
      console.log('20. Fetching all appointments...');
      
      let appointments = [];
      
      try {
        const allAppointmentsResponse = await fetch(`${API_URL}/api/appointments`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${userToken}`,
            'Accept': 'application/json'
          }
        });
        
        if (allAppointmentsResponse.ok) {
          const allAppointmentsData = await allAppointmentsResponse.json();
          let allAppointments = Array.isArray(allAppointmentsData) ? allAppointmentsData : 
            (allAppointmentsData && allAppointmentsData.appointments ? allAppointmentsData.appointments : []);
          
          console.log(`21. Found ${allAppointments.length} total appointments in the system`);
          
          if (allAppointments.length > 0) {
            // Log all appointment shop IDs for debugging
            console.log('22. All appointment shop IDs:');
            allAppointments.forEach((appointment, index) => {
              const appointmentShopId = typeof appointment.shopId === 'object' ? 
                (appointment.shopId._id || appointment.shopId.id) : appointment.shopId;
              console.log(`    Appointment ${index + 1}: Shop ID = ${appointmentShopId}`);
            });
            
            // Filter for our specific shop ID
            console.log(`23. Filtering for shop ID: ${shopId}`);
            
            // Use string comparison for IDs to handle ObjectId vs string issues
            const shopAppointments = allAppointments.filter(appointment => {
              const appointmentShopId = typeof appointment.shopId === 'object' ? 
                (appointment.shopId._id || appointment.shopId.id) : appointment.shopId;
              
              // Convert both to strings for comparison
              const shopIdStr = String(shopId);
              const appointmentShopIdStr = String(appointmentShopId);
              
              const isMatch = shopIdStr === appointmentShopIdStr;
              console.log(`    Comparing: ${shopIdStr} vs ${appointmentShopIdStr} = ${isMatch}`);
              
              return isMatch;
            });
            
            console.log(`24. Found ${shopAppointments.length} appointments for this shop`);
            
            if (shopAppointments.length > 0) {
              appointments = shopAppointments;
              
              // Process appointments for client information
              console.log('25. Processing appointments for client information');
              
              appointments = await Promise.all(appointments.map(async appointment => {
                // If client information is already populated, use it
                if (appointment.clientData || (appointment.clientId && typeof appointment.clientId === 'object')) {
                  return appointment;
                }
                
                // Try to fetch client information
                if (appointment.clientId && typeof appointment.clientId !== 'object') {
                  try {
                    const clientResponse = await fetch(`${API_URL}/api/users/${appointment.clientId}`, {
                      method: 'GET',
                      headers: {
                        'Authorization': `Bearer ${userToken}`,
                        'Accept': 'application/json'
                      }
                    });
                    
                    if (clientResponse.ok) {
                      const clientData = await clientResponse.json();
                      if (clientData && clientData.user) {
                        return {
                          ...appointment,
                          clientData: clientData.user
                        };
                      }
                    }
                  } catch (clientError) {
                    console.log(`    Error fetching client data for appointment ${appointment._id}:`, clientError.message);
                  }
                }
                
                // Otherwise, create a basic structure with available info
                return {
                  ...appointment,
                  clientData: appointment.clientId ? {
                    _id: typeof appointment.clientId === 'object' ? appointment.clientId._id : appointment.clientId,
                    firstName: 'Client',
                    lastName: '',
                  } : { firstName: 'Client', lastName: '' }
                };
              }));
            }
          }
        }
      } catch (allAppointmentsError) {
        console.log('21. ERROR fetching all appointments:', allAppointmentsError.message);
      }
      
      // Store appointments in AsyncStorage for future use
      try {
        await AsyncStorage.setItem(cacheKey, JSON.stringify({
          appointments,
          timestamp: Date.now()
        }));
        console.log(`26. Appointments saved to AsyncStorage with key: ${cacheKey}`);
        console.log(`    Saved ${appointments.length} appointments`);
      } catch (storageError) {
        console.log('26. ERROR saving appointments to AsyncStorage:', storageError.message);
      }
      
      console.log('27. Returning appointments to caller');
      console.log(`    Returning ${appointments.length} appointments`);
      console.log('========== APPOINTMENT SERVICE: COMPLETED SUCCESSFULLY ==========\n');
      return appointments;
      
    } catch (error) {
      console.log(`ERROR in getBarbershopAppointments: ${error.message}`);
      console.log('Error object:', error);
      console.log('Error stack:', error.stack);
      console.log('========== APPOINTMENT SERVICE: ENDING WITH ERROR ==========\n');
      throw error;
    }
  },
  getUserAppointments: async (userToken) => {
    console.log('\n========== APPOINTMENT SERVICE: GET USER APPOINTMENTS ==========');
    console.log('1. Function called at:', new Date().toISOString());
    
    if (!userToken) {
      console.log('2. ERROR: No user token provided');
      console.log('========== APPOINTMENT SERVICE: ENDING WITH ERROR ==========\n');
      throw new Error('No authentication token provided');
    }
    
    console.log('2. User token available:', userToken ? `${userToken.substring(0, 5)}...${userToken.substring(userToken.length - 5)}` : 'null');
    
    try {
      // First, try to get user info from AsyncStorage
      console.log('3. Attempting to get user info from AsyncStorage...');
      let userInfo = null;
      
      try {
        const userDataString = await AsyncStorage.getItem('userData');
        if (userDataString) {
          userInfo = JSON.parse(userDataString);
          console.log('4. User info retrieved from AsyncStorage');
          console.log(`   User role: ${userInfo.role}`);
          console.log(`   User ID: ${userInfo.id || userInfo._id}`);
        } else {
          console.log('4. No user info in AsyncStorage');
        }
      } catch (storageError) {
        console.log('4. ERROR getting user info from AsyncStorage:', storageError.message);
      }
      
      // If no user info in AsyncStorage, try to decode from token
      if (!userInfo) {
        console.log('5. Attempting to decode user info from token...');
        try {
          const decoded = decodeToken(userToken);
          if (decoded && decoded.id) {
            userInfo = {
              _id: decoded.id,
              id: decoded.id,
              role: decoded.role
            };
            console.log('6. User info decoded from token');
            console.log(`   User role: ${userInfo.role}`);
            console.log(`   User ID: ${userInfo._id || userInfo.id}`);
          } else {
            console.log('6. Failed to decode valid user info from token');
          }
        } catch (decodeError) {
          console.log('6. ERROR decoding token:', decodeError.message);
        }
      }
      
      // If still no user info, try to fetch from API
      if (!userInfo) {
        console.log('7. Fetching user info from API...');
        try {
          const userResponse = await fetch(`${API_URL}/api/auth/me`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${userToken}`,
              'Accept': 'application/json'
            }
          });
          
          if (!userResponse.ok) {
            console.log(`8. Failed to get user info from API: ${userResponse.status}`);
            throw new Error('Failed to get user information');
          }
          
          userInfo = await userResponse.json();
          console.log('8. User info retrieved successfully from API');
          console.log(`   User role: ${userInfo.role}`);
          console.log(`   User ID: ${userInfo._id || userInfo.id}`);
          
          // Save to AsyncStorage for future use
          await AsyncStorage.setItem('userData', JSON.stringify(userInfo));
          console.log('   User info saved to AsyncStorage');
        } catch (userError) {
          console.log('8. ERROR getting user info from API:', userError.message);
          console.log('   Cannot proceed without user information');
          throw new Error('Failed to get user information');
        }
      }
      
      // Ensure we have user info
      if (!userInfo) {
        console.log('9. No user info available, cannot fetch appointments');
        throw new Error('User information not available');
      }
      
      const clientId = userInfo.id || userInfo._id;
      console.log(`10. Using client ID: ${clientId}`);
      
      // Check if we have cached appointments
      const cacheKey = `appointments_client_${clientId}`;
      
      console.log('11. Checking for cached appointments...');
      try {
        const cachedData = await AsyncStorage.getItem(cacheKey);
        if (cachedData) {
          const { appointments, timestamp } = JSON.parse(cachedData);
          const cacheAge = Date.now() - timestamp;
          
          // Use cache if it's less than 5 minutes old
          if (cacheAge < 5 * 60 * 1000) {
            console.log(`12. Using cached appointments (${appointments.length} items, ${Math.round(cacheAge/1000)}s old)`);
            console.log('========== APPOINTMENT SERVICE: COMPLETED FROM CACHE ==========\n');
            return appointments;
          }
          console.log(`12. Cache expired (${Math.round(cacheAge/1000)}s old), fetching fresh data`);
        } else {
          console.log('12. No cached appointments found');
        }
      } catch (cacheError) {
        console.log('12. ERROR checking cache:', cacheError.message);
      }
      
      // Clear cache for testing
      console.log('13. Clearing appointment cache for testing...');
      await AsyncStorage.removeItem(cacheKey);
      console.log('    Cache cleared');
      
      // Try different API endpoints to get client appointments
      console.log('14. Trying client-specific appointments endpoint...');
      
      let appointments = [];
      let endpointSuccess = false;
      
      // First try: Client-specific endpoint
      try {
        const clientAppointmentsResponse = await fetch(`${API_URL}/api/appointments/client/${clientId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${userToken}`,
            'Accept': 'application/json'
          }
        });
        
        if (clientAppointmentsResponse.ok) {
          const clientAppointmentsData = await clientAppointmentsResponse.json();
          console.log('15. Client-specific endpoint successful');
          
          if (Array.isArray(clientAppointmentsData)) {
            appointments = clientAppointmentsData;
            console.log(`16. Found ${appointments.length} appointments in array response`);
            endpointSuccess = true;
          } else if (clientAppointmentsData && clientAppointmentsData.appointments) {
            appointments = clientAppointmentsData.appointments;
            console.log(`16. Found ${appointments.length} appointments in object.appointments`);
            endpointSuccess = true;
          } else {
            console.log('16. Unexpected response format from client-specific endpoint');
          }
        } else {
          console.log(`15. Client-specific endpoint failed: ${clientAppointmentsResponse.status}`);
        }
      } catch (clientAppointmentsError) {
        console.log('15. ERROR with client-specific endpoint:', clientAppointmentsError.message);
      }
      
      // Second try: Query parameter endpoint with clientId
      if (!endpointSuccess) {
        console.log('17. Trying query parameter endpoint with clientId...');
        try {
          const queryAppointmentsResponse = await fetch(`${API_URL}/api/appointments?clientId=${clientId}`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${userToken}`,
              'Accept': 'application/json'
            }
          });
          
          if (queryAppointmentsResponse.ok) {
            const queryAppointmentsData = await queryAppointmentsResponse.json();
            console.log('18. Query parameter endpoint successful');
            
            if (Array.isArray(queryAppointmentsData)) {
              appointments = queryAppointmentsData;
              console.log(`19. Found ${appointments.length} appointments in array response`);
              endpointSuccess = true;
            } else if (queryAppointmentsData && queryAppointmentsData.appointments) {
              appointments = queryAppointmentsData.appointments;
              console.log(`19. Found ${appointments.length} appointments in object.appointments`);
              endpointSuccess = true;
            } else {
              console.log('19. Unexpected response format from query parameter endpoint');
            }
          } else {
            console.log(`18. Query parameter endpoint failed: ${queryAppointmentsResponse.status}`);
          }
        } catch (queryAppointmentsError) {
          console.log('18. ERROR with query parameter endpoint:', queryAppointmentsError.message);
        }
      }
      
      // In the getUserAppointments method, I'll update the filtering logic to use clientId instead of userId

// Third try: Get all appointments and filter client-side
if (!endpointSuccess) {
  console.log('20. Trying all appointments endpoint and filtering...');
  try {
    const allAppointmentsResponse = await fetch(`${API_URL}/api/appointments`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${userToken}`,
        'Accept': 'application/json'
      }
    });
          
    if (allAppointmentsResponse.ok) {
      const allAppointmentsData = await allAppointmentsResponse.json();
      console.log('21. All appointments endpoint successful');
              
      let allAppointments = [];
      if (Array.isArray(allAppointmentsData)) {
        allAppointments = allAppointmentsData;
      } else if (allAppointmentsData && allAppointmentsData.appointments) {
        allAppointments = allAppointmentsData.appointments;
      }
              
      console.log(`22. Found ${allAppointments.length} total appointments in the system`);
              
      // Filter for appointments where this user is the client
      console.log(`23. Filtering for client ID: ${clientId}`);
              
      // Use string comparison for IDs to handle ObjectId vs string issues
      const clientIdStr = String(clientId);
              
      const clientAppointments = allAppointments.filter(appointment => {
        // Check for clientId field instead of userId
        const appointmentClientId = appointment.clientId;
        const appointmentClientIdStr = appointmentClientId ? String(appointmentClientId) : '';
                
        // Log the clientId for debugging
        console.log(`    Appointment ${appointment._id}: clientId = ${appointmentClientIdStr}, comparing with ${clientIdStr}`);
                
        // Only match if clientId matches the client's ID
        const isMatch = appointmentClientIdStr === clientIdStr;
                
        if (isMatch) {
          console.log(`    MATCH FOUND: Appointment ${appointment._id} has clientId ${appointmentClientIdStr}`);
        }
                
        return isMatch;
      });
              
      console.log(`24. Found ${clientAppointments.length} appointments for this client`);
      appointments = clientAppointments;
    } else {
      console.log(`21. All appointments endpoint failed: ${allAppointmentsResponse.status}`);
    }
  } catch (allAppointmentsError) {
    console.log('21. ERROR with all appointments endpoint:', allAppointmentsError.message);
  }
}

      
      // Process appointments to ensure shop and barber information is included
      if (appointments.length > 0) {
        console.log('25. Processing appointments for shop and barber information');
        
        appointments = await Promise.all(appointments.map(async appointment => {
          let processedAppointment = { ...appointment };
          
          // Ensure shop information is available
          if (!processedAppointment.shopName && processedAppointment.shopId) {
            if (typeof processedAppointment.shopId === 'object' && processedAppointment.shopId.name) {
              processedAppointment.shopName = processedAppointment.shopId.name;
            } else if (typeof processedAppointment.shopId === 'string' || typeof processedAppointment.shopId === 'object') {
              const shopIdValue = typeof processedAppointment.shopId === 'object' ? 
                (processedAppointment.shopId._id || processedAppointment.shopId.id) : processedAppointment.shopId;
              
              try {
                const shopResponse = await fetch(`${API_URL}/api/shops/${shopIdValue}`, {
                  method: 'GET',
                  headers: {
                    'Authorization': `Bearer ${userToken}`,
                    'Accept': 'application/json'
                  }
                });
                
                if (shopResponse.ok) {
                  const shopData = await shopResponse.json();
                  if (shopData && shopData.name) {
                    processedAppointment.shopName = shopData.name;
                  } else if (shopData && shopData.shop && shopData.shop.name) {
                    processedAppointment.shopName = shopData.shop.name;
                  }
                }
              } catch (shopError) {
                console.log(`    Error fetching shop data for appointment ${processedAppointment._id}:`, shopError.message);
              }
            }
          }
          
          // Ensure barber information is available
          if (!processedAppointment.barberName && processedAppointment.barberId) {
            if (typeof processedAppointment.barberId === 'object' && 
                (processedAppointment.barberId.firstName || processedAppointment.barberId.name)) {
              processedAppointment.barberName = processedAppointment.barberId.name || 
                `${processedAppointment.barberId.firstName} ${processedAppointment.barberId.lastName || ''}`;
            } else if (typeof processedAppointment.barberId === 'string' || typeof processedAppointment.barberId === 'object') {
              const barberIdValue = typeof processedAppointment.barberId === 'object' ? 
                (processedAppointment.barberId._id || processedAppointment.barberId.id) : processedAppointment.barberId;
              
              try {
                const barberResponse = await fetch(`${API_URL}/api/users/${barberIdValue}`, {
                  method: 'GET',
                  headers: {
                    'Authorization': `Bearer ${userToken}`,
                    'Accept': 'application/json'
                  }
                });
                
                if (barberResponse.ok) {
                  const barberData = await barberResponse.json();
                  if (barberData && barberData.user) {
                    processedAppointment.barberName = `${barberData.user.firstName} ${barberData.user.lastName || ''}`;
                  } else if (barberData && barberData.firstName) {
                    processedAppointment.barberName = `${barberData.firstName} ${barberData.lastName || ''}`;
                  }
                }
              } catch (barberError) {
                console.log(`    Error fetching barber data for appointment ${processedAppointment._id}:`, barberError.message);
              }
            }
          }
          
          return processedAppointment;
        }));
      }
      
      // Store appointments in AsyncStorage for future use
      try {
        await AsyncStorage.setItem(cacheKey, JSON.stringify({
          appointments,
          timestamp: Date.now()
        }));
        console.log(`26. Appointments saved to AsyncStorage with key: ${cacheKey}`);
        console.log(`    Saved ${appointments.length} appointments`);
      } catch (storageError) {
        console.log('26. ERROR saving appointments to AsyncStorage:', storageError.message);
      }
      
      console.log('27. Returning appointments to caller');
      console.log(`    Returning ${appointments.length} appointments`);
      console.log('========== APPOINTMENT SERVICE: COMPLETED SUCCESSFULLY ==========\n');
      return appointments;
      
    } catch (error) {
      console.log(`ERROR in getUserAppointments: ${error.message}`);
      console.log('Error object:', error);
      console.log('Error stack:', error.stack);
      console.log('========== APPOINTMENT SERVICE: ENDING WITH ERROR ==========\n');
      throw error;
    }
  },
  
  // Add a method to get shop data
  getShopData: async (userToken) => {
    try {
      // First check if we have shop data in AsyncStorage
      const shopDataString = await AsyncStorage.getItem('shopData');
      if (shopDataString) {
        return JSON.parse(shopDataString);
      }
      
      // Fetch shop data from API
      const response = await fetch(`${API_URL}/api/shop`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to get shop information');
      }
      
      const shopData = await response.json();
      
      // Save to AsyncStorage for future use
      await AsyncStorage.setItem('shopData', JSON.stringify(shopData));
      
      return shopData;
    } catch (error) {
      console.error('Error getting shop data:', error);
      throw error;
    }
  },

  // Helper function to generate default time slots
  generateDefaultTimeSlots() {
    // Generate time slots from 9 AM to 5 PM
    const slots = [];
    for (let hour = 9; hour < 17; hour++) {
      const amPm = hour < 12 ? 'AM' : 'PM';
      const hour12 = hour > 12 ? hour - 12 : hour;
      slots.push({
        timeSlot: `${hour12}:00 ${amPm}`,
        isBooked: false,
        status: 'available'
      });
      slots.push({
        timeSlot: `${hour12}:30 ${amPm}`,
        isBooked: false,
        status: 'available'
      });
    }
    return slots;
  },


  bookAppointment: async (appointmentData, userToken) => {
    try {
      console.log('Making appointment request with data:', appointmentData);
      
      // Debug: Check what user data we have in AsyncStorage
      let userData = null;
      try {
        const userDataString = await AsyncStorage.getItem('userData');
        if (userDataString) {
          userData = JSON.parse(userDataString);
          console.log('DEBUG - User data from AsyncStorage:', userData);
          console.log('DEBUG - User ID from AsyncStorage:', userData.id || userData._id);
        } else {
          console.log('DEBUG - No user data found in AsyncStorage');
        }
      } catch (e) {
        console.log('DEBUG - Error reading user data:', e);
      }
      
      // Create the request body with the essential fields
      const requestBody = {
        date: appointmentData.date,
        timeSlot: appointmentData.timeSlot,
        service: appointmentData.service,
        status: 'confirmed'
      };
      
      // Include shopId if it exists in the appointment data
      if (appointmentData.shopId) {
        requestBody.shopId = appointmentData.shopId;
        console.log('Including shopId in request:', appointmentData.shopId);
        
        // If we have a shopId but no shopName, try to fetch the shop name
        if (!appointmentData.shopName && userToken) {
          try {
            const shopResponse = await fetch(`${API_URL}/api/shop/${appointmentData.shopId}`, {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${userToken}`,
                'Accept': 'application/json'
              }
            });
            
            if (shopResponse.ok) {
              const shopData = await shopResponse.json();
              if (shopData && shopData.shop && shopData.shop.name) {
                appointmentData.shopName = shopData.shop.name;
                console.log('Retrieved shop name for appointment:', appointmentData.shopName);
              }
            }
          } catch (shopError) {
            console.log('Error fetching shop details:', shopError);
          }
        }
      }
      
      // Get the current user's ID from AsyncStorage
      let currentUserId = null;
      if (userData) {
        currentUserId = userData.id || userData._id;
        console.log('DEBUG - Using user ID from AsyncStorage:', currentUserId);
        
        // Include clientId in the request
        if (currentUserId) {
          requestBody.clientId = currentUserId;
        }
      } else {
        console.log('DEBUG - No user ID available from AsyncStorage, trying to get from token');
        
        // Try to decode the token directly
        try {
          // If you have a decodeToken function
          if (typeof decodeToken === 'function') {
            const decoded = decodeToken(userToken);
            if (decoded && (decoded.id || decoded._id)) {
              currentUserId = decoded.id || decoded._id;
              console.log('DEBUG - User ID from token decode:', currentUserId);
              
              if (currentUserId) {
                requestBody.clientId = currentUserId;
              }
            } else {
              console.log('DEBUG - No user ID found in decoded token');
            }
          } else {
            console.log('DEBUG - decodeToken function not available');
          }
        } catch (decodeError) {
          console.log('DEBUG - Error decoding token:', decodeError);
        }
        
        // If we still don't have a user ID, try to get user info from API
        if (!currentUserId) {
          console.log('DEBUG - Trying to get user info from API');
          try {
            const response = await fetch(`${API_URL}/api/auth/me`, {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${userToken}`,
                'Accept': 'application/json'
              }
            });
            
            if (response.ok) {
              const userInfo = await response.json();
              console.log('DEBUG - User info from API:', userInfo);
              
              // Try to get the ID from various possible locations in the response
              currentUserId = userInfo.id || userInfo._id || 
                             (userInfo.user ? (userInfo.user.id || userInfo.user._id) : null);
              
              console.log('DEBUG - User ID from API:', currentUserId);
              
              if (currentUserId) {
                requestBody.clientId = currentUserId;
                
                // Save user data to AsyncStorage for future use
                try {
                  await AsyncStorage.setItem('userData', JSON.stringify({
                    ...userInfo,
                    id: currentUserId
                  }));
                  console.log('DEBUG - Saved user data to AsyncStorage');
                } catch (saveError) {
                  console.log('DEBUG - Error saving user data to AsyncStorage:', saveError);
                }
              }
            } else {
              console.log('DEBUG - Failed to get user info from API:', await response.text());
            }
          } catch (error) {
            console.log('DEBUG - Error fetching user info from API:', error);
          }
        }
      }
      
      // Final check for clientId
      if (!requestBody.clientId) {
        console.log('WARNING: No clientId found. Appointment will fail or use default ID.');
        
        // You could throw an error here to prevent creating an appointment without a valid clientId
        // throw new Error('No client ID available. Cannot create appointment.');
      }
      
      console.log('DEBUG - Final request body:', requestBody);
      
      const response = await fetch(`${API_URL}/api/appointments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${userToken}`
        },
        body: JSON.stringify(requestBody)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.log('Error response from server:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Server response:', data);
      
      // Store the appointment in AsyncStorage with the correct date
      try {
        // Get existing appointments
        const storedAppointments = await AsyncStorage.getItem('userAppointments');
        let appointments = storedAppointments ? JSON.parse(storedAppointments) : [];
        
        // Add shop name and other details to the appointment data
        const enhancedAppointment = {
          ...data,
          shopName: appointmentData.shopName || 'Barbershop',
          userId: currentUserId, // Store the user ID explicitly for local reference
          clientId: currentUserId, // Also store as clientId to match backend model
          // Ensure the date is stored as a string in ISO format to prevent timezone issues
          date: data.date
        };
        
        // Ensure shopId is stored in the appointment
        if (appointmentData.shopId) {
          enhancedAppointment.shopId = appointmentData.shopId;
        } else if (data.shopId) {
          enhancedAppointment.shopId = data.shopId;
        }
        
        console.log('Enhanced appointment with IDs:', {
          userId: enhancedAppointment.userId,
          clientId: enhancedAppointment.clientId,
          shopId: enhancedAppointment.shopId,
          shopName: enhancedAppointment.shopName,
          date: enhancedAppointment.date
        });
        
        // Add the new appointment to the array
        appointments.push(enhancedAppointment);
        
        // Save back to AsyncStorage
        await AsyncStorage.setItem('userAppointments', JSON.stringify(appointments));
        console.log('Appointment saved to AsyncStorage');
      } catch (storageError) {
        console.log('Error storing appointment in AsyncStorage:', storageError);
      }
      
      return data;
    } catch (error) {
      console.log('Network error:', error);
      throw error;
    }
  },
  

  // Helper function to get booked time slots
  getBookedTimeSlots: async (date, shopId, userToken) => {
    if (!shopId || !date) {
      return [];
    }
    
    try {
      // Try to get from cache first
      const cacheKey = `booked_slots_${shopId}_${date}`;
      const cachedData = await AsyncStorage.getItem(cacheKey);
      
      if (cachedData) {
        const { slots, timestamp } = JSON.parse(cachedData);
        const cacheAge = Date.now() - timestamp;
        
        // Use cache if it's less than 2 minutes old
        if (cacheAge < 2 * 60 * 1000) {
          return slots;
        }
      }
      
      // Fetch appointments for this shop on this date
      let url = `${API_URL}/api/appointments/date/${date}`;
      if (shopId) {
        url += `?shopId=${shopId}`;
      }
      
      const headers = {
        'Accept': 'application/json'
      };
      
      // Add authorization if token is provided
      if (userToken) {
        headers['Authorization'] = `Bearer ${userToken}`;
      }
      
      const response = await fetch(url, { headers });
      
      if (!response.ok) {
        console.log(`Error fetching booked slots: ${response.status}`);
        return [];
      }
      
      const data = await response.json();
      let appointments = Array.isArray(data) ? data : 
        (data && data.appointments ? data.appointments : []);
      
      // Filter to only include confirmed or pending appointments
      const validStatuses = ['confirmed', 'pending'];
      const bookedAppointments = appointments.filter(appointment => 
        validStatuses.includes(appointment.status)
      );
      
      // Extract time slots from appointments
      const bookedSlots = bookedAppointments.map(appointment => ({
        timeSlot: appointment.timeSlot,
        time: appointment.time, // Some APIs use 'time' instead of 'timeSlot'
        status: appointment.status
      }));
      
      // Cache the results
      await AsyncStorage.setItem(cacheKey, JSON.stringify({
        slots: bookedSlots,
        timestamp: Date.now()
      }));
      
      return bookedSlots;
    } catch (error) {
      console.error('Error fetching booked time slots:', error);
      return [];
    }
  },
  
  getTimeSlots: async (date, shopId, userToken) => {
    try {
      // Construct the URL with the new endpoint structure
      const url = `${API_URL}/api/appointments/available-slots/${date}?shopId=${shopId}`;
      
      console.log('Fetching available time slots from:', url);
      const response = await fetch(url);
      
      // Check if response is OK
      if (!response.ok) {
        console.error(`Error fetching time slots: ${response.status}`);
        // Return a default set of time slots if the API fails
        return appointmentService.generateDefaultTimeSlots();
      }
      
      // Parse the response
      const data = await response.json();
      
      // Check if the response has the expected structure
      if (!data || !data.availableSlots || !Array.isArray(data.availableSlots)) {
        console.error('Error: Unexpected response format:', data);
        return appointmentService.generateDefaultTimeSlots();
      }
      
      // Define all possible time slots
      const allTimeSlots = [
        '9:00 AM', '10:00 AM', '11:00 AM',
        '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM'
      ];
      
      // Create result array
      const result = [];
      
      // Add all time slots with appropriate status
      for (const slot of allTimeSlots) {
        const isAvailable = data.availableSlots.includes(slot);
        result.push({
          timeSlot: slot,
          isBooked: !isAvailable,
          status: isAvailable ? 'available' : 'booked'
        });
      }
      
      return result;
    } catch (error) {
      console.error('Error fetching time slots:', error);
      // Return a default set of time slots if there's an error
      return appointmentService.generateDefaultTimeSlots();
    }
  },
  
  getAppointmentsByDate: async (date, shopId, userToken) => {
    try {
      if (!date) {
        throw new Error('Date is required');
      }
      
      // Construct the URL based on available parameters
      let url = `${API_URL}/api/appointments/date/${date}`;
      if (shopId) {
        url += `?shopId=${shopId}`;
      }
      
      const headers = {
        'Accept': 'application/json'
      };
      
      // Add authorization if token is provided
      if (userToken) {
        headers['Authorization'] = `Bearer ${userToken}`;
      }
      
      const response = await fetch(url, { headers });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch appointments: ${response.status}`);
      }
      
      const data = await response.json();
      let appointments = Array.isArray(data) ? data : 
        (data && data.appointments ? data.appointments : []);
      
      // Enhance appointments with additional information
      const enhancedAppointments = appointments.map(appointment => ({
        ...appointment,
        formattedTime: formatTimeSlot(appointment.timeSlot || appointment.time),
        status: appointment.status || 'confirmed',
        isBooked: true
      }));
      
      return enhancedAppointments;
    } catch (error) {
      console.error('Error fetching appointments by date:', error);
      throw error;
    }
  },

  isTimeSlotAvailable: async (date, timeSlot, shopId, userToken) => {
    try {
      // Get all time slots for the date
      const allSlots = await appointmentService.getTimeSlots(date, shopId, userToken);
      
      // Find the specific slot
      const slot = allSlots.find(s => 
        s.timeSlot === timeSlot || s.time === timeSlot
      );
      
      // Return availability status
      return slot ? !slot.isBooked : false;
    } catch (error) {
      console.error('Error checking time slot availability:', error);
      return false;
    }
  },
 
  getUserAppointments: async (userToken) => {
    try {
      console.log('\n========== APPOINTMENT SERVICE: GET USER APPOINTMENTS ==========');
      console.log('1. Function called at:', new Date().toISOString());
          
      if (!userToken) {
        console.log('2. ERROR: No user token provided');
        console.log('========== APPOINTMENT SERVICE: ENDING WITH ERROR ==========\n');
        throw new Error('No authentication token provided');
      }
          
      console.log('2. User token available:', userToken ? `${userToken.substring(0, 5)}...${userToken.substring(userToken.length - 5)}` : 'null');
          
      // Get the current user's ID from AsyncStorage
      let currentUserId = null;
      let userRole = null;
      try {
        const userData = await AsyncStorage.getItem('userData');
        if (userData) {
          const parsedUserData = JSON.parse(userData);
          currentUserId = parsedUserData.id || parsedUserData._id;
          userRole = parsedUserData.role;
          console.log('3. Found current user ID from AsyncStorage:', currentUserId);
          console.log('   User role:', userRole);
        }
      } catch (userDataError) {
        console.log('3. ERROR getting userData from AsyncStorage:', userDataError.message);
      }
          
      // If we don't have a user ID, try to decode it from token
      if (!currentUserId) {
        console.log('4. No user ID in AsyncStorage, attempting to decode from token...');
        try {
          const decoded = decodeToken(userToken);
          if (decoded && (decoded.id || decoded._id || decoded.userId || decoded.sub)) {
            currentUserId = decoded.id || decoded._id || decoded.userId || decoded.sub;
            userRole = decoded.role;
            console.log('5. Successfully decoded user ID from token:', currentUserId);
            console.log('   User role from token:', userRole);
          } else {
            console.log('5. Failed to decode valid user ID from token');
          }
        } catch (decodeError) {
          console.log('5. ERROR decoding token:', decodeError.message);
        }
      }
          
      // Try to get all appointments from AsyncStorage first
      console.log('6. Checking for appointments in AsyncStorage...');
      const cacheKey = `appointments_user_${currentUserId}`;
      const storedAppointments = await AsyncStorage.getItem(cacheKey);
      
      if (storedAppointments) {
        console.log('7. Found cached appointments in AsyncStorage');
        const parsedAppointments = JSON.parse(storedAppointments);
        console.log(`   Cached appointments count: ${parsedAppointments.length}`);
        
        // Return cached appointments if they exist
        if (parsedAppointments.length > 0) {
          console.log('8. Returning cached appointments');
          console.log('========== APPOINTMENT SERVICE: COMPLETED FROM CACHE ==========\n');
          return parsedAppointments;
        }
      }
      
      console.log('9. Fetching all appointments from API...');
      
      // Make API request to get all appointments
      const response = await fetch(`${API_URL}/api/appointments`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Accept': 'application/json'
        }
      });
          
      console.log(`10. API response status: ${response.status}`);
          
      if (!response.ok) {
        console.log(`11. ERROR: API request failed with status ${response.status}`);
        try {
          const errorData = await response.text();
          console.log('    Error response:', errorData);
        } catch (parseError) {
          console.log('    Could not parse error response');
        }
        console.log('========== APPOINTMENT SERVICE: ENDING WITH ERROR ==========\n');
        return []; // Return empty array instead of throwing
      }
          
      const data = await response.json();
      console.log('12. Server response for appointments:', typeof data, Array.isArray(data) ? `Array with ${data.length} items` : 'Object');
          
      // Process the appointments data
      if (data && (data.appointments || Array.isArray(data))) {
        const allAppointments = data.appointments || data;
        console.log(`13. Processing ${allAppointments.length} appointments from API`);
        
        // Filter appointments for the current user based on user ID
        console.log(`14. Filtering appointments for user ID: ${currentUserId}`);
        
        // For clients, we filter by userId in the appointment
        // For barbershops, we filter by shopId in the appointment
        let filteredAppointments = [];
        if (userRole === 'client') {
          console.log('15. User is a client, filtering by clientId in appointment');
          filteredAppointments = allAppointments.filter(appointment => {
            // Convert IDs to strings for comparison
            const currentUserIdStr = String(currentUserId);
            
            // Check clientId (primary field for client identification)
            const clientIdStr = appointment.clientId ? 
              (typeof appointment.clientId === 'object' ? 
                String(appointment.clientId._id || appointment.clientId.id) : 
                String(appointment.clientId)) : 
              '';
            
            // Log each appointment's clientId for debugging
            console.log(`    Appointment ${appointment._id}: clientId = ${clientIdStr}, comparing with ${currentUserIdStr}`);
            
            // Match only if clientId matches the current user's ID
            return clientIdStr === currentUserIdStr;
          });
        } else if (userRole === 'barbershop' || userRole === 'mainBarbershop') {
          console.log('15. User is a barbershop, filtering by shopId in appointment');
          filteredAppointments = allAppointments.filter(appointment => {
            // Convert IDs to strings for comparison
            const currentUserIdStr = String(currentUserId);
            
            // Get shopId as string, handling object or string cases
            const shopIdStr = appointment.shopId ? 
              (typeof appointment.shopId === 'object' ? 
                String(appointment.shopId._id || appointment.shopId.id) : 
                String(appointment.shopId)) : 
              '';
            
            // Log each appointment's shopId for debugging
            console.log(`    Appointment ${appointment._id}: shopId = ${shopIdStr}, comparing with ${currentUserIdStr}`);
            
            // Match if shopId matches the current user's ID
            return shopIdStr === currentUserIdStr;
          });
        }
        
        console.log(`16. Found ${filteredAppointments.length} appointments for this user`);
        
        // Create a map to store shop names by shopId to avoid duplicate requests
        const shopNamesMap = {};
        
        // Enhanced appointments with shop names
        const enhancedAppointments = await Promise.all(
          filteredAppointments.map(async (appointment) => {
            const enhanced = { ...appointment };
            
            // If this appointment has a shopId, try to get the shop name
            if (appointment.shopId) {
              // Check if we've already fetched this shop's name
              if (shopNamesMap[appointment.shopId]) {
                enhanced.shopName = shopNamesMap[appointment.shopId];
              } else {
                try {
                  const shopResponse = await fetch(`${API_URL}/api/shop/${appointment.shopId}`, {
                    method: 'GET',
                    headers: {
                      'Authorization': `Bearer ${userToken}`,
                      'Accept': 'application/json'
                    }
                  });
                  
                  if (shopResponse.ok) {
                    const shopData = await shopResponse.json();
                    if (shopData && shopData.shop && shopData.shop.name) {
                      // Store the shop name in our map for future use
                      shopNamesMap[appointment.shopId] = shopData.shop.name;
                      enhanced.shopName = shopData.shop.name;
                      console.log(`    Found shop name for appointment ${appointment._id}: ${enhanced.shopName}`);
                    }
                  }
                } catch (shopError) {
                  console.log(`    Error fetching shop details for appointment ${appointment._id}:`, shopError.message);
                }
              }
            }
            
            // If we couldn't get a shop name, use a default
            if (!enhanced.shopName) {
              enhanced.shopName = 'Barbershop';
            }
            
            return enhanced;
          })
        );
        
        // Store filtered appointments in AsyncStorage with user-specific key
        await AsyncStorage.setItem(cacheKey, JSON.stringify(enhancedAppointments));
        console.log(`17. Stored ${enhancedAppointments.length} appointments in AsyncStorage with key: ${cacheKey}`);
        
        console.log('18. Returning enhanced appointments from API');
        console.log('========== APPOINTMENT SERVICE: COMPLETED SUCCESSFULLY ==========\n');
        return enhancedAppointments;
      }
          
      console.log('13. No appointments data found in API response');
      console.log('========== APPOINTMENT SERVICE: COMPLETED WITH EMPTY RESULT ==========\n');
      return [];
    } catch (error) {
      console.error('ERROR in getUserAppointments:', error.message);
      console.error('Error stack:', error.stack);
      console.log('========== APPOINTMENT SERVICE: ENDING WITH ERROR ==========\n');
      return [];
    }
  },
  
  
  cancelAppointment: async (appointmentId, userToken) => {
    try {
      const response = await fetch(`${API_URL}/api/appointments/${appointmentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.log(`Error canceling appointment: ${response.status}`, errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // Update the appointment in AsyncStorage
      try {
        const storedAppointments = await AsyncStorage.getItem('userAppointments');
        if (storedAppointments) {
          let appointments = JSON.parse(storedAppointments);
          
          // Update the status of the canceled appointment
          appointments = appointments.map(app => 
            app._id === appointmentId ? {...app, status: 'canceled'} : app
          );
          
          await AsyncStorage.setItem('userAppointments', JSON.stringify(appointments));
          console.log('Updated appointment status in AsyncStorage');
        }
      } catch (storageError) {
        console.log('Error updating appointment in AsyncStorage:', storageError);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error canceling appointment:', error);
      throw error;
    }
  }
};



export const authService = {
  login: async (email, password, role) => {
    try {
      const requestBody = { email, password };
      console.log('Login attempt:', { email, role });
      console.log('Request body:', requestBody);
      
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      console.log('Login response status:', response.status);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Login response data:', data);
      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },


  loginBarbershop: async (credentials) => {
    try {
      const requestBody = {
        email: credentials.email,
        password: credentials.password
      };
      console.log('Sending barbershop login request with:', requestBody);
      
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      console.log('Barbershop login response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.log('Error response data:', errorData);
        throw new Error(errorData.message || 'Login failed');
      }

      const data = await response.json();
      console.log('Barbershop login response data:', data);
      return data;
    } catch (error) {
      console.error('Barbershop login error:', error);
      throw error;
    }
  },

  register: async (userData) => {
    try {
      console.log('Sending registration request with:', userData);
      
      let endpoint;
      switch(userData.role) {
        case 'client':
          endpoint = `${API_URL}/api/auth/client/register`;
          break;
        case 'barbershop':
          endpoint = `${API_URL}/api/auth/barbershop/register`;
          break;
        case 'mainBarbershop':
          endpoint = `${API_URL}/api/auth/mainBarbershop/register`;
          break;
        default:
          endpoint = `${API_URL}/api/auth/client/register`;
      }
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(userData)
      });

      console.log('Registration response status:', response.status);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Registration response data:', data);
      return data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  verifyToken: async (token) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/verify`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  },

  searchBarbershops: async (searchParams) => {
    try {
      console.log('Searching barbershops with params:', searchParams);
      
      let results = [];
      
      // If we're searching by userId, use the dedicated endpoint
      if (searchParams.userId) {
        try {
          console.log(`Searching for shop with userId: ${searchParams.userId}`);
          const response = await fetch(`${API_URL}/api/shop/byUserId/${searchParams.userId}`, {
            method: 'GET',
            headers: {
              'Accept': 'application/json'
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            console.log('Shop by userId response:', data);
            if (data.success && data.shop) {
              // Return as array for consistency with other search results
              results = [data.shop];
            }
          } else {
            console.log(`Shop by userId request failed with status: ${response.status}`);
          }
        } catch (error) {
          console.log('Error fetching shop by userId:', error);
        }
      }
      
      // For location-based searches, use the searchShopsByLocation endpoint
      else if (searchParams.city || searchParams.state) {
        try {
          let queryString = '?';
          if (searchParams.city) queryString += `city=${encodeURIComponent(searchParams.city.trim())}&`;
          if (searchParams.state) queryString += `state=${encodeURIComponent(searchParams.state.trim())}&`;
          if (searchParams.location) queryString += `location=${encodeURIComponent(searchParams.location.trim())}&`;
          
          console.log(`Searching shops with location params: ${queryString}`);
          // Use the dedicated location search endpoint
          const response = await fetch(`${API_URL}/api/shop/searchByLocation${queryString}`, {
            method: 'GET',
            headers: {
              'Accept': 'application/json'
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            console.log('Location search response:', data);
            if (data.success && data.shops) {
              results = data.shops;
            } else {
              console.log('No shops found in location search');
            }
          } else {
            console.log(`Location search failed with status: ${response.status}`);
            // Fall back to the all shops endpoint if the location search fails
            results = await fallbackToAllShops(searchParams);
          }
        } catch (error) {
          console.log('Error searching shops by location:', error);
          // Try fallback if the location search throws an error
          results = await fallbackToAllShops(searchParams);
        }
      }
      
      // If we have a service parameter, use the service search endpoint
      else if (searchParams.service) {
        try {
          const queryString = `?service=${encodeURIComponent(searchParams.service.trim())}`;
          console.log(`Searching shops by service: ${queryString}`);
          
          const response = await fetch(`${API_URL}/api/shop/searchByService${queryString}`, {
            method: 'GET',
            headers: {
              'Accept': 'application/json'
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            console.log('Service search response:', data);
            if (data.success && data.shops) {
              results = data.shops;
            } else {
              console.log('No shops found offering this service');
            }
          } else {
            console.log(`Service search failed with status: ${response.status}`);
          }
        } catch (error) {
          console.log('Error searching shops by service:', error);
        }
      }
      
      // If we have a zipCode parameter, use the zipCode search
      else if (searchParams.zipCode) {
        try {
          const queryString = `?zipCode=${encodeURIComponent(searchParams.zipCode.trim())}`;
          console.log(`Searching shops by zipCode: ${queryString}`);
          
          const response = await fetch(`${API_URL}/api/shop/searchByLocation${queryString}`, {
            method: 'GET',
            headers: {
              'Accept': 'application/json'
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            console.log('ZipCode search response:', data);
            if (data.success && data.shops) {
              results = data.shops;
            } else {
              console.log('No shops found in this zip code');
            }
          } else {
            console.log(`ZipCode search failed with status: ${response.status}`);
            // Fall back to the all shops endpoint if the zipCode search fails
            results = await fallbackToAllShops(searchParams);
          }
        } catch (error) {
          console.log('Error searching shops by zipCode:', error);
          // Try fallback if the zipCode search throws an error
          results = await fallbackToAllShops(searchParams);
        }
      }
      
      // Fall back to the original search endpoint if no specific parameters matched
      else {
        results = await fallbackToOriginalSearch(searchParams);
      }
      
      // Normalize the shop data structure before returning
      const normalizedResults = normalizeShopData(results);
      console.log('Normalized search results:', normalizedResults);
      return normalizedResults;
    } catch (error) {
      console.error('Search error:', error);
      return [];
    }
  }
};

// Helper function to normalize shop data structure
function normalizeShopData(shops) {
  if (!shops || !Array.isArray(shops)) return [];
    
  return shops.map(shop => {
    if (!shop) return null;
        
    // Create a normalized shop object
    const normalizedShop = {
      _id: shop._id || shop.id || Math.random().toString(),
      name: shop.businessName || shop.name || 'Unnamed Barbershop',
    };
        
    // Handle address data
    if (typeof shop.address === 'object' && shop.address !== null) {
      // If address is already an object, use it
      normalizedShop.address = {
        street: shop.address.street || shop.address.line1 || '',
        city: shop.address.city || shop.city || '',
        state: shop.address.state || shop.state || '',
        zip: shop.address.zip || shop.address.zipCode || shop.zipCode || ''
      };
    } else if (typeof shop.address === 'string') {
      // If address is a string, use it as street address
      normalizedShop.address = {
        street: shop.address,
        city: shop.city || '',
        state: shop.state || '',
        zip: shop.zipCode || ''
      };
    } else {
      // If no address object or string, create an empty one and try to fill it
      normalizedShop.address = {
        street: '',
        city: shop.city || '',
        state: shop.state || '',
        zip: shop.zipCode || ''
      };
    }
        
    // Make sure city, state, zip are available at both levels for flexibility
    normalizedShop.city = shop.city || normalizedShop.address.city || '';
    normalizedShop.state = shop.state || normalizedShop.address.state || '';
    normalizedShop.zipCode = shop.zipCode || normalizedShop.address.zip || '';
        
    // Copy these values to the address object too for consistency
    normalizedShop.address.city = normalizedShop.address.city || normalizedShop.city;
    normalizedShop.address.state = normalizedShop.address.state || normalizedShop.state;
    normalizedShop.address.zip = normalizedShop.address.zip || normalizedShop.zipCode;
        
    // Include other important fields
    normalizedShop.phone = shop.phone || shop.phoneNumber || '';
    normalizedShop.email = shop.email || '';
    normalizedShop.website = shop.website || '';
    normalizedShop.rating = shop.rating || 0;
    normalizedShop.services = shop.services || [];
    
    // Enhanced image handling
    // Handle profile image first
    normalizedShop.profileImage = shop.profileImage || '';
    
    // Handle shop images
    if (shop.images) {
      // If images is an array, use it directly
      if (Array.isArray(shop.images)) {
        normalizedShop.images = shop.images;
      } 
      // If images is a string (single URL), convert to array
      else if (typeof shop.images === 'string') {
        normalizedShop.images = [shop.images];
      }
      // Otherwise, initialize as empty array
      else {
        normalizedShop.images = [];
      }
    } else {
      // No images property, initialize as empty array
      normalizedShop.images = [];
    }
    
    // If we have a profile image but no images, add profile image to images array
    if (normalizedShop.profileImage && normalizedShop.images.length === 0) {
      normalizedShop.images.push(normalizedShop.profileImage);
    }
    
    // If we have images but no profile image, use first image as profile
    if (!normalizedShop.profileImage && normalizedShop.images.length > 0) {
      normalizedShop.profileImage = normalizedShop.images[0];
    }
    
    // Add formatted address for convenience
    normalizedShop.formattedAddress = `${normalizedShop.address.street}${normalizedShop.address.street ? ', ' : ''}${normalizedShop.address.city}${normalizedShop.address.city ? ', ' : ''}${normalizedShop.address.state} ${normalizedShop.address.zip}`.trim();
    
    return normalizedShop;
  }).filter(shop => shop !== null); // Remove any null entries
}

  

export const taxService = {
  uploadTaxDocument: async (documentFile, userToken) => {
    try {
      const formData = new FormData();
      formData.append('document', {
        uri: documentFile.uri,
        type: documentFile.mimeType,
        name: documentFile.name
      });

      const response = await fetch(`${API_URL}/api/tax/upload`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${userToken}`
        },
        body: formData
      });

      return await response.json();
    } catch (error) {
      console.error('Document upload error:', error);
      throw error;
    }
  },

  getTaxDocuments: async (userToken) => {
    try {
      const response = await fetch(`${API_URL}/api/tax/documents`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Accept': 'application/json'
        }
      });
      return await response.json();
    } catch (error) {
      console.error('Error fetching tax documents:', error);
      throw error;
    }
  },

  submitTaxForm: async (formData, userToken) => {
    try {
      const response = await fetch(`${API_URL}/api/tax/submit-form`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      return await response.json();
    } catch (error) {
      console.error('Tax form submission error:', error);
      throw error;
    }
  }
};

export const shopService = {
  getShopData: async (userToken) => {
    try {
      const response = await fetch(`${API_URL}/api/shop`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching shop data:', error);
      throw error;
    }
  },

  createShop: async (shopData, userToken) => {
    try {
      const response = await fetch(`${API_URL}/api/shop`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify(shopData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Shop creation error:', error);
      throw error;
    }
  },

  updateShop: async (updateData, userToken) => {
    try {
      const response = await fetch(`${API_URL}/api/shop/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Shop update error:', error);
      throw error;
    }
  },

  uploadImage: async (imageData, userToken) => {
    try {
      // Use the update endpoint instead of upload-image
      const response = await fetch(`${API_URL}/api/shop/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify({ images: imageData })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Image upload error:', error);
      throw error;
    }
  },

  deleteImage: async (imageIndex, userToken) => {
    try {
      const response = await fetch(`${API_URL}/api/shop/images/${imageIndex}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Image delete error:', error);
      throw error;
    }
  },

  addService: async (serviceData, userToken) => {
    try {
      const response = await fetch(`${API_URL}/api/shop/services`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify(serviceData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Service add error:', error);
      throw error;
    }
  },

  removeService: async (serviceId, userToken) => {
    try {
      const response = await fetch(`${API_URL}/api/shop/services/${serviceId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Service remove error:', error);
      throw error;
    }
  },

  getShopImages: async (userToken) => {
    try {
      const response = await fetch(`${API_URL}/api/shop/images`, {
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching shop images:', error);
      throw error;
    }
  },

  addReview: async (shopId, reviewData, userToken) => {
    try {
      const response = await fetch(`${API_URL}/api/shop/${shopId}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify(reviewData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Review add error:', error);
      throw error;
    }
  },

  getShopById: async (shopId) => {
    try {
      console.log(`Fetching shop details using ID: ${shopId}`);
      
      // First try to get the shop directly (in case shopId is actually a shop ID)
      try {
        console.log(`Attempting direct fetch with ID: ${shopId}`);
        const directResponse = await fetch(`${API_URL}/api/shop/${shopId}`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json'
          }
        });
        
        if (directResponse.ok) {
          const responseData = await directResponse.json();
          console.log('Direct fetch response:', responseData);
          if (responseData.success && responseData.shop) {
            console.log('Retrieved shop directly by ID:', responseData.shop);
            return responseData.shop;
          }
        } else {
          console.log(`Direct fetch failed with status: ${directResponse.status}`);
        }
      } catch (directError) {
        console.log('Could not get shop directly by ID:', directError);
      }
      
      // Try to get the shop by userId using our new endpoint
      try {
        console.log(`Attempting to fetch shop by userId: ${shopId}`);
        const userIdResponse = await fetch(`${API_URL}/api/shop/byUserId/${shopId}`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json'
          }
        });
        
        if (userIdResponse.ok) {
          const responseData = await userIdResponse.json();
          console.log('Shop by userId response:', responseData);
          if (responseData.success && responseData.shop) {
            console.log('Retrieved shop by userId:', responseData.shop);
            return responseData.shop;
          }
        } else {
          console.log(`Shop by userId fetch failed with status: ${userIdResponse.status}`);
        }
      } catch (userIdError) {
        console.log('Could not get shop by userId:', userIdError);
      }
      
      // If both approaches fail, try the search function as a last resort
      try {
        console.log('Trying search function as last resort');
        const shops = await authService.searchBarbershops({ userId: shopId });
        if (shops && shops.length > 0) {
          console.log('Found shop through search function:', shops[0]);
          return shops[0];
        }
      } catch (searchError) {
        console.log('Search function approach failed:', searchError);
      }
      
      // If all approaches fail, throw an error
      throw new Error(`Could not find shop with ID: ${shopId}`);
    } catch (error) {
      console.error('Error fetching shop details:', error);
      throw error;
    }
  }
};

export default {
  appointmentService,
  authService,
  taxService,
  shopService
};
