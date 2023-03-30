const User = require("../models/user-model");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const sequelize = require("../util/database");
// const SIB = require('sib-api-v3-sdk');
require('dotenv').config();
const TransactionServices = require('../services/transaction-services');
const UserServices = require('../services/user-services');

exports.signUpUser = async (req, res, next) => {
    let t = await TransactionServices.transaction();
    try{
        const {name, email, password} = req.body;
        let user = await UserServices.findUserByEmail(email, t);
        if(user.length>0)
            throw new Error('User already exists');

        const saltrounds = 10;
        bcrypt.hash(password, saltrounds, async (err, hash) => {
            console.log(err);
            await UserServices.createNewUser(name, email, hash, t);
            await t.commit();
            res.status(200).json({success:true, message:'User successfully registered'}); 
        })
    }
    catch(err){
        console.log(err);
        await t.rollback();
        res.status(201).send({success:false, error:'User already exists'});
    }
}

function generateToken(user){
    return jwt.sign({id: user.id, name: user.name} , process.env.TOKEN_SECRET);
}

exports.loginUser = async (req, res, next) => {
    let t = await TransactionServices.transaction();
    try{
        const {email, password} = req.body;
        let user = await UserServices.findUserByEmail(email, t);
        if(user.length>0){
           let flag = await bcrypt.compare(password, user[0].password);
           if(!flag)
                throw new Error('Incorrect Password');
            const token = generateToken(user[0]);
            t.commit();
            res.status(200).json({success:true, message:'Login Successful', token: token});
        }
        else
            throw new Error('Incorrect mail/user doesn\'t exist');
    }
    catch(err){
        console.log(err)
        await t.rollback();
        res.status(201).send({success:false, error:err.message});
    }
}

exports.checkPremium = async (req, res, next) => {
    try{
        currentUser = req.user;
        if(currentUser.isPremiumUser)
            res.status(200).json({success: true, message: 'You are a premium user'});
        else
            throw new Error('You are not a premium user');
    }
    catch(err){
        res.status(201).send({success: false, error: err.message});
    }
}

exports.getUser = async (req, res, next) => {
    try{
        res.status(200).json({success: true, id: req.user.id, name: req.user.name});
    }
    catch(err){
        console.log(err);
        res.status(201).send({success: false, error: err.message});
    }
}