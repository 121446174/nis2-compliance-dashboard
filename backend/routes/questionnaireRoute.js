const express = require('express');
const db = require('../db');
const auth = require('../middleware/auth');

const router = express.Router();

// Route to fetch questions based on classification and category
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

        // Query for sector-specific questions
        const sectorSpecificQuery = `
            SELECT * 
            FROM questions
            WHERE Classification_Type = 'Sector-Specific'
            AND Sector_ID = ?
            ${categoryId ? 'AND Category_ID = ?' : ''}
        `;

        const queryParams = [];
        if (categoryId) {
            queryParams.push(categoryId);
        }

        // Execute both queries
        const [essentialAndImportantQuestions] = await db.query(
            essentialAndImportantQuery,
            categoryId ? queryParams : []
        );

        const [sectorSpecificQuestions] = await db.query(
            sectorSpecificQuery,
            categoryId ? [sectorId, ...queryParams] : [sectorId]
        );

        // Combine results
        const allQuestions = [
            ...essentialAndImportantQuestions,
            ...sectorSpecificQuestions,
        ];

        // Respond with all questions
        res.json(allQuestions);
    } catch (err) {
        console.error('Error fetching questions:', err);
        res.status(500).json({ error: 'Error fetching questions' });
    }
});

// Route to fetch categories based on classification
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
                query = 'INSERT INTO responses (User_ID, Question_ID, Text_Answer, Category_ID) VALUES (?, ?, ?, ?)';
                queryValues = [userId, answer.questionId, answer.response, categoryId];
            } else if (answerType === 'multiple_choice') {
                // Fetch numeric value for the user's choice
                const [rule] = await db.query(
                    'SELECT Score_Impact FROM scoring_rules WHERE Question_ID = ? AND Answer_Value = ?',
                    [answer.questionId, answer.response]
                );

                if (!rule || rule.length === 0) {
                    throw new Error(`Invalid multiple-choice response: ${answer.response} for Question_ID: ${answer.questionId}`);
                }

                const responseValue = rule[0].Score_Impact; // Numeric value from scoring rules
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
