const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const sequelize = require('./util/database');
const Expense = require('./models/expense-model');
const User = require('./models/user-model');
const UserRouter = require('./routes/user-routes');
const ExpenseRouter = require('./routes/expense-router');
const PurchaseRouter = require('./routes/purchase-routes');
const Order = require('./models/order-model');
const LeaderBoardRouter = require('./routes/leaderboard-router');

const app = express();
app.use(cors());
app.use(bodyParser.json({extended:false}));

app.use('/user', UserRouter);

app.use('/user', ExpenseRouter);

app.use('/purchase', PurchaseRouter);

app.use('/premium', LeaderBoardRouter);

Expense.belongsTo(User, {constraints: true, onDelete: 'CASCADE'});
Order.belongsTo(User, {constraints: true, onDelete: 'CASCADE'});
User.hasMany(Expense);
User.hasMany(Order);

sequelize
    // .sync({force:true})
    .sync()
    .then(() => {
        app.listen(3000);
    })
    .catch(err => {
        console.log(err);
    })

