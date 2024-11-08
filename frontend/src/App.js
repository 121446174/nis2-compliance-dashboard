// Source: Stack Overflow - How to import "Route, Router and Switch" correctly in React
// Modification: Updated imports to use 'Routes' instead of 'Switch' for React Router v6 syntax
// URL: https://stackoverflow.com/questions/68384258/how-to-import-route-router-and-switch-correctly
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './Navbar'; 
import Registration from './Registration';
import Login from './Login';
import Dashboard from './Dashboard';

function App() {
  return (
    <Router>
      <Navbar /> 
      <Routes>
        <Route path="/" element={<Registration />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}

export default App;















