const { Op, Model } = require("sequelize");
const Expense = require("../models/expense-model");
const sequelize = require("../util/database");

const yearly_expenses = async (req, res, next) => {
    try{
        let year = req.params.year;
        let page = req.query.page;
        let limit = req.query.limit;
        if(page === undefined || limit === undefined){
            page = 1;
            limit = Number.MAX_SAFE_INTEGER;
        }
        else{
            limit = Number(limit);
        }

        let expenses = await Expense.findAll({
            attributes: [
                [sequelize.fn('MONTH', sequelize.col('createdAt')), 'month'],
                [sequelize.fn('SUM', sequelize.col('amount')), 'total_expense']
            ],
            where:{
                // userId: userId,
                userId: req.user.id,
                [Op.and] : [
                    sequelize.where(sequelize.fn('YEAR', sequelize.col('createdAt')), year)
                ]
            },
            group: [sequelize.fn('MONTH', sequelize.col('createdAt'))],
            order: [['month', 'ASC']],
            offset: Number(page - 1) * limit,
            limit: limit
        });
        let exp_year_total_count = await Expense.findAll({
            attributes: [
                [sequelize.fn('MONTH', sequelize.col('createdAt')), 'month'],
                [sequelize.fn('SUM', sequelize.col('amount')), 'total_expense']
            ],
            where:{
                userId: req.user.id,
                [Op.and] : [
                    sequelize.where(sequelize.fn('YEAR', sequelize.col('createdAt')), year)
                ]
            },
            group: [sequelize.fn('MONTH', sequelize.col('createdAt'))],
        })
        let pages = exp_year_total_count.length;
        // console.log(expenses);
        pages = Math.ceil(pages/limit);
        req.expenses = expenses;
        req.pages = pages;
        // console.log(expenses)
        next();
    }
    catch(err){
        console.log(err)
    }
}
module.exports = yearly_expenses;