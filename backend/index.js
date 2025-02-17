
// Reference: CORS Middleware Documentation for enabling cross-origin requests
// URL: https://expressjs.com/en/resources/middleware/cors.html
// Modifications: Applied CORS to allow cross-origin requests from frontend, making it accessible for all routes

require('dotenv').config();
const express = require('express');
const cors = require('cors'); // frontend to make requests to your backend.
const bodyParser = require('body-parser'); //parses incoming JSON request data (accessible)
const complianceRoutes = require('./routes/compliance'); 
const registerRoute = require('./routes/registerRoute'); 
const loginRoute = require('./routes/loginRoute'); // Import login route
const userRoute = require('./routes/userRoute');
const questionnaireRoute = require('./routes/questionnaireRoute'); // Import questionnaire route
const specificsectorRoute = require('./routes/specificsectorRoute'); // Import sector-specific route
const riskScoreRoute = require('./routes/riskScore');
const categoryScores = require('./routes/categoryScores');
const recommendationsRoute = require('./routes/recommendations');
const incidentsRoute = require('./routes/incidents');
const adminRoutes = require('./routes/adminRoute');
const benchmarkRoutes = require('./routes/benchmarkRoutes');
const adminRecommendations = require('./routes/adminRecommendations');
const adminBenchmarkRoutes = require('./routes/adminBenchmarkRoutes');

const app = express();
const port = process.env.PORT || 5000;

// Middleware setup -  easy for your server to handle requests from the frontend and parse JSON data.
app.use(cors({
  origin: "http://localhost:3000", // Allow frontend to make requests
  credentials: true // Allow cookies, authentication headers (fix for Admin Panel)
}));
app.use(express.json()); // Replaces bodyParser.json() (modern way)
app.use(express.urlencoded({ extended: true })); // Allows form submissions


// Root route for testing - check server is running
app.get('/', (req, res) => {
  res.send('Server is up and running');
});

// Mount routes - imports different routes for easier management of route logic
app.use('/api/compliance', complianceRoutes); 
app.use('/register', registerRoute); 
app.use('/login', loginRoute); // Add the login route
app.use('/user', userRoute);
app.use('/api/questionnaire', questionnaireRoute); // Mount questionnaire route
app.use('/api/questionnaire', specificsectorRoute); // Mount specific sector route
app.use('/api/risk', riskScoreRoute); // Mount Risk Score route
app.use('/api', categoryScores); 
app.use('/api/recommendations', recommendationsRoute);
app.use('/api/incidents', incidentsRoute);
app.use('/admin', adminRoutes);
app.use('/api/benchmark', benchmarkRoutes);
app.use('/admin', adminRecommendations);
app.use('/admin/benchmark', adminBenchmarkRoutes);

// Start the server - verify server running
app.listen(port, () => {
  console.log(`Backend server is running on http://localhost:${port}`);
});





