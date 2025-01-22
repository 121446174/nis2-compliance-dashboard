//Inspired Source: Mozilla Developer Network (MDN)
//Route to fetch questions and categorires.
//URL: https://developer.mozilla.org/en-US/docs/Learn/Server-side/Express_Nodejs/routes


const express = require('express');
const db = require('../db');
const auth = require('../middleware/auth');

const router = express.Router();

// Route to fetch questions based on classification and category
// Mozilla Developer Network (MDN) inspired source "The router.get() method responds to HTTP GET requests at a specific path."
// Execurting query - https://www.honeybadger.io/blog/using-sql-databases-in-javascript/
router.get('/questions', auth, async (req, res) => {
    const { classificationType, categoryId, sectorId } = req.query;

    if (!classificationType || !sectorId) {
        return res.status(400).json({ error: 'Missing classificationType or sectorId' });
    }

    try {
        // Query for essential and important questions
        const essentialAndImportantQuery = `
            SELECT * 
            FROM questions
            WHERE Classification_Type IN ('Essential', 'Important')
            AND Is_Mandatory = 1
            ${categoryId ? 'AND Category_ID = ?' : ''}
        `;

        const queryParams = [];
        if (categoryId) {
            queryParams.push(categoryId);
        }

        // Execute query
        const [essentialAndImportantQuestions] = await db.query(
            essentialAndImportantQuery,
            queryParams
        );

        // Respond with all questions
        //Mozilla Developer Network (MDN) inspired source "Error responses should use res.status() to indicate server errors."
        res.json(essentialAndImportantQuestions);
    } catch (err) {
        console.error('Error fetching questions:', err);
        res.status(500).json({ error: 'Error fetching questions' });
    }
});

// Route to fetch categories based on classification
// Mozilla Developer Network (MDN) inspired source 'Route functions can access query parameters through req.query."
router.get('/categories', auth, async (req, res) => {
    const { classificationType } = req.query;

    if (!classificationType) {
        return res.status(400).json({ error: 'Missing classificationType' });
    }

    try {
        const [categories] = await db.query(
            `SELECT * FROM categories WHERE Classification_Type = ? ORDER BY Category_ID`,
            [classificationType]
        );
        res.json(categories);
    } catch (err) {
        console.error('Error fetching categories:', err);
        res.status(500).json({ error: 'An error occurred while fetching categories' });
    }
});

// Route to submit answers
//Source: ChatGPT - Node.js/Express Questionnaire Submission Route
router.post('/submit-answers', auth, async (req, res) => {
    const { userId, answers, categoryId } = req.body;

    if (!userId || !answers || !Array.isArray(answers) || !categoryId) {
        return res.status(400).json({ error: 'Missing or invalid answers data' });
    }

    try {
        const [questionData] = await db.query('SELECT * FROM questions');
        const questionMap = Object.fromEntries(questionData.map((q) => [q.Question_ID, q.Answer_Type]));

        const answerPromises = answers.map(async (answer) => {
            const answerType = questionMap[answer.questionId];
            let query, queryValues;

            if (answerType === 'yes_no') {
                const responseValue = answer.response === "0" ? 0 : 1; // Yes = 0, No = 1
                query = 'INSERT INTO responses (User_ID, Question_ID, Answer, Category_ID) VALUES (?, ?, ?, ?)';
                queryValues = [userId, answer.questionId, responseValue, categoryId];
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
                // Default to 0 if no scoring rule matches
                // Inspired Source: https://dev.mysql.com/doc/refman/8.0/en/insert-on-duplicate.html
                const responseValue = rules.length ? parseFloat(rules[0].Score_Impact) : 0;
            
                query = `INSERT INTO responses (User_ID, Question_ID, Answer, Processed_Value, Category_ID) VALUES (?, ?, ?, ?, ?)
                    ON DUPLICATE KEY UPDATE Answer = ?, Processed_Value = ?;
                `;
                queryValues = [ userId, answer.questionId, responseValue, answer.response, categoryId, responseValue, answer.response];
            } else if (answerType === 'multiple_choice') {
                // Fetch numeric value for the user's choice
                // await sync: https://forum.freecodecamp.org/t/nodejs-async-await-mysql-query-select-problem/410085/2
                const [rule] = await db.query(
                    'SELECT Score_Impact FROM scoring_rules WHERE Question_ID = ? AND Answer_Value = ?',
                    [answer.questionId, answer.response]
                );
             //Error handling for invalid data
             // https://stackoverflow.com/questions/75014916/error-handling-array-map-is-not-a-function
                if (!rule || rule.length === 0) {
                    throw new Error(`Invalid multiple-choice response: ${answer.response} for Question_ID: ${answer.questionId}`);
                }

                const responseValue = rule[0].Score_Impact; // Extracts Numeric value from scoring rules
                query = 'INSERT INTO responses (User_ID, Question_ID, Answer, Category_ID, Processed_Value) VALUES (?, ?, ?, ?, ?)';
                queryValues = [userId, answer.questionId, responseValue, categoryId, answer.response];
            } else if (answerType === 'numeric') {
                const responseValue = parseInt(answer.response, 10);
                query = 'INSERT INTO responses (User_ID, Question_ID, Answer, Category_ID) VALUES (?, ?, ?, ?)';
                queryValues = [userId, answer.questionId, responseValue, categoryId];
            }

            return db.query(query, queryValues);
        });

        await Promise.all(answerPromises);
        res.json({ success: true, message: 'Answers saved successfully' });
    } catch (err) {
        console.error('Error saving answers:', err);
        res.status(500).json({ error: 'An error occurred while saving answers' });
    }
});

module.exports = router;
