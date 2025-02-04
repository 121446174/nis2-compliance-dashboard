// Source: Stack Overflow - How to import "Route, Router and Switch" correctly in React
// Modification: Updated imports to use 'Routes' instead of 'Switch' for React Router v6 syntax
// URL: https://stackoverflow.com/questions/68384258/how-to-import-route-router-and-switch-correctly

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Box } from '@mui/material';
import Navbar from './Navbar';
import Registration from './Registration';
import Login from './Login';
import Dashboard from './Dashboard';
import Questionnaire from './Questionnaire';
import { UserProvider } from './UserContext';
import SectorSpecificQuestions from './SectorSpecificQuestions';
import RiskScore from './RiskResult';
import Recommendations from './Recommendations';
import IncidentDashboard from './IncidentDashboard';

function App() {
  return (
    <UserProvider>
      <Router>
        <Box sx={{ display: 'flex', height: '100vh' }}>
          {/* Sidebar (Fixed Width) */}
          <Box sx={{ width: '240px', flexShrink: 0 }}>
            <Navbar />
          </Box>

          {/* Main Content (Takes Remaining Space) */}
          <Box sx={{ flexGrow: 1, p: 3 }}>  
            <Routes>
              <Route path="/" element={<Registration />} />
              <Route path="/login" element={<Login />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/questionnaire" element={<Questionnaire />} />
              <Route path="/sector-specific" element={<SectorSpecificQuestions />} /> 
              <Route path="/risk-score" element={<RiskScore />} />
              <Route path="/recommendations" element={<Recommendations />} />
              <Route path="/incidents" element={<IncidentDashboard />} />
            </Routes>
          </Box>
        </Box>
      </Router>
    </UserProvider>
  );
}

export default App;
