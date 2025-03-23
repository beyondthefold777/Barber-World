import config from '../config/environment';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = config.apiUrl;

export const appointmentService = {
  getBarbershopAppointments: async (userToken) => {
    try {
      const response = await fetch(`${API_URL}/api/appointments`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Accept': 'application/json'
        }
      });
      return await response.json();
    } catch (error) {
      console.error('Error fetching appointments:', error);
      throw error;
    }
  },

  bookAppointment: async (appointmentData, userToken) => {
    try {
      console.log('Making appointment request with data:', appointmentData);
      
      const response = await fetch(`${API_URL}/api/appointments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${userToken}`
        },
        body: JSON.stringify({
          shopId: appointmentData.shopId, // Include the shop ID
          date: appointmentData.date,
          timeSlot: appointmentData.timeSlot,
          service: appointmentData.service,
          status: 'confirmed'
        })
      });

      if (!response.ok) {
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
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Store the fetched appointments in AsyncStorage for future use
        if (data && (data.appointments || Array.isArray(data))) {
          const appointmentsToStore = data.appointments || data;
          await AsyncStorage.setItem('userAppointments', JSON.stringify(appointmentsToStore));
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
              return [data.shop];
            }
          } else {
            console.log(`Shop by userId request failed with status: ${response.status}`);
          }
        } catch (error) {
          console.log('Error fetching shop by userId:', error);
        }
      }
      
      // For location-based searches, use the searchShopsByLocation endpoint
      if (searchParams.city || searchParams.state) {
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
              return data.shops;
            } else {
              console.log('No shops found in location search');
              return [];
            }
          } else {
            console.log(`Location search failed with status: ${response.status}`);
            // Fall back to the all shops endpoint if the location search fails
            return await fallbackToAllShops(searchParams);
          }
        } catch (error) {
          console.log('Error searching shops by location:', error);
          // Try fallback if the location search throws an error
          return await fallbackToAllShops(searchParams);
        }
      }
      
      // If we have a service parameter, use the service search endpoint
      if (searchParams.service) {
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
              return data.shops;
            } else {
              console.log('No shops found offering this service');
              return [];
            }
          } else {
            console.log(`Service search failed with status: ${response.status}`);
            return [];
          }
        } catch (error) {
          console.log('Error searching shops by service:', error);
          return [];
        }
      }
      
      // Fall back to the original search endpoint if no specific parameters matched
      return await fallbackToOriginalSearch(searchParams);
    } catch (error) {
      console.error('Search error:', error);
      return [];
    }
  }
};

// Helper function for fallback to all shops endpoint
async function fallbackToAllShops(searchParams) {
  try {
    let queryString = '?';
    if (searchParams.city) queryString += `location=${encodeURIComponent(searchParams.city.trim())}&`;
    if (searchParams.state) queryString += `state=${encodeURIComponent(searchParams.state.trim())}&`;
    
    console.log(`Falling back to all shops endpoint with params: ${queryString}`);
    const response = await fetch(`${API_URL}/api/shop/all${queryString}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('All shops fallback response:', data);
      if (data.success && data.shops) {
        return data.shops;
      }
    }
    return [];
  } catch (error) {
    console.log('Error with all shops fallback:', error);
    return [];
  }
}

// Helper function for fallback to original search endpoint
async function fallbackToOriginalSearch(searchParams) {
  try {
    console.log('Falling back to original search endpoint with params:', searchParams);
    const response = await fetch(`${API_URL}/api/shop/searchBarbershops`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(searchParams)
    });

    if (!response.ok) {
      console.log(`Original search failed with status: ${response.status}`);
      return [];
    }

    const data = await response.json();
    console.log('Original search response data:', data);
    return data.shops || (Array.isArray(data) ? data : []);
  } catch (error) {
    console.log('Error with original search endpoint:', error);
    return [];
  }
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
