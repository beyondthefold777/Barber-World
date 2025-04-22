import config from '../config/environment';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = config.apiUrl;

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
      // First, get the user info to determine role and ID
      console.log('3. Fetching user info to determine role and ID...');
      let userInfo;
      
      try {
        const userResponse = await fetch(`${API_URL}/api/auth/me`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${userToken}`,
            'Accept': 'application/json'
          }
        });
        
        if (!userResponse.ok) {
          console.log(`4. Failed to get user info: ${userResponse.status}`);
          throw new Error('Failed to get user information');
        }
        
        userInfo = await userResponse.json();
        console.log('4. User info retrieved successfully');
        console.log(`   User role: ${userInfo.role}`);
        console.log(`   User ID: ${userInfo._id}`);
      } catch (userError) {
        console.log('4. ERROR getting user info:', userError.message);
        console.log('   Proceeding with generic appointments endpoint');
        userInfo = null;
      }
      
      // Determine the appropriate endpoint based on user role
      let endpoint = `${API_URL}/api/appointments`;
      
      if (userInfo) {
        if (userInfo.role === 'barbershop' || userInfo.role === 'mainBarbershop') {
          // For barbershop users, get appointments for their shop
          console.log('5. User is a barbershop, fetching shop-specific appointments');
          endpoint = `${API_URL}/api/appointments/shop/${userInfo._id}`;
        } else if (userInfo.role === 'client') {
          // For client users, get their own appointments
          console.log('5. User is a client, fetching user-specific appointments');
          endpoint = `${API_URL}/api/appointments/user/${userInfo._id}`;
        } else {
          console.log(`5. Unknown user role: ${userInfo.role}, using default endpoint`);
        }
      } else {
        console.log('5. No user info available, using default endpoint');
      }
      
      console.log(`6. Using endpoint: ${endpoint}`);
      
      console.log('7. Initiating fetch request...');
      const fetchStartTime = Date.now();
      
      let response;
      try {
        response = await fetch(endpoint, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${userToken}`,
            'Accept': 'application/json'
          }
        });
        
        const fetchEndTime = Date.now();
        console.log(`8. Fetch completed in ${fetchEndTime - fetchStartTime}ms`);
        console.log(`9. Response status: ${response.status} ${response.statusText}`);
        
      } catch (fetchError) {
        console.log('8. FETCH ERROR:', fetchError.message);
        console.log('   Error details:', fetchError);
        console.log('========== APPOINTMENT SERVICE: ENDING WITH FETCH ERROR ==========\n');
        throw new Error(`Network error: ${fetchError.message}`);
      }
      
      // Check if response is ok
      if (!response.ok) {
        console.log('10. ERROR: Response not OK');
        
        let errorText = '';
        try {
          errorText = await response.text();
          console.log('11. Error response body:', errorText);
        } catch (textError) {
          console.log('11. Could not read error response body:', textError.message);
        }
        
        console.log('========== APPOINTMENT SERVICE: ENDING WITH HTTP ERROR ==========\n');
        throw new Error(`Failed to fetch appointments: ${response.status} ${errorText}`);
      }
      
      console.log('10. Response OK, attempting to parse JSON...');
      
      let data;
      try {
        data = await response.json();
        console.log('11. JSON parsing successful');
      } catch (jsonError) {
        console.log('11. JSON PARSE ERROR:', jsonError.message);
        console.log('    Error details:', jsonError);
        
        // Try to get the raw text to see what's wrong
        try {
          const rawText = await response.text();
          console.log('    Raw response text (first 500 chars):', rawText.substring(0, 500));
        } catch (textError) {
          console.log('    Could not get raw text:', textError.message);
        }
        
        console.log('========== APPOINTMENT SERVICE: ENDING WITH JSON PARSE ERROR ==========\n');
        throw new Error(`Invalid JSON response: ${jsonError.message}`);
      }
      
      console.log('12. Examining parsed data:');
      console.log(`    Data type: ${typeof data}`);
      console.log(`    Is array: ${Array.isArray(data)}`);
      
      // Handle different response formats
      let appointments = data;
      
      // If data is an object with an appointments property, use that
      if (!Array.isArray(data) && data && typeof data === 'object' && Array.isArray(data.appointments)) {
        console.log('13. Data contains appointments property, using that');
        appointments = data.appointments;
      }
      
      // Ensure appointments is an array
      if (!Array.isArray(appointments)) {
        console.log('13. Data is not in expected format, converting to empty array');
        appointments = [];
      }
      
      console.log(`14. Final appointments count: ${appointments.length}`);
      
      if (appointments.length > 0) {
        console.log('15. First appointment details:');
        const firstItem = appointments[0];
        
        console.log(`    ID: ${firstItem._id || 'undefined'}`);
        console.log(`    Date: ${firstItem.date || 'undefined'}`);
        console.log(`    Service: ${firstItem.service || 'undefined'}`);
        
        // Check if we need to populate shop information
        if (firstItem.shopId && typeof firstItem.shopId !== 'object') {
          console.log('16. Shop information needs to be populated');
          console.log(`    ShopId: ${firstItem.shopId}`);
          
          // Try to populate shop information for each appointment
          try {
            console.log('17. Attempting to populate shop information for appointments...');
            const populatedAppointments = await Promise.all(
              appointments.map(async (appointment) => {
                if (appointment.shopId && typeof appointment.shopId !== 'object') {
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
                      if (shopData && shopData.shop) {
                        return {
                          ...appointment,
                          shopData: shopData.shop
                        };
                      }
                    }
                  } catch (shopError) {
                    console.log(`    Error fetching shop data for appointment ${appointment._id}:`, shopError.message);
                  }
                }
                return appointment;
              })
            );
            
            appointments = populatedAppointments;
            console.log('18. Shop information population completed');
          } catch (populationError) {
            console.log('17. ERROR during shop information population:', populationError.message);
            // Continue with unpopulated appointments
          }
        } else {
          console.log('16. Shop information already populated or not available');
        }
      } else {
        console.log('15. No appointments found');
      }
      
      console.log('19. Returning appointments to caller');
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
  
  bookAppointment: async (appointmentData, userToken) => {
    try {
      console.log('Making appointment request with data:', appointmentData);
      
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
      }
      
      // Include clientId if it exists in the appointment data
      if (appointmentData.clientId) {
        requestBody.clientId = appointmentData.clientId;
        console.log('Including clientId in request:', appointmentData.clientId);
      }
      
      // If we don't have clientId in the appointment data, try to get it from user info
      if (!appointmentData.clientId && userToken) {
        try {
          // Make a lightweight request to get user info
          const userResponse = await fetch(`${API_URL}/api/auth/me`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${userToken}`,
              'Accept': 'application/json'
            }
          });
          
          if (userResponse.ok) {
            const userInfo = await userResponse.json();
            if (userInfo && userInfo._id) {
              requestBody.clientId = userInfo._id;
              console.log('Retrieved and including clientId in request:', userInfo._id);
            }
          }
        } catch (userError) {
          // If we can't get the user ID, just continue without it
          console.log('Could not retrieve user ID, continuing without it:', userError.message);
        }
      }
      
      console.log('Final request body:', requestBody);
      
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
      
      // Store the appointment in AsyncStorage
      try {
        // Get existing appointments
        const storedAppointments = await AsyncStorage.getItem('userAppointments');
        let appointments = storedAppointments ? JSON.parse(storedAppointments) : [];
        
        // Add shop name and other details to the appointment data
        const enhancedAppointment = {
          ...data,
          shopName: appointmentData.shopName || 'Barbershop',
        };
        
        // Ensure shopId is stored in the appointment
        if (appointmentData.shopId) {
          enhancedAppointment.shopId = appointmentData.shopId;
        } else if (data.shopId) {
          enhancedAppointment.shopId = data.shopId;
        }
        
        // Ensure clientId is stored in the appointment
        if (requestBody.clientId) {
          enhancedAppointment.clientId = requestBody.clientId;
        } else if (data.clientId) {
          enhancedAppointment.clientId = data.clientId;
        }
        
        console.log('Enhanced appointment with IDs:', {
          shopId: enhancedAppointment.shopId,
          clientId: enhancedAppointment.clientId
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
  
  getTimeSlots: async (date, shopId) => {
    try {
      // Include shopId in the request to get shop-specific time slots
      const url = shopId 
        ? `${API_URL}/api/appointments/available-slots/${date}?shopId=${shopId}`
        : `${API_URL}/api/appointments/available-slots/${date}`;
      
      console.log('Fetching time slots from:', url);
      
      const response = await fetch(url);
      return await response.json();
    } catch (error) {
      console.error('Error fetching time slots:', error);
      throw error;
    }
  },
  
  getUserAppointments: async (userToken) => {
    try {
      // Try to get appointments from AsyncStorage
      const storedAppointments = await AsyncStorage.getItem('userAppointments');
      if (storedAppointments) {
        const appointments = JSON.parse(storedAppointments);
        console.log('Retrieved appointments from AsyncStorage:', appointments.length);
        return appointments;
      }
      
      // If nothing in AsyncStorage, try the server
      try {
        const response = await fetch(`${API_URL}/api/appointments/user`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${userToken}`,
            'Accept': 'application/json'
          }
        });
        
        if (!response.ok) {
          console.log(`Error fetching appointments: ${response.status}`);
          return []; // Return empty array instead of throwing
        }
        
        const data = await response.json();
        
        // Store the fetched appointments in AsyncStorage for future use
        if (data && (data.appointments || Array.isArray(data))) {
          const appointmentsToStore = data.appointments || data;
          
          // Ensure each appointment has shopId and clientId if available
          const enhancedAppointments = appointmentsToStore.map(appointment => {
            const enhanced = { ...appointment };
            
            // Make sure shopId is preserved
            if (appointment.shopId) {
              enhanced.shopId = appointment.shopId;
            }
            
                     // Make sure clientId is preserved
                     if (appointment.clientId) {
                      enhanced.clientId = appointment.clientId;
                    }
                    
                    // Add shop name if available
                    if (appointment.shop && appointment.shop.name) {
                      enhanced.shopName = appointment.shop.name;
                    } else if (appointment.shopData && appointment.shopData.name) {
                      enhanced.shopName = appointment.shopData.name;
                    }
                    
                    return enhanced;
                  });
                  
                  await AsyncStorage.setItem('userAppointments', JSON.stringify(enhancedAppointments));
                  console.log('Stored enhanced appointments in AsyncStorage:', enhancedAppointments.length);
                  
                  return enhancedAppointments;
                }
                
                return data;
              } catch (serverError) {
                console.error('Error fetching user appointments from server:', serverError);
                // Return empty array if both AsyncStorage and server fail
                return [];
              }
            } catch (error) {
              console.error('Error in getUserAppointments:', error);
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
    normalizedShop.images = shop.images || [];
    
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
