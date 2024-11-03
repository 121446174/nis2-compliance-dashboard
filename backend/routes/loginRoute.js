const express = require('express');
const router = express.Router();
const db = require('../db'); // Database connection

router.post('/', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Query the user by email and password
    const [rows] = await db.query(
      'SELECT * FROM user WHERE email = ? AND password = ?',
      [email, password]
    );

    if (rows.length === 0) {
      // No user found with the provided credentials
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // User found, return a success message (in real applications, return a token for security)
    const user = rows[0];
    res.status(200).json({ message: 'Login successful', userId: user.User_ID });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: 'An error occurred during login' });
  }
});

module.exports = router;
