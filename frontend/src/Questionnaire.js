// Reference: Using the Fetch API - MDN Web Docs
// URL: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
// Modifications to suit my project requirments such as
// Added headers for authentication.
// Implemented custom error handling.
//Built dynamic URLs to handle multiple categories

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
    const [completedCategories, setCompletedCategories] = useState(new Set());  // for tracking if categories completed  
    const navigate = useNavigate();

// Inspired Source: React JS Node JS Express Add and Fetch all data from mysql database
// https://www.youtube.com/watch?v=_77ie-arQs4

   // Fetch categories using the user's classification type.
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const token = localStorage.getItem('token'); // JWT Inspired Source: https://www.npmjs.com/package/jwt-decode
                const response = await fetch(`http://localhost:5000/api/questionnaire/categories?classificationType=${classificationType}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }); 

                // Process categories and set initial category.
                const data = await response.json();
                if (!response.ok) throw new Error(data.error || 'Failed to load categories');
                setCategories(data);
                setCategoryId(data[0]?.Category_ID || null);
            } catch (error) {
                console.error(error);
                setError('Failed to load categories');
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

        // Save responses for the current category
        const token = localStorage.getItem('token');
        const answers = questions.map((question) => ({
            questionId: question.Question_ID,
            response: responses[question.Question_ID]
        }));

        // Inspired Source: Using the Fetch API
        // https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
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

    const handleNext = () => {
        if (!allCategoriesCompleted()) {
            setError('Please complete all categories before proceeding.');
            return;
        }
        navigate('/dashboard'); // Redirect to the dashboard after questionnaire
    };

    // Own code using the MUI components 
// https://mui.com/material-ui/all-components/

// input based on question type from DB 'Answer_Type' 
    const renderInputForAnswerType = (question) => {
        const { Answer_Type, Question_ID } = question;

        switch (Answer_Type) {
            case 'yes_no':
                return (
                    <Select
                        value={responses[Question_ID] || ''}
                        onChange={(e) => handleResponseChange(Question_ID, e.target.value)}
                        fullWidth
                    >
                        <MenuItem value="yes">Yes</MenuItem>
                        <MenuItem value="no">No</MenuItem>
                    </Select>
                );
            case 'text':
                return (
                    <textarea
                        value={responses[Question_ID] || ''}
                        onChange={(e) => handleResponseChange(Question_ID, e.target.value)}
                        style={{ width: '100%', padding: '8px', marginTop: '8px' }}
                    />
                );
            case 'numeric':
                return (
                    <input
                        type="number"
                        value={responses[Question_ID] || ''}
                        onChange={(e) => handleResponseChange(Question_ID, parseFloat(e.target.value))}
                        style={{ width: '100%', padding: '8px', marginTop: '8px' }}
                    />
                );
            case 'multiple_choice':
                return (
                    <Select
                        value={responses[Question_ID] || ''}
                        onChange={(e) => handleResponseChange(Question_ID, e.target.value)}
                        fullWidth
                    >
                        <MenuItem value="High">High</MenuItem>
                        <MenuItem value="Medium">Medium</MenuItem>
                        <MenuItem value="Low">Low</MenuItem>
                    </Select>
                );
            default:
                return null;
        }
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
                    {renderInputForAnswerType(question)}
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
