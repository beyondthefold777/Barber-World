import config from '../config/environment';

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
      console.log('Making request to:', `${API_URL}/api/appointments`);
      
      const response = await fetch(`${API_URL}/api/appointments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${userToken}`
        },
        body: JSON.stringify({
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
      return data;
    } catch (error) {
      console.log('Network error:', error);
      throw error;
    }
  },

  getTimeSlots: async (date) => {
    try {
      const response = await fetch(`${API_URL}/api/appointments/available-slots/${date}`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching time slots:', error);
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
      
      const response = await fetch(`${API_URL}/api/auth/barbershops/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(searchParams)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Search response data:', data);
      return data;
    } catch (error) {
      console.error('Search error:', error);
      throw error;
    }
  }
};
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

 // Update this method in the shopService object
getShopById: async (shopId) => {
  try {
    console.log(`Fetching shop details using ID: ${shopId}`);
    
    // Use the search endpoint with the ID as userId
    const response = await fetch(`${API_URL}/api/auth/barbershops/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ userId: shopId })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const shops = await response.json();
    
    if (!shops || shops.length === 0) {
      throw new Error('Shop not found');
    }
    
    // Return the first shop associated with this userId
    console.log('Found shop:', shops[0]);
    return shops[0];
  } catch (error) {
    console.error('Error fetching shop details:', error);
    throw error;
  }
}
};