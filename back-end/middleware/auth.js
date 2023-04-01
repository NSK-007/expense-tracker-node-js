const jwt = require('jsonwebtoken');
const User = require('../models/user-model');
require('dotenv').config();
const format = require('format-error').format
const ErrorLogger = require("../error-logger");

const authenticate = async (req, res, next) => {
    try{
        const token = req.header('Authorization');
        const LoggedInUser = jwt.verify(token, process.env.TOKEN_SECRET);
        if(!LoggedInUser)
            throw new Error('Please log in to proceed ')
        
        const user = await User.findByPk(LoggedInUser.id);
        if(user.length<0)
            throw new Error('User doesn\'t exist');
        req.user = user;
        next();
    }   
    catch(err){
        let error = format(err);
        const logger = ErrorLogger(`${process.env.ERROR_LOG_BASE_PATH}\\back-end\\error logs\\authentication error logs\\error.log`);
        logger.error(error);
        console.log(err)
        res.status(201).send({sucess:false, error:'Please log in to proceed'});
        res.end();
    }
}

module.exports = authenticate;