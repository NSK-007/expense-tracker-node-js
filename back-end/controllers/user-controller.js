const User = require("../models/user-model");
const bcrypt = require('bcrypt');

exports.signUpUser = async (req, res, next) => {
    try{
        const {name, email, password} = req.body;
        let user = await User.findAll({where:{email: email}})
        if(user.length>0)
            throw new Error('User already exists');

        const saltrounds = 10;
        bcrypt.hash(password, saltrounds, async (err, hash) => {
            console.log(err);
            await User.create({name, email, password: hash});
            res.status(200).json({success:true, message:'User successfully registered'}); 
        })
    }
    catch(err){
        res.status(201).send({success:false, error:'User already exists'});
    }
}

exports.loginUser = async (req, res, next) => {
    try{
        const {email, password} = req.body;
        let user = await User.findAll({where:{email:email}});
        if(user.length>0){
           let flag = await bcrypt.compare(password, user[0].password);
           if(!flag)
                throw new Error('Incorrect Password');
            res.status(200).json({success:true, message:'Login Successful'});
        }
        else
            throw new Error('Incorrect mail/user doesn\'t exist');
    }
    catch(err){
        res.status(201).send({success:false, error:err.message});
    }
}