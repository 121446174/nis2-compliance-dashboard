const express = require('express');
const pool = require('../db'); 
const auth = require('../middleware/auth');

const router = express.Router();

// 1. Extract and Check User
// Inspired Reference: MernStackdev: Post Requests 
router.post('/score/calculate', auth, async (req, res) => {
    const { userId } = req.body;

    if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
    }

    // 2. Connect DB 
    // Reference: GitHub 'using transaction with promise connection'
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        // 3. Fetch responses for the given user
       // Inspired Reference: GitHub - Performing Queries in MySQL Node.js Library
        const [responses] = await connection.query(
            'SELECT Question_ID, Answer, Text_Answer FROM responses WHERE User_ID = ?', //Retrieve fields filtered b User_ID
            [userId]
        );

        console.log('Responses fetched for risk score calculation:', responses);

        let totalScore = 0; // Total Score of users answers
        let maxPossibleScore = 0; // Track the highest possible score (for accuracy)

        for (const response of responses) {
            if (response.Answer !== null) {
                
        // 4. Fetch scoring rules and question weight using SQL JOINs with aliases 
        // Reference: Programiz - SQL JOIN With AS Alias
                const [rules] = await connection.query(
                    `SELECT sr.Score_Impact, sr.Max_Value, q.Score_Weight
                     FROM scoring_rules sr
                     JOIN questions q ON sr.Question_ID = q.Question_ID
                     WHERE sr.Question_ID = ? AND sr.Answer_Value = ?`,
                    [response.Question_ID, response.Answer]
                );

        // 5. Calculate total score and max score with weight
        // Inspired Reference: JavaScript parseFloat() Method
        // https://flexiple.com/javascript/parsefloat-method
                for (const rule of rules) {
                    totalScore += (parseFloat(rule.Score_Impact || 0) * parseFloat(rule.Score_Weight || 1));
                    maxPossibleScore += (parseFloat(rule.Max_Value || 0) * parseFloat(rule.Score_Weight || 1));
                }
            } else if (response.Text_Answer) {

        // 6. Ensure that text-based answers are scored dynamically by matching predefined keywords.
        // Reference: Programiz - SQL JOIN With AS Alias
        // URL: https://www.programiz.com/sql/join
                const [rules] = await connection.query(
                    `SELECT sr.Score_Impact, sr.Max_Value, q.Score_Weight
                     FROM scoring_rules sr
                     JOIN questions q ON sr.Question_ID = q.Question_ID
                     WHERE sr.Question_ID = ? AND sr.Match_Type = 'keyword' AND ? LIKE CONCAT('%', sr.Answer_Value, '%')`,
                    [response.Question_ID, response.Text_Answer]
                );

        // Calculate total score and max score with weight
        // Inspired Reference: JavaScript parseFloat() Method
        // https://flexiple.com/javascript/parsefloat-method
                for (const rule of rules) {
                    totalScore += (parseFloat(rule.Score_Impact || 0) * parseFloat(rule.Score_Weight || 1));
                    maxPossibleScore += (parseFloat(rule.Max_Value || 0) * parseFloat(rule.Score_Weight || 1));
                }
            }
        }

        console.log('Total Score:', totalScore, 'Max Possible Score:', maxPossibleScore);

        // 7. Ensure totalScore does not exceed maxPossibleScore
        // Reference: MDM Web Docs - Math.min()
        //https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/min
        totalScore = Math.min(totalScore, maxPossibleScore);

        // Normalise the score >0 (calculate percentage) <= 0: Set the normalisedScore to 0
        const normalizedScore = maxPossibleScore > 0 ? (totalScore / maxPossibleScore) * 100 : 0;

        // 8. Map the score to a risk level
        // Reference: Programiz - SQL BETWEEN Operator
        //https://www.programiz.com/sql/between-operator
        const [riskLevel] = await connection.query(
            'SELECT Risk_Level FROM risk_levels WHERE ? BETWEEN Min_Score AND Max_Score',
            [totalScore]
        );
        const level = riskLevel[0]?.Risk_Level || 'Unknown';

        console.log('Risk Level:', level);

        // 9. Save the score in the database
        // Inspired by Stack Overflow - Async/Await for MySQL Transactions in Node.js
        // Source: https://stackoverflow.com/questions/59749045/cant-use-async-await-to-mysql-transaction-using-nodejs
        await connection.query(
            `INSERT INTO risk_score (User_ID, Score_Value, Max_Value, Risk_Level)
             VALUES (?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE
             Score_Value = VALUES(Score_Value),
             Max_Value = VALUES(Max_Value),
             Risk_Level = VALUES(Risk_Level)`,
            [userId, totalScore, maxPossibleScore, level]
        );
        

        console.log('Risk score saved successfully for User ID:', userId);

        await connection.commit();
        res.json({ totalScore, maxPossibleScore, normalizedScore, riskLevel: level });
    } catch (err) {
        await connection.rollback();
        console.error('Error calculating risk score:', err);
        res.status(500).json({ error: 'Failed to calculate risk score' });
    } finally {
        connection.release();
    }
});

// 10. Retrieves all risk levels from the database
// Inspired Reference: MDN Web Docs - Express Routing
// Source: https://developer.mozilla.org/en-US/docs/Learn/Server-side/Express_Nodejs/routes
router.get('/levels', async (req, res) => {
    try {
        const [levels] = await pool.query('SELECT * FROM risk_levels ORDER BY Min_Score ASC');
        res.json(levels);
    } catch (err) {
        console.error('Error fetching risk levels:', err);
        res.status(500).json({ error: 'Failed to fetch risk levels' });
    }
});

module.exports = router;
