const sequelize = require("../util/database");

const getExpenses = (user, page) => {
    return user.getExpenses({offset:(Number(page-1))*5, limit:5});
}

const getExpensesTotalCount = (user) => {
    return user.getExpenses({
        attributes: [
            [sequelize.fn('COUNT', sequelize.col('id')), 'total_count']
        ]
    });
}

const getExpenseById = (id, user, t) => {
    return user.getExpenses({where: {id}, transaction: t});
}

const destroyExpense = (expense, t) => {
    return expense[0].destroy({transaction: t});
}

const updateExpense = (expense, user, t) => {
    return user.update({totalExpense: currentUser.totalExpense - Number(expense[0].amount)}, {where: {id: currentUser.id}, transaction: t})
} 


const createDownloads = (user, obj, t) => {
    return user.createDownload({url: obj.fileURL, type: obj.type, timeline: obj.timeline}, {transaction: t});
}

const getUserDownloads = (user) => {
    return user.getDownloads();
}

module.exports = {
    getExpenses,
    getExpenseById,
    destroyExpense,
    updateExpense,
    createDownloads,
    getUserDownloads,
    getExpensesTotalCount
}