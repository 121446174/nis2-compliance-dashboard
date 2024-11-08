
// Reference: Express Routing Guide for setting up modular route handlers
// URL: https://expressjs.com/en/guide/routing.html
// Modifications: Used Express router to handle HTTP GET requests for fetching user data based on userId.

const express = require('express');
const router = express.Router();
const db = require('../db'); // Import database connection

// Route to get user data by userId
router.get('/:userId', async (req, res) => {
  const userId = req.params.userId;

  try {
    const [rows] = await db.query(
      'SELECT User_ID, name, email, organisation, role, sector FROM user WHERE User_ID = ?',
      [userId]
    );
    

    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json(rows[0]);
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).json({ error: 'An error occurred while fetching user data' });
  }
});

module.exports = router;
