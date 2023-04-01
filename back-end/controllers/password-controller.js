require('dotenv').config();
const format = require('format-error').format
const ErrorLogger = require("../error-logger");
const path = require('path');
const rootDir =  path.dirname(process.mainModule.filename);
const nodemailer = require('nodemailer');
const { v4 : uuidv4 } = require('uuid');
const User = require('../models/user-model');
const sequelize = require('../util/database');
const bcrypt = require('bcrypt');
const ForgotPassword = require('../models/forgotpassword-model');
const TransactionServices = require('../services/transaction-services');
const UserServices = require('../services/user-services');
const PasswordService = require('../services/password-services');
exports.sendMail = async (req, res, next) => {
    let t = await TransactionServices.transaction();
    try{
        const gmail = req.body.resetEmail;
        const user = await UserServices.findUserByEmail(gmail, t);
        if(user===null)
            throw new Error('Mail not matched with the registered email');
        let record = await PasswordService.createForgotpasswordRecord(user, t);

        const uuid = record.dataValues.id;

        let mailTransporter = nodemailer.createTransport({
            service: process.env.SERVICE,
            host: process.env.MAIL_HOST,
            port: 465,
            secure: true,
            auth: {
                user: process.env.EMAIL,
                pass: process.env.EMAIL_PASSWORD
            }
        });

        let mailDetails = { 
            from: process.env.EMAIL,
            to: gmail,
            subject: 'RESET PASSWORD',
            html: `<p>Dear User,<br>
            Please click the below link to reset the password</p>
            <a href=${process.env.BACKEND_URL}/user/password/resetpassword/${uuid}>reset password</a>`
        };

        mailTransporter.sendMail(mailDetails, function(err, data){
            if(err){
                console.log(err);
                throw new Error(err.message)
            }
            else{
                res.status(200).json({success: true, message: 'Check your email to reset the password'});
            }
        });

        await t.commit();
    }
    catch(err){
        // console.log(err);
        let error = format(err);
        const logger = ErrorLogger(`${process.env.ERROR_LOG_BASE_PATH}\\back-end\\error logs\\password error logs\\error.log`);
        logger.error(error);
        await t.rollback();
        res.status(201).json({success: true, error: err.message});
    }
}

exports.resetPassword = async (req, res, next) => {
    try{
      const uuid = req.params.uuid;
      const fp = await PasswordService.findForgotPasswordByUUID(uuid);

      if(fp===null)
        throw new Error('Password Link doesn\'t exists ');
      if(!fp.isActive)
        throw new Error('Password Link expired');

      res.sendFile(path.join(rootDir, 'views', 'reset-password.html'), null, function(err){
        if(err)
          console.log(err)
        res.end();
      });
    }
    catch(err){
        console.log(err);
        let error = format(err);
        const logger = ErrorLogger(`${process.env.ERROR_LOG_BASE_PATH}\\back-end\\error logs\\password error logs\\error.log`);
        logger.error(error);
        res.send({success: false, error: err.message});
    }
}

exports.updatePassword = async (req, res, next) => {
  const t = await TransactionServices.transaction();
  try{
    let updatePasswordObj = req.body;
    let reset_password_email = await PasswordService.findForgotPasswordRecord(req.params.uuid, updatePasswordObj);
    if(reset_password_email===null)
      throw new Error('Email doesn\'t match with the email used in generating this link');
    let user = await UserServices.findUserByEmail(updatePasswordObj.email, t);
    if(user===null)
        throw new Error('User doesn\'t exist with given email');

    const saltRounds = 10;
    bcrypt.hash(updatePasswordObj.pass1, saltRounds, async (err, hash) => {
      if(err)
        console.log(err)
      await UserServices.updateUser(hash, user, t);
      await PasswordService.updateForgotPasswordRecord(updatePasswordObj, t);
      await t.commit();
      res.status(200).json({success: true, message: 'Password updated successfully'});
    });    
  }
  catch(err){
    // console.log(err);
    let error = format(err);
    const logger = ErrorLogger(`${process.env.ERROR_LOG_BASE_PATH}\\back-end\\error logs\\password error logs\\error.log`);
    logger.error(error);
    res.status(201).send({success: false, error: err.message});
    await t.rollback();
  }
}