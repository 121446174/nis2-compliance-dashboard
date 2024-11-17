import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

function CompletionSummary() {
    const navigate = useNavigate();

    const handleNavigate = () => {
        navigate('/dashboard'); 
    };

    return (
        <Box sx={{ maxWidth: 600, margin: 'auto', textAlign: 'center', padding: 3 }}>
            <Typography variant="h4" gutterBottom>Congratulations!</Typography>
            <Typography variant="body1" sx={{ mb: 3 }}>
                You have successfully completed the questionnaire. Your responses have been saved, and your compliance status is being evaluated.
            </Typography>
            <Button
                variant="contained"
                color="primary"
                onClick={handleNavigate}
                sx={{ mt: 2 }}
            >
                Return to Dashboard
            </Button>
        </Box>
    );
}

export default CompletionSummary;
