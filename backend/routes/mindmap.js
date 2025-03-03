const express = require('express');
const router = express.Router();
const pool = require('../db'); // ✅ MySQL connection (same as your other routes)
const auth = require('../middleware/auth'); // ✅ Use your authentication middleware

// 🔹 Fetch MindMap Data for the Logged-in User
router.get('/mindmap', auth, async (req, res) => {
    try {
        const userId = req.user.userId; // ✅ Extract user ID from the JWT token

        console.log(`🔍 Fetching mind map for user ID: ${userId}`);

        // 🔹 Step 1: Fetch User Data
        const [user] = await pool.query(`
            SELECT name, organisation, role, sector 
            FROM user 
            WHERE User_ID = ?`, 
            [userId]
        );
        console.log(`✅ User Data:`, user);

        if (!user.length) {
            console.warn(`⚠️ User ID ${userId} not found.`);
            return res.status(404).json({ error: "User not found" });
        }

        const userData = user[0];

        // 🔹 Step 2: Fetch Risk Score
        const [riskData] = await pool.query(`
            SELECT Normalized_Score 
            FROM risk_score 
            WHERE User_ID = ?`, 
            [userId]
        );
        console.log(`✅ Risk Score:`, riskData);
        const riskScore = riskData.length ? riskData[0].Normalized_Score : "No risk score available";

       // 🔹 Fetch User's Top 5 Recommendations (Based on Sector & Risk Level)
console.log(`🔹 Fetching recommendations for user ID: ${userId}`);
const [recommendations] = await pool.query(`
    SELECT r.category_id, r.recommendation_text
    FROM recommendations r
    JOIN user u ON u.Sector_ID = r.sector_id
    JOIN risk_score rs ON rs.User_ID = u.User_ID
    WHERE u.User_ID = ?
    AND rs.Risk_Level = r.risk_level
    ORDER BY r.risk_level ASC
    LIMIT 5;
`, [userId]);

console.log(`✅ Retrieved ${recommendations.length} recommendations`);

        // 🔹 Step 4: Convert to Markdown for Markmap
        let mindmapMarkdown = `# User Overview\n`;
        mindmapMarkdown += `- **Name:** ${userData.name}\n`;
        mindmapMarkdown += `- **Organisation:** ${userData.organisation}\n`;
        mindmapMarkdown += `- **Role:** ${userData.role}\n`;
        mindmapMarkdown += `- **Sector:** ${userData.sector}\n\n`;

        mindmapMarkdown += `# Risk Score\n`;
        mindmapMarkdown += `- **Score:** ${riskScore}\n\n`;

        mindmapMarkdown += `# Top 5 Recommendations\n`;
        recommendations.forEach((rec, index) => {
            mindmapMarkdown += `- **${rec.category_name}**: ${rec.recommendation_text}\n`;
        });

        console.log("✅ MindMap Data Generated Successfully!");
        res.json({ success: true, markdown: mindmapMarkdown });

    } catch (error) {
        console.error("🔥 Server Error Generating MindMap:", error);
        res.status(500).json({ error: "Internal server error while generating mind map." });
    }
});

module.exports = router;
