const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Client Controllers
exports.registerClient = async (req, res) => {
  try {
    const { email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 12);
    
    const client = new User({
      email,
      password: hashedPassword,
      role: 'client'
    });

    await client.save();
    
    const token = jwt.sign(
      { userId: client._id, role: 'client' },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({ token, userId: client._id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.loginClient = async (req, res) => {
  try {
    const { email, password } = req.body;
    const client = await User.findOne({ email, role: 'client' });
    
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    const isValidPassword = await bcrypt.compare(password, client.password);
    
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: client._id, role: 'client' },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ token, userId: client._id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Barbershop Controllers
exports.registerBarbershop = async (req, res) => {
  try {
    const { email, password, businessName } = req.body;
    const hashedPassword = await bcrypt.hash(password, 12);
    
    const barbershop = new User({
      email,
      password: hashedPassword,
      role: 'barbershop',
      businessName,
      subscriptionStatus: 'pending'
    });

    await barbershop.save();
    
    const token = jwt.sign(
      { userId: barbershop._id, role: 'barbershop' },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({ token, userId: barbershop._id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.loginBarbershop = async (req, res) => {
  try {
    const { email, password } = req.body;
    const barbershop = await User.findOne({ email, role: 'barbershop' });
    
    if (!barbershop) {
      return res.status(404).json({ message: 'Barbershop not found' });
    }

    const isValidPassword = await bcrypt.compare(password, barbershop.password);
    
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: barbershop._id, role: 'barbershop' },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ token, userId: barbershop._id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Main Barbershop Controllers
exports.registerMainBarbershop = async (req, res) => {
  try {
    const { email, password, businessName, adminCode } = req.body;
    
    // Verify admin code
    if (adminCode !== process.env.MAIN_BARBERSHOP_ADMIN_CODE) {
      return res.status(401).json({ message: 'Invalid admin code' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    
    const mainBarbershop = new User({
      email,
      password: hashedPassword,
      role: 'mainBarbershop',
      businessName,
      subscriptionStatus: 'active'
    });

    await mainBarbershop.save();
    
    const token = jwt.sign(
      { userId: mainBarbershop._id, role: 'mainBarbershop' },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({ token, userId: mainBarbershop._id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.loginMainBarbershop = async (req, res) => {
  try {
    const { email, password } = req.body;
    const mainBarbershop = await User.findOne({ email, role: 'mainBarbershop' });
    
    if (!mainBarbershop) {
      return res.status(404).json({ message: 'Main barbershop not found' });
    }

    const isValidPassword = await bcrypt.compare(password, mainBarbershop.password);
    
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: mainBarbershop._id, role: 'mainBarbershop' },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ token, userId: mainBarbershop._id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};