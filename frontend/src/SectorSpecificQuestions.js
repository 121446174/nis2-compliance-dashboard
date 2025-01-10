import React, { useEffect, useState, useContext } from 'react';
import { Typography, Box, CircularProgress, Alert } from '@mui/material';
import { UserContext } from './UserContext';

function SectorSpecificQuestions() {
    const { sectorId } = useContext(UserContext);

    const [sectorQuestions, setSectorQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchSectorQuestions = async () => {
            try {
                setLoading(true);
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

    if (loading) {
        return <CircularProgress />;
    }

    if (error) {
        return <Alert severity="error">{error}</Alert>;
    }

    return (
        <Box>
            <Typography variant="h4">Sector-Specific Questions</Typography>
            {sectorQuestions.length === 0 ? (
                <Typography>No questions available for your sector.</Typography>
            ) : (
                sectorQuestions.map((question) => (
                    <Box key={question.Question_ID} style={{ marginBottom: '10px', padding: '10px', border: '1px solid black' }}>
                        <Typography>{question.Question_Text}</Typography>
                    </Box>
                ))
            )}
        </Box>
    );
}

export default SectorSpecificQuestions;

