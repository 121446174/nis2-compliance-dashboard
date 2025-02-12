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
import { Bar } from 'react-chartjs-2';
import RiskChart from './RiskChart'; // Import the RiskChart component
import BenchmarkChart from './BenchmarkChart'; 

function Dashboard() {
    const navigate = useNavigate();
    const [userData, setUserData] = useState(null);
    const [riskData, setRiskData] = useState(null);
    const [riskLevels, setRiskLevels] = useState([]);
    const [recommendations, setRecommendations] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [helpOpen, setHelpOpen] = useState(false);
    const [allRecommendations, setAllRecommendations] = useState([]);  
const [topRecommendations, setTopRecommendations] = useState([]);  


  // Fetch user data
  // Source: StakeOverflow - LocalStorage getItem token 
  // https://stackoverflow.com/questions/57197803/localstorage-getitem-token-returns-null
  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      // Decode token to get userId
      // Source: Stack Overflow - Decode JWT Tokens in React
      const decodedToken = JSON.parse(atob(token.split('.')[1]));
      const userId = decodedToken.userId;

      try {

        // Fetch user data
        //Source: MDN Web Docs - Fetch API
        const response = await fetch(`http://localhost:5000/user/${userId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

      // Error handling fetchinh data 
      // Source: MDN Web Docs - Fetch API
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch user data');
        }

        const data = await response.json();
        setUserData(data);

        // Fetch risk assessment data
        // Source: Stack Overflow - Fetch with Await
        const riskResponse = await fetch('http://localhost:5000/api/risk/score/calculate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ userId }),
        });

       // Error handling fetchinh data 
      // Source: MDN Web Docs - Fetch API
        if (riskResponse.ok) {
          const risk = await riskResponse.json();
          setRiskData(risk); // Store risk score and level
        } else {
          setRiskData({ totalScore: 0, maxPossibleScore: 100, riskLevel: 'Unknown' }); // Default fallback
        }

        // Fetch risk levels
        // Source: Stack Overflow - Fetch with Await
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

  // Fetch category scores
  // Manage local state for catrgory scores 
  const [categoryScores, setCategoryScores] = useState([]);

  //  Source: benmvp - "Handling Async in React useEffect"
  // Source: Stack Overflow - Decode JWT Token in JavaScript
  useEffect(() => {
    const fetchCategoryScores = async () => {
        const token = localStorage.getItem('token');
        const userId = token ? JSON.parse(atob(token.split('.')[1])).userId : null;

        if (!userId) {
            console.error('No userId found in token'); 
            return;
        }

        try {
            console.log('Making API request for category scores'); 
            //Source: MDN Web Docs - Fetch API
            const response = await fetch(`http://localhost:5000/api/category-scores?userId=${userId}`, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });

            console.log('API response status:', response.status); 
            if (response.ok) {
                const data = await response.json();
                console.log('Category Scores Data:', data); 
                setCategoryScores(data);
            } else {
                const errorResponse = await response.json();
                console.error('API Error:', errorResponse); 
            }
        } catch (err) {
            console.error('Error fetching category scores:', err);
        }
    };

    fetchCategoryScores();
}, []);

// SHOW Top 5 Recommendations (Based on Risk Level)
// Inspired Source: MDN Web Docs, "fetch() API" 
// Purpose: Fetch recommendations for the current user using an API request. 
// URL: https://developer.mozilla.org/en-US/docs/Web/API/Window/fetch#checking_response_status
useEffect(() => {
  const fetchRecommendations = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

 // Inspired by: Auth0 Community discussion on decoding tokens
// Purpose: Retrieve the userId from the stored JWT token in localStorage https://community.auth0.com/t/decoding-token-atob-fails-if-i-include-users-picture/151202
    const userId = JSON.parse(atob(token.split('.')[1])).userId;
    try {
      console.log('Fetching recommendations...');
      const response = await fetch(`http://localhost:5000/api/recommendations/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to fetch recommendations');

      let recs = await response.json();
      console.log('All Recommendations Data:', recs);

      setAllRecommendations(recs); // Store ALL recommendations
    } catch (err) {
      console.error('Error fetching recommendations:', err);
    }
  };

  fetchRecommendations();
}, []); 

// PROCESS Top 5 Recommendations
// Inspired Reference: "JS - Get Top 5 Max Elements from Array" - Sorting & Slicing to Extract Top 5
// URL: https://stackoverflow.com/questions/3954438/how-to-sort-an-array-in-javascript 
// URL: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort  // Chatgpt Assistance (Prompt in READMEFILE)
useEffect(() => {
  if (allRecommendations.length > 0) {
    console.log('Processing top 5 recommendations...');

    const riskLevelsOrder = { Critical: 1, "Very High": 2, High: 3, Medium: 4, Low: 5 };

    const sortedTop5 = [...allRecommendations]
      .filter(rec => rec.risk_level) // Ensure valid risk levels
      .sort((a, b) => (riskLevelsOrder[a.risk_level] || 99) - (riskLevelsOrder[b.risk_level] || 99)) // Sort by risk level
      .slice(0, 5); // Get only the Top 5

    console.log('🔥 Top 5 Sorted Recommendations:', sortedTop5);
    setTopRecommendations(sortedTop5);
  }
}, [allRecommendations]); // Runs when `allRecommendations` updates

// FIX CHART DATA = Process ALL recommendations for the chart
// W3schools Bar Chart - https://www.w3schools.com/js/js_graphics_chartjs.asp
const getRiskChartData = () => {
  console.log("All Recommendations Data:", allRecommendations); // Debugging log

  if (!allRecommendations || allRecommendations.length === 0) {
    console.warn("No recommendations available! Defaulting to zeros.");
    return {
      labels: ['Low', 'Medium', 'High', 'Very High', 'Critical'],
      datasets: [
        {
          label: 'Risk Distribution',
          data: [0, 0, 0, 0, 0], // Default empty values
          backgroundColor: ['#4caf50', '#ffeb3b', '#ffa000', '#ff5733', '#d32f2f'],
        },
      ],
    };
  }
// Inspired Reference: "Count Number of Element Occurrences in JavaScript Array" - Using forEach() to count occurrences
// URL: https://stackabuse.com/count-number-of-element-occurrences-in-javascript-array/
  const riskLevels = ['Low', 'Medium', 'High', 'Very High', 'Critical'];
  const riskCounts = { Low: 0, Medium: 0, High: 0, 'Very High': 0, Critical: 0 };

  allRecommendations.forEach((rec) => {
    if (rec.risk_level && riskCounts.hasOwnProperty(rec.risk_level)) {
      riskCounts[rec.risk_level]++;
    }
  });

  console.log("Final Risk Counts (ALL RECOMMENDATIONS):", riskCounts);

  return {
    labels: riskLevels,
    datasets: [
      {
        label: 'Risk Distribution',
        data: riskLevels.map(level => riskCounts[level] || 0),
        backgroundColor: ['#4caf50', '#ffeb3b', '#ffa000', '#ff5733', '#d32f2f'],
      },
    ],
  };
};

// Navigation and routing
//Source: React Router Documentation
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleHelpOpen = () => setHelpOpen(true);
  const handleHelpClose = () => setHelpOpen(false);

  // Dashboard layout
  // Reference: MUI Website
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
          <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid item xs={12} md={6}>
  <Card>
    <CardContent>
      <Typography variant="h6">📊 Risk Level Distribution</Typography>
      <Bar data={getRiskChartData()} options={{ responsive: true, maintainAspectRatio: true }} height={150} />
    </CardContent>
  </Card>
</Grid>

        
<Grid item xs={12} md={6}>
  <Card>
    <CardContent>
      <Typography variant="h6">⭐ Top 5 Risk-Based Recommendations</Typography>
      {topRecommendations.length > 0 ? (
  <ul>
    {topRecommendations.map((rec, index) => (

            <li key={index}>
              <strong>{rec.category_name} ({rec.risk_level} Risk):</strong> {rec.recommendation_text}
            </li>
          ))}
        </ul>
      ) : (
        <Typography>No recommendations available.</Typography>
      )}
    </CardContent>
  </Card>
</Grid>

          </Grid>
          {/* Example: Add a new Grid row for the Benchmark Chart */}
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              {/* The BenchmarkChart component will fetch and render its own data */}
              <BenchmarkChart />
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
