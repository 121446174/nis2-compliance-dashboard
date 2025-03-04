import React, { useEffect, useState } from 'react';
import {
    Typography, Box, CircularProgress, Alert, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Paper, TextField, MenuItem, Select, InputLabel, FormControl,  Button, Dialog, DialogTitle, DialogContent, DialogActions,
} from '@mui/material';


// Inspired Source – MDN Web Docs, "Map Object in JavaScript" https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map 
// Define risk level priorities for sorting
const riskLevelsOrder = { 'Critical': 1, 'Very High': 2, 'High': 3, 'Medium': 4, 'Low': 5 };

// Define colors for risk levels
const riskColors = {
    Critical: '#ffcccc',  
    'Very High': '#ffeb99', 
    High: '#ffcc99',  
    Medium: '#ccffcc', 
    Low: '#e6f7ff'  
};

function Recommendations() {
    const [loading, setLoading] = useState(true);
    const [recommendations, setRecommendations] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRisk, setFilterRisk] = useState('');
    const [filterCategory, setFilterCategory] = useState('');
    const [sortOrder, setSortOrder] = useState('desc'); 

   
// Inspired by: Auth0 Community discussion on decoding tokens
// Purpose: Retrieve the userId from the stored JWT token in localStorage https://community.auth0.com/t/decoding-token-atob-fails-if-i-include-users-picture/151202
    const token = localStorage.getItem('token');
    const userId = token ? JSON.parse(atob(token.split('.')[1])).userId : null;

    const [helpOpen, setHelpOpen] = useState(false);
    const handleHelpOpen = () => setHelpOpen(true);
    const handleHelpClose = () => setHelpOpen(false)

// Inspired Source: MDN Web Docs, "fetch() API" 
// Purpose: Fetch recommendations for the current user using an API request. https://developer.mozilla.org/en-US/docs/Web/API/Window/fetch#checking_response_status
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

    // Reference: Material-UI CircularProgress and Alert component - https://mui.com/material-ui/react-progress/ and https://mui.com/material-ui/react-alert/
    if (loading) return <CircularProgress />;
    if (!recommendations.length) return <Alert severity="info">No recommendations available.</Alert>;

   // Filter + Sort Recommendations
   // Used to filter recommendations based on search term, risk level, and category Reference: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter
   // https://www.geeksforgeeks.org/how-to-implement-search-filter-functionality-in-reactjs/
   const filteredRecommendations = recommendations
   .filter(rec => 
       rec.recommendation_text.toLowerCase().includes(searchTerm.toLowerCase()) && // Filters by search term - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/includes
       (filterRisk ? rec.risk_level === filterRisk : true) && // Filters by risk level
       (filterCategory ? rec.category_name === filterCategory : true) // Filters by category
   ) 
   // Used to sort recommendations by risk level in ascending or descending order https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort
   .sort((a, b) => 
       sortOrder === 'asc' 
           ? (riskLevelsOrder[b.risk_level] || 99) - (riskLevelsOrder[a.risk_level] || 99) // Sorts by risk level
           : (riskLevelsOrder[a.risk_level] || 99) - (riskLevelsOrder[b.risk_level] || 99) // Sorts by risk level
   );

    return ( 
                <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
                    <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', textAlign: 'center' }}>
                        Your Personalised Cybersecurity Recommendations
                    </Typography>

                     {/* Help Button Added Here  */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                <Button variant="outlined" color="primary" onClick={handleHelpOpen}>
                    Help
                </Button>
            </Box>

            {/* Help Dialog  */}
            <Dialog open={helpOpen} onClose={handleHelpClose}>
                <DialogTitle>How to Use the Recommendations Page</DialogTitle>
                <DialogContent>
                    <Typography variant="body1">🔹 Use the search bar to find specific recommendations.</Typography>
                    <Typography variant="body1">🔹 Filter recommendations by risk level or category.</Typography>
                    <Typography variant="body1">🔹 Sort recommendations by highest or lowest risk.</Typography>
                    <Typography variant="body1">🔹 Read through the recommendations to understand potential risks and actions.</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleHelpClose} color="primary">Got it!</Button>
                </DialogActions>
            </Dialog>
        
                    {/* Search & Filter Options - 'Search Filter in React JS' https://www.youtube.com/watch?v=xAqCEBFGdYk */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                        <TextField 
                            label="Search Recommendations" 
                            variant="outlined"
                            size="small"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            sx={{ width: '30%' }}
                        />
        
                        {/* Filter by Risk MUI Select Component - https://mui.com/material-ui/react-select/?srsltid=AfmBOorW3g0r41s-LsuhZNfhHw1346l9BTC7jX3s9pMg9Zf7-8wtAGrS*/}
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
        
                        {/* Filter by Category Reference: React Creating Dynamic Select and Option Elements with Material-UI - Stack Overflow - https://stackoverflow.com/questions/65927056/react-creating-dynamic-select-and-option-elements-with-material-ui*/}
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
        
                        {/* Sort by Risk Level MUI Select Component - https://mui.com/material-ui/react-select/?srsltid=AfmBOorW3g0r41s-LsuhZNfhHw1346l9BTC7jX3s9pMg9Zf7-8wtAGrS*/}
                        <FormControl sx={{ minWidth: 150 }}>
                        <InputLabel>Sort by Risk</InputLabel>
                     <Select
                      value={sortOrder}
                      onChange={(e) => setSortOrder(e.target.value)}
                      >
                    <MenuItem value="desc">Highest Risk First</MenuItem> 
                  <MenuItem value="asc">Lowest Risk First</MenuItem> 
              </Select>
           </FormControl>
         </Box>
        
 {/* Recommendations Table 'React Material UI Tutorial - 33 - Table' https://www.youtube.com/watch?v=qk2oY7W3fuY*/}
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