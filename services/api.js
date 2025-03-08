import config from '../config/environment';

const API_URL = config.apiUrl;

export const appointmentService = {
  bookAppointment: async (appointmentData) => {
    try {
      console.log('Making request to:', `${API_URL}/api/appointments`);
      
      const response = await fetch(`${API_URL}/api/appointments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
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

  loginMainBarbershop: async (credentials) => {
    try {
      const requestBody = {
        email: credentials.email,
        password: credentials.password
      };
      console.log('Sending main barbershop login request with:', requestBody);
      
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      console.log('Main barbershop login response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.log('Error response data:', errorData);
        throw new Error(errorData.message || 'Login failed');
      }

      const data = await response.json();
      console.log('Main barbershop login response data:', data);
      return data;
    } catch (error) {
      console.error('Main barbershop login error:', error);
      throw error;
    }
  },

  register: async (userData) => {
    try {
      console.log('Sending registration request with:', userData);
      
      const response = await fetch(`${API_URL}/api/auth/${userData.role}/register`, {
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
  }
};