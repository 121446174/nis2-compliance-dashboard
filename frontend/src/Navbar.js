import React from 'react';
import AppBar from '@mui/material/AppBar'; // main nagivation structure
import Toolbar from '@mui/material/Toolbar'; // main nagiavtion structure
import Typography from '@mui/material/Typography'; // Title display
import Button from '@mui/material/Button'; 
import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" style={{ flexGrow: 1 }}>
          NIS2 Compliance Dashboard
        </Typography>
        <Button color="inherit" component={Link} to="/">Home</Button>
        <Button color="inherit" component={Link} to="/login">Login</Button>
        <Button color="inherit" component={Link} to="/dashboard">Dashboard</Button>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;
