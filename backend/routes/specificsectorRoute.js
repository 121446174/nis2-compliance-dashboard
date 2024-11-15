const express = require('express');
const db = require('../db'); // Database connection module
const auth = require('../middleware/auth'); // Authentication middleware

const router = express.Router();

// Route to save sector-specific responses
router.post('/save-sector-responses', auth, async (req, res) => {
    const { userId, responses } = req.body;

    if (!userId || !responses) {
        return res.status(400).json({ error: 'Missing userId or responses data' });
    }

    try {
        const responsePromises = Object.entries(responses).map(([questionId, responseValue]) => {
            return db.query(
                `INSERT INTO responses (User_ID, Question_ID, Answer, Text_Answer) VALUES (?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE Answer = VALUES(Answer), Text_Answer = VALUES(Text_Answer)`,
                [
                    userId,
                    questionId,
                    responseValue === 'yes' ? 1 : responseValue === 'no' ? 0 : null,
                    typeof responseValue === 'string' ? responseValue : null
                ]
            );
        });

        await Promise.all(responsePromises);
        res.json({ success: true, message: 'Responses saved successfully' });
    } catch (err) {
        console.error('Error saving sector-specific responses:', err);
        res.status(500).json({ error: 'An error occurred while saving responses' });
    }
});

module.exports = router;
