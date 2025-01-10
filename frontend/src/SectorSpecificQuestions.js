import React, { useEffect, useState, useContext } from 'react';
import {
    Typography,
    Box,
    CircularProgress,
    Alert,
    FormControl,
    RadioGroup,
    FormControlLabel,
    Radio,
    TextField,
    Select,
    MenuItem,
    Button,
} from '@mui/material';
import { UserContext } from './UserContext';

function SectorSpecificQuestions() {
    const { userId, sectorId } = useContext(UserContext); // Access userId from UserContext
    console.log('Sector ID in SectorSpecificQuestions:', sectorId);
    const [sectorQuestions, setSectorQuestions] = useState([]);
    const [responses, setResponses] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch questions
    useEffect(() => {
        const fetchSectorQuestions = async () => {
            try {
                console.log('Fetching questions for sectorId:', sectorId);
                const token = localStorage.getItem('token');
                const response = await fetch(
                    `http://localhost:5000/api/questionnaire/sector-specific?sectorId=${sectorId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'application/json',
                        },
                    }
                );

                if (!response.ok) {
                    const data = await response.json();
                    throw new Error(data.error || 'Failed to fetch sector-specific questions');
                }

                const data = await response.json();
                console.log('Fetched sector questions:', data);
                setSectorQuestions(data);
                setError(null);
            } catch (err) {
                console.error('Error fetching questions:', err.message);
                setError(err.message || 'An error occurred while loading questions.');
            } finally {
                setLoading(false);
            }
        };

        fetchSectorQuestions();
    }, [sectorId]);

    // Handle responses
    const handleResponseChange = (questionId, value) => {
        setResponses((prev) => ({
            ...prev,
            [questionId]: value,
        }));
    };

    // Submit responses
    const handleSubmit = async () => {
        try {
            const token = localStorage.getItem('token');
            const answers = sectorQuestions.map((question) => ({
                questionId: question.Question_ID,
                response: responses[question.Question_ID],
            }));

            console.log('Submitting sector-specific answers:', { userId, answers });

            const response = await fetch('http://localhost:5000/api/questionnaire/submit-sector-answers', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userId, answers }), // Include userId in the payload
            });

            if (!response.ok) {
                const data = await response.json(); // Corrected variable name
                console.error('Error response from API:', data);
                throw new Error(data.error || 'Failed to submit responses');
            }

            alert('Responses submitted successfully!');
        } catch (err) {
            console.error('Error submitting responses:', err.message);
            setError(err.message || 'Failed to submit responses.');
        }
    };

    // Render input based on answer type
    const renderInputForAnswerType = (question) => {
        switch (question.Answer_Type) {
            case 'yes_no':
                return (
                    <FormControl>
                        <RadioGroup
                            row
                            value={responses[question.Question_ID] || ''}
                            onChange={(e) => handleResponseChange(question.Question_ID, e.target.value)}
                        >
                            <FormControlLabel value="Yes" control={<Radio />} label="Yes" />
                            <FormControlLabel value="No" control={<Radio />} label="No" />
                        </RadioGroup>
                    </FormControl>
                );
            case 'text':
                return (
                    <TextField
                        fullWidth
                        multiline
                        rows={3}
                        value={responses[question.Question_ID] || ''}
                        onChange={(e) => handleResponseChange(question.Question_ID, e.target.value)}
                        placeholder="Enter your response here"
                    />
                );
            case 'multiple_choice':
                const options = JSON.parse(question.MCQ_Options || '[]');
                return (
                    <FormControl fullWidth>
                        <Select
                            value={responses[question.Question_ID] || ''}
                            onChange={(e) => handleResponseChange(question.Question_ID, e.target.value)}
                        >
                            {options.map((option, index) => (
                                <MenuItem key={index} value={option}>
                                    {option}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                );
            default:
                return <Typography variant="body2">Unknown question type</Typography>;
        }
    };

    // Loading state
    if (loading) {
        return <CircularProgress />;
    }

    // Error state
    if (error) {
        return <Alert severity="error">{error}</Alert>;
    }

    // Render questions
    return (
        <Box>
            <Typography variant="h4">Sector-Specific Questions</Typography>
            {sectorQuestions.length === 0 ? (
                <Typography>No questions available for your sector.</Typography>
            ) : (
                sectorQuestions.map((question) => (
                    <Box
                        key={question.Question_ID}
                        sx={{
                            marginBottom: 2,
                            padding: 2,
                            border: '1px solid #ccc',
                            borderRadius: '5px',
                            backgroundColor: '#f9f9f9',
                        }}
                    >
                        <Typography variant="h6">{question.Question_Text}</Typography>
                        {renderInputForAnswerType(question)}
                    </Box>
                ))
            )}
            {sectorQuestions.length > 0 && (
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSubmit}
                    disabled={sectorQuestions.some((q) => !responses[q.Question_ID])}
                >
                    Submit Responses
                </Button>
            )}
        </Box>
    );
}

export default SectorSpecificQuestions;



