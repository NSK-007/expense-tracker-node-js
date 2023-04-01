const { Op, Model } = require("sequelize");
const Expense = require("../models/expense-model");
const sequelize = require("../util/database");
const ErrorLogger = require("../error-logger");
const format = require('format-error').format
require('dotenv').config();

const monthly_expenses = async (req, res, next) => {
    try{
        let obj = req.params;
        let obj2 = req.query;
        let limit = 0;
        if(obj2.page===undefined){
            obj2.page = 1;
            limit = Number.MAX_SAFE_INTEGER;
        }
        else{
            limit = Number(obj2.limit);
        }
        let expenses = await Expense.findAll({
            attributes: [
                'createdAt', 'description', 'type', 'amount' 
            ],
            where: {
                userId: req.user.id,
                [Op.and]: [
                    sequelize.where(sequelize.fn('Month', sequelize.col('createdAt')), obj.month),
                    sequelize.where(sequelize.fn('YEAR', sequelize.col('createdAt')), obj.year)
                ],
            },
            offset: Number(obj2.page-1) * limit,
            limit: limit
        });

        let exp_month_total_count = await Expense.findAll({
            attributes: [
                [sequelize.fn('COUNT', sequelize.col('id')), 'total_count']
            ],
            where: {
                userId: req.user.id,
                [Op.and]: [
                    sequelize.where(sequelize.fn('Month', sequelize.col('createdAt')), obj.month),
                    sequelize.where(sequelize.fn('YEAR', sequelize.col('createdAt')), obj.year)
                ],
            },
        });
        let pages = exp_month_total_count[0];
        pages = Math.ceil(pages.dataValues.total_count/Number(obj2.limit));
        req.expenses = expenses;
        req.pages = pages;
        next();
    }
    catch(err){
        let error = format(err);
        const logger = ErrorLogger(`${process.env.ERROR_LOG_BASE_PATH}\\back-end\\error logs\\expense error logs\\error.log`);
        logger.error(error);
        console.log(err);
    }
}

module.exports = monthly_expenses; 