const express = require('express');
const UserController = require('../controllers/user-controller')
const ExpenseController = require('../controllers/expense-controller');
const authenticate = require('../middleware/auth');
const router = express.Router();

router.post('/signup', UserController.signUpUser);

router.post('/loginUser', UserController.loginUser);

router.get('/get-expenses', authenticate, ExpenseController.getUserExpenses);

router.post('/add-expense', authenticate, ExpenseController.addExpense);

router.delete('/expense/delete-expense/:id', authenticate, ExpenseController.deleteExpense);

module.exports = router;