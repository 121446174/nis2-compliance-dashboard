const express = require('express');
const db = require('../db');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/category-scores', auth, async (req, res) => {
    const { userId } = req.query;
    if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
    }

    try {
        // 1) Fetch risk levels dynamically from the DB
        const [riskLevels] = await db.query('SELECT * FROM risk_levels ORDER BY Min_Score ASC');

        // 2) Fetch category scores for the user
        const query = `
            SELECT 
                c.Category_ID,
                c.Category_Name,
                SUM(r.Answer * q.Score_Weight) AS UserScore,
                SUM(sr.Max_Value * q.Score_Weight) AS MaxScore
            FROM responses r
            JOIN questions q ON r.Question_ID = q.Question_ID
            JOIN categories c ON q.Category_ID = c.Category_ID
            LEFT JOIN scoring_rules sr ON sr.Question_ID = q.Question_ID
            WHERE r.User_ID = ?
            GROUP BY c.Category_ID, c.Category_Name;
        `;

        const [categoryScores] = await db.query(query, [userId]);

        const results = [];

        for (const category of categoryScores) {
            const categoryId = category.Category_ID;
            const categoryName = category.Category_Name;
            const userScore = category.UserScore || 0;
            const maxScore = category.MaxScore || 1; // Prevent division by zero
            const percentage = (userScore / maxScore) * 100; 

            // 3) Determine risk level dynamically from the `risk_levels` table
            let riskLevel = 'Unknown';
            for (const level of riskLevels) {
                if (percentage >= level.Min_Score && percentage <= level.Max_Score) {
                    riskLevel = level.Risk_Level;
                    break;
                }
            }

            // 4) Store or update the score in `category_scores`
            await db.query(
                `INSERT INTO category_scores (user_id, category_id, score, risk_level, calculated_at)
                 VALUES (?, ?, ?, ?, NOW())
                 ON DUPLICATE KEY UPDATE
                   score = VALUES(score),
                   risk_level = VALUES(risk_level),
                   calculated_at = VALUES(calculated_at)`,
                [userId, categoryId, percentage, riskLevel]
            );

            // 5) Add the result for API response
            results.push({
                category: categoryName,
                percentage: percentage.toFixed(2),
                riskLevel: riskLevel
            });
        }

        res.json(results);
    } catch (err) {
        console.error('Error calculating or storing category scores:', err);
        res.status(500).json({ error: 'Failed to calculate/store category scores' });
    }
});

module.exports = router;