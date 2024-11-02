
// backend/db.js
const mysql = require('mysql2/promise'); // Use the Promise-based version of mysql2

const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'eimear',
    database: 'nis2_compliance'
});

db.getConnection()
  .then(() => {
    console.log('Connected to MySQL database.');
  })
  .catch((err) => {
    console.error('Error connecting to MySQL:', err);
  });

module.exports = db;

