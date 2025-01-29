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
// Inspired by Chatgpt prompt from previous iteration
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

        const answerPromises = answers.map(async (answer) => {
            const answerType = questionMap[answer.questionId];
            let query = null; // Ensure query is initialized
            let queryValues = []; // Ensure queryValues is always an array

            if (answerType === 'yes_no') {
                const responseValue = answer.response === "0" ? 0 : 1; 
                query = `
                    INSERT INTO responses (User_ID, Question_ID, Answer, Sector_ID)
                    VALUES (?, ?, ?, ?)
                    ON DUPLICATE KEY UPDATE Answer = ?, Sector_ID = ?;
                `;
                queryValues = [userId, answer.questionId, responseValue, sectorId, responseValue, sectorId];

            } else if (answerType === 'text') {
                // Fetch scoring rules for the question
                 // Check scoring rules for keyword or regex matches
                // Inspired Source: https://forum.freecodecamp.org/t/nodejs-async-await-mysql-query-select-problem/410085/2
                const [rules] = await db.query(`
                    SELECT Score_Impact, Answer_Value
                    FROM scoring_rules
                    WHERE Question_ID = ?
                      AND Match_Type = 'keyword'
                `, [answer.questionId]);

                console.log('Rules fetched for Question_ID:', answer.questionId, rules);

                // Default score is 0 if no rule matches
                // Inspired Source: https://dev.mysql.com/doc/refman/8.0/en/insert-on-duplicate.html
                let maxImpact = 0;
                const userResponseLower = answer.response ? answer.response.toLowerCase() : '';

                // Ensure user response exists
                if (!userResponseLower) {
                    console.error('User response is missing or empty for Question_ID:', answer.questionId);
                    throw new Error('Invalid user response');
                }

                for (const rule of rules) {
                    // Fetch synonyms for the keyword from the database
                    //REFERENCE
                    const [synonymResults] = await db.query(`
                        SELECT Synonym FROM synonyms WHERE Keyword = ? AND Question_ID = ?
                    `, [rule.Answer_Value, answer.questionId]); //  Ensuring synonyms are for the correct question

                    console.log(`Synonyms for "${rule.Answer_Value}":`, synonymResults);

                    const syns = synonymResults.map(row => row.Synonym);
                    syns.push(rule.Answer_Value); // Include the original keyword

                    for (const candidate of syns) {
                        if (userResponseLower.includes(candidate.toLowerCase())) {
                            console.log(`Match found: ${candidate}`);
                            maxImpact = Math.max(maxImpact, parseFloat(rule.Score_Impact));
                            break; // Stop checking once a match is found
                        }
                    }
                }

                console.log('Max Impact for Question_ID:', answer.questionId, 'is:', maxImpact);

                // Ensure query is defined before executing
                query = `
                  INSERT INTO responses (User_ID, Question_ID, Answer, Processed_Value, Sector_ID)
                  VALUES (?, ?, ?, ?, ?)
                  ON DUPLICATE KEY UPDATE Answer = ?, Processed_Value = ?, Sector_ID = ?;
                `;
                queryValues = [userId, answer.questionId, maxImpact, answer.response, sectorId, maxImpact, answer.response, sectorId];

                console.log('Query values for text response:', queryValues);

            } else if (answerType === 'multiple_choice') {
                // Fetch the numeric value (Score_Impact) for the MCQ response
                const [rules] = await db.query(`
                    SELECT Score_Impact FROM scoring_rules
                    WHERE Question_ID = ? AND LOWER(Answer_Value) = LOWER(?)
                `, [answer.questionId, answer.response]);
             //Error handling for invalid data
             // https://stackoverflow.com/questions/75014916/error-handling-array-map-is-not-a-function
                if (!rules.length) {
                    console.error(`Invalid MCQ response: ${answer.response} for Question_ID: ${answer.questionId}`);
                    throw new Error(`Invalid multiple-choice response: ${answer.response} for Question_ID: ${answer.questionId}`);
                }

                const responseValue = rules[0].Score_Impact;
                query = `
                    INSERT INTO responses (User_ID, Question_ID, Answer, Processed_Value, Sector_ID)
                    VALUES (?, ?, ?, ?, ?)
                    ON DUPLICATE KEY UPDATE Answer = ?, Processed_Value = ?, Sector_ID = ?;
                `;
                queryValues = [userId, answer.questionId, responseValue, answer.response, sectorId, responseValue, answer.response, sectorId];

            } else if (answerType === 'numeric') {
                const responseValue = parseInt(answer.response, 10);
                query = `
                    INSERT INTO responses (User_ID, Question_ID, Answer, Sector_ID)
                    VALUES (?, ?, ?, ?)
                    ON DUPLICATE KEY UPDATE Answer = ?, Sector_ID = ?;
                `;
                queryValues = [userId, answer.questionId, responseValue, sectorId, responseValue, sectorId];
            }

            //  Ensure query and queryValues exist before running the query
            if (query && queryValues.length > 0) {
                return db.query(query, queryValues);
            } else {
                console.error(`Skipping invalid query for Question_ID: ${answer.questionId}`);
                return Promise.resolve(); // Prevents errors when query is undefined
            }
        });

        await Promise.all(answerPromises);
        res.json({ success: true, message: 'Sector-specific answers saved successfully' });
    } catch (err) {
        console.error('Error saving sector-specific answers:', err);
        res.status(500).json({ error: 'An error occurred while saving sector-specific answers' });
    }
});

module.exports = router;
