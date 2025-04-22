const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Using shopId as the field name to match your routes
  shopId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shop', // This should match the model name in shop.model.js
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  timeSlot: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled'],
    default: 'pending'
  },
  service: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

appointmentSchema.index({ date: 1, status: 1 });
appointmentSchema.index({ shopId: 1 });

module.exports = mongoose.model('Appointment', appointmentSchema);
