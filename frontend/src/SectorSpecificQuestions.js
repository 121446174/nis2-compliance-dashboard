import React, { useEffect, useState, useContext } from 'react'; 
import { UserContext } from './UserContext';
import { Box, Typography, CircularProgress, Alert, Button } from '@mui/material';

function SectorSpecificQuestions() {
    const { userId } = useContext(UserContext);
    const [questions, setQuestions] = useState([]);
    const [responses, setResponses] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [submitError, setSubmitError] = useState(null);

    useEffect(() => {
        const fetchSectorQuestions = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`http://localhost:5000/api/questionnaire/sector-questions?userId=${userId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });
                const data = await response.json();
                if (!response.ok) throw new Error(data.error || 'Failed to load sector-specific questions');
                setQuestions(data);
            } catch (err) {
                console.error(err);
                setError('Failed to load sector-specific questions');
            } finally {
                setLoading(false);
            }
        };
        fetchSectorQuestions();
    }, [userId]);

    const handleResponseChange = (questionId, value) => {
        setResponses((prev) => ({ ...prev, [questionId]: value }));
    };

    const handleSubmit = async () => {
        const unansweredQuestions = questions.filter(q => !responses[q.Question_ID]);
        if (unansweredQuestions.length > 0) {
            setSubmitError('Please answer all questions before submitting.');
            return;
        }
        
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/questionnaire/save-sector-responses`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userId, responses }),
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.error || 'Failed to save responses');
            
            // Reset submit error on successful submit
            setSubmitError(null);
            alert('Responses submitted successfully!');
        } catch (error) {
            console.error('Error saving responses:', error);
            setSubmitError('Failed to save responses.');
        }
    };

    if (loading) return <CircularProgress />;
    if (error) return <Alert severity="error">{error}</Alert>;

    return (
        <Box sx={{ maxWidth: 700, margin: 'auto', padding: 3 }}>
            <Typography variant="h4" gutterBottom>Sector-Specific Questions</Typography>
            {questions.map((question) => (
                <Box key={question.Question_ID} sx={{ mb: 2 }}>
                    <Typography>{question.Question_Text}</Typography>
                    <input
                        type={question.Answer_Type === 'numeric' ? 'number' : 'text'}
                        value={responses[question.Question_ID] || ''}
                        onChange={(e) => handleResponseChange(question.Question_ID, e.target.value)}
                        style={{ width: '100%', padding: '8px', marginTop: '8px' }}
                    />
                </Box>
            ))}
            {submitError && <Alert severity="error" sx={{ mt: 2 }}>{submitError}</Alert>}
            <Button variant="contained" color="primary" onClick={handleSubmit} sx={{ mt: 3 }}>
                Submit
            </Button>
        </Box>
    );
}

export default SectorSpecificQuestions;

