import React, { useEffect, useState, useContext } from 'react';
import { Typography, Box, CircularProgress, Alert, Button, Select, MenuItem } from '@mui/material';
import { UserContext } from './UserContext';

function Questionnaire() {
    const { userId, classificationType } = useContext(UserContext);
    const [categories, setCategories] = useState([]);
    const [questions, setQuestions] = useState([]);
    const [categoryId, setCategoryId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const token = localStorage.getItem('token'); // Ensure token is available
                const response = await fetch(`http://localhost:5000/api/questionnaire/categories?classificationType=${classificationType}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`, // Include token in Authorization header
                        'Content-Type': 'application/json'
                    }
                });
                const data = await response.json();
                if (!response.ok) throw new Error(data.error || 'Failed to load categories');
                setCategories(data);
                setCategoryId(data[0]?.Category_ID || null); // Set default category
            } catch (error) {
                console.error(error);
                setError('Failed to load categories');
            }
        };
        fetchCategories();
    }, [classificationType]);
    
    useEffect(() => {
        if (!categoryId) return;
        
        const fetchQuestions = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`http://localhost:5000/api/questionnaire/questions?classificationType=${classificationType}&categoryId=${categoryId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                const data = await response.json();
                if (!response.ok) throw new Error(data.error || 'Failed to load questions');
                setQuestions(data);
                setLoading(false);
            } catch (error) {
                console.error(error);
                setError('Failed to load questions');
            }
        };
        fetchQuestions();
    }, [classificationType, categoryId]);
    

    if (loading) return <CircularProgress />;
    if (error) return <Alert severity="error">{error}</Alert>;

    return (
        <Box sx={{ maxWidth: 700, margin: 'auto', padding: 3 }}>
            <Typography variant="h4" gutterBottom>{classificationType} Sector Compliance Questionnaire</Typography>
            <Select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} fullWidth sx={{ mb: 3 }}>
                {categories.map(category => (
                    <MenuItem key={category.Category_ID} value={category.Category_ID}>
                        {category.Category_Name}
                    </MenuItem>
                ))}
            </Select>
            {/* Map and display questions here */}
            {/* Add submission logic */}
        </Box>
    );
}

export default Questionnaire;
