// Reference: Express Routing Guide for setting up modular route handlers
// URL: https://expressjs.com/en/guide/routing.html
// Modifications: Used Express router to handle HTTP GET requests for fetching user data based on userId.

const express = require('express');
const router = express.Router();
const db = require('../db'); // Import database connection
const auth = require('../middleware/auth'); // Import the auth middleware

// 
// Route to fetch sectors (no auth needed if this information is public)
router.get('/sectors', async (req, res) => {
  try {
    const [sectors] = await db.query('SELECT Sector_Name FROM sector');
    res.status(200).json(sectors);
  } catch (error) {
    console.error('Error fetching sectors:', error);
    res.status(500).json({ error: 'An error occurred while fetching sectors' });
  }
});

// Route to fetch employee count options (no auth needed if this information is public)
router.get('/employee-count', async (req, res) => {
  try {
    const [employeeCounts] = await db.query('SELECT Employee_Range FROM employee_count');
    res.status(200).json(employeeCounts);
  } catch (error) {
    console.error('Error fetching employee counts:', error);
    res.status(500).json({ error: 'An error occurred while fetching employee counts' });
  }
});

// Route to fetch revenue options (no auth needed if this information is public)
router.get('/revenue', async (req, res) => {
  try {
    const [revenues] = await db.query('SELECT Revenue_Range FROM revenue');
    res.status(200).json(revenues);
  } catch (error) {
    console.error('Error fetching revenue options:', error);
    res.status(500).json({ error: 'An error occurred while fetching revenue options' });
  }
});

// Protected route to get user data by userId (requires authentication)
router.get('/:userId', auth, async (req, res) => {
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

