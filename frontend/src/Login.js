
// Inspired Source: Adapted input handling and form structure from "Basic Login Form with useState"
// https://dev.to/miracool/how-to-manage-user-authentication-with-react-js-3ic5
//Inspired Source: "How to use UseState Hooks"
//https://daveceddia.com/usestate-hook-examples/
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TextField, Button, Typography, Box, Alert, CircularProgress } from '@mui/material';

function Login() {
  const navigate = useNavigate(); // handle redirections after login
  const [formData, setFormData] = useState({ email: '', password: '' }); //input values initally empty
  const [errorMessage, setErrorMessage] = useState(''); // handling errors
  const [loading, setLoading] = useState(false);

  // Function - Handle changes to the input fields by updating the formData state
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value, //update field 
    });
  };

 // Function - Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    try {
        const response = await fetch('http://localhost:5000/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData), // send form data as JSON
        });

        // Check the response status
        console.log('Response status:', response.status);

        const data = await response.json();
        setLoading(false);

        // Log the full response to check its contents
        console.log('Login response data:', data);

        if (response.ok && data.userId) {
            console.log('User ID received:', data.userId); // Check user ID before redirecting
            // Redirect to dashboard after successful login
            navigate(`/dashboard?userId=${data.userId}`);
        } else {
            // Log any error message received from the server
            console.log('Login error:', data.error || 'Login failed');
            setErrorMessage(data.error || 'Login failed');
        }
    } catch (error) {
        setLoading(false);
        console.error('Error in login request:', error);
        setErrorMessage('An error occurred during login');
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




