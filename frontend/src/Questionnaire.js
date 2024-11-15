import React, { useEffect, useState, useContext } from 'react';
import { Typography, Box, CircularProgress, Alert, Select, MenuItem, TextField, Button } from '@mui/material';
import { UserContext } from './UserContext';

function Questionnaire() {
    const { userId, classificationType } = useContext(UserContext);
    const [categories, setCategories] = useState([]);
    const [questions, setQuestions] = useState([]);
    const [categoryId, setCategoryId] = useState(null);
    const [responses, setResponses] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch categories
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`http://localhost:5000/api/questionnaire/categories?classificationType=${classificationType}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                const data = await response.json();
                if (!response.ok) throw new Error(data.error || 'Failed to load categories');
                setCategories(data);
                setCategoryId(data[0]?.Category_ID || null); // Set first category as default
            } catch (error) {
                console.error(error);
                setError('Failed to load categories');
            }
        };
        fetchCategories();
    }, [classificationType]);

    // Fetch questions
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
                setResponses({}); // Reset responses for the new category
                setLoading(false);
            } catch (error) {
                console.error(error);
                setError('Failed to load questions');
            }
        };
        fetchQuestions();
    }, [classificationType, categoryId]);

    // Handle response change
    const handleResponseChange = (questionId, value) => {
        setResponses(prev => ({ ...prev, [questionId]: value }));
    };

    // Submit answers
    const handleSubmit = async () => {
        try {
            const token = localStorage.getItem('token');
            const answers = Object.entries(responses).map(([questionId, response]) => ({
                questionId: parseInt(questionId, 10),
                response
            }));

            const response = await fetch(`http://localhost:5000/api/questionnaire/submit-answers`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ userId, answers, categoryId })
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Failed to submit answers');
            alert('Responses saved successfully');
        } catch (error) {
            console.error(error);
            setError('Failed to submit responses');
        }
    };

    if (loading) return <CircularProgress />;
    if (error) return <Alert severity="error">{error}</Alert>;

    return (
        <Box sx={{ maxWidth: 700, margin: 'auto', padding: 3 }}>
            <Typography variant="h4" gutterBottom>{classificationType} Sector Compliance Questionnaire</Typography>

            {/* Category Selector */}
            <Select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} fullWidth sx={{ mb: 3 }}>
                {categories.map(category => (
                    <MenuItem key={category.Category_ID} value={category.Category_ID}>
                        {category.Category_Name}
                    </MenuItem>
                ))}
            </Select>

            {/* Render Questions and Input Fields */}
            {questions.map(question => (
                <Box key={question.Question_ID} sx={{ mb: 2 }}>
                    <Typography>{question.Question_Text}</Typography>
                    {question.Answer_Type === 'yes_no' && (
                        <Select
                            value={responses[question.Question_ID] || ''}
                            onChange={(e) => handleResponseChange(question.Question_ID, e.target.value)}
                            fullWidth
                        >
                            <MenuItem value="yes">Yes</MenuItem>
                            <MenuItem value="no">No</MenuItem>
                        </Select>
                    )}
                    {question.Answer_Type === 'text' && (
                        <TextField
                            value={responses[question.Question_ID] || ''}
                            onChange={(e) => handleResponseChange(question.Question_ID, e.target.value)}
                            fullWidth
                            multiline
                            rows={3}
                        />
                    )}
                    {question.Answer_Type === 'numeric' && (
                        <TextField
                            type="number"
                            value={responses[question.Question_ID] || ''}
                            onChange={(e) => handleResponseChange(question.Question_ID, e.target.value)}
                            fullWidth
                        />
                    )}
                </Box>
            ))}

            {/* Submit Button */}
            <Button variant="contained" color="primary" onClick={handleSubmit} sx={{ mt: 3 }}>
                Submit Responses
            </Button>
        </Box>
    );
}

export default Questionnaire;
