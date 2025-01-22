const express = require('express');
const db = require('../db');
const auth = require('../middleware/auth');

const router = express.Router();

/// Route to fetch sector-specific questions
// Mozilla Developer Network (MDN) inspired source "The router.get() method responds to HTTP GET requests at a specific path."
// Execurting query - https://www.honeybadger.io/blog/using-sql-databases-in-javascript/
router.get('/sector-specific', auth, async (req, res) => {
    const { sectorId } = req.query;
    const resolvedSectorId = sectorId || req.user.sectorId; //if the `sectorId`, the user's sector ID is used as a fallback.

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
// Inspired by Chatgpt propmt from previous iteration
router.post('/submit-sector-answers', auth, async (req, res) => {
    const { userId, answers, sectorId } = req.body;

    if (!userId || !answers || !Array.isArray(answers) || !sectorId) {
        return res.status(400).json({ error: 'Missing or invalid answers data' });
    }

    try {
        // Fetch all question metadata
        const [questionData] = await db.query('SELECT * FROM questions');
        const questionMap = Object.fromEntries(questionData.map((q) => [q.Question_ID, q.Answer_Type]));

        const answerPromises = answers.map(async (answer) => {
            const answerType = questionMap[answer.questionId];
            let query, queryValues;

            if (answerType === 'yes_no') {
                const responseValue = answer.response === "0" ? 0 : 1; 
                query = `
                    INSERT INTO responses (User_ID, Question_ID, Answer, Sector_ID)
                    VALUES (?, ?, ?, ?)
                    ON DUPLICATE KEY UPDATE Answer = ?, Sector_ID = ?;
                `;
                queryValues = [userId, answer.questionId, responseValue, sectorId, responseValue, sectorId];
            } else if (answerType === 'text') {
                // Check scoring rules for keyword or regex matches
                // Inspired Source: https://forum.freecodecamp.org/t/nodejs-async-await-mysql-query-select-problem/410085/2
                const [rules] = await db.query(
                    `SELECT Score_Impact 
                     FROM scoring_rules 
                     WHERE Question_ID = ? 
                     AND Match_Type IN ('keyword', 'regex') 
                     AND ? LIKE CONCAT('%', Answer_Value, '%')`,
                    [answer.questionId, answer.response]
                );

                // Default score is 0 if no rule matches
                // Inspired Source: https://dev.mysql.com/doc/refman/8.0/en/insert-on-duplicate.html
                const responseValue = rules.length ? parseFloat(rules[0].Score_Impact) : 0;

                query = `
                    INSERT INTO responses (User_ID, Question_ID, Answer, Processed_Value, Sector_ID)
                    VALUES (?, ?, ?, ?, ?)
                    ON DUPLICATE KEY UPDATE Answer = ?, Processed_Value = ?, Sector_ID = ?;
                `;
                queryValues = [
                    userId,
                    answer.questionId,
                    responseValue, // Scored numeric value or 0 if no match
                    answer.response, // Original text response
                    sectorId,
                    responseValue,
                    answer.response,
                    sectorId,
                ];
            } else if (answerType === 'multiple_choice') {
                // Fetch the numeric value (Score_Impact) for the MCQ response
                const [rules] = await db.query(
                    'SELECT Score_Impact FROM scoring_rules WHERE Question_ID = ? AND Answer_Value = ?',
                    [answer.questionId, answer.response]
                );
             //Error handling for invalid data
             // https://stackoverflow.com/questions/75014916/error-handling-array-map-is-not-a-function
                if (!rules.length) {
                    throw new Error(`Invalid multiple-choice response: ${answer.response} for Question_ID: ${answer.questionId}`);
                }

                const responseValue = rules[0].Score_Impact; // Numeric value for scoring

                query = `
                    INSERT INTO responses (User_ID, Question_ID, Answer, Processed_Value, Sector_ID)
                    VALUES (?, ?, ?, ?, ?)
                    ON DUPLICATE KEY UPDATE Answer = ?, Processed_Value = ?, Sector_ID = ?;
                `;
                queryValues = [
                    userId,
                    answer.questionId,
                    responseValue, 
                    answer.response, 
                    sectorId,
                    responseValue,
                    answer.response,
                    sectorId,
                ];
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

module.exports = router;
