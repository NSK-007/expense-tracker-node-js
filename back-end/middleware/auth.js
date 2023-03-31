const jwt = require('jsonwebtoken');
const User = require('../models/user-model');
require('dotenv').config();


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
        console.log(err)
        res.status(201).send({sucess:false, error:'Please log in to proceed'});
    }
}

module.exports = authenticate;