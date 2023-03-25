const Sequelize = require("sequelize");
const sequelize = require("../util/database");

const Download = sequelize.define('download', {
    id: {
        type: Sequelize.STRING,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
    },
    url: {
        type: Sequelize.STRING,
        allowNull: false
    },
    
})