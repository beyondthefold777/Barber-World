const API_URL = 'https://barber-world-production.up.railway.app';

export const appointmentService = {
  // Book an appointment
  bookAppointment: async (appointmentData) => {
    try {
      const response = await fetch(`${API_URL}/api/appointments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(appointmentData),
      });
      return await response.json();
    } catch (error) {
      console.error('Booking error:', error);
      throw error;
    }
  },

  // Get available time slots
  getTimeSlots: async (date) => {
    try {
      const response = await fetch(`${API_URL}/api/appointments/available?date=${date}`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching time slots:', error);
      throw error;
    }
  }
};
