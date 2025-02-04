import { Bar } from 'react-chartjs-2'; 
import { Chart, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import React, { useState, useEffect } from 'react';
import {
    Typography, Box, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Paper, Button, Dialog, DialogTitle, DialogContent,
    TextField, MenuItem, Select, InputLabel, FormControl
} from '@mui/material';

Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const IncidentDashboard = () => {
    const [incidents, setIncidents] = useState([]); 
    const [open, setOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [selectedIncident, setSelectedIncident] = useState(null);
    const [formData, setFormData] = useState({ description: '', severity: '', date_time: '', indicators: '', impacted_services: '' });

    const token = localStorage.getItem('token');

    // 📡 Fetch Incidents
    useEffect(() => {
        fetch('http://localhost:5000/api/incidents', {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then(res => res.json())
        .then(data => {
            if (!Array.isArray(data)) {  
                console.error("API response is not an array:", data);
                setIncidents([]);
            } else {
                setIncidents(data);
            }
        })
        .catch(err => {
            console.error('Error fetching incidents:', err);
            setIncidents([]);
        });
    }, []);

    // ✅ Handle New Incident Submission
    const handleSubmit = async () => {
        if (!formData.description || !formData.severity) {
            alert("Please fill in all required fields!");
            return;
        }

        const formattedDateTime = new Date().toISOString().slice(0, 19).replace("T", " ");

        const incidentData = {
            ...formData,
            date_time: formattedDateTime,
        };

        try {
            const response = await fetch('http://localhost:5000/api/incidents/report', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(incidentData)
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to report incident: ${errorText}`);
            }

            const newIncident = await response.json();
            setIncidents([newIncident, ...incidents]);
            setOpen(false);
        } catch (err) {
            console.error('Error reporting incident:', err);
        }
    };

    // ✅ Handle Delete Incident
    const handleDelete = async (incidentId) => {
        if (!window.confirm("Are you sure you want to delete this incident?")) return;

        try {
            const response = await fetch(`http://localhost:5000/api/incidents/${incidentId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!response.ok) throw new Error("Failed to delete incident");

            setIncidents(incidents.filter(incident => incident.incident_id !== incidentId));
            console.log(`🗑 Deleted Incident ID ${incidentId}`);
        } catch (err) {
            console.error("🚨 Error deleting incident:", err);
            alert("Failed to delete incident");
        }
    };

    // ✅ Handle Open Edit Dialog
    const handleEditOpen = (incident) => {
        setSelectedIncident({ ...incident });
        setEditOpen(true);
    };

    // ✅ Handle Edit Submission
    const handleEditSubmit = async () => {
        if (!selectedIncident) return;

        try {
            const response = await fetch(`http://localhost:5000/api/incidents/${selectedIncident.incident_id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(selectedIncident),
            });

            if (!response.ok) throw new Error("Failed to update incident");

            setIncidents(incidents.map(incident =>
                incident.incident_id === selectedIncident.incident_id ? selectedIncident : incident
            ));

            setEditOpen(false);
        } catch (err) {
            console.error("🚨 Error updating incident:", err);
            alert("Failed to update incident");
        }
    };

    // ✅ Get Chart Data for Incident Severity
    const getChartData = () => {
        const severityCount = { Low: 0, Medium: 0, High: 0, Critical: 0 };
        incidents.forEach(incident => severityCount[incident.severity]++);

        return {
            labels: Object.keys(severityCount),
            datasets: [{
                label: "Number of Incidents",
                data: Object.values(severityCount),
                backgroundColor: ["#4caf50", "#ffeb3b", "#ffa000", "#d32f2f"],
            }],
        };
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
                ➕ Report an Incident
            </Button>

            {/* 🗂 Incident Table */}
            <TableContainer component={Paper} sx={{ mt: 3, boxShadow: "2px 2px 12px rgba(0,0,0,0.1)" }}>
                <Table>
                    <TableHead sx={{ backgroundColor: "#f4f4f4" }}>
                        <TableRow>
                            <TableCell><strong>Date</strong></TableCell>
                            <TableCell><strong>Severity</strong></TableCell>
                            <TableCell><strong>Description</strong></TableCell>
                            <TableCell><strong>Status & Deadlines</strong></TableCell>
                            <TableCell align="right"><strong>Actions</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {incidents.map(incident => (
                            <TableRow key={incident.incident_id}>
                                <TableCell>{new Date(incident.date_time).toLocaleString()}</TableCell>
                                <TableCell>{incident.severity}</TableCell>
                                <TableCell>{incident.description}</TableCell>
                                <TableCell>
                                    <Typography variant="caption" sx={{ display: "block", color: "#d32f2f" }}>
                                        ⏳ Early Warning Due: {new Date(incident.early_warning_due).toLocaleString()}
                                    </Typography>
                                    <Typography variant="caption" sx={{ display: "block", color: "#ff5722" }}>
                                        🚨 Official Notification Due: {new Date(incident.official_notification_due).toLocaleString()}
                                    </Typography>
                                    <Typography variant="caption" sx={{ display: "block", color: "#388e3c" }}>
                                        ✅ Final Report Due: {new Date(incident.final_report_due).toLocaleString()}
                                    </Typography>
                                </TableCell>
                                <TableCell align="right">
                                    <Button variant="contained" color="warning" size="small" sx={{ mr: 1 }} onClick={() => handleEditOpen(incident)}>
                                        ✏️ Edit
                                    </Button>
                                    <Button variant="contained" color="error" size="small" onClick={() => handleDelete(incident.incident_id)}>
                                        🗑 Delete
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* 📊 Incident Severity Graph */}
            <Box sx={{ mt: 3, textAlign: 'center', width: '80%', mx: 'auto' }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Incident Severity Breakdown</Typography>
                <Bar data={getChartData()} options={{ responsive: true, maintainAspectRatio: true }} height={150} />
            </Box>
        </Box>
    );
};

export default IncidentDashboard;



