const express = require('express');
const db = require('../db');
const auth = require('../middleware/auth');

const router = express.Router();

// 1) Define a GET route at the '/category-scores' endpoint
// Inspired Reference: MernStackdev - Handling Express API Endpoints
router.get('/category-scores', auth, async (req, res) => {
    const { userId } = req.query;
    if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
    }

     // Calculates scores for a specific user across four predefined categories 
    // Source Chatgpt Prompt Available in README.md
    try {
        // 2) Fetch risk levels dynamically from the DB
        // Inspired Reference: Performing Queries in MySQL Node.js Library - GitHub
        const [riskLevels] = await db.query('SELECT * FROM risk_levels ORDER BY Min_Score ASC');

        // 3) Fetch category scores for the user
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

        // Executes the query string using db.query and passes the userId as a parameter to the query.
       //Inspired Reference: GitHub - Performing Queries in MySQL Node.js Library
        const [categoryScores] = await db.query(query, [userId]);

        const results = [];
       
        // 4) Loop through category scores and calculate percentage
        // Inspired Reference: JavaScript for...of Loop - MDN Web Docs - MDM https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for...of
        for (const category of categoryScores) { // user scores for different categories.
            const categoryId = category.Category_ID; // ID of the category.
            const categoryName = category.Category_Name; // 
            const userScore = category.UserScore || 0;
            const maxScore = category.MaxScore || 1; // Prevent division by zero
            const percentage = (userScore / maxScore) * 100; 

             // 5) Determine risk level dynamically from `risk_levels` table
            // Inspired Reference: "JavaScript for...of Loop - MDN Web Docs = https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for...of
            let riskLevel = 'low'; 
            for (const level of riskLevels) {
                if (percentage >= level.Min_Score && percentage <= level.Max_Score) {
                    riskLevel = level.Risk_Level;
                    break;
                }
            }

            // 6) Store or update the score in `category_scores`
            // Inspired Reference: MySQL INSERT ON DUPLICATE KEY UPDATE - https://dev.mysql.com/doc/refman/8.0/en/insert-on-duplicate.html
            await db.query(
                `INSERT INTO category_scores (user_id, category_id, score, risk_level, calculated_at)
                 VALUES (?, ?, ?, ?, NOW())
                 ON DUPLICATE KEY UPDATE
                   score = VALUES(score),
                   risk_level = VALUES(risk_level),
                   calculated_at = VALUES(calculated_at)`,
                [userId, categoryId, percentage, riskLevel]
            );

            // 7) Add the result for API response
            results.push({
                category: categoryName,
                percentage: percentage.toFixed(2), // Round to 2 decimal places https://stackoverflow.com/questions/8522673/make-a-number-a-percentage
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