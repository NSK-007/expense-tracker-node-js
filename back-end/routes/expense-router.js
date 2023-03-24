const express = require('express');
const ExpenseController = require('../controllers/expense-controller');
const authenticate = require('../middleware/auth');
const ExpenseRouter = express.Router();

ExpenseRouter.get('/get-expenses', authenticate, ExpenseController.getUserExpenses);

ExpenseRouter.get('/expenses/monthly-expenses/:month/:year', authenticate, ExpenseController.getMonthlyExpenses);

ExpenseRouter.get('/expenses/yearly-expenses/:year', authenticate, ExpenseController.getYearlyExpenses);

ExpenseRouter.get('/expenses/download/:type', authenticate, ExpenseController.downloadExpenses)

ExpenseRouter.post('/add-expense', authenticate, ExpenseController.addExpense);

ExpenseRouter.delete('/expense/delete-expense/:id', authenticate, ExpenseController.deleteExpense);

module.exports = ExpenseRouter;