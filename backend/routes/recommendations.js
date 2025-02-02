const express = require('express');
const pool = require('../db');
const auth = require('../middleware/auth');
const router = express.Router();


// LOG EVERY REQUEST HERE (INCLUDING INVALID ONES)
router.use((req, res, next) => {
    console.log(`Incoming request: ${req.method} ${req.originalUrl}`);
    console.log(`Auth Header: ${req.headers.authorization}`);
    next();
});

// Recommendations for user
router.get('/:userId', auth, async (req, res) => {
const { userId } = req.params;
    console.log(`Fetching recommendations for User ID: ${userId}`);


    try {
        // 1. Verify if the user exists
        console.log(`🔍 Checking if User ID ${userId} exists in the database...`);
        const [userCheck] = await pool.query(`SELECT * FROM user WHERE user_id = ?`, [userId]);

        if (userCheck.length === 0) {
            console.log(`ERROR: User ID ${userId} not found!`);
            return res.status(404).json({ error: 'User not found' });
        }
        console.log(`User ID ${userId} exists:`, userCheck);


        // 2. Check category risk levels
        console.log(`🔍 Retrieving category risk levels for User ID ${userId}...`);
        const [categoryRisks] = await pool.query(
            `SELECT cs.category_id, cs.risk_level, c.category_name 
            FROM category_scores cs
            JOIN categories c ON cs.category_id = c.category_id
            WHERE cs.user_id = ?`, [userId]
        );
        console.log(`📊 Category Risks for User ID ${userId}:`, categoryRisks);

        let recommendations = [];

        // 3️⃣ Fetch Category-Based Recommendations
        for (const { category_id, risk_level, category_name } of categoryRisks) {
            console.log(`🔍 Fetching recommendations for Category ID: ${category_id}, Risk Level: ${risk_level}`);
            const [categoryRecs] = await pool.query(`
                SELECT r.*, ? AS category_name
                FROM recommendations r
                WHERE r.category_id = ? AND r.risk_level = ?`, 
                [category_name, category_id, risk_level]
            );
            recommendations.push(...categoryRecs);
        }

        // 4️⃣ Fetch Trigger-Based Recommendations
        console.log(`🔍 Fetching trigger-based recommendations for User ID ${userId}...`);
        const [triggerRecs] = await pool.query(`
            SELECT r.*, c.category_name 
            FROM recommendations r
            JOIN responses res ON r.question_id = res.question_id
            LEFT JOIN questions q ON r.question_id = q.question_id
            LEFT JOIN categories c ON q.category_id = c.category_id
            WHERE res.user_id = ? AND res.answer = 1`, 
            [userId]
        );
        recommendations.push(...triggerRecs);

        // 5️⃣ Fetch Sector-Based Recommendations
        console.log(`🔍 Checking user sector for User ID ${userId}...`);
        const [userSector] = await pool.query(`SELECT sector_id FROM user WHERE user_id = ?`, [userId]);

        if (userSector.length > 0 && userSector[0].sector_id) {
            const sectorId = userSector[0].sector_id;
            console.log(`🌍 Fetching sector-specific recommendations for Sector ID: ${sectorId}`);
            const [sectorRecs] = await pool.query(`
                SELECT r.*, 'Sector-Specific' AS category_name 
                FROM recommendations r
                WHERE r.sector_id = ?`, 
                [sectorId]
            );
            recommendations.push(...sectorRecs);
        }

        // ✅ Remove Duplicates
        const uniqueRecommendations = Array.from(new Map(
            recommendations.map(rec => [rec.recommendation_text, rec])
        ).values());

        console.log(`✅ Final Recommendations for User ID ${userId}:`, uniqueRecommendations);
        return res.json(uniqueRecommendations);

    } catch (err) {
        console.error(`ERROR: Failed to fetch recommendations for User ID ${userId}:`, err);
        res.status(500).json({ error: 'Failed to fetch recommendations' });
    }
});

module.exports = router;