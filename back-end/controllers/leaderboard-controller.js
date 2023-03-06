const { Sequelize } = require("sequelize");
const User = require("../models/user-model");
const sequelize = require("../util/database")

exports.getLeaderBoard = async (req, res, next) => {
    try{
        const expense_user = await sequelize.query('SELECT users.name, SUM(amount) FROM users INNER JOIN expenses WHERE users.id = expenses.userId GROUP BY userId ORDER BY SUM(amount) DESC',  {type: Sequelize.QueryTypes.SELECT})
        res.status(200).json({expense_user});
    }
    catch(err){
        console.log(err);
        res.status(201).send({success: false, error: err.message});
    }
}