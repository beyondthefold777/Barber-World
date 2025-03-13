const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  barbershopId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  fileName: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed'],
    default: 'pending'
  },
  category: {
    type: String,
    required: true,
    enum: ['License', 'Insurance', 'Certification', 'Other']
  },
  uploadDate: {
    type: Date,
    default: Date.now
  }
});

// Add index for querying documents by uploadDate and status
documentSchema.index({ uploadDate: 1, status: 1 });

module.exports = mongoose.model('Document', documentSchema);