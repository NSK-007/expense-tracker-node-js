const RazorPay = require('razorpay');
const Order = require('../models/order-model');
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
    try{    
        // console.log(process.env.RAZOR_PAY_KEY_ID);
        var rz_pay = new RazorPay({
            key_id: process.env.RAZOR_PAY_KEY_ID,
            key_secret: process.env.RAZOR_PAY_KEY_SECRET
        });

        const amount = 2500;

        await rz_pay.orders.create({amount, currency: "INR"}, async (err, order) => {
            // console.log(order);
            if(err){
                throw new Error('Transaction Failed');
            }
            let new_order = await req.user.createOrder({orderId: order.id, status: 'PENDING'});
            res.status(200).json({new_order, key_id: rz_pay.key_id});
        })
    }
    catch(err){
        console.log(err);
        res.status(201).json({success: false, error: err.message});
    }
}

exports.updateTransactionStatus = async (req, res, next) => {
    try{
        const currentUser = req.user;
        const {payment_id, order_id} = req.body;
        let order = await Order.findOne({where: {orderid: order_id}});
        if(!payment_id){
            order.update({paymentId: payment_id, status: 'FAILED'});
            throw new Error('Payment Failed');
        }
        await Promise.all([order.update({paymentId: payment_id, status: 'SUCCESSFUL'}), currentUser.update({isPremiumUser: true})])
        res.status(200).json({success: true, message: 'Transaction Successful'});
    }
    catch(err){
        // console.log(err);
        res.status(201).send({success:false, message: err.message});
    }
}