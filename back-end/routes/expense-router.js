const express = require('express');
const ExpenseController = require('../controllers/expense-controller');
const authenticate = require('../middleware/auth');
const ExpenseRouter = express.Router();

ExpenseRouter.get('/get-expenses', authenticate, ExpenseController.getUserExpenses);

ExpenseRouter.post('/add-expense', authenticate, ExpenseController.addExpense);

ExpenseRouter.delete('/expense/delete-expense/:id', authenticate, ExpenseController.deleteExpense);

module.exports = ExpenseRouter;