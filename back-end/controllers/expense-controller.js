const Expense = require("../models/expense-model");
const User = require("../models/user-model");

exports.getUserExpenses = async (req, res, next) => {
    try{
        // console.log(req.user);
        const expenses = await Expense.findAll({where: {userId: req.user.id}});  
        res.status(200).json(expenses);
    }
    catch(err){
        console.log(err);
        res.status(201).json(expenses);
    }
}

exports.addExpense = async (req, res, next) => {
    try{
        const {amount, description, type} = req.body;
        const currentUser = req.user;
        // console.log(typeof amount);
        // let expense = await Expense.create({amount, description, type});
        let expense = await currentUser.createExpense({amount, description, type});
        res.status(200).json(expense);
    }
    catch(err){
        console.log(err);
        res.status(201).send({success: false, error: 'Please Enter number for amount'});
    }
}

exports.deleteExpense = async (req, res, next) => {
    try{
        const id = req.params.id;
        let expense = await Expense.findByPk(id);
        // console.log(id, expense);
        await expense.destroy();
        res.status(200).send({success:true, message:'Expense Deleted'});
    }
    catch(err){
        console.log(err);
        res.status(201).json({success:false, error:'Expense Not Deleted'});
    }
}