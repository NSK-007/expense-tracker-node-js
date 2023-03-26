const Order = require('../models/order-model');
const sequelize = require('../util/database');
require('dotenv').config();
const TransactionServices = require('../services/transaction-services');
const RazorpayServices = require('../services/razorpay-services');
const OrderServices = require('../services/order-services');
const UserServices = require('../services/user-services');

exports.checkIfAlreadyPremium = async (req, res, next) => {
    try{
        const currentUser = req.user;
        if(currentUser.isPremiumUser)
            throw new Error('You are already a Premium User');
        next();
    }
    catch(err){
        res.status(201).send({success: false, error: err.message});
    }
}

exports.purchasePremium = async (req, res, next) => {
    let t = await TransactionServices.transaction();
    try{ 
        rz_pay = RazorpayServices.connectToRazorPay();
        const amount = 2500;

        rz_pay.orders.create({amount, currency: "INR"}, async (err, order) => {
            if(err){
                console.log(err)
                throw new Error('Transaction Failed');
            }
            let new_order = await req.user.createOrder({orderId: order.id, status: 'PENDING'});
            await t.commit();
            res.status(200).json({new_order, key_id: rz_pay.key_id});
        })
    }
    catch(err){
        console.log(err);
        await t.rollback();
        res.status(201).json({success: false, error: err.message});
    }
}

exports.updateTransactionStatus = async (req, res, next) => {
    let t = await TransactionServices.transaction();
    try{
        const currentUser = req.user;
        const {payment_id, order_id} = req.body;
        let order = await OrderServices.findOrder(order_id, t);
        if(!payment_id){
            await OrderServices.updateOrder(order, payment_id, 'FAILED');
            throw new Error('Payment Failed');
        }

        await Promise.all([OrderServices.updateOrder(order, payment_id, 'SUCCESSFUL', t), UserServices.updateUserPremiumStatus(t)]);

        await t.commit();
        res.status(200).json({success: true, message: 'Transaction Successful'});
    }
    catch(err){
        console.log(err);
        await t.rollback();
        res.status(201).send({success:false, message: err.message});
    }
}