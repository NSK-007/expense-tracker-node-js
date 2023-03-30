const express = require('express');
const ExpenseController = require('../controllers/expense-controller');
const authenticate = require('../middleware/auth');
const monthly_expenses = require('../middleware/monthly-expenses');
const yearly_expenses = require('../middleware/yearly-expenses');
const ExpenseRouter = express.Router();

ExpenseRouter.get('/get-expenses', authenticate, ExpenseController.getUserExpenses);

ExpenseRouter.get('/expenses/monthly-expenses/:month/:year', authenticate, monthly_expenses, ExpenseController.getMonthlyExpenses);

ExpenseRouter.get('/expenses/yearly-expenses/:year', authenticate, yearly_expenses, ExpenseController.getYearlyExpenses);

ExpenseRouter.get('/expenses/downloadMonthly/:month/:year', authenticate, monthly_expenses, ExpenseController.downloadExpenses);

ExpenseRouter.get('/expenses/getDownloads', authenticate, ExpenseController.getDownloads);

ExpenseRouter.get('/expenses/downloadYearly/:year', authenticate, yearly_expenses, ExpenseController.downloadExpenses);

ExpenseRouter.post('/add-expense', authenticate, ExpenseController.addExpense);

ExpenseRouter.post('/expenses/add-download', authenticate, ExpenseController.addDownload);

ExpenseRouter.delete('/expense/delete-expense/:id', authenticate, ExpenseController.deleteExpense);

module.exports = ExpenseRouter;