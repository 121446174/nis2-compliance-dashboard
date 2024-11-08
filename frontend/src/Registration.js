// Inspired Source: Tutorialspoint How to Develop User Registration Form in React Js
// https://www.tutorialspoint.com/how-to-develop-user-registration-form-in-react-j
import React, { useState } from 'react';
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


// Modifications: Added sector classification logic for NIS2 compliance needs
  const [classification, setClassification] = useState(null); // classification: store the classification results setClassification: allows you to update
  const [errorMessage, setErrorMessage] = useState(''); // Stores any error messages, especially useful if registration fails.
  const [loading, setLoading] = useState(false); // Tracks whether the registration process is in progress

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

    // Inspired Source: As using Async/Await modified handling the submission of registration data to the backend server with 
    // StackFlow - Proper Way to Make API Fetch 'POST' with Async/Await https://stackoverflow.com/questions/50046841/proper-way-to-make-api-fetch-post-with-async-await
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

  // Inspired Source: Material UI AppBar Documentation for implementation details
// URL: https://mui.com/material-ui/react-app-bar/
// Modifications: Adapted the AppBar and Toolbar layout and responsive design for screen size adjustments

  // List of all sectors
  const sectors = [
    'Energy', 'Transport', 'Banking', 'Financial Market Infrastructure',
    'Drinking Water', 'Waste Water', 'Health', 'Digital Infrastructure',
    'ICT - Service Management B2B', 'Public Administration', 'Space',
    'Postal & Courier Services', 'Waste Management', 'Chemicals', 
    'Foods', 'Manufacturing', 'Digital Providers', 'Research'
  ];

  return (
    <Box sx={{ maxWidth: 400, margin: 'auto', padding: 3 }}>
      <Typography variant="h4" gutterBottom>Register Your Organisation</Typography>
      <form onSubmit={handleSubmit}>

        <TextField
          label="Name"
          name="username"
          variant="outlined"
          fullWidth
          margin="normal"
          value={formData.username}
          onChange={handleChange}
          required
        />
        
        <TextField
          label="Email"
          name="email"
          variant="outlined"
          fullWidth
          margin="normal"
          value={formData.email}
          onChange={handleChange}
          required
          type="email"
        />

        <TextField
          label="Organisation"
          name="organisation"
          variant="outlined"
          fullWidth
          margin="normal"
          value={formData.organisation}
          onChange={handleChange}
          placeholder="Optional"
        />

        <TextField
          label="Role"
          name="role"
          variant="outlined"
          fullWidth
          margin="normal"
          value={formData.role}
          onChange={handleChange}
          placeholder="Optional"
        />

        <TextField
          label="Password"
          name="password"
          variant="outlined"
          fullWidth
          margin="normal"
          value={formData.password}
          onChange={handleChange}
          required
          type="password"
        />
        <FormControl fullWidth margin="normal">
          <InputLabel>Sector</InputLabel>
          <Select
            label="Sector"
            name="sector"
            value={formData.sector}
            onChange={handleChange}
            required
          >
            <MenuItem value=""><em>Select Sector</em></MenuItem>
            {sectors.map((sector) => (
              <MenuItem key={sector} value={sector.toLowerCase()}>
                {sector}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth margin="normal">
          <InputLabel>Employee Count</InputLabel>
          <Select
            label="Employee Count"
            name="employeeCount"
            value={formData.employeeCount}
            onChange={handleChange}
            required
          >
            <MenuItem value=""><em>Select</em></MenuItem>
            <MenuItem value="<50">Less than 50</MenuItem>
            <MenuItem value="50-249">50-249</MenuItem>
            <MenuItem value=">250">250+</MenuItem>
          </Select>
        </FormControl>

        <FormControl fullWidth margin="normal">
          <InputLabel>Revenue</InputLabel>
          <Select
            label="Revenue"
            name="revenue"
            value={formData.revenue}
            onChange={handleChange}
            required
          >
            <MenuItem value=""><em>Select</em></MenuItem>
            <MenuItem value="<10">Under 10 million</MenuItem>
            <MenuItem value="10-50">10-50 million</MenuItem>
            <MenuItem value=">50">Over 50 million</MenuItem>
          </Select>
        </FormControl>

        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          disabled={loading}
          sx={{ mt: 2 }}
        >
          {loading ? <CircularProgress size={24} /> : 'Register'}
        </Button>
      </form>

      {errorMessage && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {errorMessage}
        </Alert>
      )}

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



