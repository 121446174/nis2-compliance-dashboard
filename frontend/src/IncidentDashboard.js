import React, { useState, useEffect } from 'react';
import {
    Typography, Box, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Paper, Button, Dialog, DialogTitle, DialogContent,
    TextField, MenuItem, Select, InputLabel, FormControl
} from '@mui/material';

const IncidentDashboard = () => {
    const [incidents, setIncidents] = useState([]);
    const [open, setOpen] = useState(false);
    const [formData, setFormData] = useState({ description: '', severity: '', date_time: '', indicators: '', impacted_services: '' });

    const token = localStorage.getItem('token');

    // 📡 Fetch Incidents
    useEffect(() => {
        fetch('http://localhost:5000/api/incidents', {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then(res => res.json())
        .then(data => {
            console.log("Fetched Incidents:", data); 
            setIncidents(data);
        })
        .catch(err => console.error('Error fetching incidents:', err));
    }, []);
    

    // Handle New Incident Submission
    const handleSubmit = async () => {
        if (!formData.description || !formData.severity) {
            alert("Please fill in all required fields!");
            return;
        }
    
        // Convert Date to MySQL-Compatible Format (No Milliseconds)
        const formattedDateTime = new Date().toISOString().slice(0, 19).replace("T", " ");
    
        const incidentData = {
            ...formData,
            date_time: formattedDateTime,  // Correct Format for MySQL
        };
    
        console.log("Sending to API:", incidentData); // Debug before sending request
    
        try {
            const response = await fetch('http://localhost:5000/api/incidents/report', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(incidentData)
            });
    
            console.log("Response Status:", response.status); // Check if request succeeds
    
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to report incident: ${errorText}`);
            }
    
            const newIncident = await response.json();
            console.log("New Incident Saved:", newIncident);
    
            setIncidents([newIncident, ...incidents]); // Refresh UI with new data
            setOpen(false);
        } catch (err) {
            console.error('Error reporting incident:', err);
        }
    };
    
    
    return (
        <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
            <Typography variant="h4" sx={{ textAlign: 'center', mb: 3, fontWeight: 'bold' }}>
                Cybersecurity Incident Tracker
            </Typography>
    
            <Button
                variant="contained"
                sx={{
                    backgroundColor: "#1976d2",
                    fontWeight: "bold",
                    padding: "12px 16px",
                    borderRadius: "8px",
                    boxShadow: "2px 2px 10px rgba(0,0,0,0.1)",
                    "&:hover": { backgroundColor: "#115293" }
                }}
                onClick={() => setOpen(true)}
            >
                Report an Incident
            </Button>
    
            {/* 📋 Incident Table */}
            <TableContainer component={Paper} sx={{ mt: 3, boxShadow: "2px 2px 12px rgba(0,0,0,0.1)" }}>
                <Table>
                    <TableHead sx={{ backgroundColor: "#f4f4f4" }}>
                        <TableRow>
                            <TableCell><strong>Date</strong></TableCell>
                            <TableCell><strong>Severity</strong></TableCell>
                            <TableCell><strong>Description</strong></TableCell>
                            <TableCell><strong>Status</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {incidents.length > 0 ? (
                            incidents.map(incident => (
                                <TableRow key={incident.incident_id} sx={{ "&:hover": { backgroundColor: "#f9f9f9" } }}>
                                    {/* Date */}
                                    <TableCell>{new Date(incident.date_time).toLocaleString()}</TableCell>
    
                                    {/* Severity - Colored Badge */}
                                    <TableCell>
                                        <Box
                                            sx={{
                                                display: 'inline-block',
                                                padding: '4px 8px',
                                                borderRadius: '8px',
                                                backgroundColor:
                                                    incident.severity === "Critical" ? "#d32f2f" :
                                                    incident.severity === "High" ? "#ffa000" :
                                                    incident.severity === "Medium" ? "#ffeb3b" : "#4caf50",
                                                color: incident.severity === "Critical" ? "white" : "black",
                                                fontWeight: 'bold',
                                            }}
                                        >
                                            {incident.severity}
                                        </Box>
                                    </TableCell>
    
                                    {/* Description */}
                                    <TableCell sx={{ maxWidth: 400, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                        {incident.description}
                                    </TableCell>
    
                                    {/* Status - Styled Label */}
                                    <TableCell>
                                        <Box sx={{
                                            fontWeight: 'bold',
                                            padding: "4px 8px",
                                            borderRadius: "8px",
                                            backgroundColor:
                                                incident.status === "Final Report" ? "#388e3c" :
                                                incident.status === "Intermediate Report" ? "#1976d2" :
                                                incident.status === "Official Notification" ? "#673ab7" : "#757575",
                                            color: "white",
                                        }}>
                                            {incident.status}
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={4} align="center" sx={{ fontStyle: "italic", color: "#888" }}>
                                    No incidents reported yet.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
    
            {/* Incident Report Dialog */}
            <Dialog open={open} onClose={() => setOpen(false)}>
                <DialogTitle>Report a New Incident</DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        label="Description"
                        multiline
                        rows={3}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        sx={{ mt: 2 }}
                    />
                    <FormControl fullWidth sx={{ mt: 2 }}>
                        <InputLabel>Severity</InputLabel>
                        <Select
                            value={formData.severity}
                            onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                        >
                            <MenuItem value="Low">🟢 Low</MenuItem>
                            <MenuItem value="Medium">🟡 Medium</MenuItem>
                            <MenuItem value="High">🟠 High</MenuItem>
                            <MenuItem value="Critical">🔴 Critical</MenuItem>
                        </Select>
                    </FormControl>
                    <Button
                        fullWidth
                        variant="contained"
                        sx={{ mt: 2, backgroundColor: "#d32f2f", "&:hover": { backgroundColor: "#b71c1c" } }}
                        onClick={handleSubmit}
                    >
                        🚀 Submit Incident
                    </Button>
                </DialogContent>
            </Dialog>
        </Box>
    );
};

export default IncidentDashboard;