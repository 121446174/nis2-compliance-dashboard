import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Typography, Box, CircularProgress, Alert, Button } from '@mui/material';

function Dashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  // Extract userId from URL query params
  const queryParams = new URLSearchParams(location.search);
  const userId = queryParams.get('userId');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch(`http://localhost:5000/user/${userId}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch user data');
        }
        const data = await response.json();
        console.log('Fetched user data:', data); // Debugging log to verify data structure
        setUserData(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId]);

  const handleLogout = () => {
    navigate('/login'); // Redirect to login page
  };

  return (
    <Box sx={{ maxWidth: 600, margin: 'auto', padding: 3 }}>
      {loading ? (
        <CircularProgress />
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <>
          <Typography variant="h4">Welcome, {userData?.name || 'User'}</Typography>
          <Typography variant="body1" sx={{ mt: 2 }}>
            Email: {userData?.email || 'No Email Provided'}
          </Typography>
          <Typography variant="body1">
            Organisation: {userData?.organisation || 'No Organisation Provided'}
          </Typography>
          <Typography variant="body1">
            Role: {userData?.role || 'No Role Provided'}
          </Typography>
          <Typography variant="body1" sx={{ mt: 1 }}>
            Sector: {userData?.sector || 'No Sector Provided'}
          </Typography>

          {/* Logout Button */}
          <Button
            variant="contained"
            color="secondary"
            onClick={handleLogout}
            sx={{ mt: 3 }}
          >
            Logout
          </Button>
        </>
      )}
    </Box>
  );
}

export default Dashboard;

