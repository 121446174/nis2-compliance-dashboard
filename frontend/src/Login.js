// Inspired Source: "Basic Login Form with useState" 
// https://dev.to/miracool/how-to-manage-user-authentication-with-react-js-3ic5
// Modifications: Adapted form submission structure, error handling, and login redirection.

import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { TextField, Button, Typography, Box, Alert, CircularProgress } from '@mui/material';
import { UserContext } from './UserContext';


// Inspired Source: "How to use useState Hooks"
// https://daveceddia.com/usestate-hook-examples/
// Modifications: Used useState to manage multiple form fields in a single object and handle input changes.

function Login() {
  const navigate = useNavigate();
  const { login } = useContext(UserContext); // Use login function from UserContext
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);
  
    try {
      const response = await fetch('http://localhost:5000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
  
      const data = await response.json();
      console.log('Login API Response:', data);
  
      if (response.ok && data.token) {
        // Store token and update UserContext
        localStorage.setItem('token', data.token);
        login(data.userId, data.classificationType, data.sectorId); // Ensure sectorId is passed here
        console.log('After Login - UserContext Sector ID:', data.sectorId);
  
        // Redirect to dashboard
        navigate('/dashboard');
      } else {
        setErrorMessage(data.error || 'Login failed');
      }
    } catch (error) {
      console.error('Error in login request:', error.message);
      setErrorMessage('An error occurred during login');
    } finally {
      setLoading(false);
    }
  
  

  };

  return (
    <Box sx={{ maxWidth: 400, margin: 'auto', padding: 3 }}>
      <Typography variant="h4" gutterBottom>Login</Typography>
      <form onSubmit={handleSubmit}>
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

        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          disabled={loading}
          sx={{ mt: 2 }}
        >
          {loading ? <CircularProgress size={24} /> : 'Login'}
        </Button>
      </form>

      {errorMessage && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {errorMessage}
        </Alert>
      )}
    </Box>
  );
}

export default Login;