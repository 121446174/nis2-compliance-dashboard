const express = require('express');
const pool = require('../db');
const auth = require('../middleware/auth');
const router = express.Router();

// 🆕 Log a New Incident
router.post('/report', auth, async (req, res) => {
    const { severity, date_time, description, indicators, impacted_services } = req.body;
    const user_id = req.user.userId; // Extract user ID from token

    if (!user_id || !severity || !date_time || !description) {
        console.error("🚨 Missing required fields:", { user_id, severity, date_time, description });
        return res.status(400).json({ error: 'Missing required fields' });
    }

    // ✅ Calculate Due Dates Based on NIS2 Timeline
    const incidentDate = new Date(date_time);
    const earlyWarningDue = new Date(incidentDate.getTime() + 24 * 60 * 60 * 1000);  // +1 Day
    const officialNotificationDue = new Date(incidentDate.getTime() + 72 * 60 * 60 * 1000); // +3 Days
    const finalReportDue = new Date(incidentDate.getTime() + 30 * 24 * 60 * 60 * 1000); // +30 Days

    try {
        const [result] = await pool.query(
            `INSERT INTO incidents 
            (user_id, severity, date_time, description, indicators, impacted_services, early_warning_due, official_notification_due, final_report_due)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [user_id, severity, date_time, description, indicators || null, impacted_services || null,
                earlyWarningDue, officialNotificationDue, finalReportDue]
        );

        console.log(`✅ New incident logged: ID ${result.insertId}`);
        res.status(201).json({ message: 'Incident reported successfully', incident_id: result.insertId });

    } catch (err) {
        console.error('🚨 MySQL Error:', err.message);
        res.status(500).json({ error: err.message || 'Failed to log incident' });
    }
});

// Fetch Incidents for a User
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
        console.error('🚨 Error fetching incidents:', err);
        res.status(500).json({ error: 'Failed to retrieve incidents' });
    }
});

// Update Incident Status
router.put('/:incidentId/status', auth, async (req, res) => {
    const { incidentId } = req.params;
    const { status } = req.body;

    try {
        await pool.query(`UPDATE incidents SET status = ? WHERE incident_id = ?`, [status, incidentId]);

        console.log(`Incident ID ${incidentId} status updated to: ${status}`);
        res.json({ message: 'Incident status updated successfully' });

    } catch (err) {
        console.error('Error updating status:', err);
        res.status(500).json({ error: 'Failed to update incident status' });
    }
});

// 🗑 Delete an Incident
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

        console.log(`🗑 Deleted Incident ID ${incidentId} (User ${user_id})`);
        res.json({ message: 'Incident deleted successfully', deletedId: incidentId });

    } catch (err) {
        console.error('🚨 Error deleting incident:', err);
        res.status(500).json({ error: 'Failed to delete incident' });
    }
});

router.put('/:incidentId', auth, async (req, res) => {
    const { incidentId } = req.params;
    const { severity, description, indicators, impacted_services } = req.body;
    const user_id = req.user.userId;

    try {
        const [result] = await pool.query(
            `UPDATE incidents SET severity = ?, description = ?, indicators = ?, impacted_services = ? 
            WHERE incident_id = ? AND user_id = ?`,
            [severity, description, indicators, impacted_services, incidentId, user_id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Incident not found or unauthorized' });
        }

        console.log(`✏️ Updated Incident ID ${incidentId}`);
        res.json({ message: 'Incident updated successfully' });

    } catch (err) {
        console.error('🚨 Error updating incident:', err);
        res.status(500).json({ error: 'Failed to update incident' });
    }
});

// Notify Authorities (Future Expansion)
const notifyAuthorities = async (incidentId, severity) => {
    if (severity === 'High' || severity === 'Critical') {
        console.log(`Alerting authorities about Incident ID ${incidentId}`);
        // Placeholder for API/Email notification system
    }
};

module.exports = router;
