import React, { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    TextField,
    Select,
    MenuItem,
    Button,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    Paper,
    FormControl,
    InputLabel,
    Alert
} from '@mui/material';

// AdminPanel component to manage questions
const AdminPanel = () => {
    const [questions, setQuestions] = useState([]);
    const [categories, setCategories] = useState([]);
    const [sectors, setSectors] = useState([]);
    const [formData, setFormData] = useState({
        question_text: '',
        classification_type: '',
        category_id: '',
        sector_id: '',
        answer_type: '',
        mcq_options: ''
    });
    const [editingId, setEditingId] = useState(null);
    const [error, setError] = useState('');
    const token = localStorage.getItem('token');

    // 1. Fetch Questions, Categories, and Sectors on component mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                const questionsRes = await fetch('http://localhost:5000/admin/questions', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const categoriesRes = await fetch('http://localhost:5000/admin/categories', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const sectorsRes = await fetch('http://localhost:5000/admin/sectors', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const questionsData = await questionsRes.json();
                const categoriesData = await categoriesRes.json();
                const sectorsData = await sectorsRes.json();
                setQuestions(questionsData);
                setCategories(categoriesData);
                setSectors(sectorsData);
            } catch (err) {
                console.error('Error fetching data:', err);
                setError('Failed to fetch data');
            }
        };
        fetchData();
    }, [token]);

    // 2. Handle form field changes
    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    // 3. Handle form submission (add or update question)
    const handleSubmit = async () => {
        // Validate required fields
        if (!formData.question_text || !formData.classification_type || !formData.category_id || !formData.answer_type) {
            setError('Please fill in all required fields.');
            return;
        }
        if (formData.classification_type === 'Sector-Specific' && !formData.sector_id) {
            setError('Sector-Specific questions require a sector.');
            return;
        }
        setError('');
        
        // For multiple_choice answer type, process mcq_options (comma separated) into JSON string
        const payload = {
            question_text: formData.question_text,
            classification_type: formData.classification_type,
            category_id: formData.category_id,
            sector_id: formData.classification_type === 'Sector-Specific' ? formData.sector_id : null,
            answer_type: formData.answer_type,
            mcq_options: formData.answer_type === 'multiple_choice'
                ? JSON.stringify(formData.mcq_options.split(',').map(opt => opt.trim()))
                : null
        };

        try {
            let response;
            if (editingId) {
                // Update existing question
                response = await fetch(`http://localhost:5000/admin/questions/${editingId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify(payload)
                });
            } else {
                // Add new question
                response = await fetch('http://localhost:5000/admin/questions', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify(payload)
                });
            }
            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || 'Failed to save question');
            }
            // Refresh the page data (you may update state instead of reloading)
            window.location.reload();
        } catch (err) {
            console.error('Error saving question:', err);
            setError(err.message);
        }
    };

    // 4. Handle edit: populate form with selected question's data
    const handleEdit = (question) => {
        setEditingId(question.Question_ID);
        setFormData({
            question_text: question.Question_Text,
            classification_type: question.Classification_Type,
            category_id: question.Category_ID,
            sector_id: question.Sector_ID || '',
            answer_type: question.Answer_Type,
            mcq_options: question.MCQ_Options ? JSON.parse(question.MCQ_Options).join(', ') : ''
        });
    };

    // 5. Handle delete question
    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this question?')) return;
        try {
            const response = await fetch(`http://localhost:5000/admin/questions/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Failed to delete question');
            window.location.reload();
        } catch (err) {
            console.error('Error deleting question:', err);
            setError('Failed to delete question');
        }
    };

    return (
        <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
            <Typography variant="h4" sx={{ textAlign: 'center', mb: 3, fontWeight: 'bold' }}>
                Admin Panel - Manage Questions
            </Typography>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {/* Form for Add/Edit Question */}
            <Paper sx={{ p: 2, mb: 3, boxShadow: '2px 2px 10px rgba(0,0,0,0.1)' }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                    {editingId ? 'Edit Question' : 'Add New Question'}
                </Typography>
                <TextField
                    fullWidth
                    label="Question Text"
                    value={formData.question_text}
                    onChange={(e) => handleChange('question_text', e.target.value)}
                    sx={{ mb: 2 }}
                />
                <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>Category</InputLabel>
                    <Select
                        value={formData.category_id}
                        label="Category"
                        onChange={(e) => handleChange('category_id', e.target.value)}
                    >
                        {categories.map(cat => (
                            <MenuItem key={cat.Category_ID} value={cat.Category_ID}>
                                {cat.Category_Name}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>Classification</InputLabel>
                    <Select
                        value={formData.classification_type}
                        label="Classification"
                        onChange={(e) => handleChange('classification_type', e.target.value)}
                    >
                        <MenuItem value="Essential">Essential</MenuItem>
                        <MenuItem value="Important">Important</MenuItem>
                        <MenuItem value="Sector-Specific">Sector-Specific</MenuItem>
                    </Select>
                </FormControl>
                {/* Show Sector selection only for Sector-Specific classification */}
                {formData.classification_type === 'Sector-Specific' && (
                    <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel>Sector</InputLabel>
                        <Select
                            value={formData.sector_id}
                            label="Sector"
                            onChange={(e) => handleChange('sector_id', e.target.value)}
                        >
                            {sectors.map(sec => (
                                <MenuItem key={sec.Sector_ID} value={sec.Sector_ID}>
                                    {sec.Sector_Name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                )}
                <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>Answer Type</InputLabel>
                    <Select
                        value={formData.answer_type}
                        label="Answer Type"
                        onChange={(e) => handleChange('answer_type', e.target.value)}
                    >
                        <MenuItem value="yes_no">Yes/No</MenuItem>
                        <MenuItem value="text">Text</MenuItem>
                        <MenuItem value="numeric">Numeric</MenuItem>
                        <MenuItem value="multiple_choice">Multiple Choice</MenuItem>
                    </Select>
                </FormControl>
                {/* Show MCQ Options input only if answer type is multiple_choice */}
                {formData.answer_type === 'multiple_choice' && (
                    <TextField
                        fullWidth
                        label="MCQ Options (comma-separated)"
                        value={formData.mcq_options}
                        onChange={(e) => handleChange('mcq_options', e.target.value)}
                        sx={{ mb: 2 }}
                    />
                )}
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button variant="contained" onClick={handleSubmit}>
                        {editingId ? 'Update Question' : 'Add Question'}
                    </Button>
                    {editingId && (
                        <Button variant="outlined" onClick={() => {
                            setEditingId(null);
                            setFormData({
                                question_text: '',
                                classification_type: '',
                                category_id: '',
                                sector_id: '',
                                answer_type: '',
                                mcq_options: ''
                            });
                        }}>
                            Cancel Edit
                        </Button>
                    )}
                </Box>
            </Paper>
            {/* Table to display existing questions */}
            <Paper sx={{ p: 2, boxShadow: '2px 2px 10px rgba(0,0,0,0.1)' }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell><strong>Question</strong></TableCell>
                            <TableCell><strong>Category</strong></TableCell>
                            <TableCell><strong>Classification</strong></TableCell>
                            <TableCell><strong>Sector</strong></TableCell>
                            <TableCell><strong>Answer Type</strong></TableCell>
                            <TableCell align="right"><strong>Actions</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {questions.map(q => (
                            <TableRow key={q.Question_ID}>
                                <TableCell>{q.Question_Text}</TableCell>
                                <TableCell>{q.Category_Name || 'N/A'}</TableCell>
                                <TableCell>{q.Classification_Type}</TableCell>
                                <TableCell>{q.Sector_Name || 'N/A'}</TableCell>
                                <TableCell>{q.Answer_Type}</TableCell>
                                <TableCell align="right">
                                    <Button variant="outlined" size="small" onClick={() => handleEdit(q)}>
                                        Edit
                                    </Button>
                                    <Button variant="outlined" color="error" size="small" sx={{ ml: 1 }} onClick={() => handleDelete(q.Question_ID)}>
                                        Delete
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Paper>
        </Box>
    );
};

export default AdminPanel;
