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

        let totalScore = 0;
        let maxPossibleScore = 0; // Track the highest possible score

        for (const response of responses) {
            if (response.Answer !== null) {
                // Fetch scoring rules for numeric or multiple-choice answers
                const [rules] = await connection.query(
                    `SELECT sr.Score_Impact, sr.Max_Value, q.Score_Weight
                     FROM scoring_rules sr
                     JOIN questions q ON sr.Question_ID = q.Question_ID
                     WHERE sr.Question_ID = ? AND sr.Answer_Value = ?`,
                    [response.Question_ID, response.Answer]
                );

                // Calculate total score and max score with weight
                for (const rule of rules) {
                    totalScore += (parseFloat(rule.Score_Impact || 0) * parseFloat(rule.Score_Weight || 1));
                    maxPossibleScore += (parseFloat(rule.Max_Value || 0) * parseFloat(rule.Score_Weight || 1));
                }
            } else if (response.Text_Answer) {
                // Handle text-based answers
                const [rules] = await connection.query(
                    `SELECT sr.Score_Impact, sr.Max_Value, q.Score_Weight
                     FROM scoring_rules sr
                     JOIN questions q ON sr.Question_ID = q.Question_ID
                     WHERE sr.Question_ID = ? AND sr.Match_Type = 'keyword' AND ? LIKE CONCAT('%', sr.Answer_Value, '%')`,
                    [response.Question_ID, response.Text_Answer]
                );

                // Calculate total score and max score with weight
                for (const rule of rules) {
                    totalScore += (parseFloat(rule.Score_Impact || 0) * parseFloat(rule.Score_Weight || 1));
                    maxPossibleScore += (parseFloat(rule.Max_Value || 0) * parseFloat(rule.Score_Weight || 1));
                }
            }
        }

        console.log('Total Score:', totalScore, 'Max Possible Score:', maxPossibleScore);

        // Clamp totalScore if needed
        totalScore = Math.min(totalScore, maxPossibleScore);

        // Normalize the score for frontend display
        const normalizedScore = maxPossibleScore > 0 ? (totalScore / maxPossibleScore) * 100 : 0;

        // Map the score to a risk level
        const [riskLevel] = await connection.query(
            'SELECT Risk_Level FROM risk_levels WHERE ? BETWEEN Min_Score AND Max_Score',
            [totalScore]
        );
        const level = riskLevel[0]?.Risk_Level || 'Unknown';

        console.log('Risk Level:', level);

        // Save the score in the database
        await connection.query(
            `INSERT INTO risk_score (User_ID, Score_Value, Max_Value, Risk_Level)
             VALUES (?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE Score_Value = ?, Max_Value = ?, Risk_Level = ?`,
            [userId, totalScore, maxPossibleScore, level, totalScore, maxPossibleScore, level]
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

module.exports = router;
