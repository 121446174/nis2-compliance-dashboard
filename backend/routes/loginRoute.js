// Own code inspired by previous router structures in this project and standard Express.js routing patterns
const express = require('express'); // imports express
const router = express.Router(); // new router 
const db = require('../db'); // Database connection
// 
router.post('/', async (req, res) => { // Post route to handle login requests
  const { email, password } = req.body; // extract email and password

  // SQL Query to search the user by email and password
    // Source: ChatGPT generated structure, customised to include SQL injection prevention
  try {

    const [rows] = await db.query(
      'SELECT * FROM user WHERE email = ? AND password = ?', // (?) to prevent SQL injection
      [email, password] // return one user
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
