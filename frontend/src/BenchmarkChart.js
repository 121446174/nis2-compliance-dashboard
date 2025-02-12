// BenchmarkChart.js
import React, { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress, Alert } from '@mui/material';
import { Bar } from 'react-chartjs-2';

function BenchmarkChart() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [comparison, setComparison] = useState(null);

  const token = localStorage.getItem('token');
  const userId = token ? JSON.parse(atob(token.split('.')[1])).userId : null;

  const fetchComparisonData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`http://localhost:5000/api/benchmark/comparison/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to fetch benchmark data.');
      }
      const data = await res.json();
      setComparison(data);
    } catch (err) {
      console.error('Error fetching benchmark data:', err);
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
      setLoading(false);
    }
  }, [userId]);

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!comparison) return null;

  const { userRiskScore, benchmark } = comparison;

  // Prepare the chart data
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
        data: [
          userRiskScore.Normalized_Score,
          userRiskScore.Normalized_Score,
          userRiskScore.Normalized_Score,
        ],
        backgroundColor: ['#e91e63'],
      },
    ],
  };

  return (
    <Box sx={{ width: '100%', height: '400px' }}>
      <Typography variant="h6" sx={{ mb: 1 }}>
        Sector Benchmark Analysis & Your Risk Score
      </Typography>
      <Bar
        data={chartData}
        options={{
          responsive: true,
          maintainAspectRatio: false, // Allows the chart to fill the container's height
          layout: {
            padding: { top: 20, bottom: 20, left: 20, right: 20 },
          },
          scales: {
            x: {
              title: {
                display: true,
                text: 'Score Category',
                font: { size: 14 },
              },
              ticks: {
                font: { size: 12 },
              },
            },
            y: {
              title: {
                display: true,
                text: 'Score Value',
                font: { size: 14 },
              },
              ticks: {
                font: { size: 12 },
              },
            },
          },
          plugins: {
            legend: { position: 'bottom' },
          },
        }}
      />
    </Box>
  );
}

export default BenchmarkChart;


