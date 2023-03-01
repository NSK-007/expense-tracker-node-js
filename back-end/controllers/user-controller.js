const User = require("../models/user-model");

exports.signUpController = async (req, res, next) => {
    try{
        let user = await User.findAll({where:{email:req.body.email}})
        if(user.length>0)
            throw new Error('User already exists');

        user = await User.create({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password
        });
        res.status(200).json(user);
    }
    catch(err){
        res.status(201).send({success:false, error:'User already exists'});
    }
}

exports.loginUser = async (req, res, next) => {
    try{
        let user = await User.findAll({where:{email:req.body.email}});
        if(user.length>0){
            let user_password = await User.findAll({where:{password:req.body.password}});
            // console.log(user_password);
            if(user_password.length==0)
                throw new Error('Incorrect Password');
            // console.log('user logged in');
            res.status(200).json({success:true, message:'Login Successfull'});
        }
        else
            throw new Error('Incorrect mail/user doesn\'t exist');
    }
    catch(err){
        // console.log(err.message);
        res.status(201).send({success:false, error:err.message});
    }
}