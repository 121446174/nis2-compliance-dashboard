import React, { useEffect, useState, useContext } from 'react'; // Import React and Hooks
import {
    Typography,
    Box,
    Card,
    CardContent,
    Button,
    CircularProgress,
    Alert,
    FormControl,
    RadioGroup,
    FormControlLabel,
    Radio,
    Divider,
} from '@mui/material'; // Import Material UI components
import { UserContext } from './UserContext'; // Import UserContext here
import './SectorSpecificQuestions.css'; // Import CSS

function SectorSpecificQuestions() {
    const { userId, sectorId } = useContext(UserContext); // Use UserContext inside the component
    console.log('Sector ID from UserContext:', sectorId); // Debug: Log sectorId

    const [sectorQuestions, setSectorQuestions] = useState([]);
    const [responses, setResponses] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch sector-specific questions
    useEffect(() => {
        const fetchSectorQuestions = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('token');
                const response = await fetch('http://localhost:5000/api/questionnaire/sector-specific', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    console.error('API Error:', errorData.error);
                    throw new Error(errorData.error || 'Failed to load sector-specific questions');
                }

                const data = await response.json();
                console.log('Sector-specific questions received:', data);
                setSectorQuestions(data);
            } catch (error) {
                console.error('Error fetching sector-specific questions:', error);
                setError('Failed to load sector-specific questions');
            } finally {
                setLoading(false);
            }
        };

        fetchSectorQuestions();
    }, []);

    const handleResponseChange = (questionId, value) => {
        setResponses((prev) => ({ ...prev, [questionId]: value }));
    };

    const handleSubmitSectorQuestions = async () => {
        if (!sectorQuestions.every((q) => responses[q.Question_ID] !== undefined)) {
            setError('Please answer all sector-specific questions before submitting.');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const answers = sectorQuestions.map((q) => ({
                questionId: q.Question_ID,
                response: responses[q.Question_ID],
            }));

            const response = await fetch('http://localhost:5000/api/questionnaire/submit-sector-answers', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userId, answers }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Failed to save sector-specific answers');

            alert('Sector-specific responses saved successfully');
        } catch (error) {
            console.error('Failed to save sector-specific responses:', error);
            setError('Failed to save sector-specific responses.');
        }
    };

    if (loading) return <CircularProgress />;
    if (error) return <Alert severity="error">{error}</Alert>;

    return (
        <Box className="sector-specific-container">
            <Typography variant="h4" className="sector-specific-title">
                Sector-Specific Questions
            </Typography>
            {sectorQuestions.map((question) => (
                <Card key={question.Question_ID} className="sector-question-card">
                    <CardContent>
                        <Typography variant="h6">{question.Question_Text}</Typography>
                        <FormControl>
                            <RadioGroup
                                row
                                value={responses[question.Question_ID] || ''}
                                onChange={(e) => handleResponseChange(question.Question_ID, e.target.value)}
                            >
                                <FormControlLabel value="0" control={<Radio />} label="Yes" />
                                <FormControlLabel value="1" control={<Radio />} label="No" />
                            </RadioGroup>
                        </FormControl>
                    </CardContent>
                </Card>
            ))}

            <Button
                variant="contained"
                color="primary"
                onClick={handleSubmitSectorQuestions}
                sx={{ mt: 3 }}
            >
                Submit Sector Questions
            </Button>
        </Box>
    );
}

export default SectorSpecificQuestions;
