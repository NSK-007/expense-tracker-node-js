const { Op, where } = require("sequelize");
const Expense = require("../models/expense-model");
const User = require("../models/user-model");
const AWS = require('aws-sdk')
const sequelize = require("../util/database");
const monthly_expenses = require("../middleware/monthly-expenses");
const converter = require('json-2-csv');
const yearly_expenses = require("../middleware/yearly-expenses");

exports.getUserExpenses = async (req, res, next) => {
    try{
        const currentUser = req.user;
        const expenses = await currentUser.getExpenses();
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
        res.status(200).json({success: true, expenses: req.expenses});
    }
    catch(err){
        console.log(err);
        res.status(201).send({success: false, error: err.message})
    }
}

exports.getYearlyExpenses = async (req, res, next) => {
    try{
        res.status(200).json({expenses: req.expenses});
    }
    catch(err){
        console.log(err);
        res.status(201).send({success: false, error: err.message})
    }
}

async function uploadToS3(filename, expenses){
    console.log('json',expenses);
    const BUCKET_NAME = process.env.BUCKET_NAME
    const IAM_USER_KEY = process.env.IAM_USER_KEY
    const IAM_USER_SECRET = process.env.IAM_USER_SECRET

    let s3bucket = new AWS.S3({
        accessKeyId: IAM_USER_KEY,
        secretAccessKey: IAM_USER_SECRET,
    });
    var params = {
        Bucket: BUCKET_NAME,
        Key: filename,
        Body: expenses,
        ACL: 'public-read'
    }

    const s3_promise = new Promise((res, rej) => {
        s3bucket.upload(params, (err, s3_res) => {
            if(err){
                console.log(err);
                rej(new Error(err.message));
            }
            else{
                console.log(s3_res);
                res(s3_res.Location);
            }
        });
    });

    return await s3_promise;
}

exports.downloadExpenses = async (req, res, next) => {
    console.log('downloading....');
    try{
        // let expenses = await monthly_expenses(obj, req.user.id);
        let type = (req.url).includes('Monthly')?'Monthly':'Yearly';
        // console.log(req.url)
        let expenses = req.expenses;
        expenses = expenses.map(expenses => expenses.dataValues);
        let csvData = await converter.json2csv(expenses);
        const filename = `${req.user.id}_Expenses/${type}/${new Date()}.csv`;
        const fileURL = await uploadToS3(filename, csvData);
        console.log(fileURL);
        res.status(200).json({success: true, fileURL});
    }
    catch(err){
        console.log(err);
        res.status(201).send({success: false, error: err.message});
    }
}

exports.addDownload = async (req, res, next) => {
    console.log('adding download...');
    let t = await sequelize.transaction();
    try{
        
    }
    catch(err){
        console.log(err)
    }
}