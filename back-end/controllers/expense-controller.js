const Expense = require("../models/expense-model");
const User = require("../models/user-model");

exports.getUserExpenses = async (req, res, next) => {
    try{
        const currentUser = req.user;
        const expenses = await currentUser.getExpenses({where: {userId: req.user.id}});
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
        // console.log(Number(currentUser.totalExpense+Number(amount)));
        // console.log(typeof amount, typeof req.user.totalExpense);
        let expense = await currentUser.createExpense({amount, description, type});
        await User.update({totalExpense: (currentUser.totalExpense+Number(amount))}, {where: {id: currentUser.id}});
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
        // let expense = await Expense.findByPk(id);
        let currentUser = req.user;
        let expense = await Expense.findAll({where : {id: id, userId: currentUser.id}})
        console.log(id, expense);
        await expense[0].destroy();
        res.status(200).send({success:true, message:'Expense Deleted'});
    }
    catch(err){
        console.log(err);
        res.status(201).json({success:false, error:'Expense Not Deleted'});
    }
}