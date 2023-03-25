const { Op, Model } = require("sequelize");
const Expense = require("../models/expense-model");
const sequelize = require("../util/database");

const yearly_expenses = async (req, res, next) => {
    try{
        let year = req.params.year;
        console.log(year)
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
            order: [['month', 'ASC']]
        });
        req.expenses = expenses;
        // console.log(expenses)
        next();
    }
    catch(err){
        console.log(err)
    }
}
module.exports = yearly_expenses;