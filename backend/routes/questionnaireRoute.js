const express = require('express');
const db = require('../db'); 
const auth = require('../middleware/auth'); 

const router = express.Router();

// Route to fetch questions based on classification and category
// Inspired Source: Mozilla Developer Network (MDN)
// URL: Express Tutorial Part 4: Routes and Controllers
router.get('/questions', auth, async (req, res) => {
    const { classificationType, categoryId } = req.query;

    if (!classificationType) {
        return res.status(400).json({ error: 'Missing classificationType' });
    }

    try {
        const query = `
            SELECT * FROM questions 
            WHERE Classification_Type = ? 
            ${categoryId ? 'AND Category_ID = ?' : ''}
            ORDER BY Question_ID
        `;
        const queryParams = categoryId ? [classificationType, categoryId] : [classificationType];

        const [questions] = await db.query(query, queryParams);
        res.json(questions);
    } catch (err) {
        console.error('Error fetching questions:', err);
        res.status(500).json({ error: 'An error occurred while fetching questions' });
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
// Inspired Source: ChatGPT, Node.js/Express Questionnaire Submission Route
// Prompt in READMEFILE
router.post('/submit-answers', auth, async (req, res) => {
    const { userId, answers, categoryId } = req.body;

    if (!userId || !answers || !Array.isArray(answers) || !categoryId) {
        return res.status(400).json({ error: 'Missing or invalid answers data' });
    }

    try {
        const [questionData] = await db.query('SELECT * FROM questions');
        const questionMap = Object.fromEntries(questionData.map((q) => [q.Question_ID, q.Answer_Type]));

        const answerPromises = answers.map((answer) => {
            const answerType = questionMap[answer.questionId];
            let query, queryValues;

            if (answerType === 'yes_no') {
                // Updated logic for Yes = 0, No = 1
                const responseValue = answer.response === "0" ? 0 : 1; // Explicitly check for "0" or "1"
                query = 'INSERT INTO responses (User_ID, Question_ID, Answer, Category_ID) VALUES (?, ?, ?, ?)';
                queryValues = [userId, answer.questionId, responseValue, categoryId];
            } else if (answerType === 'text') {
                // Handle text answers
                query = 'INSERT INTO responses (User_ID, Question_ID, Text_Answer, Category_ID) VALUES (?, ?, ?, ?)';
                queryValues = [userId, answer.questionId, answer.response, categoryId];
            } else if (answerType === 'multiple_choice') {
                // Handle multiple-choice answers
                const responseValue = mapChoiceToScore(answer.response);
                query = 'INSERT INTO responses (User_ID, Question_ID, Answer, Category_ID) VALUES (?, ?, ?, ?)';
                queryValues = [userId, answer.questionId, responseValue, categoryId];
            } else if (answerType === 'numeric') {
                // Handle numeric answers
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

// Helper function for multiple choice scoring
// Inpsired Source: Working with objects
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map
// Modifications -  Created a scoreMap object for predefined choices.
function mapChoiceToScore(choice) {
    const scoreMap = { High: 3, Medium: 2, Low: 1 };
    return scoreMap[choice] || 0;
}

module.exports = router;
