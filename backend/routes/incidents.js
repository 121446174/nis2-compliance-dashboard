const express = require('express');
const pool = require('../db');
const auth = require('../middleware/auth');
const router = express.Router();

// 1. Log a New Incident
// Inspired Reference MernStackdev: Post Requests https://mernstackdev.com/post-routes-in-web-development/#validating-data-in-post-requests 
// Youtube: https://youtu.be/0Hu27PoloYw
router.post('/report', auth, async (req, res) => {
    const { severity, date_time, description, indicators, impacted_services } = req.body;
    const user_id = req.user.userId; // Extract user ID from token

    if (!user_id || !severity || !date_time || !description) {
        console.error("Missing required fields:", { user_id, severity, date_time, description });
        return res.status(400).json({ error: 'Missing required fields' });
    }

    // 2. Calculate Due Dates Based on NIS2 Timeline
    // Inspired Reference: MDM Date() constructor and Stack Overflow new Date(new Date().getTime() + 24 * 60 * 60 * 1000)
    const incidentDate = new Date(date_time);
    const earlyWarningDue = new Date(incidentDate.getTime() + 24 * 60 * 60 * 1000);  // Early Report in 24 hours
    const officialNotificationDue = new Date(incidentDate.getTime() + 72 * 60 * 60 * 1000); // Report in 72 hours
    const finalReportDue = new Date(incidentDate.getTime() + 30 * 24 * 60 * 60 * 1000); // Report to CIRST in 30 days
    
    // 3. Insert Incident into the Database 
    // Reference: MySQL INSERT Documentation - https://dev.mysql.com/doc/refman/8.0/en/insert.html
    try {
        const [result] = await pool.query(
            `INSERT INTO incidents 
            (user_id, severity, date_time, description, indicators, impacted_services, early_warning_due, official_notification_due, final_report_due)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [user_id, severity, date_time, description, indicators || null, impacted_services || null,
                earlyWarningDue, officialNotificationDue, finalReportDue]
        );

       
        console.log(`New incident logged: ID ${result.insertId}`);
        res.status(201).json({ message: 'Incident reported successfully', incident_id: result.insertId });

    } catch (err) {
        console.error('MySQL Error:', err.message);
        res.status(500).json({ error: err.message || 'Failed to log incident' });
    }
});

// 4.Fetch Incidents for a User
// Inspired Reference: MDN's "Express Routing" guide from Mozilla Developer Network (MDN) https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Server-side/Express_Nodejs/routes
// MySQL 8.0 Documentation: SELECT Query https://dev.mysql.com/doc/refman/8.0/en/select.html
router.get('/', auth, async (req, res) => {
    const user_id = req.user.userId;

    try {
        const [incidents] = await pool.query(
            `SELECT incident_id, severity, date_time, description, indicators, impacted_services, status, 
            early_warning_due, official_notification_due, final_report_due, last_updated 
            FROM incidents 
            WHERE user_id = ? 
            ORDER BY date_time DESC`, 
            [user_id]
        );

    
        console.log(`📡 Enhanced incident fetch for User ID ${user_id}`);
        res.json(incidents);

    } catch (err) {
        console.error('Error fetching incidents:', err);
        res.status(500).json({ error: 'Failed to retrieve incidents' });
    }
});

// 5. Delete an Incident
// Source: Stack Overflow - "How to modularize a DELETE route with params in Express" https://stackoverflow.com/questions/72342532/how-to-modularize-a-delete-route-with-params-in-express
router.delete('/:incidentId', auth, async (req, res) => {
    const { incidentId } = req.params;
    const user_id = req.user.userId;

    try {
        const [result] = await pool.query(
            `DELETE FROM incidents WHERE incident_id = ? AND user_id = ?`, 
            [incidentId, user_id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Incident not found or unauthorized' });
        }

        console.log(`Deleted Incident ID ${incidentId} (User ${user_id})`);
        res.json({ message: 'Incident deleted successfully', deletedId: incidentId });

    } catch (err) {
        console.error('Error deleting incident:', err);
        res.status(500).json({ error: 'Failed to delete incident' });
    }
});

module.exports = router;
