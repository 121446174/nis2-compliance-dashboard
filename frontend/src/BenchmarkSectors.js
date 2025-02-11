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
  Button
} from '@mui/material';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';

function BenchmarkSectors() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  // We'll store the comparison data in one object:
  const [comparison, setComparison] = useState(null);

  const token = localStorage.getItem('token');
  // Decode the user ID from the token (assuming it’s in the payload as "userId")
  const userId = token ? JSON.parse(atob(token.split('.')[1])).userId : null;

  const fetchComparisonData = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`http://localhost:5000/api/benchmark/comparison/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

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

  const handleRecalc = async () => {
    try {
      setLoading(true);
      setError(null);

      const reqBody = {
        internalWeight: 30, // These values are now in the DB, but you could allow overrides
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

  useEffect(() => {
    if (userId) {
      fetchComparisonData();
    } else {
      setError('User not logged in.');
    }
  }, [userId]);

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!comparison) return null;

  const { userRiskScore, benchmark } = comparison;

  // Prepare data for the bar chart (Internal, External, Blended)
  const chartData = {
    labels: ['Internal Avg', 'External Score', 'Blended Score'],
    datasets: [
      {
        label: 'Sector Benchmark',
        data: [benchmark.internal_avg, benchmark.external_score, benchmark.blended_score],
        backgroundColor: ['#1976d2', '#ff9800', '#4caf50'],
      },
      {
        label: 'Your Risk Score',
        data: [userRiskScore.Normalized_Score], // Assuming normalized score (0-100)
        backgroundColor: ['#e91e63'],
      }
    ]
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', mt: 2 }}>
      <Typography variant="h4" sx={{ mb: 2 }}>
        Sector Benchmark Analysis & Your Risk Score
      </Typography>

      <Button variant="contained" color="primary" onClick={handleRecalc} sx={{ mb: 3 }}>
        Recalculate Benchmarks
      </Button>

      <TableContainer component={Paper} sx={{ mb: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Sector</strong></TableCell>
              <TableCell><strong>Internal Avg</strong></TableCell>
              <TableCell><strong>External Score</strong></TableCell>
              <TableCell><strong>Blended Score</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow key={benchmark.sectorId || benchmark.benchmark_id}>
              <TableCell>{benchmark.Sector_Name}</TableCell>
              <TableCell>{benchmark.internal_avg.toFixed(2)}</TableCell>
              <TableCell>{benchmark.external_score.toFixed(2)}</TableCell>
              <TableCell>{benchmark.blended_score.toFixed(2)}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      <Typography variant="h6" sx={{ mb: 2 }}>
        Benchmark Score Breakdown
      </Typography>
      <Bar data={chartData} />

      <Box sx={{ mt: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 2 }}>
        <Typography variant="body1"><strong>What This Means:</strong></Typography>
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
          - Your individual risk score is <strong>{userRiskScore.Normalized_Score.toFixed(2)}</strong>.
        </Typography>
      </Box>
    </Box>
  );
}

export default BenchmarkSectors;



