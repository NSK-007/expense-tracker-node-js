const { Sequelize } = require("sequelize");
const Expense = require("../models/expense-model");
const User = require("../models/user-model");
const sequelize = require("../util/database")

exports.getLeaderBoard = async (req, res, next) => {
    try{
        // const expense_user = await sequelize.query('SELECT users.name, SUM(amount) FROM users INNER JOIN expenses WHERE users.id = expenses.userId GROUP BY userId ORDER BY SUM(amount) DESC',  {type: Sequelize.QueryTypes.SELECT});

        // const expense_user = await User.findAll({
        //     attributes: ['id', 'name', [sequelize.fn('sum', sequelize.col('expenses.amount')), 'total_sum']],
        //     include: [
        //         {
        //             model: Expense,
        //             attributes: []
        //         }
        //     ],
        //     group: ['user.id'],
        //     order: [['total_sum', 'DESC']]
        // })
        // res.status(200).json({expense_user});

        const expense_user = await User.findAll({
            attributes: ['name', 'totalExpense'],
            order: [['totalExpense', 'DESC']]
        })
        res.status(200).json({expense_user});
    }
    catch(err){
        console.log(err);
        res.status(201).send({success: false, error: err.message});
    }
}