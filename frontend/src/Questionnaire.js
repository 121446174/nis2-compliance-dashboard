import React, { useEffect, useState, useContext } from 'react';
import { Typography, Box, CircularProgress, Alert, Button, Select, MenuItem } from '@mui/material';
import { UserContext } from './UserContext';
import { useNavigate } from 'react-router-dom';

function Questionnaire() {
    const { userId, classificationType } = useContext(UserContext);
    const [categories, setCategories] = useState([]);
    const [questions, setQuestions] = useState([]);
    const [responses, setResponses] = useState({});
    const [categoryId, setCategoryId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [completedCategories, setCompletedCategories] = useState(new Set());
    const navigate = useNavigate();

    // Fetch categories on load
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
                setCategoryId(data[0]?.Category_ID || null);
            } catch (error) {
                console.error(error);
                setError('Failed to load categories');
            } finally {
                setLoading(false);
            }
        };
        fetchCategories();
    }, [classificationType]);

    // Fetch questions based on selected category
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

    const handleResponseChange = (questionId, value) => {
        setResponses(prev => ({ ...prev, [questionId]: value }));
    };

    const allQuestionsAnsweredForCategory = () => {
        return questions.every(question => responses[question.Question_ID] !== undefined);
    };

    const handleSubmitCategory = async () => {
        if (!allQuestionsAnsweredForCategory()) {
            setError('Please answer all questions in this category before submitting.');
            return;
        }

        const token = localStorage.getItem('token');
        const answers = questions.map((question) => ({
            questionId: question.Question_ID,
            response: responses[question.Question_ID]
        }));

        try {
            const response = await fetch(`http://localhost:5000/api/questionnaire/submit-answers`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ userId, answers, categoryId })
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Failed to save responses');
            
            alert('Responses for this category saved successfully');

            // Mark category as completed
            setCompletedCategories((prev) => new Set(prev).add(categoryId));
        } catch (error) {
            console.error(error);
            setError('Failed to save responses');
        }
    };

    const allCategoriesCompleted = () => {
        return categories.length > 0 && completedCategories.size === categories.length;
    };

    // Handle navigating to the dashboard
    const handleNext = () => {
        if (!allCategoriesCompleted()) {
            setError('Please complete all categories before proceeding.');
            return;
        }
        navigate('/dashboard'); // Redirect to the dashboard
    };

    if (loading) return <CircularProgress />;
    if (error) return <Alert severity="error">{error}</Alert>;

    return (
        <Box sx={{ maxWidth: 700, margin: 'auto', padding: 3 }}>
            <Typography variant="h4" gutterBottom>{classificationType} Sector Compliance Questionnaire</Typography>
            <Select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} fullWidth sx={{ mb: 3 }}>
                {categories.map(category => (
                    <MenuItem key={category.Category_ID} value={category.Category_ID}>
                        {category.Category_Name} {completedCategories.has(category.Category_ID) ? '✅' : ''}
                    </MenuItem>
                ))}
            </Select>
            {questions.map(question => (
                <Box key={question.Question_ID} sx={{ mb: 2 }}>
                    <Typography>{question.Question_Text}</Typography>
                    <Select
                        value={responses[question.Question_ID] || ''}
                        onChange={(e) => handleResponseChange(question.Question_ID, e.target.value)}
                        fullWidth
                    >
                        <MenuItem value="yes">Yes</MenuItem>
                        <MenuItem value="no">No</MenuItem>
                    </Select>
                </Box>
            ))}
            <Button
                variant="contained"
                color="primary"
                onClick={handleSubmitCategory}
                sx={{ mt: 3 }}
            >
                Submit Category
            </Button>
             <Button
                variant="contained"
                color="secondary"
                onClick={handleNext}
                disabled={!allCategoriesCompleted()} // Disable "Next" until all categories are completed
                sx={{ mt: 3, ml: 2 }}
            >
                Next
            </Button>
        </Box>
    );
}

export default Questionnaire;

  

