const express = require('express');
const router = express.Router();
const pool = require('../db'); 
const auth = require('../middleware/auth'); 

// 🔹 Fetch MindMap Data for the Logged-in User
router.get('/mindmap', auth, async (req, res) => {
    try {
        const userId = req.user.userId; // Extract user ID from the JWT token
        console.log(`🔍 Fetching mind map for user ID: ${userId}`);

        // 🔹 Step 1: Fetch User Data
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

        // 🔹 Step 2: Fetch Risk Score
        const [riskData] = await pool.query(`
            SELECT Normalized_Score 
            FROM risk_score 
            WHERE user_id = ?`, 
            [userId]
        );
        const riskScore = riskData.length ? riskData[0].Normalized_Score : "No risk score available";

        // 🔹 Step 3: Fetch **Sector-Specific Recommendations**
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

        // 🔹 Step 4: Convert to Markdown for MindMap
        let mindmapMarkdown = `# User Overview\n`;
        mindmapMarkdown += `- **Name:** ${userData.name}\n`;
        mindmapMarkdown += `- **Organisation:** ${userData.organisation}\n`;
        mindmapMarkdown += `- **Role:** ${userData.role}\n`;
        mindmapMarkdown += `- **Sector:** ${userData.sector}\n\n`;

        mindmapMarkdown += `# Risk Score\n`;
        mindmapMarkdown += `- **Score:** ${riskScore}\n\n`;

        mindmapMarkdown += `# Top 5 Sector-Specific Recommendations\n`;
        recommendations.forEach((rec) => { 
            mindmapMarkdown += `- **${rec.category_name}**: ${rec.recommendation_text} (**${rec.risk_level}**)\n`;
        });

        console.log("MindMap Data Generated Successfully!");
        res.json({ success: true, markdown: mindmapMarkdown });

    } catch (error) {
        console.error("🔥 Server Error Generating MindMap:", error);
        res.status(500).json({ error: "Internal server error while generating mind map." });
    }
});

module.exports = router;
