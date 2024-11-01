// registerRoute.js 
 express = require('express');
const router = express.Router();
const db = require('../db'); // Import your database connection

router.post('/', async (req, res) => {
  const { username, email, password, sector, revenue, employeeCount } = req.body;

  try {
    // Insert user data into the database
    const [userResult] = await db.query(
      'INSERT INTO users (name, email, password, sector) VALUES (?, ?, ?, ?)',
      [username, email, password, sector]
    );

    const userId = userResult.insertId;

    // Determine classification based on decision tree
    let classification = 'Out of Scope';
    const regulatedSectors = ['energy', 'transport', 'health']; // Update sectors as needed
    const isRegulated = regulatedSectors.includes(sector.toLowerCase());

    if (isRegulated) {
      if (employeeCount === '>250' || revenue === '>50') {
        classification = 'Essential';
      } else if (employeeCount === '50-249' && revenue === '10-50') {
        classification = 'Important';
      }
    }

    // Save classification in compliance_assessment table
    await db.query(
      'INSERT INTO compliance_assessment (user_id, classification) VALUES (?, ?)',
      [userId, classification]
    );

    res.status(201).json({ message: 'Registration successful', classification });
  } catch (error) {
    res.status(500).json({ error: 'Error during registration' });
  }
});

module.exports = router;
