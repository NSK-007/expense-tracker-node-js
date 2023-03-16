require('dotenv').config();
const path = require('path');
const rootDir =  path.dirname(process.mainModule.filename);
const nodemailer = require('nodemailer');
const { v4 : uuidv4 } = require('uuid');
const User = require('../models/user-model');
const sequelize = require('../util/database');
const bcrypt = require('bcrypt');
const ForgotPassword = require('../models/forgotpassword-model');
exports.sendMail = async (req, res, next) => {
    let t = await sequelize.transaction();
    try{
        const gmail = req.body.resetEmail;
        const user = await User.findOne({where: {email: gmail}});

        if(user===null)
            throw new Error('Mail not matched with the registered email');

        let record = await user.createForgotpassword({
            id: uuidv4(),
            isActive: true,
        },{transaction: t});
        // console.log(record);
        const uuid = record.dataValues.id;
        console.log(uuid);

        let mailTransporter = nodemailer.createTransport({
            service: 'gmail',
            host: "smtp.gmail.com",
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
                console.log('Email Sent');
                res.status(200).json({success: true, message: 'Check your email to reset the password'});
            }
        });

        await t.commit();
    }
    catch(err){
        console.log(err);
        await t.rollback();
        res.status(201).json({success: true, error: err.message});
    }
}

exports.resetPassword = async (req, res, next) => {
    try{
      // console.log(req.params.uuid)
      // console.log(rootDir)
      const uuid = req.params.uuid;
      const fp = await ForgotPassword.findOne({where: {id: uuid}});

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
        res.send({success: false, error: err.message});
    }
}

exports.updatePassword = async (req, res, next) => {
  console.log('updating password....')
  const t = await sequelize.transaction();
  try{
    let updatePasswordObj = req.body;
    // console.log(req.body)
    let user = await User.findOne({where: {email: updatePasswordObj.email}});
    if(user===null)
        throw new Error('User doesn\'t exist with given email');

    const saltRounds = 10;
    bcrypt.hash(updatePasswordObj.pass1, saltRounds, async (err, hash) => {
      if(err)
        console.log(err)
      await User.update({password: hash}, {where: {id: user.id}, transaction: t});
      await ForgotPassword.update({isActive: false}, {where: {id: updatePasswordObj.uuid}});
      await t.commit();
      res.status(200).json({success: true, message: 'Password updated successfully'});
    });    
  }
  catch(err){
    console.log(err);
    res.status(201).send({success: false, error: err.message});
    await t.rollback();
  }
}