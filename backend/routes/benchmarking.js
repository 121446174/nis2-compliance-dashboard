const express = require('express');
const router = express.Router();
const db = require('../db');

// Fetch benchmarking data based on sector ID
router.get('/:sector_id', (req, res) => {
    const sectorId = req.params.sector_id;

    const query = 'SELECT Benchmark_ID, Sector_ID, Compliance_Standard, Avg_Risk_Score, Comparison_Date FROM Benchmarking WHERE Sector_ID = ?';

    db.query(query, [sectorId], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(results);  // Return the benchmarking data as JSON
    });
});

module.exports = router;
