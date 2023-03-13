require('dotenv').config();
const nodemailer = require('nodemailer');
exports.resetPassword = async (req, res, next) => {
    try{
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
            to: req.body.resetEmail,
            subject: 'RESET PASSWORD',
            text: 'Click the below link to reset the password'
        };

        mailTransporter.sendMail(mailDetails, function(err, data){
            if(err)
                console.log(err)
            else
                console.log('Email Sent');
        })
    }
    catch(err){
        console.log(err)
    }
}