const { Op, where } = require("sequelize");
const Expense = require("../models/expense-model");
const User = require("../models/user-model");
const AWS = require('aws-sdk')
const sequelize = require("../util/database");
const monthly_expenses = require("../middleware/monthly-expenses");
const converter = require('json-2-csv');
const yearly_expenses = require("../middleware/yearly-expenses");
const ExpenseServices = require('../services/expense-services');
const TransactionServices = require('../services/transaction-services');
const S3Services = require('../services/s3-services');

exports.getUserExpenses = async (req, res, next) => {
    try{
        const obj = req.query
        console.log(obj);
        const currentUser = req.user;
        // console.log(page);
        // const expenses = await currentUser.getExpenses();
        const expenses = await ExpenseServices.getExpenses(currentUser, obj);
        const total_no_of_rows = await ExpenseServices.getExpensesTotalCount(currentUser);
        // console.log(total_no_of_rows[0].dataValues.total_count);
        let pages = Math.ceil(total_no_of_rows[0].dataValues.total_count/Number(obj.limit));
        // console.log(pages)
        res.status(200).json({expenses, pages});
    }
    catch(err){
        console.log(err);
        res.status(201).json(expenses);
    }
}

exports.addExpense = async (req, res, next) => {
    // let t = await sequelize.transaction();
    let t = await TransactionServices.transaction();
    try{
        const {amount, description, type} = req.body;
        const currentUser = req.user;
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
    let t = await TransactionServices.transaction();
    try{
        const id = req.params.id;
        let currentUser = req.user;
        let expense = await ExpenseServices.getExpenseById(id, currentUser, t);
        console.log(expense);
        await ExpenseServices.destroyExpense(expense, t);
        await ExpenseServices.updateExpense(expense, currentUser, t);
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
        res.status(200).json({success: true, expenses: req.expenses, pages: req.pages});
    }
    catch(err){
        console.log(err);
        res.status(201).send({success: false, error: err.message})
    }
}

exports.getYearlyExpenses = async (req, res, next) => {
    try{
        res.status(200).json({expenses: req.expenses, pages: req.pages});
    }
    catch(err){
        console.log(err);
        res.status(201).send({success: false, error: err.message})
    }
}

exports.downloadExpenses = async (req, res, next) => {
    console.log('downloading....');
    try{
        // let expenses = await monthly_expenses(obj, req.user.id);
        let type = (req.url).includes('Monthly')?'Monthly':'Yearly';
        // console.log(req.url)
        let obj = req.params;
        let expenses = req.expenses;
        expenses = expenses.map(expenses => expenses.dataValues);
        let csvData = await converter.json2csv(expenses);
        let timeline = type==='Monthly'?obj.month+'-'+obj.year:obj.year;
        const filename = `${req.user.id}_Expenses/${type}/${timeline+'-'+new Date()}.csv`;
        const fileURL = await S3Services.uploadToS3(filename, csvData);
        console.log(fileURL);
        res.status(200).json({success: true, fileURL, timeline});
    }
    catch(err){
        console.log(err);
        res.status(201).send({success: false, error: err.message});
    }
}

exports.addDownload = async (req, res, next) => {
    console.log('adding download...');
    let t = await TransactionServices.transaction();
    let user = req.user;
    let obj = req.body;
    try{
        let download = await ExpenseServices.createDownloads(user, obj, t);
        res.status(200).json({success: true, download: download});
        await t.commit();
    }
    catch(err){
        console.log(err);
        res.status(201).send({success: false, error: err.message});
        await t.rollback();
    }
}

exports.getDownloads = async (req, res, next) => {
    console.log('getting downloads...');
    let user = req.user;
    let page = req.query.page;
    let limit = Number(req.query.limit);
    try{
        let downloads = await ExpenseServices.getUserDownloads(user, page, limit);
        let pages = await ExpenseServices.getUserDownloadsCount(user);
        console.log(pages[0].dataValues.total_count)
        pages = Math.ceil(pages[0].dataValues.total_count/limit);
        console.log(pages);
        res.status(200).json({success: true, downloads: downloads, pages: pages});
    }
    catch(err){
        console.log(err);
        res.status(201).send({success: false, error: err.message});
    }
}