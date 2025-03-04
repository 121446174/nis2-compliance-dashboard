import React, { useState, useEffect } from 'react'; 
import {
  Typography,
  Box,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Link,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';

function BenchmarkSectors() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [comparison, setComparison] = useState(null);
// Inspired by: Auth0 Community discussion on decoding tokens
// Purpose: Retrieve the userId from the stored JWT token in localStorage https://community.auth0.com/t/decoding-token-atob-fails-if-i-include-users-picture/151202
  const token = localStorage.getItem('token');
  const userId = token ? JSON.parse(atob(token.split('.')[1])).userId : null;

   // Help Dialog State
   const [helpOpen, setHelpOpen] = useState(false);
   const handleHelpOpen = () => setHelpOpen(true);
   const handleHelpClose = () => setHelpOpen(false);
 
  // Inspired Source: MDN Web Docs, "fetch() API" 
  // Purpose: Fetch recommendations for the current user using an API request. https://developer.mozilla.org/en-US/docs/Web/API/Window/fetch#checking_response_status
  const fetchComparisonData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(
        `http://localhost:5000/api/benchmark/comparison/${userId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (!res.ok) {
        const errData = await res.json().catch(() => {});
        const errMsg = errData?.error || 'Failed to fetch comparison data.';
        throw new Error(errMsg);
      }

      const data = await res.json();
      setComparison(data);
    } catch (err) {
      console.error('Error fetching comparison data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle recalculation of benchmarks
  // Reference: MDN Fetch API - POST Requests
  // https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
  const handleRecalc = async () => {
    try {
      setLoading(true);
      setError(null);

      const reqBody = {
        internalWeight: 30, 
        externalWeight: 70
      };

      const res = await fetch('http://localhost:5000/api/benchmark/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(reqBody)
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => {});
        const errMsg = errData?.error || 'Failed to recalculate benchmarks.';
        throw new Error(errMsg);
      }

      await fetchComparisonData();
    } catch (err) {
      console.error('Error recalculating benchmarks:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

// Automatically fetch data when userId changes
 // Reference: React Docs - useEffect Hook for Fetching Data
  // https://react.dev/reference/react/useEffect
  useEffect(() => {
    if (userId) {
      fetchComparisonData();
    } else {
      setError('User not logged in.');
    }
  }, [userId]);

   // Handle Loading and Errors - Show relevant UI elements
   // Reference: Material-UI CircularProgress and Alert component - https://mui.com/material-ui/react-progress/ and https://mui.com/material-ui/react-alert/
  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!comparison) return null;

  const { userRiskScore, benchmark } = comparison;

  // Prepare data for the bar chart (Internal, External, Blended)
  // W3schools Bar Chart - https://www.w3schools.com/js/js_graphics_chartjs.asp
  const chartData = {
    labels: ['Internal Avg', 'External Score', 'Blended Score'],
    datasets: [
      {
        label: 'Sector Benchmark',
        data: [
          benchmark.internal_avg,
          benchmark.external_score,
          benchmark.blended_score
        ],
        backgroundColor: ['#1976d2', '#ff9800', '#4caf50']
      },
      {
        label: 'Your Risk Score',
        data: [
          userRiskScore.Normalized_Score,
          userRiskScore.Normalized_Score,
          userRiskScore.Normalized_Score
        ],
        backgroundColor: ['#e91e63']
      }
    ]
  };

  return (

    <Box sx={{ maxWidth: 800, mx: 'auto', mt: 2 }}>
      <Typography variant="h4" sx={{ mb: 2 }}>
        Sector Benchmark Analysis &amp; Your Risk Score
      </Typography>

 {/* Help Button Added Here  */}
 <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button variant="outlined" color="primary" onClick={handleHelpOpen}>
          Help
        </Button>
      </Box>

      {/* Help Dialog */}
      <Dialog open={helpOpen} onClose={handleHelpClose}>
        <DialogTitle>How to Use the Benchmark Page</DialogTitle>
        <DialogContent>
          <Typography variant="body1">🔹 The table shows a comparison of your risk score against sector benchmarks.</Typography>
          <Typography variant="body1">🔹 Click "Recalculate Benchmarks" to update the scores.</Typography>
          <Typography variant="body1">🔹 The bar chart visualizes the differences between internal, external, and blended scores.</Typography>
          <Typography variant="body1">🔹 Use this data to understand your cybersecurity position in your sector.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleHelpClose} color="primary">Got it!</Button>
        </DialogActions>
      </Dialog>

{/* Recalculate Button Reference: MUI Button API - https://mui.com/material-ui/react-button/ */}
      <Button variant="contained" color="primary" onClick={handleRecalc} sx={{ mb: 3 }}>
        Recalculate Benchmarks
      </Button>
      {/* Recommendations Table 'React Material UI Tutorial - 33 - Table' https://www.youtube.com/watch?v=qk2oY7W3fuY*/}
      <TableContainer component={Paper} sx={{ mb: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <strong>Sector</strong>
              </TableCell>
              <TableCell>
                <strong>Internal Avg</strong>
              </TableCell>
              <TableCell>
                <strong>Your Risk Score (Internal)</strong>
              </TableCell>
              <TableCell>
                <strong>External Score</strong>
              </TableCell>
              <TableCell>
                <strong>Your Risk Score (External)</strong>
              </TableCell>
              <TableCell>
                <strong>Blended Score</strong>
              </TableCell>
              <TableCell>
                <strong>Your Risk Score (Blended)</strong>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow key={benchmark.sector_id}>
              <TableCell>{benchmark.Sector_Name}</TableCell>
              <TableCell>{benchmark.internal_avg.toFixed(2)}</TableCell>
              <TableCell>{userRiskScore.Normalized_Score.toFixed(2)}</TableCell>
              <TableCell>{benchmark.external_score.toFixed(2)}</TableCell>
              <TableCell>{userRiskScore.Normalized_Score.toFixed(2)}</TableCell>
              <TableCell>{benchmark.blended_score.toFixed(2)}</TableCell>
              <TableCell>{userRiskScore.Normalized_Score.toFixed(2)}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
  {/* Reference: Chart.js Data Formatting - https://www.chartjs.org/docs/latest/getting-started/ */}
      <Typography variant="h6" sx={{ mb: 2 }}>
        Benchmark Score Breakdown
      </Typography>
      <Bar data={chartData} />
  {/* Informational Box - Breakdown of Benchmark Scores  - Reference: MUI Box API - https://mui.com/material-ui/api/box/ */}
      <Box sx={{ mt: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 2 }}>
        <Typography variant="body1">
          <strong>What This Means:</strong>
        </Typography>
        <Typography variant="body2">
          - <strong>Internal Avg</strong>: The average risk score from users in your sector.
        </Typography>
        <Typography variant="body2">
          - <strong>External Score</strong>: An industry benchmark score.
        </Typography>
        <Typography variant="body2">
          - <strong>Blended Score</strong>: A weighted score combining internal and external values.
        </Typography>
        <Typography variant="body2" sx={{ mt: 1 }}>
          - Your individual risk score is{' '}
          <strong>{userRiskScore.Normalized_Score.toFixed(2)}</strong>.
        </Typography>

        {/* Conditionally Render the Justification Box If User is Logged In Reference: React Conditional Rendering - https://react.dev/learn/conditional-rendering */}
        {userId && (
          <Box sx={{ mt: 3, p: 2, bgcolor: '#e0e0e0', borderRadius: 2 }}>
            <Typography variant="body2">
              <strong>Justification:</strong>
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              {benchmark.justification}
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              <Link
                href="https://www.enisa.europa.eu/publications/enisa-threat-landscape-2024"
                target="_blank"
                rel="noopener"
              >
                Source: ENISA Threat Landscape 2024
              </Link>
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default BenchmarkSectors;

