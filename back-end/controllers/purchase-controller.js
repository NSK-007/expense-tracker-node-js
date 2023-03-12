const RazorPay = require('razorpay');
const Order = require('../models/order-model');
const sequelize = require('../util/database');
require('dotenv').config();

exports.checkIfAlreadyPremium = async (req, res, next) => {
    try{
        const currentUser = req.user;
        if(currentUser.isPremiumUser)
            throw new Error('You are already a Premium User');
        next();
    }
    catch(err){
        // console.log(err);
        res.status(201).send({success: false, error: err.message});
    }
}

exports.purchasePremium = async (req, res, next) => {
    let t = await sequelize.transaction();
    try{    
        // console.log(process.env.RAZOR_PAY_KEY_ID);
        var rz_pay = new RazorPay({
            key_id: process.env.RAZOR_PAY_KEY_ID,
            key_secret: process.env.RAZOR_PAY_KEY_SECRET
        });

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
    let t = await sequelize.transaction();
    try{
        const currentUser = req.user;
        const {payment_id, order_id} = req.body;
        let order = await Order.findOne({where: {orderid: order_id}, transaction: t});
        if(!payment_id){
            order.update({paymentId: payment_id, status: 'FAILED'}, {transaction: t});
            throw new Error('Payment Failed');
        }
        await Promise.all([order.update({paymentId: payment_id, status: 'SUCCESSFUL'}, {transaction: t}), currentUser.update({isPremiumUser: true}, {transaction: t})]);
        await t.commit();
        res.status(200).json({success: true, message: 'Transaction Successful'});
    }
    catch(err){
        console.log(err);
        await t.rollback();
        res.status(201).send({success:false, message: err.message});
    }
}