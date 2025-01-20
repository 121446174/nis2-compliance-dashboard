import React, { useEffect, useState } from 'react';
import { Typography, Box, CircularProgress, Alert } from '@mui/material';
import RiskChart from './RiskChart';

function RiskResults() {
    const [loading, setLoading] = useState(true);
    const [riskResult, setRiskResult] = useState(null);
    const [error, setError] = useState(null);
    const [riskLevels, setRiskLevels] = useState([]); // Fetch and pass riskLevels dynamically

    const token = localStorage.getItem('token');
    const userId = token ? JSON.parse(atob(token.split('.')[1])).userId : null;

    useEffect(() => {
        const fetchRiskData = async () => {
            try {
                if (!userId) throw new Error('User ID is missing.');

                // Fetch risk score
                const response = await fetch('http://localhost:5000/api/risk/score/calculate', {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ userId }),
                });
                if (!response.ok) throw new Error('Failed to fetch risk score.');

                const riskData = await response.json();
                setRiskResult(riskData);

                // Fetch risk levels
                const levelsResponse = await fetch('http://localhost:5000/api/risk/levels');
                if (!levelsResponse.ok) throw new Error('Failed to fetch risk levels.');

                const levelsData = await levelsResponse.json();
                setRiskLevels(levelsData);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchRiskData();
    }, [userId]);

    if (loading) return <CircularProgress />;
    if (error) return <Alert severity="error">{error}</Alert>;

    return (
        <Box>
            <Typography variant="h4" gutterBottom>
                Risk Assessment Results
            </Typography>
            <Typography variant="body1">
                Risk Level: {riskResult?.riskLevel}
            </Typography>
            <Typography variant="body1">
                Risk Score: {riskResult?.totalScore.toFixed(2)} / {riskResult?.maxPossibleScore.toFixed(2)} (
                {riskResult?.normalizedScore.toFixed(2)}%)
            </Typography>
            <RiskChart
                totalScore={riskResult?.totalScore}
                maxPossibleScore={riskResult?.maxPossibleScore}
                riskLevel={riskResult?.riskLevel}
                riskLevels={riskLevels} // Pass riskLevels here
            />
        </Box>
    );
}

export default RiskResults;


