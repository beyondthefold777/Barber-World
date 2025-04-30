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
  // Location fields
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
  
  // Email verification fields
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: {
    type: String
  },
  verificationTokenExpires: {
    type: Date
  },
  
  // Password reset fields
  resetPasswordToken: {
    type: String
  },
  resetPasswordExpires: {
    type: Date
  },
  
  // Profile fields
  bio: {
    type: String,
    default: ''
  },
  profileImage: {
    type: String,
    default: ''
  },
  
  // Account preferences/settings
  preferences: {
    notifications: {
      email: {
        marketing: { type: Boolean, default: true },
        appointments: { type: Boolean, default: true },
        reminders: { type: Boolean, default: true }
      },
      push: {
        marketing: { type: Boolean, default: true },
        appointments: { type: Boolean, default: true },
        reminders: { type: Boolean, default: true }
      }
    },
    privacy: {
      showProfile: { type: Boolean, default: true },
      showReviews: { type: Boolean, default: true }
    },
    theme: {
      darkMode: { type: Boolean, default: false },
      colorScheme: { type: String, default: 'default' }
    }
  },
  
  // Conversations reference
  conversations: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation'
  }],
  
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
