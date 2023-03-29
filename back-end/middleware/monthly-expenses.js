const { Op, Model } = require("sequelize");
const Expense = require("../models/expense-model");
const sequelize = require("../util/database");

const monthly_expenses = async (req, res, next) => {
    try{
        let obj = req.params;
        let page = req.query.page;
        let limit = 0;
        // console.log('monthly ',page);
        if(page===undefined){
            page = 1;
            limit = Number.MAX_SAFE_INTEGER;
        }
        else{
            limit = 5;
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
            offset: Number(page-1) * 5,
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
        pages = Math.ceil(pages.dataValues.total_count/5);
        console.log(pages);
        req.expenses = expenses;
        req.pages = pages;
        next();
    }
    catch(err){
        console.log(err);
    }
}

module.exports = monthly_expenses;