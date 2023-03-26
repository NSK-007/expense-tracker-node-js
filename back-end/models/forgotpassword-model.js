const Sequelize = require('sequelize');
const sequelize = require('../util/database');

const ForgotPassword = sequelize.define('forgotpassword', {
    id: {
        type: Sequelize.STRING,
        primaryKey: true,
        allowNull: false,
    },
    isActive: Sequelize.BOOLEAN,
    email: {
        type: Sequelize.STRING,
        allowNull: false
    }
});

module.exports = ForgotPassword;