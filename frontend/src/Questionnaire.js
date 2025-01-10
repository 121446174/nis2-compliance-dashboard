// Reference: Using the Fetch API - MDN Web Docs
// URL: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
// Modifications to suit my project requirments such as
// Added headers for authentication.
// Implemented custom error handling.
//Built dynamic URLs to handle multiple categories

import React, { useEffect, useState, useContext } from 'react';
import {
    Typography,
    Box,
    Card,
    CardContent,
    Button,
    CircularProgress,
    Alert,
    Stepper,
    Step,
    StepLabel,
    Select,
    MenuItem,
    FormControl,
    RadioGroup,
    FormControlLabel,
    Radio,
} from '@mui/material';
import { UserContext } from './UserContext';
import {jwtDecode } from 'jwt-decode';
import './Questionnaire.css';
import { useNavigate } from 'react-router-dom';

function Questionnaire() {
    const navigate = useNavigate();
    const { userId, classificationType, sectorId: userSectorId } = useContext(UserContext);

    const [categories, setCategories] = useState([]);
    const [questions, setQuestions] = useState([]);
    const [sectorSpecific, setSectorSpecific] = useState([]);
    const [responses, setResponses] = useState({});
    const [categoryId, setCategoryId] = useState(null);
    const [completedCategories, setCompletedCategories] = useState(new Set());
    const [showSectorSpecific, setShowSectorSpecific] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!classificationType || !userSectorId) {
            console.warn('Questionnaire.js - Missing classificationType or sectorId. Falling back to token.');

            const token = localStorage.getItem('token');
            if (token) {
                const decodedToken = jwtDecode(token);
                console.log('Questionnaire.js - Retrieved values from token:', decodedToken);

                // Ensure fallback for classificationType and userSectorId
                if (!classificationType) console.log('Fallback classificationType:', decodedToken.classification);
                if (!userSectorId) console.log('Fallback sectorId:', decodedToken.sectorId);
            } else {
                console.error('Questionnaire.js - Missing token and required data. Cannot proceed.');
            }
        }
    }, [classificationType, userSectorId]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('token');
                const response = await fetch(
                    `http://localhost:5000/api/questionnaire/categories?classificationType=${classificationType}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'application/json',
                        },
                    }
                );

                const data = await response.json();
                if (!response.ok) throw new Error(data.error || 'Failed to load categories');
                setCategories(data);
                setCategoryId(data[0]?.Category_ID || null);
            } catch (err) {
                console.error(err);
                setError('Failed to load categories');
            } finally {
                setLoading(false);
            }
        };
        fetchCategories();
    }, [classificationType]);

    useEffect(() => {
        const fetchQuestions = async () => {
            if (!categoryId) return;

            try {
                setLoading(true);
                const token = localStorage.getItem('token');
                const resolvedSectorId = userSectorId || jwtDecode(token).sectorId;

                console.log('Resolved Sector ID for API Call:', resolvedSectorId);

                const response = await fetch(
                    `http://localhost:5000/api/questionnaire/questions?classificationType=${classificationType}&sectorId=${resolvedSectorId}&categoryId=${categoryId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'application/json',
                        },
                    }
                );

                const data = await response.json();
                if (!response.ok) throw new Error(data.error || 'Failed to load questions');

                const sectorSpecificQuestions = data.filter((q) => q.Classification_Type === 'Sector-Specific');
                setQuestions(data.filter((q) => q.Classification_Type !== 'Sector-Specific'));
                setSectorSpecific(sectorSpecificQuestions);
            } catch (err) {
                console.error(err);
                setError('Failed to load questions');
            } finally {
                setLoading(false);
            }
        };
        fetchQuestions();
    }, [classificationType, categoryId, userSectorId]);

    const handleResponseChange = (questionId, value) => {
        setResponses((prev) => ({ ...prev, [questionId]: value }));
    };

    const handleSubmitCategory = async () => {
        if (!questions.every((q) => responses[q.Question_ID] !== undefined)) {
            setError('Please answer all questions before submitting.');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const answers = questions.map((q) => ({
                questionId: q.Question_ID,
                response: responses[q.Question_ID],
            }));

            const response = await fetch('http://localhost:5000/api/questionnaire/submit-answers', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userId, answers, categoryId }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('API Error:', errorData.error);
                throw new Error(errorData.error || 'Failed to save responses');
            }

            alert('Category responses saved successfully');

            setCompletedCategories((prev) => {
                const updated = new Set(prev);
                updated.add(categoryId);

                if (updated.size === categories.length) {
                    console.log('All categories completed. Navigating to sector-specific questions.');
                    navigate('/sector-specific'); // Redirect to the SectorSpecificQuestions page
                }

                return updated;
            });
        } catch (error) {
            console.error('Failed to save responses:', error);
            setError('Failed to save responses.');
        }
    };

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
                            <FormControlLabel value="0" control={<Radio />} label="Yes" />
                            <FormControlLabel value="1" control={<Radio />} label="No" />
                        </RadioGroup>
                    </FormControl>
                );
            case 'text':
                return (
                    <textarea
                        value={responses[question.Question_ID] || ''}
                        onChange={(e) => handleResponseChange(question.Question_ID, e.target.value)}
                        placeholder="Type your answer here..."
                        className="text-input"
                    />
                );
            case 'multiple_choice':
                const options = Array.isArray(question.MCQ_Options)
                    ? question.MCQ_Options
                    : JSON.parse(question.MCQ_Options || '[]');
                return (
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
                );
            default:
                return null;
        }
    };

    if (loading) return <CircularProgress />;
    if (error) return <Alert severity="error">{error}</Alert>;

    return (
        <Box className="questionnaire-container">
            <Stepper activeStep={categories.findIndex((c) => c.Category_ID === categoryId)} alternativeLabel>
                {categories.map((category) => (
                    <Step key={category.Category_ID}>
                        <StepLabel>{category.Category_Name}</StepLabel>
                    </Step>
                ))}
            </Stepper>

            <Typography variant="h4" className="questionnaire-title">
                {classificationType} Sector Compliance Questionnaire
            </Typography>

            <Select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                fullWidth
                className="category-selector"
                sx={{ mb: 3 }}
            >
                {categories.map((category) => (
                    <MenuItem key={category.Category_ID} value={category.Category_ID}>
                        {category.Category_Name}
                    </MenuItem>
                ))}
            </Select>

            {questions.map((question) => (
                <Card key={question.Question_ID} className="question-card">
                    <CardContent>
                        <Typography variant="h6">{question.Question_Text}</Typography>
                        {renderInputForAnswerType(question)}
                    </CardContent>
                </Card>
            ))}

            <Button
                variant="contained"
                color="primary"
                onClick={handleSubmitCategory}
                disabled={questions.some((q) => responses[q.Question_ID] === undefined)}
                sx={{ mt: 3 }}
            >
                Submit Category
            </Button>
        </Box>
    );
}

export default Questionnaire;
