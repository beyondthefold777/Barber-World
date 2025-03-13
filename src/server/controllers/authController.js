const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Unified login handler
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Login attempt for:', email);

    const user = await User.findOne({ email });
    
    if (!user || !(await bcrypt.compare(password, user.password))) {
      console.log('Invalid login attempt for:', email);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    console.log('Login successful for:', email);

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        businessName: user.businessName,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
};

// Client registration
exports.registerClient = async (req, res) => {
  try {
    const { email, password, username, phoneNumber } = req.body;
    console.log('Starting client registration process for:', email);
    
    const hashedPassword = await bcrypt.hash(password, 12);
    console.log('Password hashed successfully');

    const user = new User({
      email,
      password: hashedPassword,
      username,
      phoneNumber,
      role: 'client'
    });

    await user.save();
    console.log('Client user saved successfully');

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    console.log('JWT token generated for client');

    res.status(201).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Detailed client registration error:', error);
    res.status(500).json({ message: 'Registration failed', error: error.message });
  }
};

// Barbershop registration
exports.registerBarbershop = async (req, res) => {
  try {
    const { email, password, businessName, address, city, state, zipCode } = req.body;
    console.log('Starting barbershop registration for:', email);

    const hashedPassword = await bcrypt.hash(password, 12);
    console.log('Password hashed successfully');
    
    const user = new User({
      email,
      password: hashedPassword,
      businessName,
      role: 'barbershop',
      address,
      city,
      state,
      zipCode
    });

    await user.save();
    console.log('Barbershop user saved successfully');

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    console.log('JWT token generated for barbershop');

    res.status(201).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        businessName: user.businessName,
        role: user.role,
        address,
        city,
        state,
        zipCode
      }
    });
  } catch (error) {
    console.error('Detailed barbershop registration error:', error);
    res.status(500).json({ message: 'Registration failed', error: error.message });
  }
};

// Main Barbershop registration
exports.registerMainBarbershop = async (req, res) => {
  try {
    const { email, password, businessName, adminCode, address, city, state, zipCode } = req.body;
    console.log('Starting main barbershop registration for:', email);
    
    if (adminCode !== process.env.ADMIN_CODE) {
      console.log('Invalid admin code attempted');
      return res.status(403).json({ message: 'Invalid admin code' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    console.log('Password hashed successfully');
    
    const user = new User({
      email,
      password: hashedPassword,
      businessName,
      role: 'mainBarbershop',
      address,
      city,
      state,
      zipCode
    });

    await user.save();
    console.log('Main barbershop user saved successfully');

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    console.log('JWT token generated for main barbershop');

    res.status(201).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        businessName: user.businessName,
        role: user.role,
        address,
        city,
        state,
        zipCode
      }
    });
  } catch (error) {
    console.error('Detailed main barbershop registration error:', error);
    res.status(500).json({ message: 'Registration failed', error: error.message });
  }
};

// Barbershop Search
exports.searchBarbershops = async (req, res) => {
  try {
    const { city, state, zipCode } = req.body;
    let query = { role: 'barbershop' };

    if (zipCode) {
      query.zipCode = zipCode;
    } else if (city && state) {
      query.city = new RegExp(city, 'i');
      query.state = new RegExp(state, 'i');
    }

    const barbershops = await User.find(query)
      .select('businessName address city state zipCode')
      .lean();

    res.json(barbershops);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ message: 'Search failed', error: error.message });
  }
};

// Password reset handlers
exports.forgotPassword = async (req, res) => {
  console.log('Password reset requested');
  res.status(501).json({ message: 'Password reset functionality coming soon' });
};

exports.resetPassword = async (req, res) => {
  console.log('Password reset attempt');
  res.status(501).json({ message: 'Password reset functionality coming soon' });
};

// Email verification handlers
exports.verifyEmail = async (req, res) => {
  console.log('Email verification requested');
  res.status(501).json({ message: 'Email verification functionality coming soon' });
};

exports.resendVerification = async (req, res) => {
  console.log('Verification resend requested');
  res.status(501).json({ message: 'Verification resend functionality coming soon' });
};