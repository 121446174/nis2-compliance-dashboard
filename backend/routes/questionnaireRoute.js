// routes/questionnaireRoute.js

const express = require('express');
const db = require('../db'); // Database connection module
const auth = require('../middleware/auth'); // Auth middleware

const router = express.Router();

// Route to fetch questions based on classification and category
router.get('/questions', auth, async (req, res) => {
    const { classificationType, categoryId } = req.query;

    if (!classificationType || !categoryId) {
        return res.status(400).json({ error: 'Missing classificationType or categoryId' });
    }

    try {
        const [results] = await db.query(
            `SELECT * FROM questions 
             WHERE Classification_Type = ? AND Category_ID = ? 
             ORDER BY Question_ID`,
            [classificationType, categoryId]
        );
        res.json(results);
    } catch (err) {
        console.error('Error fetching questions:', err);
        res.status(500).json({ error: 'An error occurred while fetching questions' });
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
        const questionMap = Object.fromEntries(questionData.map(q => [q.Question_ID, q.Answer_Type]));

        const answerPromises = answers.map(answer => {
            const answerType = questionMap[answer.questionId];
            let query, queryValues;

            if (answerType === 'yes_no') {
                const responseValue = (typeof answer.response === 'string' && answer.response.toLowerCase() === 'yes') ? 1 : 0;
                query = 'INSERT INTO responses (User_ID, Question_ID, Answer, Category_ID) VALUES (?, ?, ?, ?)';
                queryValues = [userId, answer.questionId, responseValue, categoryId];
            } else if (answerType === 'text') {
                query = 'INSERT INTO responses (User_ID, Question_ID, Text_Answer, Category_ID) VALUES (?, ?, ?, ?)';
                queryValues = [userId, answer.questionId, answer.response, categoryId];
            } else if (answerType === 'multiple_choice') {
                const responseValue = mapChoiceToScore(answer.response);
                query = 'INSERT INTO responses (User_ID, Question_ID, Answer, Category_ID) VALUES (?, ?, ?, ?)';
                queryValues = [userId, answer.questionId, responseValue, categoryId];
            } else if (answerType === 'numeric') {
                const responseValue = parseInt(answer.response, 10);
                query = 'INSERT INTO responses (User_ID, Question_ID, Answer, Category_ID) VALUES (?, ?, ?, ?)';
                queryValues = [userId, answer.questionId, responseValue, categoryId];
            } else {
                console.error(`Unknown answer type for question ${answer.questionId}`);
                throw new Error(`Unsupported answer type for question ID: ${answer.questionId}`);
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

// Helper function to map multiple-choice answers to scores
function mapChoiceToScore(choice) {
    const scoreMap = {
        "High": 3,
        "Medium": 2,
        "Low": 1
    };
    return scoreMap[choice] || 0;
}

module.exports = router;
