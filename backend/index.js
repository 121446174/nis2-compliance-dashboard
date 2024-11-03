const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const complianceRoutes = require('./routes/compliance'); 
const registerRoute = require('./routes/registerRoute'); 
const loginRoute = require('./routes/loginRoute'); // Import login route
const userRoute = require('./routes/userRoute');

const app = express();
const port = process.env.PORT || 5000;

// Middleware setup
app.use(cors());
app.use(bodyParser.json());

// Root route for testing
app.get('/', (req, res) => {
  res.send('Server is up and running');
});

// Mount routes
app.use('/api/compliance', complianceRoutes); 
app.use('/register', registerRoute); 
app.use('/login', loginRoute); // Add the login route
app.use('/user', userRoute);

// Start the server
app.listen(port, () => {
  console.log(`Backend server is running on http://localhost:${port}`);
});





