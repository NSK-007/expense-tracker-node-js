const { Op, Model } = require("sequelize");
const Expense = require("../models/expense-model");
const sequelize = require("../util/database");

const monthly_expenses = async (req, res, next) => {
    try{
        let obj = req.params;
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
        })
        req.expenses = expenses;
        next();
    }
    catch(err){
        console.log(err);
    }
}

module.exports = monthly_expenses;