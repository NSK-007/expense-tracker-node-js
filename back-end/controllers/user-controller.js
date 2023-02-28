const User = require("../models/user-model");

exports.signUpController = async (req, res, next) => {
    try{
        let user = await User.findAll({where:{email:req.body.email}})
        console.log(user.length);
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
        console.log(err.message);
        res.status(201).send({error:'User already exists'});
    }
}