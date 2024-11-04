// compliance.js Not for iteration1
const express = require('express');
const router = express.Router();
const db = require('../db');  // Your MySQL database connection

// 1. CREATE a new compliance task (POST)
router.post('/', (req, res) => {
    console.log("Received POST request:", req.body);  // Log the request to the console
    const { description, status, due_date, priority } = req.body;
    if (!description || !status) {
        return res.status(400).json({ error: 'Description and status are required.' });
    }
    const query = 'INSERT INTO Compliance_Task (Description, Status, Due_Date, Priority) VALUES (?, ?, ?, ?)';
    db.query(query, [description, status, due_date, priority], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ message: 'Task created successfully', taskId: results.insertId });
    });
});

// 2. READ all compliance tasks (GET)
router.get('/', (req, res) => {
    const query = 'SELECT * FROM Compliance_Task';
    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
});

// 3. UPDATE a compliance task (PUT)
router.put('/:taskId', (req, res) => {
    const taskId = req.params.taskId;
    const { description, status, due_date, priority } = req.body;
    if (!description || !status) {
        return res.status(400).json({ error: 'Description and status are required.' });
    }
    const query = 'UPDATE Compliance_Task SET Description = ?, Status = ?, Due_Date = ?, Priority = ? WHERE Task_ID = ?';
    db.query(query, [description, status, due_date, priority, taskId], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Task updated successfully' });
    });
});

// 4. DELETE a compliance task (DELETE)
router.delete('/:taskId', (req, res) => {
    const taskId = req.params.taskId;
    const query = 'DELETE FROM Compliance_Task WHERE Task_ID = ?';
    db.query(query, [taskId], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Task deleted successfully' });
    });
});

module.exports = router;
