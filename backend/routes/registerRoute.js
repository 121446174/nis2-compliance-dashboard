// Reference: Express Routing Guide for modular route setup
// URL: https://expressjs.com/en/guide/routing.html
// Modifications: Added classification logic and database queries to handle user registration and compliance classification

const express = require('express');
const router = express.Router();
const db = require('../db'); // Database connection

router.post('/', async (req, res) => {
  const {
    username,          // Name of the user
    email,             // Email of the user
    password,          // Password of the user
    sector,            // Name of the sector (will be mapped to Sector_ID)
    organisation = "Not Provided", // Organisation (optional, with default)
    role = "Not Provided",          // Role (optional, with default)
    revenue,           // Revenue range, such as "10-50"
    employeeCount      // Employee count range, such as ">250"
  } = req.body;

  console.log("Received registration data:", req.body);

  try {
    // Step 1: Fetch Sector_ID dynamically based on sector name
    const [sectorResult] = await db.query('SELECT Sector_ID FROM sector WHERE Sector_Name = ?', [sector]);
    if (sectorResult.length === 0) {
      return res.status(400).json({ error: 'Invalid sector selected' });
    }
    const sectorId = sectorResult[0].Sector_ID;

    // Step 2: Insert user data into the `user` table, including Organisation, Role, and Password
    const [userResult] = await db.query(
      'INSERT INTO user (name, email, password, sector_id, organisation, role, sector) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [username, email, password, sectorId, organisation, role, sector]
    );
    const userId = userResult.insertId;
    console.log("User inserted with ID:", userId); // Log user insertion success

    // Step 3: Classification logic (you may need to adjust or remove this section based on your project's requirements)
    let classification = 'Out of Scope';

    // Fetch employee and revenue ranges from the database
    const [employeeRanges] = await db.query('SELECT Employee_Range FROM employee_count');
    const [revenueRanges] = await db.query('SELECT Revenue_Range FROM revenue');

    // Define classification criteria based on dynamic ranges
    const essentialEmployeeRange = employeeRanges.find(range => range.Employee_Range === '>250');
    const importantEmployeeRange = employeeRanges.find(range => range.Employee_Range === '50-249');
    const essentialRevenueRange = revenueRanges.find(range => range.Revenue_Range === '>50');
    const importantRevenueRange = revenueRanges.find(range => range.Revenue_Range === '10-50');

    // Classify as "Essential" or "Important" based on dynamic database ranges
    if ((employeeCount === essentialEmployeeRange.Employee_Range) || (revenue === essentialRevenueRange.Revenue_Range)) {
      classification = 'Essential';
    } else if ((employeeCount === importantEmployeeRange.Employee_Range) && (revenue === importantRevenueRange.Revenue_Range)) {
      classification = 'Important';
    }

    // Step 4: Insert classification into `compliance_assessment` if applicable
    if (classification !== 'Out of Scope') {
      await db.query('INSERT INTO compliance_assessment (user_id, classification) VALUES (?, ?)', [userId, classification]);
      console.log("Compliance assessment added for user"); // Log compliance assessment addition
    }

    res.status(201).json({ message: 'Registration successful', classification });
  } catch (error) {
    console.error('Error during registration:', error); // Log error details
    res.status(500).json({ error: 'Error during registration' });
  }
});

module.exports = router;
