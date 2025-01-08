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
import './Questionnaire.css';


function Questionnaire() {
    const { userId, classificationType } = useContext(UserContext);
    const [categories, setCategories] = useState([]);
    const [questions, setQuestions] = useState([]);
    const [responses, setResponses] = useState({});
    const [categoryId, setCategoryId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [completedCategories, setCompletedCategories] = useState(new Set());

    // Fetch categories
    useEffect(() => {
        const fetchCategories = async () => {
            try {
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
            } catch (error) {
                console.error(error);
                setError('Failed to load categories');
            }
        };
        fetchCategories();
    }, [classificationType]);

    // Fetch questions
    useEffect(() => {
        if (!categoryId) return;

        const fetchQuestions = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(
                    `http://localhost:5000/api/questionnaire/questions?classificationType=${classificationType}&categoryId=${categoryId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'application/json',
                        },
                    }
                );

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

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Failed to save responses');

            alert('Responses saved successfully');
            setCompletedCategories((prev) => new Set(prev).add(categoryId));
        } catch (error) {
            console.error(error);
            setError('Failed to save responses.');
        }
    };

    const renderYesNoInput = (question) => (
        <FormControl>
            <RadioGroup
                row
                value={responses[question.Question_ID] || ''} // Controlled component
                onChange={(e) => handleResponseChange(question.Question_ID, e.target.value)}
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                }}
            >
                <FormControlLabel
                    value="0"
                    control={<Radio />}
                    label="Yes"
                    sx={{
                        '& .MuiRadio-root': {
                            color: '#0d47a1', // Default color
                        },
                        '& .Mui-checked': {
                            color: '#0d47a1', // Checked color
                        },
                    }}
                />
                <FormControlLabel
                    value="1"
                    control={<Radio />}
                    label="No"
                    sx={{
                        '& .MuiRadio-root': {
                            color: '#d32f2f', // Default color
                        },
                        '& .Mui-checked': {
                            color: '#d32f2f', // Checked color
                        },
                    }}
                />
            </RadioGroup>
        </FormControl>
    );
    

    const renderInputForAnswerType = (question) => {
        switch (question.Answer_Type) {
            case 'yes_no':
                return renderYesNoInput(question); // Use updated radio button logic for Yes/No
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
    // Parse MCQ_Options safely, default to an empty array if not present
    const options = Array.isArray(question.MCQ_Options)
        ? question.MCQ_Options
        : JSON.parse(question.MCQ_Options || '[]');
    return (
        <Select
            value={responses[question.Question_ID] || ''}
            onChange={(e) => handleResponseChange(question.Question_ID, e.target.value)}
            fullWidth
            sx={{ marginTop: '10px', padding: '8px', backgroundColor: '#f5f5f5' }}
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
            {/* Progress Tracker */}
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