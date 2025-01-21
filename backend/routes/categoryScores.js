const express = require('express');
const db = require('../db'); // Your database connection
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/category-scores', auth, async (req, res) => {
    const { userId } = req.query;

    if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
    }

    console.log('Received request for category scores with userId:', userId); // Debugging log

    try {
        const query = `
        SELECT 
            c.Category_Name,
            SUM(r.Answer * q.Score_Weight) AS UserScore,
            SUM(sr.Max_Value * q.Score_Weight) AS MaxScore
        FROM 
            responses r
        JOIN 
            questions q ON r.Question_ID = q.Question_ID
        JOIN 
            categories c ON q.Category_ID = c.Category_ID
        LEFT JOIN 
            scoring_rules sr ON sr.Question_ID = q.Question_ID
        WHERE 
            r.User_ID = ?
            AND c.Category_Name IN ('Governance', 'Incident Response', 'Supply Chain Security', 'Third Party Risk Management')
        GROUP BY 
            c.Category_Name;
    `;
        console.log('Running query:', query); // Debugging log

        const [categoryScores] = await db.query(query, [userId]);
        console.log('Query result:', categoryScores); // Debugging log

        const normalizedScores = categoryScores.map((category) => ({
            category: category.Category_Name,
            percentage: category.MaxScore ? (category.UserScore / category.MaxScore) * 100 : 0,
        }));

        console.log('Normalized Scores:', normalizedScores); // Debugging log
        res.json(normalizedScores);
    } catch (err) {
        console.error('Error fetching category scores:', err);
        res.status(500).json({ error: 'Failed to fetch category scores' });
    }
});


module.exports = router;
