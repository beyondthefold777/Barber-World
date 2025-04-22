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
  
  try {
    const newAppointment = await appointment.save();
    console.log('Successfully saved appointment');
    res.status(201).json(newAppointment);
  } catch (error) {
    console.log('Error saving appointment:', error);
    res.status(400).json({ message: error.message });
  }
});

// Get all appointments (for testing)
router.get('/', async (req, res) => {
  try {
    const appointments = await Appointment.find();
    console.log(`Retrieved ${appointments.length} appointments`);
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
      .sort({ date: 1, timeSlot: 1 });
    
    console.log(`Found ${appointments.length} appointments for shop ${req.params.shopId}`);
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
      .sort({ date: -1 });
    
    console.log(`Found ${appointments.length} appointments for client ${req.params.clientId}`);
    res.json(appointments);
  } catch (error) {
    console.log('Error fetching client appointments:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get appointments for the logged-in user
router.get('/user', async (req, res) => {
  try {
    // Get userId from token or query parameter
    const userId = req.user ? req.user.id : req.query.userId || '64f5e3c2e4b1234567890123';
    
    console.log(`Fetching appointments for user: ${userId}`);
    
    // Find appointments for this user
    const appointments = await Appointment.find({ clientId: userId })
      .sort({ date: -1 });
    
    console.log(`Found ${appointments.length} appointments for user ${userId}`);
    
    // Try to populate shop information manually
    const populatedAppointments = [];
    
    for (const appointment of appointments) {
      try {
        const shopData = await Shop.findById(appointment.shopId).lean();
        
        populatedAppointments.push({
          ...appointment.toObject(),
          shopData: shopData || { name: 'Unknown Shop' }
        });
      } catch (err) {
        console.log(`Error populating shop for appointment ${appointment._id}:`, err);
        populatedAppointments.push({
          ...appointment.toObject(),
          shopData: { name: 'Unknown Shop' }
        });
      }
    }
    
    res.json(populatedAppointments);
  } catch (error) {
    console.error('Error fetching user appointments:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get shop details for appointment booking
router.get('/shop-details/:shopId', async (req, res) => {
  try {
    const shop = await Shop.findById(req.params.shopId);
    if (!shop) {
      return res.status(404).json({ message: 'Shop not found' });
    }
    console.log(`Retrieved shop details for ${req.params.shopId}`);
    res.json({ shop });
  } catch (error) {
    console.log('Error fetching shop details:', error);
    res.status(500).json({ message: error.message });
  }
});

// Update appointment status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }
    
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    
    console.log(`Updated appointment ${req.params.id} status to ${status}`);
    res.json(appointment);
  } catch (error) {
    console.log('Error updating appointment status:', error);
    res.status(500).json({ message: error.message });
  }
});

// Delete appointment
router.delete('/:id', async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndDelete(req.params.id);
    
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    
    console.log(`Deleted appointment ${req.params.id}`);
    res.json({ message: 'Appointment deleted' });
  } catch (error) {
    console.log('Error deleting appointment:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
