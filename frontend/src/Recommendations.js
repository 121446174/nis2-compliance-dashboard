import React, { useEffect, useState } from 'react';
import {
    Typography, Box, CircularProgress, Alert, Grid, Paper
} from '@mui/material';

// Define risk level priorities
const riskLevelsOrder = { 'Critical': 1, 'Very High': 2, 'High': 3, 'Medium': 4, 'Low': 5 };

// Define colors based on risk level
const riskColors = {
    'Critical': '#d32f2f',  // Red
    'Very High': '#ff5722', // Deep Orange
    'High': '#ff9800',      // Orange
    'Medium': '#ffeb3b',    // Yellow
    'Low': '#4caf50'        // Green
};

// Define categories
const categories = [
    { id: 'governance', name: 'Governance' },
    { id: 'third_party', name: 'Third Party Risk Management' },
    { id: 'incident_response', name: 'Incident Response' },
    { id: 'supply_chain', name: 'Supply Chain' },
    { id: 'sector', name: 'Sector-Specific Recommendations' }
];

function Recommendations() {
    const [loading, setLoading] = useState(true);
    const [recommendations, setRecommendations] = useState([]);
    const [categoryRisks, setCategoryRisks] = useState({});
    const [error, setError] = useState(null);

    const token = localStorage.getItem('token');
    const userId = token ? JSON.parse(atob(token.split('.')[1])).userId : null;

    useEffect(() => {
        const fetchRecommendations = async () => {
            try {
                if (!userId) throw new Error('User ID is missing.');
                
                const response = await fetch(`http://localhost:5000/api/recommendations/${userId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (!response.ok) throw new Error('Failed to fetch recommendations.');
                
                const result = await response.json();
                const recommendations = result || [];

                console.log("✅ API Response: ", recommendations);

                // ✅ FIXED: Sort recommendations by risk level dynamically
                const sortedRecs = [...recommendations].sort((a, b) => 
                    (riskLevelsOrder[a.risk_level] || 99) - (riskLevelsOrder[b.risk_level] || 99)
                );

                setRecommendations(sortedRecs);
            } catch (err) {
                console.error('Error fetching recommendations:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchRecommendations();
    }, [userId]);

    if (loading) return <CircularProgress />;
    if (error) return <Alert severity="error">{error}</Alert>;

    // ✅ FIXED: Categorize recommendations properly
    const categorizedRecs = {
        governance: [],
        third_party: [],
        incident_response: [],
        supply_chain: [],
        sector: []
    };

    recommendations.forEach((rec) => {
        if (rec.sector_id) {
            categorizedRecs.sector.push(rec); // ✅ FIXED: Adding sector recommendations
        } else if (rec.category_id === 1) {
            categorizedRecs.governance.push(rec);
        } else if (rec.category_id === 5 || rec.category_id === 6) {
            categorizedRecs.third_party.push(rec);
        } else if (rec.category_id === 3) {
            categorizedRecs.incident_response.push(rec);
        } else {
            categorizedRecs.supply_chain.push(rec);
        }
    });

    console.log("✅ Categorized Recommendations: ", categorizedRecs);

    return (
        <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', textAlign: 'center' }}>
                Your Personalised Cybersecurity Recommendations
            </Typography>

            <Grid container spacing={3}>
                {categories.map(({ id, name }) => (
                    <Grid item xs={12} sm={6} key={id}>
                        <Paper elevation={3} sx={{ p: 3, backgroundColor: '#f5f5f5' }}>
                            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, textAlign: 'center' }}>
                                {name}
                            </Typography>
                            {categorizedRecs[id].length === 0 ? (
                                <Typography variant="body2" sx={{ color: 'gray', textAlign: 'center' }}>
                                    No recommendations in this category.
                                </Typography>
                            ) : (
                                categorizedRecs[id].map((rec) => (
                                    <Paper
                                        key={rec.id}
                                        sx={{
                                            p: 2, mb: 2,
                                            backgroundColor: riskColors[rec.risk_level] || '#ffffff',
                                            color: rec.risk_level === 'Low' ? 'black' : 'white'
                                        }}
                                    >
                                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                            {rec.recommendation_text}
                                        </Typography>
                                        <Typography variant="body2">
                                            <strong>Impact:</strong> {rec.impact}
                                        </Typography>
                                    </Paper>
                                ))
                            )}
                        </Paper>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
}

export default Recommendations;






