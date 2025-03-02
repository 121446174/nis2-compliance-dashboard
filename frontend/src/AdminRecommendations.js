// AdminRecommendations.js
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

const AdminRecommendations = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [categories, setCategories] = useState([]);
  const [sectors, setSectors] = useState([]);
  const [formData, setFormData] = useState({
    category_id: '',
    question_id: '',
    sector_id: '',
    risk_level: '',
    recommendation_text: '',
    impact: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const token = localStorage.getItem('token');

  // 1. Fetch Recommendations, Categories, and Sectors on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const recRes = await fetch('http://localhost:5000/admin/recommendations', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const catRes = await fetch('http://localhost:5000/admin/categories', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const secRes = await fetch('http://localhost:5000/admin/sectors', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const recData = await recRes.json();
        const catData = await catRes.json();
        const secData = await secRes.json();
        setRecommendations(recData);
        setCategories(catData);
        setSectors(secData);
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

  // 3. Handle form submission (add or update recommendation)
  const handleSubmit = async () => {
    if (!formData.category_id || !formData.risk_level || !formData.recommendation_text || !formData.impact) {
      setError('Please fill in all required fields.');
      return;
    }
    setError('');
    try {
      let response;
      if (editingId) {
        // Update recommendation
        response = await fetch(`http://localhost:5000/admin/recommendations/${editingId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(formData)
        });
      } else {
        // Add new recommendation
        response = await fetch('http://localhost:5000/admin/recommendations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(formData)
        });
      }
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to save recommendation');
      }
      // Refresh data (or update state accordingly)
      window.location.reload();
    } catch (err) {
      console.error('Error saving recommendation:', err);
      setError(err.message);
    }
  };

  // 4. Handle edit: populate form with recommendation data
  const handleEdit = (rec) => {
    setEditingId(rec.id);
    setFormData({
      category_id: rec.category_id,
      question_id: rec.question_id || '',
      sector_id: rec.sector_id || '',
      risk_level: rec.risk_level,
      recommendation_text: rec.recommendation_text,
      impact: rec.impact
    });
  };

  // 5. Handle delete recommendation
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this recommendation?')) return;
    try {
      const response = await fetch(`http://localhost:5000/admin/recommendations/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to delete recommendation');
      window.location.reload();
    } catch (err) {
      console.error('Error deleting recommendation:', err);
      setError('Failed to delete recommendation');
    }
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      <Typography variant="h4" sx={{ textAlign: 'center', mb: 3, fontWeight: 'bold' }}>
        Admin Panel - Manage Recommendations
      </Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {/* Form for Add/Edit Recommendation */}
      <Paper sx={{ p: 2, mb: 3, boxShadow: '2px 2px 10px rgba(0,0,0,0.1)' }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          {editingId ? 'Edit Recommendation' : 'Add New Recommendation'}
        </Typography>
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
        <TextField
          fullWidth
          label="Question ID (optional)"
          value={formData.question_id}
          onChange={(e) => handleChange('question_id', e.target.value)}
          sx={{ mb: 2 }}
        />
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Sector (optional)</InputLabel>
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
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Risk Level</InputLabel>
          <Select
            value={formData.risk_level}
            label="Risk Level"
            onChange={(e) => handleChange('risk_level', e.target.value)}
          >
            <MenuItem value="Low">Low</MenuItem>
            <MenuItem value="Medium">Medium</MenuItem>
            <MenuItem value="High">High</MenuItem>
            <MenuItem value="Very High">Very High</MenuItem>
            <MenuItem value="Critical">Critical</MenuItem>
          </Select>
        </FormControl>
        <TextField
          fullWidth
          label="Recommendation Text"
          value={formData.recommendation_text}
          onChange={(e) => handleChange('recommendation_text', e.target.value)}
          sx={{ mb: 2 }}
        />
        <TextField
          fullWidth
          label="Impact"
          value={formData.impact}
          onChange={(e) => handleChange('impact', e.target.value)}
          sx={{ mb: 2 }}
        />
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="contained" onClick={handleSubmit}>
            {editingId ? 'Update Recommendation' : 'Add Recommendation'}
          </Button>
          {editingId && (
            <Button
              variant="outlined"
              onClick={() => {
                setEditingId(null);
                setFormData({
                  category_id: '',
                  question_id: '',
                  sector_id: '',
                  risk_level: '',
                  recommendation_text: '',
                  impact: ''
                });
              }}
            >
              Cancel Edit
            </Button>
          )}
        </Box>
      </Paper>
      {/* Table Displaying Recommendations */}
      <Paper sx={{ p: 2, boxShadow: '2px 2px 10px rgba(0,0,0,0.1)' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Recommendation</strong></TableCell>
              <TableCell><strong>Category</strong></TableCell>
              <TableCell><strong>Risk Level</strong></TableCell>
              <TableCell><strong>Impact</strong></TableCell>
              <TableCell align="right"><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {recommendations.map(rec => (
              <TableRow key={rec.id}>
                <TableCell>{rec.recommendation_text}</TableCell>
                <TableCell>{rec.Category_Name || 'N/A'}</TableCell>
                <TableCell>{rec.risk_level}</TableCell>
                <TableCell>{rec.impact}</TableCell>
                <TableCell align="right">
                  <Button variant="outlined" size="small" onClick={() => handleEdit(rec)}>
                    Edit
                  </Button>
                  <Button variant="outlined" color="error" size="small" sx={{ ml: 1 }} onClick={() => handleDelete(rec.id)}>
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

export default AdminRecommendations;