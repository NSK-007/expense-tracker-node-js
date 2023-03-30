const User = require("../models/user-model");
const sequelize = require("../util/database");

const findUserByEmail = (email, t) => {
    return User.findAll({where: {email: email}, transaction: t});
}

const createNewUser = (name, email, hash, t) => {
    return User.create({name, email, password: hash, isPremiumUser: false, totalExpense: 0}, {transaction: t});
}

const updateUser = (hash, user, t) => {
    console.log(user);
    return User.update({password: hash}, {where: {id: user[0].id}, transaction: t});
}

const findAllUsers = (obj) => {
    return User.findAll({attributes: ['name', 'totalExpense'], order: [['totalExpense', 'DESC']], offset:Number(obj.page-1)*Number(obj.limit), limit:Number(obj.limit) });
}

const updateUserPremiumStatus = (t) => {
    return currentUser.update({isPremiumUser: true}, {transaction: t});
}

const getUsersTotalCount = () => {
    return User.findAll({
        attributes: [
            [sequelize.fn('COUNT', sequelize.col('id')), 'total_count']
        ]
    });
}

module.exports = {
    findUserByEmail,
    createNewUser,
    updateUser,
    findAllUsers,
    updateUserPremiumStatus,
    getUsersTotalCount
}