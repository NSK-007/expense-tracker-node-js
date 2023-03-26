const { v4 : uuidv4 } = require('uuid');
const ForgotPassword = require('../models/forgotpassword-model');

const createForgotpasswordRecord = (user, t) => {
    return user[0].createForgotpassword({id: uuidv4(), isActive: true, email: user[0].email}, {transaction: t});
}

const findForgotPasswordByUUID = (uuid) => {
    return ForgotPassword.findOne({where: {id: uuid}});
}

const findForgotPasswordRecord = (uuid, updatePasswordObj) => {
    return ForgotPassword.findOne({uuid: uuid, where: {email: updatePasswordObj.email, isActive: true}});
}

const updateForgotPasswordRecord = (updatePasswordObj, t) => {
    return ForgotPassword.update({isActive: false}, {where: {id: updatePasswordObj.uuid}, transaction: t});
}

module.exports = {
    createForgotpasswordRecord,
    findForgotPasswordByUUID,
    findForgotPasswordRecord,
    updateForgotPasswordRecord
}