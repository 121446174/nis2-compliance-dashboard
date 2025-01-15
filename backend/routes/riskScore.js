const express = require('express');
const pool = require('../db'); // Database connection
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/score/calculate', auth, async (req, res) => {
    const { userId } = req.body;

    if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
    }

    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        // Step 1: Fetch responses for the given user
        const [responses] = await connection.query(
            'SELECT Question_ID, Answer, Text_Answer FROM responses WHERE User_ID = ?',
            [userId]
        );

        console.log('Responses fetched for risk score calculation:', responses);

        let totalScore = 0; // Ensure this is initialized as a number

for (const response of responses) {
    if (response.Answer !== null) {
        const [rules] = await connection.query(
            'SELECT Score_Impact FROM scoring_rules WHERE Question_ID = ? AND Answer_Value = ?',
            [response.Question_ID, response.Answer]
        );
        totalScore += rules.reduce((sum, rule) => sum + parseFloat(rule.Score_Impact || 0), 0); // Parse as float
    } else if (response.Text_Answer) {
        const [rules] = await connection.query(
            `SELECT Score_Impact FROM scoring_rules
             WHERE Question_ID = ? AND Match_Type = 'keyword' AND ? LIKE CONCAT('%', Answer_Value, '%')`,
            [response.Question_ID, response.Text_Answer]
        );
        totalScore += rules.reduce((sum, rule) => sum + parseFloat(rule.Score_Impact || 0), 0); // Parse as float
    }
}

        
console.log('Total calculated score before clamping:', totalScore);

// Clamp totalScore to fit within decimal(5,2)
totalScore = Math.min(totalScore, 999.99);

console.log('Total calculated score after clamping:', totalScore);

        // Step 3: Map the score to a risk level
        const [riskLevel] = await connection.query(
            'SELECT Risk_Level FROM risk_levels WHERE ? BETWEEN Min_Score AND Max_Score',
            [totalScore]
        );
        const level = riskLevel[0]?.Risk_Level || 'Unknown';

        console.log('Risk Level:', level);

        // Step 4: Save the score in the database
        await connection.query(
            `INSERT INTO risk_score (User_ID, Score_Value, Risk_Level)
             VALUES (?, ?, ?)
             ON DUPLICATE KEY UPDATE Score_Value = ?, Risk_Level = ?`,
            [userId, totalScore, level, totalScore, level]
        );

        console.log('Risk score saved successfully for User ID:', userId);

        await connection.commit();
        res.json({ totalScore, riskLevel: level });
    } catch (err) {
        await connection.rollback();
        console.error('Error calculating risk score:', err);
        res.status(500).json({ error: 'Failed to calculate risk score' });
    } finally {
        connection.release();
    }
});

module.exports = router;

