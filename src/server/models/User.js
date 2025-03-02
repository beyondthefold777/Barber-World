const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['client', 'barbershop', 'mainBarbershop'],
    required: true,
  },
  businessName: {
    type: String,
    required: function() { return this.role === 'barbershop' || this.role === 'mainBarbershop'; }
  },
  subscriptionStatus: {
    type: String,
    enum: ['active', 'inactive', 'pending'],
    default: 'inactive'
  },
  subscriptionEndDate: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', userSchema);

const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

exports.register = async (req, res) => {
  try {
    const { email, password, role, businessName } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = new User({
      email,
      password: hashedPassword,
      role,
      businessName,
      subscriptionStatus: role === 'client' ? 'active' : 'inactive'
    });

    await user.save();

    // Generate JWT
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        businessName: user.businessName
      }
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        businessName: user.businessName,
        subscriptionStatus: user.subscriptionStatus
      }
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validateRegistration } = require('../middleware/validation');

router.post('/register', validateRegistration, authController.register);
router.post('/login', authController.login);

module.exports = router;

const validateRegistration = (req, res, next) => {
  const { email, password, role, businessName } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  if (!['client', 'barbershop', 'mainBarbershop'].includes(role)) {
    return res.status(400).json({ message: 'Invalid role specified' });
  }

  if ((role === 'barbershop' || role === 'mainBarbershop') && !businessName) {
    return res.status(400).json({ message: 'Business name is required for barbershops' });
  }

  next();
};

module.exports = { validateRegistration };
