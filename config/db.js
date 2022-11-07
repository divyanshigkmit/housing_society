const mysql = require("mysql2");


const connection = mysql.createPool({
    host     : process.env.host,
    port     : process.env.port,
    database : process.env.database,
    user     : process.env.username,
    password : process.env.password,
});

connection.getConnection((err) => {
  if(err) throw err;
  console.log('Mysql Connected...');
});

module.exports = connection;