const sequelize = require("../util/database");

const getExpenses = (user, obj) => {
    return user.getExpenses({offset:(Number(obj.page-1))*Number(obj.limit), limit:Number(obj.limit)});
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

const getUserDownloads = (user, page, limit) => {
    return user.getDownloads({
        offset: Number(page-1)*limit,
        limit: limit
    });
}

const getUserDownloadsCount = (user) => {
    return user.getDownloads({
        attributes:[
            [sequelize.fn('COUNT', sequelize.col('id')), 'total_count']
        ]
    })
}

module.exports = {
    getExpenses,
    getExpenseById,
    destroyExpense,
    updateExpense,
    createDownloads,
    getUserDownloads,
    getExpensesTotalCount,
    getUserDownloadsCount
}