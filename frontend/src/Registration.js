// Inspired Source: Tutorialspoint How to Develop User Registration Form in React Js
// https://www.tutorialspoint.com/how-to-develop-user-registration-form-in-react-j

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TextField, Button, Typography, MenuItem, Select, FormControl, InputLabel, Box, Alert, CircularProgress } from '@mui/material';

function Registration() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    organisation: '',
    role: '',
    password: '',
    sector: '',
    employeeCount: '',
    revenue: '',
  });

  const [classification, setClassification] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const [sectors, setSectors] = useState([]);
  const [employeeCounts, setEmployeeCounts] = useState([]);
  const [revenues, setRevenues] = useState([]);

  // Inspired Source: "Handling Async in React useEffect"  https://www.benmvp.com/blog/successfully-using-async-functions-useeffect-react/ 
    // Using an inner async function within useEffect, as recommended, to avoid making useEffect async.
  useEffect(() => {
    const fetchSectors = async () => {
      try {
        const response = await fetch('http://localhost:5000/user/sectors');
        const data = await response.json();
        setSectors(data.map(sector => sector.Sector_Name));
      } catch (error) {
        console.error('Error fetching sectors:', error);
      }
    };

    const fetchEmployeeCounts = async () => {
      try {
        const response = await fetch('http://localhost:5000/user/employee-count');
        const data = await response.json();
        setEmployeeCounts(data.map(count => count.Employee_Range));
      } catch (error) {
        console.error('Error fetching employee counts:', error);
      }
    };

    const fetchRevenues = async () => {
      try {
        const response = await fetch('http://localhost:5000/user/revenue');
        const data = await response.json();
        setRevenues(data.map(revenue => revenue.Revenue_Range));
      } catch (error) {
        console.error('Error fetching revenue options:', error);
      }
    };

    fetchSectors();
    fetchEmployeeCounts();
    fetchRevenues();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      setLoading(false);

      if (response.ok) {
        setClassification(data.classification);
      } else {
        setErrorMessage(data.error || 'Registration failed');
      }
    } catch (error) {
      setLoading(false);
      setErrorMessage('An error occurred during registration');
    }
  };

  return (
    <Box sx={{ maxWidth: 400, margin: 'auto', padding: 3 }}>
      <Typography variant="h4" gutterBottom>Register Your Organisation</Typography>
      <form onSubmit={handleSubmit}>
        <TextField label="Name" name="username" variant="outlined" fullWidth margin="normal" value={formData.username} onChange={handleChange} required />
        <TextField label="Email" name="email" variant="outlined" fullWidth margin="normal" value={formData.email} onChange={handleChange} required type="email" />
        
        <TextField label="Organisation" name="organisation" variant="outlined" fullWidth margin="normal" value={formData.organisation} onChange={handleChange} required />
        
        <TextField label="Role" name="role" variant="outlined" fullWidth margin="normal" value={formData.role} onChange={handleChange} required />
        
        <TextField label="Password" name="password" variant="outlined" fullWidth margin="normal" value={formData.password} onChange={handleChange} required type="password" />
        
        <FormControl fullWidth margin="normal">
          <InputLabel>Sector</InputLabel>
          <Select label="Sector" name="sector" value={formData.sector} onChange={handleChange} required>
            <MenuItem value=""><em>Select Sector</em></MenuItem>
            {sectors.map((sector) => (
              <MenuItem key={sector} value={sector.toLowerCase()}>{sector}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth margin="normal">
          <InputLabel>Employee Count</InputLabel>
          <Select label="Employee Count" name="employeeCount" value={formData.employeeCount} onChange={handleChange} required>
            <MenuItem value=""><em>Select</em></MenuItem>
            {employeeCounts.map((count) => (
              <MenuItem key={count} value={count}>{count}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth margin="normal">
          <InputLabel>Revenue</InputLabel>
          <Select label="Revenue" name="revenue" value={formData.revenue} onChange={handleChange} required>
            <MenuItem value=""><em>Select</em></MenuItem>
            {revenues.map((revenue) => (
              <MenuItem key={revenue} value={revenue}>{revenue}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button type="submit" variant="contained" color="primary" fullWidth disabled={loading} sx={{ mt: 2 }}>
          {loading ? <CircularProgress size={24} /> : 'Register'}
        </Button>
      </form>

      {errorMessage && <Alert severity="error" sx={{ mt: 2 }}>{errorMessage}</Alert>}

      {classification && (
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant="h6">Your Classification: {classification}</Typography>
          <Button variant="contained" color="secondary" onClick={() => navigate('/login')} sx={{ mt: 2 }}>
            Proceed to Login
          </Button>
        </Box>
      )}
    </Box>
  );
}

export default Registration;






