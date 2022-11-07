require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql");
const routes = require('./routes/routes');
const cors = require("cors");
const connection = require('./config/db');




const app = express();
// const corsOptions ={
//     origin:'*', 
//     credentials:true,            //access-control-allow-credentials:true
//     optionSuccessStatus:200,
//  }
 

app.use(cors());
app.use(express.json());
app.use('/api', routes);
// app.use(cors(corsOptions));

 


app.listen(3000, () => {
    console.log(`Server Started at ${3000}`)
});

module.exports = app;