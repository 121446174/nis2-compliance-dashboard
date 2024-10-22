// backend/routes/compliance.js

const express = require('express');
const router = express.Router();
const db = require('../db');  // Make sure your db.js is correctly set up for MySQL connection

// Fetch compliance data
router.get('/', (req, res) => {
    const query = 'SELECT * FROM Compliance_Task';  // Adjust this query to match your database table
    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(results);  // Return the compliance data as JSON
    });
});

module.exports = router;










