const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');

// Get available time slots
router.get('/available-slots/:date', async (req, res) => {
  try {
    const bookedSlots = await Appointment.find({
      date: new Date(req.params.date),
      status: 'confirmed'
    }).select('timeSlot');
    
    const allTimeSlots = [
      '9:00 AM', '10:00 AM', '11:00 AM',
      '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM'
    ];
    
    const availableSlots = allTimeSlots.filter(slot => 
      !bookedSlots.some(booked => booked.timeSlot === slot)
    );

    res.json({ availableSlots });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new appointment
router.post('/', async (req, res) => {
  const appointment = new Appointment({
    clientId: req.body.clientId || '64f5e3c2e4b1234567890123', // Temporary default ID
    date: new Date(req.body.date),
    timeSlot: req.body.time,
    service: req.body.service || 'Regular Haircut', // Default service
    status: 'confirmed' // Auto-confirm for now
  });

  try {
    const newAppointment = await appointment.save();
    res.status(201).json(newAppointment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
