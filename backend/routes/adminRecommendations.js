const express = require('express');
const db = require('../db');
const auth = require('../middleware/auth');
const router = express.Router();

// GET: Fetch All Recommendations
// Mozilla Developer Network (MDN) inspired source "The router.get() method responds to HTTP GET requests at a specific path."
// Execurting query - https://www.honeybadger.io/blog/using-sql-databases-in-javascript/
router.get('/recommendations', auth, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT 
          r.id,
          r.category_id,
          r.question_id,
          r.sector_id,
          r.risk_level,
          r.recommendation_text,
          r.impact,
          c.Category_Name,
          s.Sector_Name
       FROM recommendations r
       LEFT JOIN categories c ON r.category_id = c.Category_ID
       LEFT JOIN sector s ON r.sector_id = s.Sector_ID
       ORDER BY r.id DESC`
    );
    console.log(`Fetched ${rows.length} recommendations`);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching recommendations:', err);
    res.status(500).json({ error: 'Failed to fetch recommendations' });
  }
});

// POST: Add a New Recommendation
// Inspired by Incident Logging (https://mernstackdev.com/post-routes-in-web-development/#validating-data-in-post-requests)
// MySQL Insert Statement Reference (https://dev.mysql.com/doc/refman/8.0/en/insert.html)
router.post('/recommendations', auth, async (req, res) => {
  const { category_id, question_id, sector_id, risk_level, recommendation_text, impact } = req.body;

  // Validate required fields (adjust as needed)
  if (!category_id || !risk_level || !recommendation_text || !impact) {
    console.error('Missing required fields:', req.body);
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const [result] = await db.query(
      `INSERT INTO recommendations 
       (category_id, question_id, sector_id, risk_level, recommendation_text, impact)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [category_id, question_id || null, sector_id || null, risk_level, recommendation_text, impact]
    );
    console.log(`New recommendation added with ID ${result.insertId}`);
    res.status(201).json({ message: 'Recommendation added successfully', id: result.insertId });
  } catch (err) {
    console.error('Error adding recommendation:', err);
    res.status(500).json({ error: 'Failed to add recommendation' });
  }
});

// PUT: Update an Existing Recommendation 
// Express.js Routing for Handling Requests: https://developer.mozilla.org/en-US/docs/Learn/Server-side/Express_Nodejs/routes
// SQL Update: https://www.programiz.com/sql/update
router.put('/recommendations/:id', auth, async (req, res) => {
  const { id } = req.params;
  const { category_id, question_id, sector_id, risk_level, recommendation_text, impact } = req.body;

  if (!category_id || !risk_level || !recommendation_text || !impact) {
    console.error('Missing required fields for update:', req.body);
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const [result] = await db.query(
      `UPDATE recommendations 
       SET category_id = ?, question_id = ?, sector_id = ?, risk_level = ?, recommendation_text = ?, impact = ?
       WHERE id = ?`,
      [category_id, question_id || null, sector_id || null, risk_level, recommendation_text, impact, id]
    );
    console.log(`Recommendation ID ${id} updated`);
    res.json({ message: 'Recommendation updated successfully' });
  } catch (err) {
    console.error('Error updating recommendation:', err);
    res.status(500).json({ error: 'Failed to update recommendation' });
  }
});

// DELETE: Remove a Recommendation
// Inspired by Incident Deletion (https://stackoverflow.com/questions/72342532/how-to-modularize-a-delete-route-with-params-in-express)
// MySQL DELETE Reference (https://dev.mysql.com/doc/refman/8.0/en/delete.html)
router.delete('/recommendations/:id', auth, async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await db.query(`DELETE FROM recommendations WHERE id = ?`, [id]);
    if (result.affectedRows === 0) {
      console.warn(`No recommendation found with ID ${id}`);
      return res.status(404).json({ error: 'Recommendation not found' });
    }
    console.log(`Recommendation ID ${id} deleted`);
    res.json({ message: 'Recommendation deleted successfully', deletedId: id });
  } catch (err) {
    console.error('Error deleting recommendation:', err);
    res.status(500).json({ error: 'Failed to delete recommendation' });
  }
});

module.exports = router;

