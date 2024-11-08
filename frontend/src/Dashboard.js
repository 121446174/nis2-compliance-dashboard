// Imports of necessary libraries and components
import React, { useEffect, useState } from 'react'; //lifecycle
import { useLocation, useNavigate } from 'react-router-dom';
import { Typography, Box, CircularProgress, Alert, Button, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
 

function Dashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [helpOpen, setHelpOpen] = useState(false); // State for Help dialog

  
  // Reference: " How to use async functions in useEffect" 
  // URL:https://devtrium.com/posts/async-functions-useeffect
  
  // Extract userId from URL query params
  const queryParams = new URLSearchParams(location.search); // Modification: Using URLSearchParams to extract userId from query string
  const userId = queryParams.get('userId');

  
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch(`http://localhost:5000/user/${userId}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch user data');
        }
        const data = await response.json();
        console.log('Fetched user data:', data); // Debugging log to verify data structure
        setUserData(data);
      } catch (error) {
        setError(error.message); // Modification: Set error state in case of fetch failure
      } finally {
        setLoading(false); // Modification: Turn off loading spinner once fetch completes
      }
    };

    fetchUserData();
  }, [userId]); // Modification: Added dependency on userId to refetch if userId changes


  const handleLogout = () => {
    navigate('/login'); // Redirect to login page
  };

  // Handlers for Help/Info dialog
  // Reference: https://dev.to/codewithmahadihasan/comprehensive-guide-to-handling-modals-in-react-46je
  
  const handleHelpOpen = () => setHelpOpen(true);
  const handleHelpClose = () => setHelpOpen(false);

  return (
    <Box sx={{ maxWidth: 600, margin: 'auto', padding: 3 }}>
      {loading ? (
        <CircularProgress />
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : userData ? (
        <>
          {/* Top-right control buttons - Only visible after successful login - https://mui.com/system/getting-started/the-sx-prop/*/}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Button
              variant="outlined"
              color="primary"
              onClick={handleHelpOpen}
              sx={{ mr: 1 }}
            >
              Help
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              href="https://docs.google.com/forms/d/e/1FAIpQLSfZ7pXJVG5wyk4LSH0YF39rOsPq7rtbd5UHHAE7NxBhldptnQ/viewform?usp=sf_link"
              target="_blank"
              rel="noopener noreferrer"
              sx={{ mr: 1 }}
            >
              Give Feedback {/* https://plainenglish.io/blog/embedding-google-forms-in-react-apps*/}
            </Button>
            <Button
              variant="contained"
              color="secondary"
              onClick={handleLogout}
            >
              Logout
            </Button>
          </Box>

          <Typography variant="h4">Welcome, {userData?.name || 'User'}</Typography>
          <Typography variant="body1" sx={{ mt: 2 }}>
            Email: {userData?.email || 'No Email Provided'}
          </Typography>
          <Typography variant="body1">
            Organisation: {userData?.organisation || 'No Organisation Provided'}
          </Typography>
          <Typography variant="body1">
            Role: {userData?.role || 'No Role Provided'}
          </Typography>
          <Typography variant="body1" sx={{ mt: 1 }}>
            Sector: {userData?.sector || 'No Sector Provided'}
          </Typography>

          {/* Help Dialog */}
          <Dialog open={helpOpen} onClose={handleHelpClose}>
            <DialogTitle>How to Use the Dashboard</DialogTitle>
            <DialogContent>
              <Typography variant="body1">
                This dashboard provides your compliance data, classification, and other key information related to NIS2 compliance.
              </Typography>
              <Typography variant="body2" sx={{ mt: 2 }}>
                Use the navigation bar to access different sections like the compliance questionnaire, roadmap, and benchmarking tools.
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleHelpClose} color="primary">
                Close
              </Button>
            </DialogActions>
          </Dialog>
        </>
      ) : (
        <Alert severity="warning">Please log in to access the dashboard.</Alert>
      )}
    </Box>
  );
}

export default Dashboard;


