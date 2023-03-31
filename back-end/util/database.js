const Sequelize = require('sequelize');
require('dotenv').config()
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER_NAME, process.env.DB_PASSWORD, {
    dialect: 'mysql',
    localhost: 'localhost'
})

module.exports = sequelize; 