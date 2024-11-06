// Inspired Sources: Combine an AppBar with a Drawer in Material UI - Stack Overflow
// URL: https://stackoverflow.com/questions/48780908/combine-an-appbar-with-a-drawer-in-material-ui

// Material UI AppBar Documentation for implementation details:
// URL: https://mui.com/material-ui/react-app-bar/ React, { useState } from 'react'; // useState manage for small screens
import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, Button, Box, Avatar, IconButton, Drawer, List, ListItem, ListItemText } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { Link } from 'react-router-dom';
import logo from './assets/compliNIS2.png'; 

function Navbar() {
  const [drawerOpen, setDrawerOpen] = useState(false); // controls whether the sidebar is open/closed on small screen

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const menuItems = [
    { text: 'Home', path: '/' },
    { text: 'Login', path: '/login' },
    { text: 'Dashboard', path: '/dashboard' },
    { text: 'Questionnaire', path: '/questionnaire' },
    { text: 'Roadmap', path: '/roadmap' },
    { text: 'Benchmarking', path: '/benchmarking' },
    { text: 'Incident Reports', path: '/incident-reports' },
  ];

  return (
    <>
      {/* Top Navigation Bar */}
      <AppBar position="static" sx={{ backgroundColor: '#0d47a1' }}> 
        <Toolbar>
          {/* Logo and Title */}
          <Box display="flex" alignItems="center" sx={{ flexGrow: 1 }}>
            <Avatar alt="CompliNIS2 Logo" src={logo} sx={{ width: 40, height: 40, mr: 1 }} />
            <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
              NIS2 Compliance Dashboard
            </Typography>
          </Box>

          {/* Menu Button for Small Screens - button opens the sidebar (drawer) sx hides it */}
          <IconButton
            color="inherit"
            edge="end"
            onClick={handleDrawerToggle}
            sx={{ display: { xs: 'block', md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>

          {/* Navigation Links for Medium and Larger Screens (Box) */}
          <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
            {menuItems.map((item) => (
              <Button
                key={item.text}
                color="inherit"
                component={Link}
                to={item.path}
                sx={{
                  mx: 1,
                  '&:hover': { backgroundColor: '#1e88e5', color: '#ffffff' },
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
        <Box sx={{ width: 250 }} onClick={handleDrawerToggle}>
          <List>
            {menuItems.map((item) => (
              <ListItem button key={item.text} component={Link} to={item.path}>
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




