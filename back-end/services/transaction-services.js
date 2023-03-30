const sequelize = require("../util/database")

const transaction = () => {
    return sequelize.transaction();
}
module.exports = {
    transaction
}