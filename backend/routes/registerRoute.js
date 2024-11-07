// Inspired source: https://expressjs.com/en/guide/routing.html
const express = require('express');
const router = express.Router();
const db = require('../db');

router.post('/', async (req, res) => {
  const {
    username,
    email,
    password,
    sector,
    organisation = "Not Provided",
    role = "Not Provided",
    revenue,
    employeeCount
  } = req.body;

  console.log("Received registration data:", req.body);

  try {
    // Determine classification based on business rules
    let classification = 'Out of Scope';
    const regulatedSectors = [
      'energy', 'transport', 'banking', 'financial market infrastructure',
      'drinking water', 'waste water', 'health', 'digital infrastructure',
      'ict - service management b2b', 'public administration', 'space',
      'postal & courier services', 'waste management', 'chemicals', 
      'foods', 'manufacturing', 'digital providers', 'research'
    ];

    const isRegulated = regulatedSectors.includes(sector.toLowerCase());
    console.log(`Sector: ${sector}, isRegulated: ${isRegulated}`);
    
    // Classification logic based on employeeCount and revenue
    if (isRegulated) {
      if (employeeCount === '>250' || revenue === '>50') {
        classification = 'Essential';
      } else if (employeeCount === '50-249' && revenue === '10-50') {
        classification = 'Important';
      }
    }

    console.log(`Classification determined: ${classification}`);

    // Prevent registration for "Out of Scope" users
    if (classification === 'Out of Scope') {
      return res.status(403).json({ error: 'Registration not allowed for Out of Scope users' });
    }

    // Insert user data into the `user` table only if classification is valid
    const [userResult] = await db.query(
      'INSERT INTO user (name, email, password, sector, organisation, role) VALUES (?, ?, ?, ?, ?, ?)',
      [username, email, password, sector, organisation, role]
    );

    const userId = userResult.insertId;

    // Save classification in `compliance_assessment` table
    await db.query(
      'INSERT INTO compliance_assessment (user_id, classification) VALUES (?, ?)',
      [userId, classification]
    );

    res.status(201).json({ message: 'Registration successful', classification });
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({ error: 'Error during registration' });
  }
});

module.exports = router;




