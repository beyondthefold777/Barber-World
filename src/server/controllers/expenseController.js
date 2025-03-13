const Expense = require('../models/Expense');

exports.createExpense = async (req, res) => {
  try {
    console.log('User from token:', req.user);
    
    const newExpense = new Expense({
      barbershopId: req.user.userId,
      description: req.body.description,
      amount: req.body.amount,
      category: req.body.category,
      date: req.body.date,
      notes: req.body.notes
    });

    console.log('Attempting to save expense:', newExpense);
    const savedExpense = await newExpense.save();
    console.log('Saved expense:', savedExpense);

    res.json({
      success: true,
      expense: savedExpense,
      message: 'Expense recorded successfully'
    });
  } catch (error) {
    console.log('Error saving expense:', error);
    res.status(500).json({ success: false, message: 'Failed to record expense' });
  }
};

exports.getBarbershopExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find({ barbershopId: req.user.userId });
    res.json({ success: true, expenses });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch expenses' });
  }
};

exports.updateExpense = async (req, res) => {
  try {
    const expense = await Expense.findOneAndUpdate(
      { _id: req.params.id, barbershopId: req.user.userId },
      req.body,
      { new: true }
    );
    
    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense not found' });
    }

    res.json({ success: true, expense });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update expense' });
  }
};

exports.deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findOneAndDelete({
      _id: req.params.id,
      barbershopId: req.user.userId
    });

    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense not found' });
    }

    res.json({ success: true, message: 'Expense deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete expense' });
  }
};