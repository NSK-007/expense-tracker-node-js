const Sequelize = require('sequelize');
const sequelize = require('../util/database');

const ForgotPassword = sequelize.define('forgotpassword', {
    id: {
        type: Sequelize.STRING,
        primaryKey: true,
        allowNull: false,
    },
    isActive: Sequelize.BOOLEAN
});

module.exports = ForgotPassword;