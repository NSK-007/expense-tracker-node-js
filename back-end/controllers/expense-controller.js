const { Op, where } = require("sequelize");
const Expense = require("../models/expense-model");
const User = require("../models/user-model");
const sequelize = require("../util/database");

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
    let t = await sequelize.transaction();
    try{
        const {amount, description, type} = req.body;
        const currentUser = req.user;
        // console.log(Number(currentUser.totalExpense+Number(amount)));
        // console.log(typeof amount, typeof req.user.totalExpense);
        let expense = await currentUser.createExpense({amount, description, type}, {transaction: t});
        await User.update({totalExpense: (currentUser.totalExpense+Number(amount))}, {where: {id: currentUser.id}, transaction: t} );
        await t.commit();
        res.status(200).json(expense);
    }
    catch(err){
        console.log(err);
        await t.rollback();
        res.status(201).send({success: false, error: err.message});
    }
}

exports.deleteExpense = async (req, res, next) => {
    let t = await sequelize.transaction();
    try{
        const id = req.params.id;
        // let expense = await Expense.findByPk(id);
        let currentUser = req.user;
        let expense = await Expense.findAll({where : {id: id, userId: currentUser.id}, transaction: t})
        // console.log(id, expense);
        await expense[0].destroy({transaction: t});
        await currentUser.update({totalExpense: currentUser.totalExpense - Number(expense[0].amount)}, {where: {id: currentUser.id}, transaction: t})
        await t.commit();
        res.status(200).send({success:true, message:'Expense Deleted'});
    }
    catch(err){
        console.log(err);
        await t.rollback();
        res.status(201).json({success:false, error:'Expense Not Deleted'});
    }
}

exports.getMonthlyExpenses = async (req, res, next) => {
    try{
        console.log('Monthly Expenses');
        let obj = req.params
        // console.log(obj);
        let expenses = await Expense.findAll({
            attributes: [
                'createdAt', 'description', 'type', 'amount' 
                // [sequelize.fn('sum', sequelize.col('amount')), 'total_sum']x
            ],
            where: {
                userId: req.user.id,
                [Op.and]: [
                    sequelize.where(sequelize.fn('Month', sequelize.col('createdAt')), obj.month),
                    sequelize.where(sequelize.fn('YEAR', sequelize.col('createdAt')), obj.year)
                ],
            },
        })
        // console.log(expenses);
        res.status(200).json({success: true, expenses: expenses, month: obj.month});
    }
    catch(err){
        console.log(err);
        res.status(201).send({success: false, error: err.message})
    }
}

exports.getYearlyExpenses = async (req, res, next) => {
    try{
        let year = req.params.year;
        let expenses_by_month = await Expense.findAll({
            attributes: [
                [sequelize.fn('MONTH', sequelize.col('createdAt')), 'month'],
                [sequelize.fn('SUM', sequelize.col('amount')), 'total_expense']
            ],
            where:{
                userId: req.user.id,
                [Op.and] : [
                    sequelize.where(sequelize.fn('YEAR', sequelize.col('createdAt')), year)
                ]
            },
            group: [sequelize.fn('MONTH', sequelize.col('createdAt'))],
            order: [['month', 'ASC']]
        });
        res.status(200).json({expenses: expenses_by_month});
    }
    catch(err){
        console.log(err);
        res.status(201).send({success: false, error: err.message})
    }
}