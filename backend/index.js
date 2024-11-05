// Reference: https://expressjs.com/en/resources/middleware/cors.html
const express = require('express');
const cors = require('cors'); // frontend to make requests to your backend.
const bodyParser = require('body-parser'); //parses incoming JSON request data (accessible)
const complianceRoutes = require('./routes/compliance'); 
const registerRoute = require('./routes/registerRoute'); 
const loginRoute = require('./routes/loginRoute'); // Import login route
const userRoute = require('./routes/userRoute');

const app = express();
const port = process.env.PORT || 5000;

// Middleware setup -  easy for your server to handle requests from the frontend and parse JSON data.
app.use(cors());
app.use(bodyParser.json());

// Root route for testing - check server is running
app.get('/', (req, res) => {
  res.send('Server is up and running');
});

// Mount routes - imports different routes for easier management of route logic
app.use('/api/compliance', complianceRoutes); 
app.use('/register', registerRoute); 
app.use('/login', loginRoute); // Add the login route
app.use('/user', userRoute);

// Start the server - verify server running
app.listen(port, () => {
  console.log(`Backend server is running on http://localhost:${port}`);
});





