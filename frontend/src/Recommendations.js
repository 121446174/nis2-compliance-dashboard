import React, { useEffect, useState } from 'react';
import {
    Typography, Box, CircularProgress, Alert, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Paper, TextField, MenuItem, Select, InputLabel, FormControl
} from '@mui/material';

// Define risk level priorities for sorting
const riskLevelsOrder = { 'Critical': 1, 'Very High': 2, 'High': 3, 'Medium': 4, 'Low': 5 };

// Define colors for risk levels
const riskColors = {
    Critical: '#ffcccc',  // Light Red
    'Very High': '#ffeb99', // Light Yellow
    High: '#ffcc99',  // Orange
    Medium: '#ccffcc', // Light Green
    Low: '#e6f7ff'  // Light Blue
};

function Recommendations() {
    const [loading, setLoading] = useState(true);
    const [recommendations, setRecommendations] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRisk, setFilterRisk] = useState('');
    const [filterCategory, setFilterCategory] = useState('');
    const [sortOrder, setSortOrder] = useState('desc'); // Default: Highest Risk First

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
                const sortedRecs = result.sort((a, b) => 
                    (riskLevelsOrder[a.risk_level] || 99) - (riskLevelsOrder[b.risk_level] || 99)
                );

                setRecommendations(sortedRecs);
            } catch (err) {
                console.error('Error fetching recommendations:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchRecommendations();
    }, [userId]);

    if (loading) return <CircularProgress />;
    if (!recommendations.length) return <Alert severity="info">No recommendations available.</Alert>;

   // ✅ Filter + Sort Recommendations
   const filteredRecommendations = recommendations
   .filter(rec => 
       rec.recommendation_text.toLowerCase().includes(searchTerm.toLowerCase()) &&
       (filterRisk ? rec.risk_level === filterRisk : true) &&
       (filterCategory ? rec.category_name === filterCategory : true) // ✅ FIXED: Now it properly filters by category
   )
   .sort((a, b) => 
       sortOrder === 'asc' 
           ? (riskLevelsOrder[b.risk_level] || 99) - (riskLevelsOrder[a.risk_level] || 99)  // ✅ FIXED: Sort correctly
           : (riskLevelsOrder[a.risk_level] || 99) - (riskLevelsOrder[b.risk_level] || 99)
   );

            return ( 
                <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
                    <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', textAlign: 'center' }}>
                        Your Personalised Cybersecurity Recommendations
                    </Typography>
        
                    {/* ✅ Search & Filter Options */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                        <TextField 
                            label="Search Recommendations" 
                            variant="outlined"
                            size="small"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            sx={{ width: '30%' }}
                        />
        
                        {/* Filter by Risk */}
                        <FormControl sx={{ minWidth: 150 }}>
                            <InputLabel>Filter by Risk</InputLabel>
                            <Select
                                value={filterRisk}
                                onChange={(e) => setFilterRisk(e.target.value)}
                            >
                                <MenuItem value="">All</MenuItem>
                                <MenuItem value="Critical">Critical</MenuItem>
                                <MenuItem value="Very High">Very High</MenuItem>
                                <MenuItem value="High">High</MenuItem>
                                <MenuItem value="Medium">Medium</MenuItem>
                                <MenuItem value="Low">Low</MenuItem>
                            </Select>
                        </FormControl>
        
                        {/* Filter by Category */}
                        <FormControl sx={{ minWidth: 150 }}>
                            <InputLabel>Filter by Category</InputLabel>
                            <Select
                                value={filterCategory}
                                onChange={(e) => setFilterCategory(e.target.value)}
                            >
                                <MenuItem value="">All</MenuItem>
                                {Array.from(new Set(recommendations.map(rec => rec.category_name)))
                                    .map(category => <MenuItem key={category} value={category}>{category}</MenuItem>)}
                            </Select>
                        </FormControl>
        
                        {/* Sort by Risk Level */}
                        <FormControl sx={{ minWidth: 150 }}>
    <InputLabel>Sort by Risk</InputLabel>
    <Select
        value={sortOrder}
        onChange={(e) => setSortOrder(e.target.value)}
    >
        <MenuItem value="desc">Highest Risk First</MenuItem> {/* Corrected! */}
        <MenuItem value="asc">Lowest Risk First</MenuItem>  {/* Corrected! */}
    </Select>
</FormControl>
</Box>
        
                    {/* ✅ Recommendations Table */}
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell><strong>Category</strong></TableCell>
                                    <TableCell><strong>Risk Level</strong></TableCell>
                                    <TableCell><strong>Recommendation</strong></TableCell>
                                    <TableCell><strong>Impact</strong></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredRecommendations.map((rec) => (
                                    <TableRow key={rec.id}>
                                        <TableCell>{rec.category_name || 'Sector-Specific'}</TableCell>
                                        <TableCell 
                                            sx={{ backgroundColor: riskColors[rec.risk_level] || 'white' }}
                                        >
                                            {rec.risk_level}
                                        </TableCell>
                                        <TableCell>{rec.recommendation_text}</TableCell>
                                        <TableCell>{rec.impact}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>
            );
        }
        
        export default Recommendations;