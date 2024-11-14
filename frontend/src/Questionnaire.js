import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Typography, Box, CircularProgress, Alert } from '@mui/material';

function Questionnaire() {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  // Function to fetch questionnaire questions
  useEffect(() => {
    const fetchQuestions = async () => {
      // Retrieve the JWT token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        // Redirect to login if no token is found
        navigate('/login');
        return;
      }

      try {
        const response = await fetch('http://localhost:5000/api/questionnaire/questions', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`, // Include the token in the headers
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch questions');
        }

        const data = await response.json();
        setQuestions(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [navigate]);

  return (
    <Box sx={{ maxWidth: 600, margin: 'auto', padding: 3 }}>
      <Typography variant="h4" gutterBottom>Compliance Questionnaire</Typography>
      {loading ? (
        <CircularProgress />
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : questions.length > 0 ? (
        questions.map((question) => (
          <Box key={question.Question_ID} sx={{ mb: 2 }}>
            <Typography variant="h6">{question.Question_Text}</Typography>
            {/* Add input fields for each question response here if needed */}
          </Box>
        ))
      ) : (
        <Alert severity="info">No questions available.</Alert>
      )}
    </Box>
  );
}

export default Questionnaire;