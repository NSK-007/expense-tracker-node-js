const express = require('express');
const UserController = require('../controllers/user-controller')
const ExpenseController = require('../controllers/expense-controller');
const router = express.Router();

router.get('/', ExpenseController.getAllExpenses);

router.post('/signup', UserController.signUpUser);

router.post('/loginUser', UserController.loginUser);

router.post('/add-expense', ExpenseController.addExpense);

router.delete('/expense/delete-expense/:id', ExpenseController.deleteExpense);

module.exports = router;