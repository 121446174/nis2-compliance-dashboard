# NIS2 Compliance Dashboard

This project is a compliance management system for NIS2, providing a dashboard and tools to help organisations assess and manage cybersecurity compliance.

Project Structure
Backend: Node.js and Express.js handle API requests and interact with the MySQL database.
Frontend: React.js provides the user interface, including registration, login, and compliance assessment forms.
Database: MySQL for storing user data, compliance classifications, and assessment responses.
Prerequisites
Node.js: Ensure Node.js is installed for both frontend and backend dependencies.
MySQL: Set up MySQL and configure the database connection in backend/db.js.
Installation
Clone the repository and install dependencies for both frontend and backend:

bash
Copy code
git clone https://github.com/your-repo/nis2-compliance-dashboard.git
cd nis2-compliance-dashboard

# Install backend dependencies
cd backend
npm install
# Runs the backend server at http://localhost:5000.

# Install frontend dependencies
cd ../frontend
npm install
# Runs the React frontend at http://localhost:3000.


### References 

Backend
# index.js
Sets up the Express server, configures middleware, and initializes routes.

Inspired Source: Express CORS Middleware Documentation
Purpose: Implementing cors middleware to allow communication between frontend and backend without cross-origin restrictions.
URL: https://expressjs.com/en/resources/middleware/cors.html
Routes

# loginRoute.js: 
Manages user authentication, processing login requests.
Inspired Source: Express Routing Documentation
Purpose: Setting up routing structure for efficient request handling.
URL: https://expressjs.com/en/guide/routing.html

Inpired Source: Fetch API for beginners
URL: https://www.freecodecamp.org/news/javascript-fetch-api-for-beginners/

Chatgpt Prompt: "After verifying credentials, I also need it to check if the user’s compliance classification allows them access"


# registerRoute.js: 
Handles new user registration, including initial compliance classification.

Inspired Source: Inserting Rows into a Table from Node.js
Purpose: Guide for inserting user data into the MySQL user table, including capturing the insertId.
URL: https://www.mysqltutorial.org/mysql-nodejs/insert/
userRoute.js: Handles user data retrieval.

Inspired Source: Express Routing Documentation
Purpose: Setting up routing structure for efficient request handling.
URL: https://expressjs.com/en/guide/routing.html

Inspired Source: Node.js Connect Mysql with Node app
Purpose: Fix so data fetching from the database 
URL: https://www.geeksforgeeks.org/node-js-connect-mysql-with-node-app/

Chatgpt Prompt: "Include logic to classify the user as 'Essential,' 'Important,' or 'Out of Scope' based on business rules, specifically" 

"My current system is storing 'Out of Scope' customers - how can i fix it to only allow storage in the database if the user qualifies as 'Essential' or 'Important."

# Database (db.js)
Source: MySQL Tutorial - Connecting to the MySQL Server from Node.js
Purpose: Configuring MySQL with Node.js using a promise-based setup for asynchronous handling.
URL: https://www.mysqltutorial.org/mysql-nodejs/connect/

node-mysql2 Documentation
Purpose: Using mysql2 with promise-based queries for efficient database connection.
URL: https://sidorares.github.io/node-mysql2/docs

Frontend
Developed using Create React App, following React best practices for project setup and environment management.

Core Components
# App.js: 

Source: Stack Overflow - How to Import "Route, Router and Switch" Correctly in React
Purpose: Guided the initial routing setup in React.
URL: https://stackoverflow.com/questions/68384258/how-to-import-route-router-and-switch-correctly

# Dashboard.js: 
Displays user-specific compliance information and assessment scores.

Inspired Source: Devtrium - Async Functions in useEffect
Purpose: Implementing asynchronous data fetching with useEffect to update user data.
URL: https://devtrium.com/posts/async-functions-useeffect

Source: Dev - Handling Modals in React
Purpose: Structuring openModal and closeModal handlers using useState for dialog control.
URL: https://dev.to/codewithmahadihasan/comprehensive-guide-to-handling-modals-in-react-46je

Source: PlainEnglish.io - Embedding Google Forms in React Apps
Purpose: Embedded Google Forms for feedback collection.
URL: https://plainenglish.io/blog/embedding-google-forms-in-react-apps

# Login.js: 
Manages user login and authentication.

Inspired Source: Basic Login Form with useState and Event Handling
Purpose: Utilized useState for managing form input and async/await for handling form submission.
URL: https://dev.to/miracool/how-to-manage-user-authentication-with-react-js-3ic5
Navbar.js: Navigation bar for main routes.

Source: Stack Overflow - Combine AppBar with Drawer in Material-UI
Purpose: Helped create a responsive navigation bar with an AppBar and Drawer for mobile screens.
URL: https://stackoverflow.com/questions/48780908/combine-an-appbar-with-a-drawer-in-material-ui

Source: Material-UI AppBar Documentation
Purpose: Provided guidance on structuring and styling the AppBar for this project.
URL: https://mui.com/material-ui/react-app-bar/


# Registration.js: User registration form.

Inspired Source: How to Develop User Registration Form in React Js
Purpose: Based on a guide from Tutorialspoint, customized with additional fields and validation logic for this project.
URL: https://www.tutorialspoint.com/how-to-develop-user-registration-form-in-react-j
Styling and Assets

"Login and Registration Form using React + Node + MySQL | Login and Sign Up Form with Validation"
Source: YouTube tutorial provided insights into setting up the structure for the login form, including handling user input and validation processes.
URL: https://www.youtube.com/watch?v=F53MPHqOmYI

Inspired Source: Handling Async in React useEffect
Purpose:  Following the recommended structure, async calls are defined as inner functions within `useEffect`, ensuring that the hook itself does not return a promise, which can lead to unexpected bugs in React.
Inspired by the example of using `Bugsnag` for error notification, we structured error handling with `try-catch` blocks to capture and log errors.
URL: https://www.benmvp.com/blog/successfully-using-async-functions-useeffect-react/


 # App.css: Contains styles for the layout and design, based on default Create React App styling.

# Index.css: Additional styles for form layout and responsiveness.

Source: W3Schools CSS Forms Documentation
Purpose: Used for implementing responsive design and form styling.
URL: https://www.w3schools.com/css/css_form.asp

Frontend Entry Points

# index.js: Entry point for the frontend React application.
Source: Stack Overflow - How to Import "Route, Router and Switch" Correctly in React
Purpose: Setup and configuration of routing and rendering in index.js.
URL: https://stackoverflow.com/questions/68384258/how-to-import-route-router-and-switch-correctly

# This is a test change to verify GitHub connection
