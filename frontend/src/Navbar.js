// Inspired Sources: Combine an AppBar with a Drawer in Material UI - Stack Overflow
// URL: https://stackoverflow.com/questions/48780908/combine-an-appbar-with-a-drawer-in-material-ui

import React, { useState, useEffect } from "react";
import {
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Box,
  Avatar,
  Typography,
  IconButton,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import HomeIcon from "@mui/icons-material/Home";
import LoginIcon from "@mui/icons-material/Login";
import DashboardIcon from "@mui/icons-material/Dashboard";
import QuestionAnswerIcon from "@mui/icons-material/QuestionAnswer";
import AssessmentIcon from "@mui/icons-material/Assessment";
import ReportIcon from "@mui/icons-material/Report";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import { Link, useLocation } from "react-router-dom";
import logo from "./assets/compliNIS2.png";

function Navbar() {
  const [drawerOpen, setDrawerOpen] = useState(true);
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));

    console.log("🔍 DEBUG: Fetched user from localStorage:", user);

    if (user) {
      console.log("✅ User found:", user);
      console.log("🔍 Checking if user is an admin:", user.isAdmin);
      setIsAdmin(user.isAdmin || false);
    } else {
      console.log("❌ No user found in localStorage. Setting isAdmin to false.");
      setIsAdmin(false);
    }
  }, [location.pathname]); // 🔥 Runs every time the page changes

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  // 🔹 Normal User Menu
  const userMenuItems = [
    { text: "Home", path: "/", icon: <HomeIcon /> },
    { text: "Login", path: "/login", icon: <LoginIcon /> },
    { text: "Dashboard", path: "/dashboard", icon: <DashboardIcon /> },
    { text: "Questionnaire", path: "/questionnaire", icon: <QuestionAnswerIcon /> },
    { text: "Recommendations", path: "/recommendations", icon: <AssessmentIcon /> },
    { text: "Benchmarking", path: "/benchmarks", icon: <AssessmentIcon /> },
    { text: "Incident Reports", path: "/incidents", icon: <ReportIcon /> },
  ];

  // 🔹 Admin Menu (Restricted Access)
  const adminMenuItems = [
    { text: "Register", path: "/", icon: <HomeIcon /> },
    { text: "Login", path: "/login", icon: <LoginIcon /> },
    { text: "Dashboard", path: "/dashboard", icon: <DashboardIcon /> }, // Logout will be in dashboard
    { text: "Admin Panel", path: "/admin", icon: <AdminPanelSettingsIcon /> },
    { text: "Admin Recommendations", path: "/admin/recommendations", icon: <AssessmentIcon /> }, 
    { text: "Admin Benchmarking", path: "/admin/benchmark", icon: <AssessmentIcon /> }
  ];

  console.log("📌 Current Admin Status:", isAdmin);
  console.log("📌 Menu Being Rendered:", isAdmin ? "Admin Menu" : "User Menu");

  return (
    <Box sx={{ display: "flex" }}>
      {/* 🔹 Blue Line Above Navbar */}
      <Box
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "6px",
          backgroundColor: "#1976d2",
          zIndex: 1300,
        }}
      />

      {/* 🔹 Menu Button (Visible Only on Small Screens) */}
      <IconButton
        color="inherit"
        onClick={toggleDrawer}
        sx={{
          display: { xs: "block", md: "none" },
          position: "absolute",
          top: 10,
          left: 10,
          zIndex: 1400,
        }}
      >
        <MenuIcon />
      </IconButton>

      {/* 🔹 Sidebar Navigation */}
      <Drawer
        variant="persistent"
        open={drawerOpen}
        sx={{
          width: 250,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: 250,
            backgroundColor: "#1976d2",
            color: "#ffffff",
            boxShadow: "2px 0 5px rgba(0,0,0,0.2)",
          },
        }}
      >
        <Box sx={{ textAlign: "center", my: 3 }}>
          <Avatar alt="CompliNIS2 Logo" src={logo} sx={{ width: 80, height: 80, mx: "auto" }} />
          <Typography variant="h6" sx={{ fontWeight: "bold", mt: 1 }}>
            NIS2 Dashboard
          </Typography>
        </Box>
        <List>
          {(isAdmin ? adminMenuItems : userMenuItems).map((item) => (
            <ListItem
              button
              key={item.text}
              component={Link}
              to={item.path}
              sx={{
                "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.1)" },
                backgroundColor: location.pathname === item.path ? "rgba(255,255,255,0.2)" : "transparent",
              }}
            >
              <ListItemIcon sx={{ color: "#ffffff" }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          ))}
        </List>
      </Drawer>
    </Box>
  );
}

export default Navbar;

