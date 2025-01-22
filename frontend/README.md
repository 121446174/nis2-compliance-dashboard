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

# riskScore.js 

Source: Validating Data in POST Requests  
Purpose: To validate and ensure the presence of required data in POST requests  
// https://mernstackdev.com/post-routes-in-web-development/#validating-data-in-post-requests 

Source: Using Transactions with Promises  
Purpose: To handle database transactions in Node.js with MySQL 
//https://github.com/sidorares/node-mysql2/issues/384

Source: Performing Queries in MySQL Node.js Library  
Purpose: To execute SQL queries using the MySQL library in Node.js 
// https://github.com/mysqljs/mysql#performing-queries

Source: SQL JOIN With AS Alias  
Purpose: To use SQL JOINs and aliases to fetch data from related tables  
// https://www.programiz.com/sql/join

Source: JavaScript parseFloat() Method  
Purpose: To convert string values to floating-point numbers for calculations  
// https://flexiple.com/javascript/parsefloat-method
        
Source: Math.min() in JavaScript  
Purpose: To ensure totalScore does not exceed maxPossibleScore  
//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/min

        
Source: SQL BETWEEN Operator  
Purpose: To determine the risk level based on the calculated score range  
//https://www.programiz.com/sql/between-operator

Source: Async/Await for MySQL Transactions in Node.js  
Purpose: To perform asynchronous MySQL transactions effectively in Node.js  
// https://stackoverflow.com/questions/59749045/cant-use-async-await-to-mysql-transaction-using-nodejs

Source: Express Routing  
Purpose: To create and manage API routes with Express.js  
// https://developer.mozilla.org/en-US/docs/Learn/Server-side/Express_Nodejs/routes
    
# categoryScores.js 

Source: Validating Data in POST Requests  
Purpose: Define a GET route at the '/category-scores' endpoint
// https://mernstackdev.com/post-routes-in-web-development/#validating-data-in-post-requests 

Source: Chatgpt 
Purpose: Calculate score for specific user across four predefined categories 
Prompt: "I am building a backend route in Node.js for an Express application to calculate category scores for a user. The database contains four tables: responses, questions, categories, and scoring_rules. Here’s what I need:

Retrieve the Category_Name from the categories table.
Calculate the UserScore for each category by summing up (r.Answer * q.Score_Weight) from the responses and questions tables.
Calculate the MaxScore for each category by summing up (sr.Max_Value * q.Score_Weight) from the scoring_rules and questions tables. Use a LEFT JOIN to include categories even if there are no scoring rules.
Filter results for a specific userId (passed as a parameter) and restrict the query to specific categories: 'Governance', 'Incident Response', 'Supply Chain Security', 'Third Party Risk Management'.
Group the results by category name.
Generate an optimized SQL query for this use case, and explain how it works. I also need to execute the query in a Node.js route using db.query with the userId parameter. Please include debugging logs for the query execution."

Source: Performing Queries in MySQL Node.js Library  
Purpose: Executes the query string using db.query and passes the userId as a parameter to the query
// https://github.com/mysqljs/mysql#performing-queries

Source: MDN Web Docs - Array.prototype.map()
Purpose: Processes the categoryScores array to calculate a percentage score for each category
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map

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

Inspired Source: JWT Decode - npm documentation
URL: https://www.npmjs.com/package/jwt-decode
Purpose: Decoding JWT tokens to extract user-specific data (e.g., userId).

Source: StakeOverflow - LocalStorage getItem token
Purpose: Fetch user data
URL: https://stackoverflow.com/questions/57197803/localstorage-getitem-token-returns-null

Source: Stack Overflow - Decode JWT Tokens in React
Purpose: Demonstrates how to decode JWT tokens and extract specific data in React.
URL: https://stackoverflow.com/questions/61699663/how-to-authenticate-using-jwt-in-reactjs-stored-in-localstorage-on-refresh-page

Source: MDN Web Docs - Fetch API
Purpose: Covers how to fetch data using the fetch API and handle responses.
URL: https://developer.mozilla.org/en-US/docs/Web/API/fetch

Source: Stack Overflow - Fetch with Await
Purpose: Explains how to use fetch with await for API calls in JavaScriptSource: MDN Web Docs - Fetch API Error Handling
Purpose: Describes how to handle errors when fetching data.
URL: https://developer.mozilla.org/en-US/docs/Web/API/fetch#examples.
URL: https://stackoverflow.com/questions/74107674/how-to-use-fetch-with-await

Source: React Docs - useState Hook  
Purpose: To manage the local state for category scores in a functional component.  
URL: https://react.dev/reference/react/useState 

Source: Successfully Using Async Functions in React useEffect  
Purpose: Best practices for handling asynchronous operations inside the useEffect Hook.  
URL: https://www.benmvp.com/blog/successfully-using-async-functions-useeffect-react  

Source: Stack Overflow - Decode JWT Token in JavaScript  
Purpose: Explains how to decode a JWT token to extract user data such as userId.  
URL: https://stackoverflow.com/questions/38552003/how-to-decode-jwt-token-in-javascript  

Source: MDN Web Docs - Fetch API  
Purpose: Demonstrates how to use the fetch API to send HTTP requests and handle responses.  
URL: https://developer.mozilla.org/en-US/docs/Web/API/fetch 

Source: PlainEnglish.io - Embedding Google Forms in React Apps
Purpose: Embedded Google Forms for feedback collection.
URL: https://plainenglish.io/blog/embedding-google-forms-in-react-apps



# questionnaireRoute.js

Inspired Source: Mozilla Developer Network (MDN)
Route to fetch questions and categorires.
Purpose: Inspired by MDN's tutorial on routes in Express. Handles fetching data from a database based on query parameters.This route fetches categories based on the classification type and handles database interactions effectively.
URL: https://developer.mozilla.org/en-US/docs/Learn/Server-side/Express_Nodejs/routes


Route to submit answers
Purpose: Based on a combination of custom Node.js/Express practices and form handling for questionnaire submission. This route handles multiple response types and saves answers into a database.
Source: ChatGPT - Node.js/Express Questionnaire Submission Route
Prompt: 
"I need a Node.js/Express route that handles questionnaire submissions. It should:
Accept userId, an array of answers, and categoryId in the request body.
Validate answers dynamically based on the Answer_Type of each question (yes_no, text, multiple_choice, numeric).
Include helper logic for scoring multiple-choice answers and handle database inserts accordingly."


Purpose: Uses JavaScript’s map() method to process multiple choice answers into numerical scores based on predefined values.
URL: Array.map() - MDN (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map)


Source: Forum Discussion on Node.js async/await and MySQL query issues.  
Purpose: Helped implement the `async/await` pattern for fetching scoring rules with parameterized queries in Node.js.  
URL: [https://forum.freecodecamp.org/t/nodejs-async-await-mysql-query-select-problem/410085/2](https://forum.freecodecamp.org/t/nodejs-async-await-mysql-query-select-problem/410085/2)

Source: MySQL Documentation - ON DUPLICATE KEY UPDATE.  
Purpose: Used to update existing records or insert new ones when handling text-based responses.  
URL: [https://dev.mysql.com/doc/refman/8.0/en/insert-on-duplicate.html](https://dev.mysql.com/doc/refman/8.0/en/insert-on-duplicate.html)

# specificsectorRoute.js 

**Code inspired by sources from questionnaireRoute*

FRONTEND:

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

Source: MUI Typography
Purpose: For styling and organizing textual content.
//https://mui.com/material-ui/react-typography/?srsltid=AfmBOooNN-FeoNmAGVtrRZTTAgKBfmJlRLr_8PVloXUwpxQyWW8hCIKT

Source: MUI TextField
Purpose: For creating input fields with validation.
//https://mui.com/material-ui/react-text-field/?srsltid=AfmBOoqLJwuocV6egllobTrMtZyQCPfdw2P8Y1rGalyH28C1jjZu77W4

Source: MUI Button with CircularProgress
Purpose: For combining a button and loading spinner.
https://mui.com/material-ui/api/circular-progress/?srsltid=AfmBOoqhXrJ3RcpkzgoVDSsIF33yjcv4lpP6vLUzDZsraTQ4htfoF2i6

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

Source: MUI Typography
Purpose: For styling and organizing textual content.
//https://mui.com/material-ui/react-typography/?srsltid=AfmBOooNN-FeoNmAGVtrRZTTAgKBfmJlRLr_8PVloXUwpxQyWW8hCIKT

Source: MUI TextField
Purpose: For creating input fields with validation.
//https://mui.com/material-ui/react-text-field/?srsltid=AfmBOoqLJwuocV6egllobTrMtZyQCPfdw2P8Y1rGalyH28C1jjZu77W4

Source: MUI Button with CircularProgress
Purpose: For combining a button and loading spinner.
https://mui.com/material-ui/api/circular-progress/?srsltid=AfmBOoqhXrJ3RcpkzgoVDSsIF33yjcv4lpP6vLUzDZsraTQ4htfoF2i6

 # App.css: Contains styles for the layout and design, based on default Create React App styling.

# Index.css: Additional styles for form layout and responsiveness.

Source: W3Schools CSS Forms Documentation
Purpose: Used for implementing responsive design and form styling.
URL: https://www.w3schools.com/css/css_form.asp

# index.js: Entry point for the frontend React application.
Source: Stack Overflow - How to Import "Route, Router and Switch" Correctly in React
Purpose: Setup and configuration of routing and rendering in index.js.
URL: https://stackoverflow.com/questions/68384258/how-to-import-route-router-and-switch-correctly

# This is a test change to verify GitHub connection

# Questionnaire.js
Handles the main compliance questionnaire interface, including fetching categories, questions, and submitting user responses.

Inspired Source: Using the Fetch API - MDN Web Docs
URL: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
Purpose: To fetch data from backend APIs for categories, questions, and submitting responses.

Inspired Source: React JS Node JS Express Add and Fetch Data
URL: https://www.youtube.com/watch?v=_77ie-arQs4
Purpose: Integrated the logic for question fetching using category IDs - using useEffect 

Purpose: This function dynamically renders input components based on the Answer_Type property of a question.
Reference: Conditional Rendering Components in React (YouTube)
Inspired Source: Youtube https://www.youtube.com/watch?v=xRKvjWDZlW8

Material-UI (MUI) Components
URL: https://mui.com/material-ui/all-components/
Purpose: Used Typography, Box, Select, MenuItem, and Button to build responsive and accessible UI components. Added logic to conditionally disable buttons based on questionnaire progress.

Source: https://www.youtube.com/watch?v=FB-sKY63AWo
Reference: Learn MUI (Material UI) in under 10 min!

Inspired Source:JWT Token Documentation
URL:JWT Decode - npm
Purpose:  Authentication using tokens stored in local storage, for session logic.

# UserContext
Inspired Source: Using Context API in React
URL: https://www.taniarascia.com/using-context-api-in-react/
Purpose: Demonstrates the usage of React Context with functional components for managing global state.

# RiskResult.js 

Source: Parsing JWT Tokens in JavaScript
Purpose: Decoding the JWT token from localStorage to extract the user ID.
// https://stackoverflow.com/questions/61699663/how-to-authenticate-using-jwt-in-reactjs-stored-in-localstorage-on-refresh-page

Source: Successfully Using Async Functions in React useEffect
Purpose: Best practices for handling asynchronous operations inside the useEffect Hook.
// https://www.benmvp.com/blog/successfully-using-async-functions-useeffect-react/

/Source: How to Use Fetch with Await in JavaScript
Purpose: Fetching risk score data using the fetch API and handling responses with await. 
// https://stackoverflow.com/questions/74107674/how-to-use-fetch-with-await

Source: Circular Progress API - Material UI
Purpose: Displaying a loading spinner while waiting for data to load using the CircularProgress component.
// https://mui.com/material-ui/api/circular-progress/?srsltid=AfmBOoqfYX2yWbCvyIXygC3CGE2j9Bb9bQEVV5a0uhI3EUzQz_pwHX0D

Source: Optional Chaining and toFixed() Method - MDN Web Docs
Purpose: Safely accessing nested properties of the risk score object and formatting numbers to two decimal place
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Optional_chaining

Source: Material UI Typography
Purpose: Structuring and styling text content for the risk assessment results using Typography components.
URL: https://mui.com/material-ui/react-typography

# RiskChart.js

Source: Chart.js Integration in React
Purpose: Guides on integrating Chart.js with React, including registering components and creating charts.
// https://www.chartjs.org/docs/latest/getting-started/integration.html

Source: Chart.js Doughnut Chart
Purpose: Provides configuration options and details for creating doughnut charts using Chart.js.
// https://www.chartjs.org/docs/latest/charts/doughnut.html

Source: Stack Overflow - Destroy Chart.js bar graph to redraw other graph in the same canvas
Purpose: Explains how to properly destroy an existing Chart.js instance before creating a new one to avoid memory leaks or rendering issues.
// https://stackoverflow.com/questions/40056555/destroy-chart-js-bar-graph-to-redraw-other-graph-in-same-canvas


Source: React Simple Maps - Dynamic Styling
Purpose: Demonstrates how to use dynamic styling in React components, relevant for riskMapping logic.
// https://www.react-simple-maps.io/docs/style/

Source: Stack Overflow - Dynamic CSS Style in JSX
Purpose: Explains how to inline and dynamically apply CSS styles in JSX based on props or states.
// https://stackoverflow.com/questions/46322708/inlining-dynamic-css-style-in-jsx

Database

I created the database using my own knowledge and query guidance using MySQL's provdied tutorials 
URL = https://dev.mysql.com/doc/mysql-tutorial-excerpt/5.7/en/example-auto-increment.html