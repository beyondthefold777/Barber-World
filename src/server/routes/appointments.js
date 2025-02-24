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
    
    // Return available slots logic here
    res.json({ availableSlots: [] });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new appointment
router.post('/', async (req, res) => {
  const appointment = new Appointment({
    clientId: req.body.clientId,
    date: req.body.date,
    timeSlot: req.body.timeSlot,
    service: req.body.service
  });

  try {
    const newAppointment = await appointment.save();
    res.status(201).json(newAppointment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
