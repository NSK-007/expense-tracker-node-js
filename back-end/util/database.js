const Sequelize = require('sequelize');
const sequelize = new Sequelize('full-stack-expense-tracker', 'root', '@Rgukt123', {
    dialect: 'mysql',
    localhost: 'localhost'
})

module.exports = sequelize;