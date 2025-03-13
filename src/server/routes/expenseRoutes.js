const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expenseController');
const auth = require('../middleware/auth');

router.post('/', auth, expenseController.createExpense);
router.get('/barbershop-expenses', auth, expenseController.getBarbershopExpenses);
router.put('/:id', auth, expenseController.updateExpense);
router.delete('/:id', auth, expenseController.deleteExpense);

module.exports = router;