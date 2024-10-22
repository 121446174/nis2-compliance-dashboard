const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const complianceRoutes = require('./routes/compliance');  // Import compliance routes

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// API route
app.use('/api/compliance', complianceRoutes);

app.listen(port, () => {
  console.log(`Backend server is running on http://localhost:${port}`);
});

