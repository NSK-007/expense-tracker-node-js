const Expense = require("../models/expense-model");

exports.getAllExpenses = async (req, res, next) => {
    try{
        const expenses = await Expense.findAll();  
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
        let expense = await Expense.create({amount, description, type});
        res.status(200).json(expense);
    }
    catch(err){
        // console.log(err);
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