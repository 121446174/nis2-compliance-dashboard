// Reference: Express Routing Guide for setting up modular route handlers
// URL: https://expressjs.com/en/guide/routing.html
// Modifications: Added compliance classification check and conditional access control

const express = require('express');
const router = express.Router();
const db = require('../db');
const jwt = require('jsonwebtoken'); // Ensure JWT library is installed and imported

//Login route
router.post('/', async (req, res) => {
  const { email, password } = req.body;

  try {
    const [userRows] = await db.query(
      'SELECT * FROM user WHERE email = ? AND password = ?',
      [email, password]
    );

    if (userRows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = userRows[0];

    // Check the compliance classification
    const [classificationRows] = await db.query(
      'SELECT classification FROM compliance_assessment WHERE user_id = ?',
      [user.User_ID]
    );

    if (classificationRows.length === 0 || classificationRows[0].classification === 'Out of Scope') {
      return res.status(403).json({ error: 'Access denied for Out of Scope users' });
    }

    // Generate JWT token
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined in the environment variables');
    }

    const token = jwt.sign(
      { userId: user.User_ID, classification: classificationRows[0].classification },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(200).json({ message: 'Login successful', token });
  } catch (error) {
    console.error('Error during login:', error.message);
    res.status(500).json({ error: 'An error occurred during login' });
  }
});

module.exports = router;