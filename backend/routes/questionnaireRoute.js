
const express = require('express');
const db = require('../db'); // Database module
const auth = require('../middleware/auth'); // Authentication middleware

const router = express.Router();

// Example route to fetch questions
router.get('/questions', auth, async (req, res) => {
    try {
        const [results] = await db.query('SELECT * FROM questions'); // Adjust query as needed
        res.json(results);
    } catch (err) {
        console.error('Error fetching questions:', err);
        res.status(500).json({ error: 'An error occurred while fetching questions' });
    }
});

module.exports = router;



