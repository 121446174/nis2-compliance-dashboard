
// Source: Sidorares Node MySQL2 Documentation (https://sidorares.github.io/node-mysql2/docs)
const mysql = require('mysql2/promise'); // Using the Promise-based version of mysql2 for asyron /await operations 
require('dotenv').config();

const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'eimear',
    database: 'nis2_compliance'
});

// Source: MySQL Tutorial - Connecting to the MySQL Server from Node.js
// https://www.mysqltutorial.org/mysql-nodejs/connect/
db.getConnection()
  .then(() => {
    console.log('Connected to MySQL database.');
  })
  .catch((err) => {
    console.error('Error connecting to MySQL:', err);
  });

module.exports = db;

