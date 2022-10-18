require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql");
const routes = require('./routes/routes');

const connection = require('./config/db');





const app = express();



app.use(express.json());
app.use('/api', routes)




app.listen(3000, () => {
    console.log(`Server Started at ${3000}`)
});