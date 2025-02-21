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

Source: JavaScript for...of Loop - MDN Web Docs  
Purpose: Explains how to iterate over iterable objects, such as arrays, using the `for...of` loop.  
URL: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for...of  

Source: MySQL INSERT ON DUPLICATE KEY UPDATE  
Purpose: Describes how to insert data into a MySQL table and update existing records if a conflict occurs.  
URL: https://dev.mysql.com/doc/refman/8.0/en/insert-on-duplicate.html  

Source: Stack Overflow - Formatting Numbers as Percentages  
Purpose: Provides a method for rounding numbers and converting them into a percentage format using `.toFixed(2)`.  
URL: https://stackoverflow.com/questions/8522673/make-a-number-a-percentage  

# recommendations.js  

Source: NetJS Tech
Purpose: Efficient Database Querying with Connection Pooling
Uses await pool.query(...) to execute queries asynchronously.
Ensures efficient resource management by reusing database connections.
URL: https://www.netjstech.com/2024/07/nodejs-mysql-connection-pool.html

Source: MDN Web Docs - "Express Routing"  
Purpose: This route implementation follows best practices from MDN's Express Routing guide:
- Extracting route parameters using req.params
- Applying authentication middleware before request handling
- Using async/await for efficient database operations
URL: MDN Express Routing Guide (https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Server-side/Express_Nodejs/routes)

Source: StackOverflow
Purpose: Querying if user exits 
- Queries the database to check user existence before further processing.
- Returns 404 Not Found if no matching record exists.
- (Modified as article used using access tokens for user validation) 
URL:https://stackoverflow.com/questions/63591695/check-if-a-user-exists-node-js-mysql

Source: W3Schools - "Node.js MySQL Join"  
Purpose: Uses JOIN to combine data from two tables (category_scores & categories)
- Filters results based on user_id to return only relevant records**  
URL: https://www.w3schools.com/nodejs/nodejs_mysql_join.asp?

Source: MDN Web Docs, "Destructuring Assignment" (const {a,b}= obj;)
URL:https://developer.mozilla.org/en-US/docs/Learn/Server-side/Express_Nodejs/routes

Source: MySQL Documentation
Purpose: This reference explains the SQL JOIN operations used in the project, particularly for linking recommendations, responses, questions, and categories tables.
URL: https://dev.mysql.com/doc/refman/8.0/en/join.html

Source: FullStackHeroes
Purpose:Used new Map() to remove duplicate objects based on a property.
URL: https://fullstackheroes.com/tutorials/javascript/5-ways-to-remove-duplicate-objects-from-array-based-on-property/?

'*Chatgpt Prompt: I am working on a Node.js backend with MySQL and need to fetch cybersecurity recommendations based on user responses to security-related questions. Each recommendation is tied to a question, and I need to return only the recommendations where the user answered 1 (which means a security gap exists).

The database schema includes:
responses (stores user answers, linked to questions by question_id) questions (stores the question details, linked to categories) categories (stores category details, linked to recommendations) recommendations (stores recommendation text, linked to questions via question_id)
I attempted this query, but I’m not sure if it correctly retrieves the relevant recommendations based on res.answer = 1 while properly joining across multiple tables: SELECT r.*, c.category_name 
FROM recommendations r
JOIN responses res ON r.question_id = res.question_id
LEFT JOIN questions q ON r.question_id = q.question_id
LEFT JOIN categories c ON q.category_id = c.category_id
WHERE res.user_id = ? AND res.answer = 1;
Does this query correctly filter only the recommendations triggered by user responses? Is there a better way to structure it for efficiency and accuracy?"*

# incidents.js 
Source: MernStackDev: "Post Requests"
Purpose: This article provides guidance on handling POST requests in Express.js applications, including data validation and route setup.
URL: https://mernstackdev.com/post-routes-in-web-development/#validating-data-in-post-requests
https://youtu.be/0Hu27PoloYw

Source: MDN – Date() Constructor & Stack Overflow
Purpose: Calculates deadlines for incident reporting based on timestamps.
URLs:
https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/Date
https://stackoverflow.com/questions/38420260/new-datenew-date-gettime-25-24-60-60-1000-got-unexpected-date

Source: mysql2-async
Purpose: Insert Incident into the Database 
URL: https://www.npmjs.com/package/mysql2-async

Source: Mozilla Developer Network (MDN) - "Express Routing" Guide
Purpose: Provides guidelines on structuring Express.js routes, including handling requests and responses efficiently.
URL: https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Server-side/Express_Nodejs/routes

Source: MySQL 8.0 Documentation - SELECT Query
Purpose: Explains how to retrieve data from a MySQL database using the SELECT statement, ensuring efficient data fetching.
URL: https://dev.mysql.com/doc/refman/8.0/en/select.html

Delete an Incident
Source: Stack Overflow - "How to modularize a DELETE route with params in Express"
Purpose: Demonstrates best practices for implementing DELETE routes in Express, ensuring modular and maintainable code.
URL: https://stackoverflow.com/questions/72342532/how-to-modularize-a-delete-route-with-params-in-express


# benchmarkRoutes.js

Source: MDN's "Express Routing" guide Purpose: Explains Express.js routing best practices. URL: https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Server-side/Express_Nodejs/routes

Source: MySQL 8.0 Documentation: SELECT Query Purpose: Details SQL SELECT statement usage. URL: https://dev.mysql.com/doc/refman/8.0/en/select.html

Source: Express Routing Purpose: Guides handling routes in Express.js. URL: https://expressjs.com/en/guide/routing.html

Source: MDN Web Docs - If-Else Statement Purpose: Demonstrates JavaScript if-else logic. URL: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/if...else

Source: GitHub - Using transaction with promise connection Purpose: Shows how to use MySQL transactions in Node.js. URL: https://github.com/sidorares/node-mysql2/issues/384

Source: MDN Web Docs - For...of Loop Purpose: Describes JavaScript for...of loop for iterating over arrays. URL: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for...of

Source: Programiz - SQL JOIN With AS Alias Purpose: Explains SQL JOIN operations with table aliases. URL: https://www.programiz.com/sql/join

Source: JavaScript parseFloat() Method Purpose: Converts strings to floating-point numbers in JavaScript. URL: https://flexiple.com/javascript/parsefloat-method

Source: MySQL Docs - INSERT ... ON DUPLICATE KEY UPDATE Purpose: Prevents duplicate entries while updating existing records. URL: https://dev.mysql.com/doc/refman/8.0/en/insert-on-duplicate.html

Source: MySQL Tutorial - CURRENT_TIMESTAMP Purpose: Ensures accurate timestamp updates in MySQL. URL: https://dev.mysql.com/doc/refman/8.4/en/date-and-time-functions.html


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

# adminRoute.js 

Mozilla Developer Network (MDN) - Express Routing
URL: https://developer.mozilla.org/en-US/docs/Learn/Server-side/Express_Nodejs/routes
Purpose: Explains how the router.get() method handles HTTP GET requests in Express.js and how routes are structured.

Honeybadger Blog - Executing MySQL Queries in JavaScript
URL: https://www.honeybadger.io/blog/using-sql-databases-in-javascript/
Purpose: Provides best practices for efficiently executing MySQL queries in JavaScript, ensuring performance and security.

W3Schools - MySQL SELECT JOIN
URL: https://www.w3schools.com/nodejs/nodejs_mysql_join.asp
Purpose: Explains how to use SQL JOIN statements to retrieve related data from multiple tables in a single query, improving efficiency.

Stack Overflow - Checking If a User Exists in MySQL
URL: https://stackoverflow.com/questions/63591695/check-if-a-user-exists-node-js-mysql
Purpose: Discusses best practices for querying MySQL to determine if a user exists in a database before performing operations.

MERN Stack Dev - Validating Data in POST Requests
URL: https://mernstackdev.com/post-routes-in-web-development/#validating-data-in-post-requests
Purpose: Demonstrates how to validate input data in Express.js before inserting records into a database to prevent invalid or incomplete data.

MySQL Documentation - INSERT Statement
URL: https://dev.mysql.com/doc/refman/8.0/en/insert.html
Purpose: Provides official MySQL documentation on how to use the INSERT statement, including best practices and SQL syntax.

MySQL Documentation - Storing JSON Data
URL: https://dev.mysql.com/doc/refman/5.7/en/json.html
Purpose: Explains how MySQL handles JSON data types, allowing structured data to be stored and queried efficiently in a database.

GitHub - MySQLJS Library for Node.js
URL: https://github.com/mysqljs/mysql
Purpose: Provides guidance on using the MySQL package in Node.js applications for executing queries, handling connections, and using transactions.

Programiz - SQL UPDATE Query
URL: https://www.programiz.com/sql/update
Purpose: Explains the SQL UPDATE statement, detailing how to modify existing records in a database while ensuring data integrity.

Stack Overflow - Modularizing DELETE Routes in Express.js
URL: https://stackoverflow.com/questions/72342532/how-to-modularize-a-delete-route-with-params-in-express
Purpose: Discusses how to structure and modularize DELETE routes in Express.js to improve maintainability and security.

MySQL Documentation - DELETE Statement
URL: https://dev.mysql.com/doc/refman/8.0/en/delete.html
Purpose: Official MySQL documentation on using the DELETE statement, including considerations for safely removing records from a database.

# adminBenchmarkRoutes.js

Mozilla Developer Network (MDN) Express Routing Guide
https://developer.mozilla.org/en-US/docs/Learn/web_development/Extensions/Server-side/Express_Nodejs/routes

Explains best practices for executing MySQL queries in JavaScript.
Honeybadger Blog
https://www.honeybadger.io/blog/using-sql-databases-in-javascript/

Provides details on using MySQL UPDATE with subqueries to modify records dynamically.
MySQL Official Documentation
https://dev.mysql.com/doc/refman/8.0/en/update.html

Covers how MySQL ORDER BY ... LIMIT ensures retrieval of the most recent row.
MySQL Official Documentation
https://dev.mysql.com/doc/refman/8.0/en/select.html

Explains how to use JOIN operations in MySQL for combining data from multiple tables.
MySQL Official Documentation
https://dev.mysql.com/doc/refman/8.0/en/join.html

Illustrates best practices for using UPDATE ... JOIN in MySQL to update data efficiently.
MySQL Official Documentation
https://dev.mysql.com/doc/refman/8.0/en/update.html

Explains the importance of parameterized queries in MySQL to prevent SQL injection attacks.
MySQLJS GitHub Documentation
https://github.com/mysqljs/mysql#performing-queries

Discusses JavaScript's nullish coalescing operator (??) for handling default values properly.
Mozilla Developer Network (MDN) Web Docs
https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Nullish_coalescing

Explains how to update MySQL data using Node.js applications efficiently.
MySQL Tutorial
https://www.mysqltutorial.org/mysql-nodejs/update/

Covers MySQL query optimizations for ORDER BY LIMIT queries to improve performance.
Percona MySQL Performance Blog
https://www.percona.com/blog/2019/07/02/how-to-optimize-mysql-order-by-limit-queries/

Discusses safe SQL query practices in Node.js, including escaping and placeholders.
Stack Overflow Discussion
https://stackoverflow.com/questions/8263371/how-can-i-prevent-sql-injection-in-node-js

*********** FRONTEND **************

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

"I'm building a React dashboard that displays cybersecurity recommendations based on risk levels. I need to sort all recommendations by severity (Critical first, Low last) and then extract the Top 5 highest-risk ones. Here's my current attempt:
const sortedTop5 = allRecommendations
  .sort((a, b) => (riskLevelsOrder[b.risk_level] - riskLevelsOrder[a.risk_level])) // Sorting attempt
  .filter((rec, index) => index < 5);' 

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

# Recommendations.js 
Source: MDN Web Docs
Purpose: In this project, Map is used to assign numerical priority values to risk levels (riskLevelsOrder) and associate each risk level with a corresponding color (riskColors). This ensures that recommendations are visually categorized and sorted based on severity.
URL: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map

Inspired by: Auth0 Community discussion on decoding tokens
Source: https://community.auth0.com/t/decoding-token-atob-fails-if-i-include-users-picture/151202
URL: Retrieve the userId from the stored JWT token in localStorage

Inspired Source: MDN Web Docs, "fetch() API" #
Purpose: Fetch recommendations for the current user using an API request.
URL: https://developer.mozilla.org/en-US/docs/Web/API/Window/fetch#checking_response_status

Source: 'Search Filter in React JS' 
URL: https://www.youtube.com/watch?v=xAqCEBFGdYk

Source: MDN Web Docs - JavaScript Array.filter()
Purpose: Filters recommendations based on user-inputted search term.
URL: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter

Source: MDN Web Docs - JavaScript String.includes()
Purpose: Allows filtering recommendations based on partial matches to the search term.
URL: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/includes

Source: MDN Web Docs - JavaScript Array.sort()
Purpose: Sorts recommendations based on predefined risk levels in ascending or descending order.
URL: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort


Source: MUI Official Docs MUI Select Component for Dropdowns
Purpose: Implements Material-UI Select component for risk level and category filtering.
URL: https://mui.com/material-ui/react-select/

Source: Stack Overflow - "React Creating Dynamic Select and Option Elements with Material-UI"
Purpose: Uses dynamic data to populate category dropdowns in Material-UI.
URL: https://stackoverflow.com/questions/65927056/react-creating-dynamic-select-and-option-elements-with-material-ui

Creating Tables in Material-UI
Source: YouTube Video - "React Material UI Tutorial - 33 - Table"
Purpose: Implements an interactive table for displaying recommendations in a structured format.
URL: https://www.youtube.com/watch?v=qk2oY7W3fuY

#  IncidentDashboard.js 
Source: MDN "fetch() method" - Handling API Requests
Purpose: Used for retrieving incidents from the backend using the Fetch API.
URL: https://developer.mozilla.org/en-US/docs/Web/API/Window/fetch#checking_response_status

Source: TutorialKart - React: How to Get Form Data
Purpose: Demonstrates handling and retrieving form data in a React component.
URL: https://www.tutorialkart.com/react/react-how-to-get-form-data/

Source: Stack Overflow - Convert JS Date Time to MySQL DateTime
Purpose: Ensures proper date formatting for MySQL database storage.
URL: https://stackoverflow.com/questions/5129624/convert-js-date-time-to-mysql-datetime
URL: https://stackoverflow.com/questions/76140048 event-start-and-end-time-not-correctly-set-when-using-formdata-append-in-react

Source: MDN Fetch API Documentation
Purpose: Guides best practices for making API requests with error handling in JavaScript.
URL: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch?

Source: React Documentation - Updating State Based on Previous State
Purpose: Explains how to correctly update state arrays in React to avoid potential bugs.
URL: https://react.dev/reference/react/useState#updating-state-based-on-the-previous-state

Source: "React Axios Delete Request Example" - Handling DELETE Requests & Updating StatePurpose: Updating state in React after performing DELETE operations
URL: https://boxoflearn.com/react-axios-delete-request-example/

Source: "Count Number of Element Occurrences in JavaScript Array" - Using forEach() to count occurrences
Purpose: Explains how to count occurrences of specific values.
URL: https://stackabuse.com/count-number-of-element-occurrences-in-javascript-array/

Source: "W3Schools Bar Chart" - Chart.js Implementation
Purpose: Provides an example of implementing a bar chart using Chart.js.
URL: https://www.w3schools.com/js/js_graphics_chartjs.asp

Source: MUI Button API and Customization
Purpose: Customizing Material UI buttons for styling and functionality.
URL: https://mui.com/material-ui/customization/how-to-customize/
Incident Report Dialog

Source: GeeksforGeeks - How to Create a Dialog Box in ReactJS
Purpose: Implementing a modal dialog for reporting incidents using React.
URL: https://www.geeksforgeeks.org/how-to-create-dialog-box-in-reactjs-2/
Incident Table

Source: React Material UI Tutorial - 33 - Table (YouTube)
Purpose: Creating and structuring tables in React using Material UI components.
URL: https://www.youtube.com/watch?v=qk2oY7W3fuY

# BenchmarkSectors.js 

Source: MDN Web Docs, Fetch API
Purpose: Fetch recommendations for the current user using an API request.
URL: https://developer.mozilla.org/en-US/docs/Web/API/Window/fetch#checking_response_status

Source: React Docs
Purpose: Use the useEffect hook for fetching data on component mount.
URL: https://react.dev/reference/react/useEffect

Source: MUI Docs
Purpose: Implement CircularProgress and Alert for handling loading and error states.
URL: https://mui.com/material-ui/react-progress/ and https://mui.com/material-ui/react-alert/

Source: W3Schools Chart.js
Purpose: Format data properly for a bar chart in Chart.js.
URL: https://www.w3schools.com/js/js_graphics_chartjs.asp

Source: MUI Button API
Purpose: Use MUI Button for user interactions and actions.
URL: https://mui.com/material-ui/react-button/

Source: MUI Table API
Purpose: Structure and display tabular data using MUI Table.
URL: https://mui.com/material-ui/react-table/

Source: Chart.js Docs
Purpose: Format data for visualization using Chart.js.
URL: https://www.chartjs.org/docs/latest/getting-started/

Source: MUI Box API
Purpose: Use the Box component for layout and spacing in MUI.
URL: https://mui.com/material-ui/api/box/

# BenchmarkChart.js

Source: MDN Web Docs - localStorage
Purpose: Retrieve authentication token stored in localStorage for user session handling.
URL: https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage

Source: MDN Web Docs - fetch() API
Purpose: Handle API requests and responses asynchronously using fetch().
URL: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch

Source: React Docs - useEffect()
Purpose: Execute a function when dependencies change or when the component mounts.
URL: https://react.dev/reference/react/useEffect

Source: Chart.js Docs - Bar Chart Configuration
Purpose: Format data for a bar chart visualization in Chart.js.
URL: https://www.chartjs.org/docs/latest/charts/bar.html

Source: Chart.js Docs - Chart Options & Plugin Configurations
Purpose: Customize chart responsiveness, layout, axis scaling, and legend positioning.
URL: https://www.chartjs.org/docs/latest/configuration/

Source: Material-UI Docs - Box Component
Purpose: Structure layout and control spacing using MUI’s Box component.
URL: https://mui.com/material-ui/api/box/

Source: Material-UI Docs - Typography Component
Purpose: Apply structured text styles using MUI’s Typography component.
URL: https://mui.com/material-ui/api/typography/



# AdminPanel.js 

Source: Fetch API for retrieving questions, categories, and sectors
Purpose: To retrieve data from the backend API using fetch for rendering in the component
URL: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch

Source: React Docs - Handling Forms
Purpose: To handle multiple form inputs dynamically and update state accordingly
URL: https://legacy.reactjs.org/docs/forms.html#handling-multiple-inputs

Source: String.prototype.split()
Purpose: To process multiple-choice options by splitting a comma-separated string into an array
URL: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/split

Source: JavaScript Conditional (Ternary) Operator
Purpose: To conditionally assign values based on the answer type selected
URL: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Conditional_operator

Source: Fetch API - Making HTTP Requests
Purpose: To send data to the server using fetch for adding or updating questions
URL: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch

Source: window.location.reload() - Reload the current document
Purpose: To refresh the page and reflect changes after updating or deleting a question
URL: https://www.w3schools.com/jsref/met_loc_reload.asp

Source: React Forms Handling
Purpose: To populate form fields when editing a question
URL: https://legacy.reactjs.org/docs/forms.html

Source: Logical OR (||) Operator
Purpose: To assign default values for sector_id when null
URL: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Logical_OR

Source: Material-UI Box for layout structure
Purpose: To provide responsive and structured layout
URL: https://mui.com/material-ui/react-box/

Source: Material-UI Typography for headings
Purpose: To format text elements such as section titles
URL: https://mui.com/material-ui/react-typography/

Source: Material-UI Table for structured data display
Purpose: To create a tabular format for displaying questions
URL: https://mui.com/material-ui/react-table/

Source: Material-UI Button for interactions
Purpose: To create interactive elements for adding, editing, and deleting questions
URL: https://mui.com/material-ui/react-button/

Source: Material-UI FormControl, InputLabel, and Select Components
Purpose: To create structured and accessible dropdowns for form selections
URL: https://mui.com/material-ui/react-select/

CHATGPT PROPMT: 'I have a React admin panel where users can add, edit, and delete questionnaire questions. When clicking "Edit" on a question, I want the form fields to be pre-filled with the existing question's data.

Data Structure:
Question_ID
Question_Text
Classification_Type
Sector_ID
Category_ID
Answer_Type
MCQ_Options (stored as a JSON string)
What I need:

A function that updates the form state when a question is selected for editing.
It should parse MCQ_Options from a JSON string back into a readable format.
If MCQ_Options is null, it should set an empty string instead of breaking.
The function should integrate with useState.
The form should update automatically when a new question is selected.'


# AdminBenchmarkPanel.js 
Source: MDN Web Docs  
Purpose: Fetch API for making HTTP requests  
URL: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch  

Source: MDN Web Docs  
Purpose: JSON.stringify() for formatting request bodies  
URL: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify  

Source: React Docs  
Purpose: useEffect Hook for fetching data on component mount  
URL: https://react.dev/reference/react/useEffect  

Source: React Docs  
Purpose: Managing component state using useState Hook  
URL: https://legacy.reactjs.org/docs/hooks-state.html  

Source: YouTube - React Forms Tutorial  
Purpose: Handling form state in React  
URL: https://www.youtube.com/watch?v=PqAaHf7JKls  

Source: React Docs  
Purpose: Conditional Rendering (Showing Edit Form Only When Editing)  
URL: https://react.dev/learn/conditional-rendering  

Source: MDN Web Docs  
Purpose: Using Array.prototype.map() for rendering lists dynamically  
URL: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map  

Source: React Docs  
Purpose: Handling user interactions with event listeners (onClick for Edit & Save)  
URL: https://react.dev/learn/responding-to-events  

Source: Material-UI Docs  
Purpose: Box component for layout structure  
URL: https://mui.com/material-ui/react-box/  

Source: Material-UI Docs  
Purpose: Typography component for text styling  
URL: https://mui.com/material-ui/react-typography/  

Source: Material-UI Docs  
Purpose: Paper component for section containers  
URL: https://mui.com/material-ui/react-paper/  

Source: Material-UI Docs  
Purpose: Table component for displaying structured data  
URL: https://mui.com/material-ui/react-table/  

Source: Material-UI Docs  
Purpose: TextField component for user input  
URL: https://mui.com/material-ui/react-text-field/  

Source: Material-UI Docs  
Purpose: Button component for handling user interactions  
URL: https://mui.com/material-ui/react-button/  

Source: Material-UI Docs  
Purpose: Alert component for error handling and notifications  
URL: https://mui.com/material-ui/react-alert/

# Database

I created the database using my own knowledge and query guidance using MySQL's provdied tutorials 
URL = https://dev.mysql.com/doc/mysql-tutorial-excerpt/5.7/en/example-auto-increment.html