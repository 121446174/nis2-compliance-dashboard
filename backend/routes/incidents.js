const express = require('express');
const pool = require('../db');
const auth = require('../middleware/auth');
const router = express.Router();

// 🆕 Log a New Incident
router.post('/report', auth, async (req, res) => {
    const { severity, date_time, description, indicators, impacted_services } = req.body;
    const user_id = req.user.userId; // Extract user ID from token

    console.log("Incoming Incident Data:", req.body); // Debugging incoming data
    console.log("User ID:", user_id);

    if (!user_id || !severity || !date_time || !description) {
        console.error("Missing required fields:", { user_id, severity, date_time, description });
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        const [result] = await pool.query(
            `INSERT INTO incidents (user_id, severity, date_time, description, indicators, impacted_services)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [user_id, severity, date_time, description, indicators || null, impacted_services || null]
        );

        console.log(`New incident logged: ID ${result.insertId}`);
        res.status(201).json({ message: 'Incident reported successfully', incident_id: result.insertId });

    } catch (err) {
        console.error('MySQL Error:', err.message); // ✅ Log the MySQL error message
        res.status(500).json({ error: err.message || 'Failed to log incident' });
    }
});

// Fetch Incidents for a User
router.get('/', auth, async (req, res) => {
    const user_id = req.user.userId;

    try {
        const [incidents] = await pool.query(`
            SELECT * FROM incidents WHERE user_id = ? ORDER BY date_time DESC`, 
            [user_id]
        );

        console.log(`Fetched incidents for User ID ${user_id}`);
        res.json(incidents);

    } catch (err) {
        console.error('Error fetching incidents:', err);
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

// Notify Authorities (Future Expansion)
const notifyAuthorities = async (incidentId, severity) => {
    if (severity === 'High' || severity === 'Critical') {
        console.log(`Alerting authorities about Incident ID ${incidentId}`);
        // Placeholder for API/Email notification system
    }
};

module.exports = router;
