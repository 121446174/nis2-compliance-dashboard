// Reference: Express Routing Guide for setting up modular route handlers
// URL: https://expressjs.com/en/guide/routing.html
// Modifications: Added compliance classification check and conditional access control

const express = require('express');
const router = express.Router();
const db = require('../db'); // Import database connection
const jwt = require('jsonwebtoken'); // Import JWT library

// Login route
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

    // Check classification...
    const [classificationRows] = await db.query(
      'SELECT classification FROM compliance_assessment WHERE user_id = ?',
      [user.User_ID]
    );

    if (classificationRows.length === 0 || classificationRows[0].classification === 'Out of Scope') {
      return res.status(403).json({ error: 'Access denied for Out of Scope users' });
    }

    // Retrieve sectorId for the user
    // (If your DB column is "sector_id", you can just use user.sector_id)
    const sectorId = user.Sector_ID; // Correct column name

    // Generate JWT token
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined in the environment variables');
    }
    console.log('User data fetched from database:', user); // Check user details, including Sector_ID
    console.log('Classification fetched from compliance_assessment:', classificationRows[0]);
    
    const token = jwt.sign(
      { 
          userId: user.User_ID, 
          classification: classificationRows[0].classification, 
          sectorId: sectorId // Include sectorId in token
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
  );
  console.log('Generated JWT token:', token); // Verify token contains sectorId


  res.status(200).json({
    message: 'Login successful',
    token,
    userId: user.User_ID,
    classificationType: classificationRows[0].classification,
    sectorId: sectorId, // Include sectorId in the response
});
console.log('Login API Response:', {
  token,
  userId: user.User_ID,
  classificationType: classificationRows[0].classification,
  sectorId: sectorId,
});
  } catch (error) {
    console.error('Error during login:', error.message);
    res.status(500).json({ error: 'An error occurred during login' });
  }
});


module.exports = router;