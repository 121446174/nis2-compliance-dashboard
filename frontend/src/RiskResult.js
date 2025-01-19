import React, { useEffect, useState } from 'react';
import { Typography, Box, CircularProgress, Alert } from '@mui/material';
import RiskChart from './RiskChart';

function RiskResults() {
    const [loading, setLoading] = useState(true);
    const [riskResult, setRiskResult] = useState(null);
    const [error, setError] = useState(null);

    const token = localStorage.getItem('token');
    const userId = token ? JSON.parse(atob(token.split('.')[1])).userId : null;

    useEffect(() => {
        const fetchRiskScore = async () => {
            if (!userId) {
                setError('User ID is missing.');
                setLoading(false);
                return;
            }

            try {
                const response = await fetch('http://localhost:5000/api/risk/score/calculate', {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ userId }),
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(errorText || 'Failed to fetch risk score');
                }

                const data = await response.json();
                setRiskResult(data);
            } catch (err) {
                setError(err.message || 'Failed to fetch risk score');
            } finally {
                setLoading(false);
            }
        };

        fetchRiskScore();
    }, [userId]);

    if (loading) {
        return <CircularProgress />;
    }

    if (error) {
        return <Alert severity="error">{error}</Alert>;
    }

    return (
        <Box>
            <Typography variant="h4" gutterBottom>
                Risk Assessment Results
            </Typography>
            <Typography variant="body1">
                Risk Level: {riskResult?.riskLevel}
            </Typography>
            <Typography variant="body1">
                Total Score: {riskResult?.totalScore} / {riskResult?.maxPossibleScore}
            </Typography>

            {/* Render the RiskChart */}
            <RiskChart
                totalScore={riskResult?.totalScore}
                maxPossibleScore={riskResult?.maxPossibleScore}
                riskLevel={riskResult?.riskLevel}
            />
        </Box>
    );
}

export default RiskResults;
