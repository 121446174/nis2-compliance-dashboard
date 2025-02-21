const express = require('express');
const db = require('../db');
const auth = require('../middleware/auth');
const router = express.Router();

// 1. Fetch All Questions (with Category & Sector information)
// Mozilla Developer Network (MDN) inspired source "The router.get() method responds to HTTP GET requests at a specific path."
// Execurting query - https://www.honeybadger.io/blog/using-sql-databases-in-javascript/
router.get('/questions', auth, async (req, res) => {
    try {
        // SQL query: join questions with categories and sectors for display
        const [questions] = await db.query(
            `SELECT 
                q.Question_ID, 
                q.Question_Text, 
                q.Classification_Type, 
                q.Sector_ID, 
                c.Category_ID, 
                c.Category_Name, 
                q.Answer_Type, 
                q.MCQ_Options, 
                s.Sector_Name
             FROM questions q
             LEFT JOIN categories c ON q.Category_ID = c.Category_ID
             LEFT JOIN sector s ON q.Sector_ID = s.Sector_ID
             ORDER BY q.Question_ID DESC`
        );
        console.log(`Fetched ${questions.length} questions`);
        res.json(questions);
    } catch (err) {
        console.error('Error fetching questions:', err);
        res.status(500).json({ error: 'Failed to fetch questions' });
    }
});

// 2. Fetch All Categories
// Inspired by MySQL SELECT JOIN (https://www.w3schools.com/nodejs/nodejs_mysql_join.asp)
// Querying MySQL Efficiently - Stack Overflow (https://stackoverflow.com/questions/63591695/check-if-a-user-exists-node-js-mysql)
router.get('/categories', auth, async (req, res) => {
    try {
        const [categories] = await db.query(
            `SELECT * FROM categories ORDER BY Category_Name ASC`
        );
        console.log(`Fetched ${categories.length} categories`);
        res.json(categories);
    } catch (err) {
        console.error('Error fetching categories:', err);
        res.status(500).json({ error: 'Failed to fetch categories' });
    }
});

// 3. Fetch All Sectors
// Reference: Efficient MySQL Queries (https://www.w3schools.com/nodejs/nodejs_mysql_join.asp)
router.get('/sectors', auth, async (req, res) => {
    try {
        const [sectors] = await db.query(
            `SELECT * FROM sector ORDER BY Sector_Name ASC`
        );
        console.log(`Fetched ${sectors.length} sectors`);
        res.json(sectors);
    } catch (err) {
        console.error('Error fetching sectors:', err);
        res.status(500).json({ error: 'Failed to fetch sectors' });
    }
});

// 4. Add a New Question
// Inspired by Incident Logging (https://mernstackdev.com/post-routes-in-web-development/#validating-data-in-post-requests)
// MySQL Insert Statement Reference (https://dev.mysql.com/doc/refman/8.0/en/insert.html)
// Storing MCQ as a JSON - https://dev.mysql.com/doc/refman/5.7/en/json.html
router.post('/questions', auth, async (req, res) => {
    const { question_text, classification_type, sector_id, category_id, answer_type, mcq_options } = req.body;

    // Validate required fields
    if (!question_text || !classification_type || !category_id || !answer_type) {
        console.error('Missing required fields:', req.body);
        return res.status(400).json({ error: 'Missing required fields' });
    }
    if (classification_type === 'Sector-Specific' && !sector_id) {
        console.error('Sector-Specific questions require a sector_id');
        return res.status(400).json({ error: 'Sector-Specific questions require a sector_id' });
    }

    try {
        const [result] = await db.query(
            `INSERT INTO questions 
             (Question_Text, Classification_Type, Sector_ID, Category_ID, Answer_Type, MCQ_Options)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
                question_text,
                classification_type,
                classification_type === 'Sector-Specific' ? sector_id : null,
                category_id,
                answer_type,
                answer_type === 'multiple_choice' ? mcq_options : null
            ]
        );
        console.log(`New question added with ID ${result.insertId}`);
        res.status(201).json({ message: 'Question added successfully', question_id: result.insertId });
    } catch (err) {
        console.error('Error adding question:', err);
        res.status(500).json({ error: 'Failed to add question' });
    }
});

// 5. Update an Existing Question https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Server-side/Express_Nodejs/routes
// Inspired by Risk Score Updates (https://github.com/mysqljs/mysql)
// SQL UPDATE Query Reference (https://www.programiz.com/sql/update)
router.put('/questions/:id', auth, async (req, res) => {
    const { question_text, classification_type, sector_id, category_id, answer_type, mcq_options } = req.body;
    const { id } = req.params;

    // Validate required fields
    if (!question_text || !classification_type || !category_id || !answer_type) {
        console.error('Missing required fields for update:', req.body);
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        const [result] = await db.query(
            `UPDATE questions 
             SET Question_Text = ?, Classification_Type = ?, Sector_ID = ?, Category_ID = ?, Answer_Type = ?, MCQ_Options = ?
             WHERE Question_ID = ?`,
            [
                question_text,
                classification_type,
                classification_type === 'Sector-Specific' ? sector_id : null,
                category_id,
                answer_type,
                answer_type === 'multiple_choice' ? mcq_options : null,
                id
            ]
        );
        console.log(`Question ID ${id} updated`);
        res.json({ message: 'Question updated successfully' });
    } catch (err) {
        console.error('Error updating question:', err);
        res.status(500).json({ error: 'Failed to update question' });
    }
});

// 6. Delete a Question
// Inspired by Incident Deletion (https://stackoverflow.com/questions/72342532/how-to-modularize-a-delete-route-with-params-in-express)
// MySQL DELETE Reference (https://dev.mysql.com/doc/refman/8.0/en/delete.html)
router.delete('/questions/:id', auth, async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await db.query(
            `DELETE FROM questions WHERE Question_ID = ?`,
            [id]
        );
        if (result.affectedRows === 0) {
            console.warn(`No question found with ID ${id} for deletion`);
            return res.status(404).json({ error: 'Question not found' });
        }
        console.log(`Question ID ${id} deleted`);
        res.json({ message: 'Question deleted successfully', deletedId: id });
    } catch (err) {
        console.error('Error deleting question:', err);
        res.status(500).json({ error: 'Failed to delete question' });
    }
});

module.exports = router;
