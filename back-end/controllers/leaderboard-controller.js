const format = require('format-error').format
const ErrorLogger = require("../error-logger");
require('dotenv').config();
const UserServices = require('../services/user-services')
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

        // const expense_user = await User.findAll({
        //     attributes: ['name', 'totalExpense'],
        //     order: [['totalExpense', 'DESC'] ]
        // })
        const obj = req.query;
        const expense_users = await UserServices.findAllUsers(obj);
        const total_rows = await UserServices.getUsersTotalCount();
        const pages = Math.ceil(total_rows[0].dataValues.total_count/Number(obj.limit));
        res.status(200).json({expense_users, pages});
    }
    catch(err){
        let error = format(err);
        const logger = ErrorLogger(`${process.env.ERROR_LOG_BASE_PATH}\\back-end\\error logs\\leaderboard error logs\\error.log`);
        logger.error(error);
        res.status(201).send({success: false, error: err.message});
    }
}