// Source: Stack Overflow - How to import "Route, Router and Switch" correctly in React
// Modification: Updated imports to use 'Routes' instead of 'Switch' for React Router v6 syntax
// URL: https://stackoverflow.com/questions/68384258/how-to-import-route-router-and-switch-correctly

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './Navbar';
import Registration from './Registration';
import Login from './Login';
import Dashboard from './Dashboard';
import Questionnaire from './Questionnaire';
import { UserProvider } from './UserContext';
import SectorSpecificQuestions from './SectorSpecificQuestions';
import RiskScore from './RiskResult';
import Recommendations from './Recommendations';



function App() {
  return (
    <UserProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Registration />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/questionnaire" element={<Questionnaire />} />
          <Route path="/sector-specific" element={<SectorSpecificQuestions />} /> 
          <Route path="/risk-score" element={<RiskScore />} />
          <Route path="/recommendations" element={<Recommendations />} />
        </Routes>
      </Router>
    </UserProvider>
  );
}

export default App;



