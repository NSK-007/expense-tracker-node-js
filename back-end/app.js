const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const router = require('./routes/user-routes');
const sequelize = require('./util/database');

const app = express();
app.use(cors());
app.use(bodyParser.json({extended:false}));

app.use('/user', router);

sequelize
    .sync()
    .then(() => {
        app.listen(3000);
    })
    .catch(err => {
        console.log(err);
    })

