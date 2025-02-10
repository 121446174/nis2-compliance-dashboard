const express = require('express');
const db = require('../db'); // Database connection
const auth = require('../middleware/auth'); // Authentication middleware
const router = express.Router();

// Middleware: Check if user is admin
router.use(auth, async (req, res, next) => {
    try {
        const [user] = await db.query("SELECT isAdmin FROM user WHERE User_ID = ?", [req.user.userId]);
        if (!user.length || !user[0].isAdmin) {
            return res.status(403).json({ error: "Access denied. Admins only." });
        }
        next();
    } catch (err) {
        console.error("Admin Check Error:", err);
        res.status(500).json({ error: "Error verifying admin status" });
    }
});

// 1️⃣ Get all questions for the Admin
router.get('/questions', async (req, res) => {
    try {
        console.log("🔹 Admin Questions API Hit");

        const [questions] = await db.query(`
            SELECT q.Question_ID, q.Question_Text, q.Category_ID, q.Answer_Type, 
       q.Classification_Type, q.Sector_ID, s.Sector_Name
FROM questions q
LEFT JOIN sector s ON q.Sector_ID = s.Sector_ID
        `);

        console.log("✅ Questions fetched:", questions.length);
        res.json(questions);
    } catch (err) {
        console.error('❌ Error fetching questions:', err.message); // Logs actual error
        res.status(500).json({ error: 'Error fetching questions', details: err.message });
    }
});


// 2️⃣ Add a new question
router.post('/questions', async (req, res) => {
    const { question_text, category_id, classification_type, answer_type, sector_id } = req.body;

    if (!question_text || !category_id || !classification_type || !answer_type) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    try {
        await db.query(
            `INSERT INTO questions (Question_Text, Category_ID, Classification_Type, Answer_Type, Sector_ID)
             VALUES (?, ?, ?, ?, ?)`,
            [question_text, category_id, classification_type, answer_type, sector_id || null]
        );
        res.json({ message: "Question added successfully!" });
    } catch (err) {
        console.error('Error adding question:', err);
        res.status(500).json({ error: 'Failed to add question' });
    }
});

// 3️⃣ Edit an existing question
router.put('/questions/:id', async (req, res) => {
    const { question_text, category_id, classification_type, answer_type, sector_id } = req.body;
    const { id } = req.params;

    if (!question_text || !category_id || !classification_type || !answer_type) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    try {
        await db.query(
            `UPDATE questions 
             SET Question_Text=?, Category_ID=?, Classification_Type=?, Answer_Type=?, Sector_ID=?
             WHERE Question_ID=?`,
            [question_text, category_id, classification_type, answer_type, sector_id || null, id]
        );
        res.json({ message: "Question updated successfully!" });
    } catch (err) {
        console.error('Error updating question:', err);
        res.status(500).json({ error: 'Failed to update question' });
    }
});

// 4️⃣ Delete a question
router.delete('/questions/:id', async (req, res) => {
    const { id } = req.params;

    try {
        await db.query("DELETE FROM questions WHERE Question_ID=?", [id]);
        res.json({ message: "Question deleted successfully!" });
    } catch (err) {
        console.error('Error deleting question:', err);
        res.status(500).json({ error: 'Failed to delete question' });
    }
});

module.exports = router;
