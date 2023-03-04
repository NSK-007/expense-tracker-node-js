const jwt = require('jsonwebtoken');
const User = require('../models/user-model');
require('dotenv').config();


const authenticate = async (req, res, next) => {
    try{
        const token = req.header('Authorization');
        // console.log(token);
        // const userId = Number(jwt.verify(token, process.env.TOKEN_SECRET));
        const LoggedInUser = jwt.verify(token, process.env.TOKEN_SECRET);
        
        // console.log(LoggedInUser);
        const user = await User.findByPk(LoggedInUser.id);
        // console.log(user);
        if(user.length<0)
            throw new Error('User doesn\'t exist');
        req.user = user;
        next();
    }   
    catch(err){
        // console.log(err)
        res.status(201).send({sucess:false, error:'Please log in to proceed'});
    }
}

module.exports = authenticate;