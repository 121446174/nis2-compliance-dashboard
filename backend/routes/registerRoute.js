// Reference: Express Routing Guide for modular route setup
// URL: https://expressjs.com/en/guide/routing.html
// Modifications: Added classification logic and database queries to handle user registration and compliance classification

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
  
  //Inspired Source: https://www.geeksforgeeks.org/node-js-connect-mysql-with-node-app/
  // Modifications: Fetch sector dynamically from the database instead of hardcoding
  try {
    // Fetch Sector_ID 
    const [sectorResult] = await db.query('SELECT Sector_ID FROM sector WHERE Sector_Name = ?', [sector]);
    if (sectorResult.length === 0) {
      return res.status(400).json({ error: 'Invalid sector selected' });
    }
    const sectorId = sectorResult[0].Sector_ID;

    // Insert user data into the `user` table
    const [userResult] = await db.query(
      'INSERT INTO user (name, email, password, sector_id, organisation, role, sector) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [username, email, password, sectorId, organisation, role, sector]
    );
    const userId = userResult.insertId;
    console.log("User inserted with ID:", userId); // Log user insertion success

    // Classification logic 
    let classification = 'Out of Scope';

    // Fetch employee and revenue ranges from the database
    const [employeeRanges] = await db.query('SELECT Employee_Range FROM employee_count');
    const [revenueRanges] = await db.query('SELECT Revenue_Range FROM revenue');

    // Define classification criteria based on ranges
    const essentialEmployeeRange = employeeRanges.find(range => range.Employee_Range === '>250');
    const importantEmployeeRange = employeeRanges.find(range => range.Employee_Range === '50-249');
    const essentialRevenueRange = revenueRanges.find(range => range.Revenue_Range === '>50');
    const importantRevenueRange = revenueRanges.find(range => range.Revenue_Range === '10-50');

    // Classify as "Essential" or "Important" 
    if ((employeeCount === essentialEmployeeRange.Employee_Range) || (revenue === essentialRevenueRange.Revenue_Range)) {
      classification = 'Essential';
    } else if ((employeeCount === importantEmployeeRange.Employee_Range) && (revenue === importantRevenueRange.Revenue_Range)) {
      classification = 'Important';
    }

    // Insert classification into `compliance_assessment` 
    if (classification !== 'Out of Scope') {
      await db.query('INSERT INTO compliance_assessment (user_id, classification) VALUES (?, ?)', [userId, classification]);
      console.log("Compliance assessment added for user"); 
    }

    res.status(201).json({ message: 'Registration successful', classification });
  } catch (error) {
    console.error('Error during registration:', error); // Log error details
    res.status(500).json({ error: 'Error during registration' });
  }
});

module.exports = router;
