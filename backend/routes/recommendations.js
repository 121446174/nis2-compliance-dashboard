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


router.get('/:userId', auth, async (req, res) => {
const { userId } = req.params;
    console.log(`📡 [START] Fetching recommendations for User ID: ${userId}`);


    try {
        // 1. Verify if the user exists
        console.log(`🔍 [STEP 1] Checking if User ID ${userId} exists in the database...`);
        const [userCheck] = await pool.query(`SELECT * FROM user WHERE user_id = ?`, [userId]);


        if (userCheck.length === 0) {
            console.log(`🚨 ERROR: User ID ${userId} does NOT exist in the database!`);
            return res.status(404).json({ error: 'User not found' });
        }
        console.log(`✅ User ID ${userId} exists:`, userCheck);


        // 2. Check category risk levels
        console.log(`🔍 [STEP 2] Retrieving risk levels from 'category_scores' for User ID ${userId}...`);
        const [categoryRisks] = await pool.query(`SELECT category_id, risk_level FROM category_scores WHERE user_id = ?`, [userId]);
        console.log(`📊 Retrieved Category Risks for User ID ${userId}:`, categoryRisks);


        // 3️.Get category-based recommendations
        let recommendations = [];
        for (const { category_id, risk_level } of categoryRisks) {
            console.log(`🔍 [STEP 3] Fetching recommendations for Category ID: ${category_id}, Risk Level: ${risk_level}`);
            const [categoryRecs] = await pool.query(`SELECT * FROM recommendations WHERE category_id = ? AND risk_level = ?`, [category_id, risk_level]);
            console.log(`📋 Category Recommendations for Category ${category_id}:`, categoryRecs);
            recommendations.push(...categoryRecs);
        }


        // 4. Get trigger-based recommendations
        console.log(`🔍 [STEP 4] Fetching trigger-based recommendations based on user responses...`);
        const [triggerRecs] = await pool.query(`
            SELECT r.* FROM recommendations r
            JOIN responses res ON r.question_id = res.question_id
            WHERE res.user_id = ? AND res.answer = 1;`, // 1 = High-risk answer (e.g., "No")
            [userId]
        );
        console.log(`Trigger Recommendations for User ID ${userId}:`, triggerRecs);
        recommendations.push(...triggerRecs);
       
        //Get sector-based recommendations
        console.log(`[STEP 5] Checking which sector User ID ${userId} belongs to...`);
        const [userSector] = await pool.query(`SELECT sector_id FROM user WHERE user_id = ?`, [userId]);
        console.log(`User Sector Info:`, userSector);
       
        if (userSector.length > 0 && userSector[0].sector_id) {
            const sectorId = userSector[0].sector_id;
            console.log(`[STEP 6] Fetching sector-based recommendations for Sector ID: ${sectorId}`);
            const [sectorRecs] = await pool.query(`SELECT * FROM recommendations WHERE sector_id = ?`, [sectorId]);
            console.log(`Sector Recommendations for Sector ${sectorId}:`, sectorRecs);
            recommendations.push(...sectorRecs);
        }
       
       // ✅ Remove duplicates based on recommendation_text
const uniqueRecommendations = Array.from(new Map(
    recommendations.map(rec => [rec.recommendation_text, rec])
).values());


console.log(`✅ [COMPLETE] Final (Unique) Recommendations for User ID ${userId}:`, uniqueRecommendations);
return res.json(uniqueRecommendations);


    } catch (err) {
        console.error(`ERROR: Failed to fetch recommendations for User ID ${userId}:`, err);
        res.status(500).json({ error: 'Failed to fetch recommendations' });
 }
});


module.exports = router;
