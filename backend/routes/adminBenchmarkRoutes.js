const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');

// Fetch current benchmark settings (internal and external weights)
// Mozilla Developer Network (MDN) inspired source "The router.get() method responds to HTTP GET requests at a specific path."
// Execurting query - https://www.honeybadger.io/blog/using-sql-databases-in-javascript/
router.get('/settings', auth, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT internal_weight, external_weight FROM benchmark_settings ORDER BY last_updated DESC LIMIT 1'
    );
    if (!rows.length) {
      return res.status(404).json({ error: 'Benchmark settings not found' });
    }
    res.json(rows[0]); // Return the latest benchmark settings
  } catch (err) {
    console.error('Error fetching benchmark settings:', err);
    res.status(500).json({ error: 'Failed to fetch benchmark settings' });
  }
});

// PUT: Update benchmark settings by updating the most recent row (by max(id))
// https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Server-side/Express_Nodejs/routes
// MySQL UPDATE with subquery: https://dev.mysql.com/doc/refman/8.0/en/update.html
router.put('/settings', auth, async (req, res) => {
    const { internal_weight, external_weight } = req.body;
    
    if (internal_weight == null || external_weight == null) {
      return res.status(400).json({ error: 'Missing weight values' });
    }
    try {
      await pool.query(
        `UPDATE benchmark_settings
         SET internal_weight = ?, external_weight = ?, last_updated = CURRENT_TIMESTAMP
         WHERE id = (
           SELECT max_id FROM (
             SELECT MAX(id) AS max_id FROM benchmark_settings
           ) AS temp
         )`, 
        [internal_weight, external_weight]
      );
      res.json({ message: 'Benchmark settings updated successfully' });
    } catch (err) {
      console.error('Error updating benchmark settings:', err);
      res.status(500).json({ error: 'Failed to update benchmark settings' });
    }
  });
  
  // Fetch sector benchmarks including internal and external scores
  // Inspired by MDN's Express Routing Guide for handling HTTP GET requests
  //MySQL UPDATE with JOIN: https://dev.mysql.com/doc/refman/8.0/en/update.html
 // MySQL SELECT with JOIN: https://dev.mysql.com/doc/refman/8.0/en/join.html
  
  router.get('/sectors', auth, async (req, res) => {
    try {
        // Update internal risk scores
        await pool.query(`
            UPDATE sector_benchmark sb
            JOIN (
                SELECT u.Sector_ID, AVG(rs.Normalized_Score) AS avg_risk
                FROM risk_score rs
                JOIN user u ON rs.User_ID = u.User_ID
                GROUP BY u.Sector_ID
            ) calculated ON sb.sector_id = calculated.Sector_ID
            SET sb.internal_avg = calculated.avg_risk, sb.updated_at = NOW();
        `);

        // Fetch updated sector benchmarks including justification
        const [benchmarks] = await pool.query(`
            SELECT sb.*, s.Sector_Name, eb.external_score, eb.source_reference, eb.justification
            FROM sector_benchmark sb
            JOIN sector s ON sb.sector_id = s.Sector_ID
            LEFT JOIN external_benchmarks eb 
            ON sb.sector_id = eb.sector_id 
            ORDER BY eb.updated_at DESC
        `);
        
        res.json(benchmarks);
    } catch (err) {
        console.error('Error fetching sector benchmarks:', err);
        res.status(500).json({ error: 'Failed to fetch sector benchmarks' });
    }
});

  
// Update external benchmark for a given sector (admin editable)
// MySQL UPDATE with subquery: https://dev.mysql.com/doc/refman/8.0/en/update.html
 //  MySQL SELECT query with ORDER BY and LIMIT: https://dev.mysql.com/doc/refman/8.0/en/select.html

router.put('/external/:sectorId', auth, async (req, res) => {
  const { sectorId } = req.params;
  const { external_score, source_reference, justification } = req.body;

  if (external_score == null) {
    return res.status(400).json({ error: 'Missing external score' });
  }

  try {
    // 1. Update the external_benchmarks table
    await pool.query(
      `UPDATE external_benchmarks 
       SET external_score = ?, source_reference = ?, justification = ?, updated_at = NOW()
       WHERE sector_id = ? 
       ORDER BY updated_at DESC
       LIMIT 1`,
      [external_score, source_reference || null, justification || null, sectorId]
    );

    // 2. Retrieve the current global weights from benchmark_settings.
    // MDN Web Docs: Covers JavaScript’s best practices for handling default values - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Nullish_coalescing
    const [settingsRows] = await pool.query(
      'SELECT internal_weight, external_weight FROM benchmark_settings ORDER BY last_updated DESC LIMIT 1'
    );
    let internal_weight = 30,
        external_weight = 70;
    if (settingsRows.length > 0) {
      internal_weight = settingsRows[0].internal_weight;
      external_weight = settingsRows[0].external_weight;
    }

    // 3. Update the sector_benchmark table:
   // Updating Data in MySQL Database from Node.js - https://www.mysqltutorial.org/mysql-nodejs/update/
    //    Recalculate the blended_score using: blended_score = (internal_avg * (internal_weight/100)) + (external_score * (external_weight/100))
    await pool.query(
      `UPDATE sector_benchmark
       SET external_score = ?,
           blended_score = (internal_avg * (? / 100)) + (? * (? / 100)),
           updated_at = NOW()
       WHERE sector_id = ?`,
       [external_score, internal_weight, external_score, external_weight, sectorId]
    );

    res.json({ message: 'External benchmark updated successfully and sector benchmark synchronized' });
  } catch (err) {
    console.error('Error updating external benchmark:', err);
    res.status(500).json({ error: 'Failed to update external benchmark' });
  }
});


module.exports = router;
