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
  const [benchmark, setBenchmark] = useState(null);

  const token = localStorage.getItem('token');
  // Decode user ID from token (assuming token payload includes "userId")
  const userId = token ? JSON.parse(atob(token.split('.')[1])).userId : null;

  const fetchBenchmarks = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`http://localhost:5000/api/benchmark/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => {});
        const errMsg = errData?.error || 'Failed to fetch sector benchmarks.';
        throw new Error(errMsg);
      }

      const data = await res.json();
      if (data.length > 0) {
        // We expect one benchmark record for the user's sector
        setBenchmark(data[0]);
      } else {
        throw new Error('No benchmark data available for your sector.');
      }
    } catch (err) {
      console.error('Error fetching benchmarks:', err);
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

      await fetchBenchmarks();
    } catch (err) {
      console.error('Error recalculating benchmarks:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchBenchmarks();
    } else {
      setError('User not logged in.');
    }
  }, [userId]);

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!benchmark) return null;

  // Prepare data for the bar chart
  const chartData = {
    labels: ['Internal Avg', 'External Score', 'Blended Score'],
    datasets: [
      {
        label: 'Benchmark Scores',
        data: [benchmark.internal_avg, benchmark.external_score, benchmark.blended_score],
        backgroundColor: ['#1976d2', '#ff9800', '#4caf50'],
      },
    ],
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', mt: 2 }}>
      <Typography variant="h4" sx={{ mb: 2 }}>
        Sector Benchmark Analysis
      </Typography>

      <Button
        variant="contained"
        color="primary"
        onClick={handleRecalc}
        sx={{ mb: 3 }}
      >
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
        <Typography variant="body1">
          <strong>What This Means:</strong>
        </Typography>
        <Typography variant="body2">
          - The <strong>Internal Avg</strong> is calculated from your compliance scores.
        </Typography>
        <Typography variant="body2">
          - The <strong>External Score</strong> is sourced from industry benchmarks.
        </Typography>
        <Typography variant="body2">
          - The <strong>Blended Score</strong> combines these scores using a 30/70 weighting.
        </Typography>
      </Box>
    </Box>
  );
}

export default BenchmarkSectors;


