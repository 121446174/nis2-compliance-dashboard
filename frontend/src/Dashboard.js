// Dashboard.js
// Enhanced from Iteration 1 using JWT token
// Inspired Source: JWT Decode - npm documentation
// URL: https://www.npmjs.com/package/jwt-decode
// Purpose: Decoding JWT tokens to extract user-specific data (e.g., userId).

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode'; // Corrected import
import {
  Typography,
  Box,
  CircularProgress,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Card,
  CardContent,
} from '@mui/material';
import RiskChart from './RiskChart'; // Import the RiskChart component

function Dashboard() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [riskData, setRiskData] = useState(null); // State to store risk data
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
        // Fetch user data
        const response = await fetch(`http://localhost:5000/user/${userId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch user data');
        }

        const data = await response.json();
        setUserData(data);

        // Fetch risk assessment data
        const riskResponse = await fetch('http://localhost:5000/api/risk/score/calculate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ userId }),
        });

        if (riskResponse.ok) {
          const risk = await riskResponse.json();
          setRiskData(risk); // Store risk score and level
        } else {
          setRiskData({ totalScore: 0, maxPossibleScore: 100, riskLevel: 'Unknown' }); // Default fallback
        }
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

  // Handlers for Help/Info dialog
  // Reference: https://dev.to/codewithmahadihasan/comprehensive-guide-to-handling-modals-in-react-46je
  const handleHelpOpen = () => setHelpOpen(true);
  const handleHelpClose = () => setHelpOpen(false);

  return (
    <Box sx={{ maxWidth: 900, margin: 'auto', padding: 3 }}>
      {loading ? (
        <CircularProgress />
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : userData ? (
        <>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Button variant="outlined" color="primary" onClick={handleHelpOpen} sx={{ mr: 1 }}>
              Help
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              href="https://docs.google.com/forms"
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

          <Typography variant="h4" gutterBottom>
            Welcome, {userData.name || 'User'}
          </Typography>

          <Grid container spacing={3} sx={{ mt: 2 }}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6">User Information</Typography>
                  <Typography>Email: {userData.email}</Typography>
                  <Typography>Organisation: {userData.organisation}</Typography>
                  <Typography>Role: {userData.role}</Typography>
                  <Typography>Sector: {userData.sector}</Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6">Risk Assessment</Typography>
                  {riskData && riskData.totalScore !== undefined && riskData.maxPossibleScore !== undefined ? (
                    <RiskChart
                      totalScore={riskData.totalScore}
                      maxPossibleScore={riskData.maxPossibleScore}
                      riskLevel={riskData.riskLevel}
                    />
                  ) : (
                    <Typography color="textSecondary">
                      Complete the compliance questionnaire to see your risk score!
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Dialog open={helpOpen} onClose={handleHelpClose}>
            <DialogTitle>How to Use the Dashboard</DialogTitle>
            <DialogContent>
              <Typography>
                This dashboard provides your compliance data and other key information related to NIS2 compliance.
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