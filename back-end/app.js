const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const router = require('./routes/user-routes');
const sequelize = require('./util/database');
const Expense = require('./models/expense-model');
const User = require('./models/user-model');

const app = express();
app.use(cors());
app.use(bodyParser.json({extended:false}));

app.use('/user', router);

Expense.belongsTo(User, {constraints:true, onDelete: 'CASCADE'});
User.hasMany(Expense);

sequelize
    // .sync({force:true})
    .sync()
    .then(() => {
        app.listen(3000);
    })
    .catch(err => {
        console.log(err);
    })

