const API_URL = 'https://barber-world-production.up.railway.app';

export const appointmentService = {
  bookAppointment: async (appointmentData) => {
    try {
      console.log('Making request to:', `${API_URL}/api/appointments/test`);
      
      const response = await fetch(`${API_URL}/api/appointments/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          date: appointmentData.date,
          timeSlot: appointmentData.time,
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