const express = require('express'); 
const db = require('../db'); 
const auth = require('../middleware/auth'); 

const router = express.Router();

router.get('/sector-specific', auth, async (req, res) => {
    const { sectorId } = req.query;
    const userId = req.user.id; // Assuming auth middleware provides req.user

    try {
        let resolvedSectorId = sectorId;

        // If sectorId is missing, fetch it from the user table
        if (!sectorId) {
            const [userSector] = await db.query(
                'SELECT Sector_ID FROM user WHERE User_ID = ?',
                [userId]
            );

            if (!userSector || !userSector.Sector_ID) {
                return res.status(400).json({ error: 'Sector ID is missing for the user' });
            }

            resolvedSectorId = userSector.Sector_ID;
        }

        // Fetch sector-specific questions using the resolved sectorId
        const [questions] = await db.query(
            'SELECT * FROM questions WHERE Classification_Type = "Sector-Specific" AND Sector_ID = ?',
            [resolvedSectorId]
        );

        res.json(questions);
    } catch (err) {
        console.error('Error fetching sector-specific questions:', err);
        res.status(500).json({ error: 'Error fetching sector-specific questions' });
    }
});

router.post('/submit-sector-answers', auth, async (req, res) => {
    const { userId, answers } = req.body;

    if (!userId || !answers || !Array.isArray(answers)) {
        return res.status(400).json({ error: 'Missing or invalid answers data' });
    }

    try {
        const answerPromises = answers.map((answer) => {
            const query = 'INSERT INTO responses (User_ID, Question_ID, Answer) VALUES (?, ?, ?)';
            const queryValues = [userId, answer.questionId, answer.response];
            return db.query(query, queryValues);
        });

        await Promise.all(answerPromises);
        res.json({ success: true, message: 'Sector-specific answers saved successfully' });
    } catch (err) {
        console.error('Error saving sector-specific answers:', err);
        res.status(500).json({ error: 'Error saving sector-specific answers' });
    }
});


module.exports = router;