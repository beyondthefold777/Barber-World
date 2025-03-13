const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  barbershopId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  description: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Equipment', 'Supplies', 'Utilities', 'Rent', 'Marketing', 'Insurance', 'Other']
  },
  date: {
    type: Date,
    required: true
  },
  notes: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Add index for querying expenses by date and category
expenseSchema.index({ date: 1, category: 1 });

module.exports = mongoose.model('Expense', expenseSchema);