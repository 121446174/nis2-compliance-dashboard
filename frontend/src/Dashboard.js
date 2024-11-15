// Dashboard.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';  // Use named import
import { Typography, Box, CircularProgress, Alert, Button, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';

function Dashboard() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [helpOpen, setHelpOpen] = useState(false); // Help dialog state

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      // Decode token to get userId
      const decodedToken = jwtDecode(token);
      const userId = decodedToken.userId;

      try {
        const response = await fetch(`http://localhost:5000/user/${userId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`, 
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch user data');
        }

        const data = await response.json();
        setUserData(data);
      } catch (error) {
        setError(error.message || 'An error occurred while fetching data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  // Handlers for Help dialog
  const handleHelpOpen = () => setHelpOpen(true);
  const handleHelpClose = () => setHelpOpen(false);

  return (
    <Box sx={{ maxWidth: 600, margin: 'auto', padding: 3 }}>
      {loading ? (
        <CircularProgress />
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : userData ? (
        <>
          {/* Top-right control buttons */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Button
              variant="outlined"
              color="primary"
              onClick={handleHelpOpen}
              sx={{ mr: 1 }}
            >
              Help
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              href="https://docs.google.com/forms/d/e/1FAIpQLSfZ7pXJVG5wyk4LSH0YF39rOsPq7rtbd5UHHAE7NxBhldptnQ/viewform?usp=sf_link"
              target="_blank"
              rel="noopener noreferrer"
              sx={{ mr: 1 }}
            >
              Give Feedback
            </Button>
            <Button variant="contained" color="secondary" onClick={handleLogout}>
              Logout
            </Button>
          </Box>

          <Typography variant="h4">Welcome, {userData.name || 'User'}</Typography>
          <Typography variant="body1" sx={{ mt: 2 }}>
            Email: {userData.email || 'No Email Provided'}
          </Typography>
          <Typography variant="body1">
            Organisation: {userData.organisation || 'No Organisation Provided'}
          </Typography>
          <Typography variant="body1">
            Role: {userData.role || 'No Role Provided'}
          </Typography>
          <Typography variant="body1" sx={{ mt: 1 }}>
            Sector: {userData.sector || 'No Sector Provided'}
          </Typography>

          {/* Help Dialog */}
          <Dialog open={helpOpen} onClose={handleHelpClose}>
            <DialogTitle>How to Use the Dashboard</DialogTitle>
            <DialogContent>
              <Typography variant="body1">
                This dashboard provides your compliance data, classification, and other key information related to NIS2 compliance.
              </Typography>
              <Typography variant="body2" sx={{ mt: 2 }}>
                Use the navigation bar to access different sections like the compliance questionnaire, roadmap, and benchmarking tools.
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleHelpClose} color="primary">
                Close
              </Button>
            </DialogActions>
          </Dialog>
        </>
      ) : (
        <Alert severity="warning">Please log in to access the dashboard.</Alert>
      )}
    </Box>
  );
}

export default Dashboard;

