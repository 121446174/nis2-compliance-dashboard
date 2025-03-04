import { Bar } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import React, { useState, useEffect } from 'react';
import {
    Typography, Box, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Paper, Button, Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, MenuItem, Select, InputLabel, FormControl, CircularProgress, Alert
} from '@mui/material';

Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const IncidentDashboard = () => {
    const [incidents, setIncidents] = useState([]);
    const [open, setOpen] = useState(false); 
    const [formData, setFormData] = useState({ description: '', severity: '', date_time: '', indicators: '', impacted_services: '' });
    const token = localStorage.getItem('token');

      // Help Dialog State
      const [helpOpen, setHelpOpen] = useState(false);
      const handleHelpOpen = () => setHelpOpen(true);
      const handleHelpClose = () => setHelpOpen(false);

    // 1. Fetch Incidents
    // Inspired Reference: MDN "fetch() method" - Handling API Requests
    // https://developer.mozilla.org/en-US/docs/Web/API/Window/fetch#checking_response_status
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

    // 2. Handle New Incident Submissio
    // Inspired Reference: React – How to Get Form Data https://www.tutorialkart.com/react/react-how-to-get-form-data/
    const handleSubmit = async () => {
        if (!formData.description || !formData.severity) {
            alert("Please fill in all required fields!");
            return;
        }

         // Formatting Date for MySQL - Convert JS date time to MySQL datetime 
         // https://stackoverflow.com/questions/5129624/convert-js-date-time-to-mysql-datetime   and https://stackoverflow.com/questions/76140048/event-start-and-end-time-not-correctly-set-when-using-formdata-append-in-react
        const formattedDateTime = new Date().toISOString().slice(0, 19).replace("T", " ");

        const incidentData = {
            ...formData,
            date_time: formattedDateTime, // Overwrites date_time with properly formatted value
        };

        // MDM Fetch API - https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch?
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
            setIncidents([newIncident, ...incidents]); // Add new incident to the list https://react.dev/reference/react/useState#updating-state-based-on-the-previous-state
            setOpen(false);
            setFormData({ description: '', severity: '', date_time: '', indicators: '', impacted_services: '' });
        } catch (err) {
            console.error('Error reporting incident:', err);
        }
    };

    // 3. Handle Delete Incident
    // Inspired Reference: "React Axios Delete Request Example" - Handling DELETE Requests & Updating State https://boxoflearn.com/react-axios-delete-request-example/
    const handleDelete = async (incidentId) => {
        if (!window.confirm("Are you sure you want to delete this incident?")) return; // Confirm before deleting https://developer.mozilla.org/en-US/docs/Web/API/Window/confirm

        // MDM Fetch API - https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch?
        try {
            const response = await fetch(`http://localhost:5000/api/incidents/${incidentId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!response.ok) throw new Error("Failed to delete incident");

            setIncidents(incidents.filter(incident => incident.incident_id !== incidentId)); // Remove deleted incident from the list
            console.log(`Deleted Incident ID ${incidentId}`);
        } catch (err) {
            console.error("Error deleting incident:", err);
            alert("Failed to delete incident");
        }
    };

    // 4. Get Chart Data for Incident Severity
    // Inspired Reference: "Count Number of Element Occurrences in JavaScript Array" - Using forEach() to count occurrences
    // https://stackabuse.com/count-number-of-element-occurrences-in-javascript-array/
    const getChartData = () => {
        const severityCount = { Low: 0, Medium: 0, High: 0, VeryHigh: 0, Critical: 0 };
        incidents.forEach(incident => {
            if (severityCount.hasOwnProperty(incident.severity)) {
                severityCount[incident.severity]++;
            }
        });
    
        // W3schools Bar Chart - https://www.w3schools.com/js/js_graphics_chartjs.asp
        return {
            labels: Object.keys(severityCount),
            datasets: [{
                label: "Number of Incidents",
                data: Object.values(severityCount),
                backgroundColor: ["#4caf50", "#ffeb3b", "#ffa000", "#ff5722", "#d32f2f"],
            }],
        };
    };

    return (
        <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
            <Typography variant="h4" sx={{ textAlign: 'center', mb: 3, fontWeight: 'bold' }}>
                Cybersecurity Incident Tracker
            </Typography>

{/*Help Button Added Here  */}
<Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                <Button variant="outlined" color="primary" onClick={handleHelpOpen}>
                    Help
                </Button>
            </Box>

            {/*  Help Dialog  */}
            <Dialog open={helpOpen} onClose={handleHelpClose}>
                <DialogTitle>How to Use the Incident Dashboard</DialogTitle>
                <DialogContent>
                    <Typography variant="body1">🔹 Click "Report an Incident" to log a new incident.</Typography>
                    <Typography variant="body1">🔹 Use the severity filter to view specific incidents.</Typography>
                    <Typography variant="body1">🔹 The table displays reported incidents with their details.</Typography>
                    <Typography variant="body1">🔹 The chart visualizes incident severity levels.</Typography>
                    <Typography variant="body1">🔹 Click "Delete" to remove an incident from the list.</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleHelpClose} color="primary">Got it!</Button>
                </DialogActions>
            </Dialog>

            {/* Report Incident Button MUI Button API and Customisation https://mui.com/material-ui/customization/how-to-customize/ */}
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

{/*Incident Report Dialog - How to create Dialog Box in ReactJS? https://www.geeksforgeeks.org/how-to-create-dialog-box-in-reactjs-2/ */}
<Dialog open={open} onClose={() => setOpen(false)}> 
    <DialogTitle>Report an Incident</DialogTitle>
    <DialogContent>
        <TextField fullWidth label="Description" value={formData.description} 
            onChange={(e) => setFormData({ ...formData, description: e.target.value })} 
        />
        <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Severity</InputLabel>
            <Select
                value={formData.severity}
                onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
            >
                <MenuItem value="Low">Low</MenuItem>
                <MenuItem value="Medium">Medium</MenuItem>
                <MenuItem value="High">High</MenuItem>
                <MenuItem value="Critical">Critical</MenuItem>
            </Select>
        </FormControl>
    </DialogContent>
    <DialogActions>
        <Button onClick={() => setOpen(false)}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">Submit</Button>
    </DialogActions>
</Dialog>

 {/* Incident Table - React Material UI Tutorial - 33 - Table' https://www.youtube.com/watch?v=qk2oY7W3fuY*/}
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
                                        Early Warning Due: {new Date(incident.early_warning_due).toLocaleString()}
                                    </Typography>
                                    <Typography variant="caption" sx={{ display: "block", color: "#ff5722" }}>
                                        Official Notification Due: {new Date(incident.official_notification_due).toLocaleString()}
                                    </Typography>
                                    <Typography variant="caption" sx={{ display: "block", color: "#388e3c" }}>
                                        Final Report Due: {new Date(incident.final_report_due).toLocaleString()}
                                    </Typography>
                                </TableCell>
                                <TableCell align="right">
                                    <Button variant="contained" color="error" size="small" onClick={() => handleDelete(incident.incident_id)}>
                                        Delete
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
       
        {/* Incident Severity Graph - Material-UI Box & Typography Components & Chart.js - Bar Chart Documentation*/}
        <Box sx={{ mt: 3, textAlign: 'center', width: '80%', mx: 'auto' }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Incident Severity Breakdown</Typography>
                <Bar data={getChartData()} options={{ responsive: true, maintainAspectRatio: true }} height={150} />
            </Box>
             </Box>
    );
};

export default IncidentDashboard;


