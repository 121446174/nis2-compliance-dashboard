// Inspired Sources: Combine an AppBar with a Drawer in Material UI - Stack Overflow
// URL: https://stackoverflow.com/questions/48780908/combine-an-appbar-with-a-drawer-in-material-ui


import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, Button, Box, Avatar, IconButton, Drawer, List, ListItem, ListItemText, ListItemIcon } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import LoginIcon from '@mui/icons-material/Login';
import DashboardIcon from '@mui/icons-material/Dashboard';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import MapIcon from '@mui/icons-material/Map';
import AssessmentIcon from '@mui/icons-material/Assessment';
import ReportIcon from '@mui/icons-material/Report';
import { Link, useLocation } from 'react-router-dom';
import logo from './assets/compliNIS2.png';

function Navbar() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const location = useLocation(); // Get the current path to highlight the active menu

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const menuItems = [
    { text: 'Home', path: '/', icon: <HomeIcon /> },
    { text: 'Login', path: '/login', icon: <LoginIcon /> },
    { text: 'Dashboard', path: '/dashboard', icon: <DashboardIcon /> },
    { text: 'Questionnaire', path: '/questionnaire', icon: <QuestionAnswerIcon /> },
    { text: 'Recommendations', path: '/recommendations', icon: <AssessmentIcon /> },
    { text: 'Benchmarking', path: '/benchmarking', icon: <AssessmentIcon /> },
    { text: 'Incident Reports', path: '/incident-reports', icon: <ReportIcon /> },
  ];
  
// Material UI AppBar Documentation for implementation details:
// URL: https://mui.com/material-ui/react-app-bar/ React, { useState } from 'react'; // useState manage for small screens
return (
  <>
    {/* Top Navigation Bar */}
    <AppBar
      position="static"
      sx={{
        background: 'linear-gradient(90deg, #1976d2, #42a5f5)',
        boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.2)',
        border: 'none',
      }}
    >
      <Toolbar>
        {/* Logo and Title */}
        <Box display="flex" alignItems="center" sx={{ flexGrow: 1 }}>
          <Avatar
            alt="CompliNIS2 Logo"
            src={logo}
            sx={{
              width: 50,
              height: 50,
              mr: 2,
            }}
          />
          <Typography
            variant="h5"
            component="div"
            sx={{
              fontWeight: 'bold',
              fontFamily: 'Roboto, sans-serif',
              color: '#ffffff',
            }}
          >
            NIS2 Compliance Dashboard
          </Typography>
        </Box>

        {/* Menu Button for Small Screens */}
        <IconButton
          color="inherit"
          edge="end"
          onClick={handleDrawerToggle}
          sx={{ display: { xs: 'block', md: 'none' } }}
        >
          <MenuIcon />
        </IconButton>

        {/* Navigation Links for Medium and Larger Screens */}
        <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
          {menuItems.map((item) => (
            <Button
              key={item.text}
              color="inherit"
              component={Link}
              to={item.path}
              sx={{
                mx: 1.5,
                fontWeight: 'bold',
                fontFamily: 'Roboto, sans-serif',
                fontSize: '16px',
                color: '#ffffff',
                borderBottom: location.pathname === item.path ? '3px solid #ffffff' : 'none',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  borderRadius: '4px',
                },
                transition: 'all 0.3s ease',
              }}
            >
              {item.text}
            </Button>
          ))}
        </Box>
      </Toolbar>
    </AppBar>

    {/* Drawer for Small Screens */}
    <Drawer
      anchor="left"
      open={drawerOpen}
      onClose={handleDrawerToggle}
      sx={{ display: { xs: 'block', md: 'none' } }}
    >
      <Box
        sx={{
          width: 250,
          background: 'linear-gradient(180deg, #1976d2, #42a5f5)',
          color: '#ffffff',
          height: '100%',
        }}
        onClick={handleDrawerToggle}
      >
        <List>
          {menuItems.map((item) => (
            <ListItem
              button
              key={item.text}
              component={Link}
              to={item.path}
              sx={{
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              <ListItemIcon sx={{ color: '#ffffff' }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          ))}
        </List>
      </Box>
    </Drawer>
  </>
);
}

export default Navbar;