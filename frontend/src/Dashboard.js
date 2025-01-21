// Dashboard.js
// Enhanced from Iteration 1 using JWT token
// Inspired Source: JWT Decode - npm documentation
// URL: https://www.npmjs.com/package/jwt-decode
// Purpose: Decoding JWT tokens to extract user-specific data (e.g., userId).

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const [riskLevels, setRiskLevels] = useState([]); // Add state for riskLevels
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
      const decodedToken = JSON.parse(atob(token.split('.')[1]));
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

        // Fetch risk levels
        const levelsResponse = await fetch('http://localhost:5000/api/risk/levels');
        if (levelsResponse.ok) {
          const levelsData = await levelsResponse.json();
          setRiskLevels(levelsData); // Store risk levels
        } else {
          console.error('Failed to fetch risk levels');
        }
      } catch (error) {
        setError(error.message || 'An error occurred while fetching data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  const [categoryScores, setCategoryScores] = useState([]);

  useEffect(() => {
    const fetchCategoryScores = async () => {
        const token = localStorage.getItem('token');
        const userId = token ? JSON.parse(atob(token.split('.')[1])).userId : null;

        if (!userId) {
            console.error('No userId found in token'); // Debugging log
            return;
        }

        try {
            console.log('Making API request for category scores'); // Debugging log
            const response = await fetch(`http://localhost:5000/api/category-scores?userId=${userId}`, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });

            console.log('API response status:', response.status); // Debugging log
            if (response.ok) {
                const data = await response.json();
                console.log('Category Scores Data:', data); // Debugging log
                setCategoryScores(data);
            } else {
                const errorResponse = await response.json();
                console.error('API Error:', errorResponse); // Debugging log
            }
        } catch (err) {
            console.error('Error fetching category scores:', err);
        }
    };

    fetchCategoryScores();
}, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

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
          {/* Header Buttons */}
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
  
          {/* Welcome Message */}
          <Typography variant="h4" gutterBottom>
            Welcome, {userData.name || 'User'}
          </Typography>
  
          {/* User Information */}
          <Grid container spacing={3} sx={{ mt: 2 }}>
            <Grid item xs={12}>
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
          </Grid>
  
          {/* Category Breakdown and Risk Assessment (Side by Side) */}
          <Grid container spacing={3} sx={{ mt: 2 }}>
            {/* Category Breakdown */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6">Category Compliance Overview</Typography>
                  {categoryScores.length > 0 ? (
                    <div>
                      {categoryScores.map((category) => (
                        <div key={category.category} style={{ marginBottom: '10px' }}>
                          <Typography variant="subtitle2">{category.category}</Typography>
                          <Box
                            sx={{
                              height: 10,
                              background: '#E0E0E0',
                              borderRadius: 5,
                              overflow: 'hidden',
                              mt: 1,
                            }}
                          >
                            <Box
                              sx={{
                                height: '100%',
                                width: `${category.percentage}%`,
                                background: '#6C63FF',
                              }}
                            ></Box>
                          </Box>
                          <Typography variant="caption" sx={{ display: 'block', mt: 1 }}>
                            {Math.round(category.percentage)}% compliance
                          </Typography>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <Typography color="textSecondary">
                      No data available. Complete the questionnaire to see results!
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
  
            {/* Risk Assessment */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6">Risk Assessment</Typography>
                  {riskData && riskData.totalScore !== undefined && riskData.maxPossibleScore !== undefined ? (
                    <RiskChart
                      totalScore={riskData.totalScore}
                      maxPossibleScore={riskData.maxPossibleScore}
                      riskLevel={riskData.riskLevel}
                      riskLevels={riskLevels} // Pass fetched riskLevels
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
  
          {/* Help Dialog */}
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
