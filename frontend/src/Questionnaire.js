import React, { useEffect, useState, useContext } from 'react';
import { Typography, Box, CircularProgress, Alert, Button, Select, MenuItem, TextField } from '@mui/material';
import { UserContext } from './UserContext';

function Questionnaire() {
    const { userId, classificationType } = useContext(UserContext);
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [responses, setResponses] = useState({});
    const [categoryId, setCategoryId] = useState(1); // Default to first category (Governance)

    // Fetch questions based on classificationType and selected categoryId
    useEffect(() => {
        const fetchQuestions = async () => {
            if (!classificationType || !userId) return;

            try {
                const response = await fetch(`http://localhost:5000/api/questionnaire/questions?classificationType=${classificationType}&categoryId=${categoryId}`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'application/json'
                    }
                });
                const data = await response.json();
                if (!response.ok) throw new Error(data.error || 'Failed to fetch questions');
                setQuestions(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        
        fetchQuestions();
    }, [classificationType, userId, categoryId]);

    const handleResponseChange = (questionId, value) => {
        setResponses(prev => ({ ...prev, [questionId]: value }));
    };

    const handleSubmit = async () => {
        const token = localStorage.getItem('token');
        if (!userId) {
            console.error('User ID is missing');
            return;
        }
    
        try {
            const answers = Object.entries(responses).map(([questionId, response]) => {
                const question = questions.find(q => q.Question_ID === parseInt(questionId));
                
                if (question.Answer_Type === 'yes_no') {
                    response = response.toLowerCase() === 'yes' ? 1 : 0;
                } else if (question.Answer_Type === 'multiple_choice') {
                    response = mapChoiceToScore(response);
                } else if (question.Answer_Type === 'numeric') {
                    response = parseInt(response, 10);
                }
    
                return { questionId: parseInt(questionId), response: response };
            });
    
            const response = await fetch(`http://localhost:5000/api/questionnaire/submit-answers`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ userId, answers, categoryId }) // Include categoryId in request
            });
    
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Error saving responses');
            alert('Responses saved successfully');
            setResponses({}); // Clear responses for the next category if needed
        } catch (error) {
            console.error('Error saving responses:', error);
            alert(`Error: ${error.message}`);
        }
    };

    function mapChoiceToScore(choice) {
        const scoreMap = {
            "High": 3,
            "Medium": 2,
            "Low": 1
        };
        return scoreMap[choice] || 0;
    }

    if (loading) return <CircularProgress />;
    if (error) return <Alert severity="error">{error}</Alert>;

    return (
        <Box sx={{ maxWidth: 700, margin: 'auto', padding: 3 }}>
            <Typography variant="h4" gutterBottom>Essential Sector Compliance Questionnaire</Typography>

            <Select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} fullWidth sx={{ mb: 3 }}>
                <MenuItem value={1}>Governance</MenuItem>
                <MenuItem value={3}>Incident Response</MenuItem>
                <MenuItem value={5}>Supply Chain Security</MenuItem>
                <MenuItem value={6}>Third Party Risk Management</MenuItem>
            </Select>

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

            <Button variant="contained" color="primary" onClick={handleSubmit} sx={{ mt: 3 }}>
                Submit Responses
            </Button>
        </Box>
    );
}

export default Questionnaire;
