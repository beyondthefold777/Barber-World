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
  username: {
    type: String,
    default: null
  },
  phoneNumber: {
    type: String,
    default: null
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
  // New location fields
  address: {
    type: String,
    required: function() { return this.role === 'barbershop' || this.role === 'mainBarbershop'; }
  },
  city: {
    type: String,
    required: function() { return this.role === 'barbershop' || this.role === 'mainBarbershop'; }
  },
  state: {
    type: String,
    required: function() { return this.role === 'barbershop' || this.role === 'mainBarbershop'; }
  },
  zipCode: {
    type: String,
    required: function() { return this.role === 'barbershop' || this.role === 'mainBarbershop'; }
  },
  coordinates: {
    latitude: Number,
    longitude: Number
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

// Add validation for client-specific fields
userSchema.pre('save', function(next) {
  if (this.role === 'client') {
    if (!this.username || !this.phoneNumber) {
      throw new Error('Username and phone number are required for clients');
    }
  }
  next();
});

module.exports = mongoose.model('User', userSchema);