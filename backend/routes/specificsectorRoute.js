const express = require('express');
const db = require('../db');
const auth = require('../middleware/auth');

const router = express.Router();

/// Route to fetch sector-specific questions
router.get('/sector-specific', auth, async (req, res) => {
    const { sectorId } = req.query;
    const resolvedSectorId = sectorId || req.user.sectorId;

    console.log('Resolved Sector ID:', resolvedSectorId); // Log sectorId being used

    if (!resolvedSectorId) {
        console.error('Sector ID is missing for the user');
        return res.status(400).json({ error: 'Sector ID is missing for the user' });
    }

    try {
        const sectorQuery = `
            SELECT *
            FROM questions
            WHERE Classification_Type = 'Sector-Specific'
            AND Sector_ID = ?;
        `;
        const [sectorQuestions] = await db.query(sectorQuery, [resolvedSectorId]);

        console.log('Fetched Sector Questions:', sectorQuestions); // Log results from DB

        if (sectorQuestions.length === 0) {
            console.warn('No sector-specific questions found for the given sector.');
            return res.status(404).json([]); // Respond with empty array if no questions
        }
        console.log('Sending Sector-Specific Questions:', sectorQuestions); // Log response
        res.status(200).json(sectorQuestions);
    } catch (err) {
        console.error('Error fetching sector-specific questions:', err); // Log any errors
        res.status(500).json({ error: 'Failed to fetch sector-specific questions' });
    }
});



// Route to submit sector-specific answers
router.post('/submit-sector-answers', auth, async (req, res) => {
    const { userId, answers, sectorId } = req.body;

    if (!userId || !answers || !Array.isArray(answers) || !sectorId) {
        return res.status(400).json({ error: 'Missing or invalid answers data' });
    }

    try {
        // Fetch all question metadata
        const [questionData] = await db.query('SELECT * FROM questions');
        const questionMap = Object.fromEntries(questionData.map((q) => [q.Question_ID, q.Answer_Type]));

        const answerPromises = answers.map((answer) => {
            const answerType = questionMap[answer.questionId];
            let query, queryValues;

            if (answerType === 'yes_no') {
                const responseValue = answer.response === "0" ? 0 : 1; // Yes = 0, No = 1
                query = `
                    INSERT INTO responses (User_ID, Question_ID, Answer, Sector_ID)
                    VALUES (?, ?, ?, ?)
                    ON DUPLICATE KEY UPDATE Answer = ?, Sector_ID = ?;
                `;
                queryValues = [userId, answer.questionId, responseValue, sectorId, responseValue, sectorId];
            } else if (answerType === 'text') {
                query = `
                    INSERT INTO responses (User_ID, Question_ID, Text_Answer, Sector_ID)
                    VALUES (?, ?, ?, ?)
                    ON DUPLICATE KEY UPDATE Text_Answer = ?, Sector_ID = ?;
                `;
                queryValues = [userId, answer.questionId, answer.response, sectorId, answer.response, sectorId];
            } else if (answerType === 'multiple_choice') {
                const responseValue = mapChoiceToScore(answer.response);
                query = `
                    INSERT INTO responses (User_ID, Question_ID, Answer, Sector_ID)
                    VALUES (?, ?, ?, ?)
                    ON DUPLICATE KEY UPDATE Answer = ?, Sector_ID = ?;
                `;
                queryValues = [userId, answer.questionId, responseValue, sectorId, responseValue, sectorId];
            } else if (answerType === 'numeric') {
                const responseValue = parseInt(answer.response, 10);
                query = `
                    INSERT INTO responses (User_ID, Question_ID, Answer, Sector_ID)
                    VALUES (?, ?, ?, ?)
                    ON DUPLICATE KEY UPDATE Answer = ?, Sector_ID = ?;
                `;
                queryValues = [userId, answer.questionId, responseValue, sectorId, responseValue, sectorId];
            }

            return db.query(query, queryValues);
        });

        await Promise.all(answerPromises);
        res.json({ success: true, message: 'Sector-specific answers saved successfully' });
    } catch (err) {
        console.error('Error saving sector-specific answers:', err);
        res.status(500).json({ error: 'An error occurred while saving sector-specific answers' });
    }
});


// Helper function for multiple choice scoring
function mapChoiceToScore(choice) {
    const scoreMap = { High: 3, Medium: 2, Low: 1 };
    return scoreMap[choice] || 0;
}

module.exports = router;
