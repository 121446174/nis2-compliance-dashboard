const express = require('express');
const router = express.Router();
const pool = require('../db'); 
const auth = require('../middleware/auth'); 

// Fetch MindMap Data for the Logged-in User
// Reference: Express.js Guide - Writing & Using Middleware
// https://expressjs.com/en/guide/writing-middleware.html
router.get('/mindmap', auth, async (req, res) => {
    try {
        const userId = req.user.userId; // Extract user ID from the JWT token
        console.log(`Fetching mind map for user ID: ${userId}`);

        // Step 1: Fetch User Data
        // Reference: MySQL 8.0 Reference Manual – SELECT Statement
        // URL: https://dev.mysql.com/doc/refman/8.0/en/select.html
        const [user] = await pool.query(`
            SELECT name, organisation, role, sector, sector_id
            FROM user 
            WHERE user_id = ?`, 
            [userId]
        );
        if (user.length === 0) {
            console.log("User not found.");
            return res.status(404).json({ error: "User not found" });
        }
        const userData = user[0];
        const sectorId = userData.sector_id; // Get sector ID from user data

        // Step 2: Fetch Risk Score
        // Reference: MySQL 8.0 Reference Manual – SELECT Statement
        // URL: https://dev.mysql.com/doc/refman/8.0/en/select.html
        const [riskData] = await pool.query(`
            SELECT Normalized_Score 
            FROM risk_score 
            WHERE user_id = ?`, 
            [userId]
        );
        const riskScore = riskData.length ? riskData[0].Normalized_Score : "No risk score available";

        // Step 3: Fetch **Sector-Specific Recommendations**
        // Reference: MySQL 8.0 Reference Manual – FIELD() Function (String Functions)
        // URL: https://dev.mysql.com/doc/refman/8.0/en/string-functions.html#function_field
        if (!sectorId) {
            console.log("No sector ID found for user.");
            return res.status(404).json({ error: "User has no associated sector." });
        }

        const [recommendations] = await pool.query(`
            SELECT r.recommendation_text, 'Sector-Specific' AS category_name, r.risk_level 
            FROM recommendations r
            WHERE r.sector_id = ?
            ORDER BY FIELD(r.risk_level, 'Critical', 'Very High', 'High', 'Medium', 'Low')
            LIMIT 5;
        `, [sectorId]);

        if (recommendations.length === 0) {
            console.log("No sector-specific recommendations found.");
            return res.status(404).json({ error: "No recommendations available for this sector." });
        }

       
    // Step 4: Fetch **Sector-Wide Category Scores**
        // Reference: MySQL 8.0 Reference Manual – AVG Aggregate Function
        // URL: https://dev.mysql.com/doc/refman/8.0/en/aggregate-functions.html
         console.log(`Fetching category scores for sector ID: ${sectorId}`);
         const [sectorCategoryScores] = await pool.query(`
             SELECT cs.category_id, c.category_name, AVG(cs.score) AS avg_score, cs.risk_level
             FROM category_scores cs
             JOIN user u ON cs.user_id = u.user_id
             JOIN categories c ON cs.category_id = c.category_id
             WHERE u.sector_id = ?
             GROUP BY cs.category_id, c.category_name, cs.risk_level
             ORDER BY avg_score DESC;
         `, [sectorId]);
 
         console.log("Sector-wide category scores fetched:", sectorCategoryScores);
       
         // Step 5: Convert to Markdown for MindMap
         // Markdown Guide - https://www.markdownguide.org/basic-syntax/#alternate-syntax
        let mindmapMarkdown = `# User Overview\n`;
        mindmapMarkdown += `- **Name:** ${userData.name}\n`;
        mindmapMarkdown += `- **Organisation:** ${userData.organisation}\n`;
        mindmapMarkdown += `- **Role:** ${userData.role}\n`;
        mindmapMarkdown += `- **Sector:** ${userData.sector}\n\n`;

        mindmapMarkdown += `# Risk Score\n`;
        mindmapMarkdown += `- **Score:** ${riskScore}\n\n`;
     
        // Reference: MDN Web Docs – Array.prototype.forEach()
        // The .forEach() method iterates over an array and executes a function for each element. This is how loop through recommendations and sectorCategoryScores to build your mindmapMarkdown.
        // URL: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach
        //  // Adapted with assistance from ChatGPT to format recommendations and category scores into mind map Markdown.
        mindmapMarkdown += `# Top 5 Sector-Specific Recommendations\n`;
        recommendations.forEach((rec) => { 
            mindmapMarkdown += `- **${rec.category_name}**: ${rec.recommendation_text} (**${rec.risk_level}**)\n`;
        });

        mindmapMarkdown += `\n# Sector-Wide Category Scores\n`;
        sectorCategoryScores.forEach((score) => {
            // Ensure avg_score is always a valid number before calling `.toFixed(2)`
            // The .toFixed(2) method ensures that numbers are formatted to two decimal places. This is useful for percentages and scores, like your avg_score values.
            // Reference: MDN Web Docs – Number.prototype.toFixed()=  https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number/toFixed
            const avgScore = score.avg_score !== null ? parseFloat(score.avg_score).toFixed(2) : "0.00";
            mindmapMarkdown += `- **${score.category_name}**: Avg Score: ${avgScore}% (**${score.risk_level}**)\n`;
        });
        
        console.log("MindMap Data Generated Successfully!");
        res.json({ success: true, markdown: mindmapMarkdown });

    } catch (error) {
        console.error("Server Error Generating MindMap:", error);
        res.status(500).json({ error: "Internal server error while generating mind map." });
    }
});

module.exports = router;
