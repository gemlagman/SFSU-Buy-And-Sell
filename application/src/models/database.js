/*
Author: Raya Farshad
Date: 12/16/19
Description: This file holds the pool data for connections.
*/

const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: "142.44.170.121",
  user: "root",
  password: "6&rFzI70oM*",
  database: "team11_db",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

pool.getConnection(err => {
  if (err) throw err;
  console.log("My database is connected!");
  //pool.query('test_raya');
});

module.exports = pool;
