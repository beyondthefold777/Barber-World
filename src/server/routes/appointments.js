const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const Shop = require('../models/shop.model');

// Get available time slots
router.get('/available-slots/:shopId/:date', async (req, res) => {
  try {
    const bookedSlots = await Appointment.find({
      shopId: req.params.shopId,
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
    console.log('Error fetching slots:', error);
    res.status(500).json({ message: error.message });
  }
});

// Create new appointment
router.post('/', async (req, res) => {
  console.log('Received appointment request:', req.body);
  
  if (!req.body.shopId) {
    return res.status(400).json({ message: 'Shop ID is required' });
  }
  
  const appointment = new Appointment({
    clientId: req.body.clientId || '64f5e3c2e4b1234567890123',
    shopId: req.body.shopId,
    date: new Date(req.body.date),
    timeSlot: req.body.timeSlot,
    service: req.body.service || 'Regular Haircut',
    status: 'confirmed'
  });
  
  console.log('Created appointment object:', appointment);
  
  try {
    const newAppointment = await appointment.save();
    console.log('Successfully saved appointment:', newAppointment);
    res.status(201).json(newAppointment);
  } catch (error) {
    console.log('Error saving appointment:', error);
    res.status(400).json({ message: error.message });
  }
});

// Get all appointments (for testing)
router.get('/', async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate('shopId', 'name')
      .populate('clientId', 'name email');
    
    console.log('All appointments:', appointments);
    res.json(appointments);
  } catch (error) {
    console.log('Error fetching appointments:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get appointments by shop ID
router.get('/shop/:shopId', async (req, res) => {
  try {
    const appointments = await Appointment.find({ shopId: req.params.shopId })
      .populate('clientId', 'name email')
      .sort({ date: 1, timeSlot: 1 });
    
    res.json(appointments);
  } catch (error) {
    console.log('Error fetching shop appointments:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get appointments by client ID
router.get('/client/:clientId', async (req, res) => {
  try {
    const appointments = await Appointment.find({ clientId: req.params.clientId })
      .populate('shopId', 'name')
      .sort({ date: -1 });
    
    res.json(appointments);
  } catch (error) {
    console.log('Error fetching client appointments:', error);
    res.status(500).json({ message: error.message });
  }
});

// Simple user appointments route
router.get('/user', async (req, res) => {
  try {
    const userId = req.query.userId || '64f5e3c2e4b1234567890123';
    const appointments = await Appointment.find({ clientId: userId })
      .populate('shopId', 'name')
      .sort({ date: -1 });
    
    res.json(appointments);
  } catch (error) {
    console.log('Error fetching user appointments:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get shop details for appointment booking
router.get('/shop-details/:shopId', async (req, res) => {
  try {
    const shop = await Shop.findById(req.params.shopId).select('name location');
    if (!shop) {
      return res.status(404).json({ message: 'Shop not found' });
    }
    res.json({ shop });
  } catch (error) {
    console.log('Error fetching shop details:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
