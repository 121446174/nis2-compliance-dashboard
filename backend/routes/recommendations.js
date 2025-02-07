const express = require('express');
const pool = require('../db');
const auth = require('../middleware/auth');
const router = express.Router();

// Recommendations for user 
// Inspired Reference:  MDN's "Express Routing" guide from Mozilla Developer Network (MDN) (https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Server-side/Express_Nodejs/routes_)
router.get('/:userId', auth, async (req, res) => {
const { userId } = req.params;
    console.log(`Fetching recommendations for User ID: ${userId}`);

    try {
        // 1. Verify if the user exists prevent unauthorised access 
        //Inspird Reference: StakeOverflow 'Check if user exists node.js mysql' (https://stackoverflow.com/questions/63591695/check-if-a-user-exists-node-js-mysql).
        console.log(`Checking if User ID ${userId} exists in DB`);
        
        // Reference: NetJS Tech - Querying with Connection Pooling (https://www.netjstech.com/2024/07/nodejs-mysql-connection-pool.html)
        const [userCheck] = await pool.query(`SELECT * FROM user WHERE user_id = ?`, [userId]);

        if (userCheck.length === 0) {
            console.log(`ERROR: User ID ${userId} not found!`);
            return res.status(404).json({ error: 'User not found' });
        }
        console.log(`User ID ${userId} exists:`, userCheck);

        // 2. Check category risk levels
        // Inspired Reference: "Node.js MySQL Join" (https://www.w3schools.com/nodejs/nodejs_mysql_join.asp?)
        console.log(`Retrieving category risk levels for User ID ${userId}...`);
        const [categoryRisks] = await pool.query(
            `SELECT cs.category_id, cs.risk_level, c.category_name 
            FROM category_scores cs
            JOIN categories c ON cs.category_id = c.category_id
            WHERE cs.user_id = ?`, [userId]
        );
        console.log(`Category Risks for User ID ${userId}:`, categoryRisks);

        let recommendations = [];  // Empty Array to store recommendations (https://www.justacademy.co/blog-detail/how-to-declare-empty-array-in-javascript#:~:text=In%20JavaScript%2C%20declaring%20an%20empty,have%20any%20initial%20values%20yet.)

        // 3️. Fetch Category-Based Recommendations
        // Inspired Reference: MDN Web Docs, "Object Destructuring Assignment" (https://developer.mozilla.org/en-US/docs/Learn/Server-side/Express_Nodejs/routes) 
        for (const { category_id, risk_level, category_name } of categoryRisks) {
            console.log(`Fetching recommendations for Category ID: ${category_id}, Risk Level: ${risk_level}`);
            
            // Fetch all recommendations (`r.*`) that match the given `category_id` and `risk_level` 
            // Inspired by MySQL SELECT Statement: https://dev.mysql.com/doc/refman/8.0/en/select.html
            const [categoryRecs] = await pool.query(`
                SELECT r.*, ? AS category_name
                FROM recommendations r
                WHERE r.category_id = ? AND r.risk_level = ?`, 
                [category_name, category_id, risk_level]
            );
            recommendations.push(...categoryRecs);  // Push the recommendations to the array
        }

        // 4️. Fetch Trigger-Based Recommendations
        // Inspired Reference: MySQL’s documentation on JOIN clauses (15.2.13.2 JOIN Clause, MySQL).https://dev.mysql.com/doc/refman/8.0/en/join.html
        // Chatgpt Assistance (Prompt in READMEFILE)
        console.log(`Fetching trigger-based recommendations for User ID ${userId}...`);
        const [triggerRecs] = await pool.query(`
            SELECT r.*, c.category_name 
            FROM recommendations r
            JOIN responses res ON r.question_id = res.question_id
            LEFT JOIN questions q ON r.question_id = q.question_id
            LEFT JOIN categories c ON q.category_id = c.category_id
            WHERE res.user_id = ? AND res.answer = 1`, 
            [userId]
        );
        recommendations.push(...triggerRecs); // Push the recommendations to the array

        // 5️. Fetch Sector-Based Recommendations
        // Inspired by MySQL SELECT Statement: https://dev.mysql.com/doc/refman/8.0/en/select.html
        console.log(`Checking user sector for User ID ${userId}...`);
        const [userSector] = await pool.query(`SELECT sector_id FROM user WHERE user_id = ?`, [userId]);

        if (userSector.length > 0 && userSector[0].sector_id) {
            const sectorId = userSector[0].sector_id;
            console.log(`Fetching sector-specific recommendations for Sector ID: ${sectorId}`);
            const [sectorRecs] = await pool.query(`
                SELECT r.*, 'Sector-Specific' AS category_name 
                FROM recommendations r
                WHERE r.sector_id = ?`, 
                [sectorId]
            );
            recommendations.push(...sectorRecs);
        }

        // 6. Remove Duplicates
        // Inspired by FullStackHeroes' technique for removing duplicate objects using new Map(). https://fullstackheroes.com/tutorials/javascript/5-ways-to-remove-duplicate-objects-from-array-based-on-property/?
        const uniqueRecommendations = Array.from(new Map(
            recommendations.map(rec => [rec.recommendation_text, rec])
        ).values());

        console.log(`Final Recommendations for User ID ${userId}:`, uniqueRecommendations);
        return res.json(uniqueRecommendations);  // Return the unique recommendations https://stackoverflow.com/questions/19696240/proper-way-to-return-json-using-node-or-express

    } catch (err) {
        console.error(`ERROR: Failed to fetch recommendations for User ID ${userId}:`, err);
        res.status(500).json({ error: 'Failed to fetch recommendations' });
    }
});

module.exports = router;