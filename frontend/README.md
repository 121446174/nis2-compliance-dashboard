# NIS2 Compliance Dashboard

This project is a compliance management system for NIS2, providing a dashboard and tools to help organisations assess and manage cybersecurity compliance.

## Project Structure

- **Backend**: Node.js and Express.js handle API requests and interact with the MySQL database.
- **Frontend**: React.js provides the user interface, including registration, login, and compliance assessment forms.
- **Database**: MySQL for storing user data, compliance classifications, and assessment responses.

## Prerequisites

- **Node.js**: Ensure Node.js is installed for both frontend and backend dependencies.
- **MySQL**: Set up MySQL and configure the database connection in `backend/db.js`.

## Installation

Clone the repository and install dependencies for both frontend and backend:

```bash
git clone https://github.com/your-repo/nis2-compliance-dashboard.git
cd nis2-compliance-dashboard

# Install backend dependencies
cd backend
npm install
Runs the backend server at http://localhost:5000.

# Install frontend dependencies
cd ../frontend
npm install
Runs the React frontend at http://localhost:3000.

## References with Code Structure

### Backend

#### Routes
- **`Benchmarking.js`**: Handles compliance benchmarking routes and operations.
- **`compliance.js`**: Contains routes for compliance-related data and actions.
- **`loginRoute.js`**: Manages user authentication, including login requests.
- **`registerRoute.js`**: Handles new user registration and initial compliance classification.
- **`userRoute.js`**: Manages user-specific data retrieval.

#### Database (`db.js`)
- **MySQL Tutorial - Connecting to the MySQL Server from Node.js**  
  Used as a guide for configuring MySQL with Node.js using a promise-based setup for improved asynchronous handling.  
  Accessed on 2nd Oct 2024.  
  Available at: [https://www.mysqltutorial.org/mysql-nodejs/connect/](https://www.mysqltutorial.org/mysql-nodejs/connect/)

- **node-mysql2 Documentation**  
  Guide for using `mysql2` with promise-based queries to establish an efficient and asynchronous database connection.  
  Accessed on 2nd Oct 2024.  
  Available at: [https://sidorares.github.io/node-mysql2/docs](https://sidorares.github.io/node-mysql2/docs)

#### Server (`index.js`)
- Entry point for the backend server, setting up middleware and initializing routes for API access.

### Frontend

The frontend was created using [Create React App](https://reactjs.org/), following standard React best practices for setting up and managing the React environment.

- **Src/Assets**
  - **`App.css`**: Contains styles for the overall layout and visual design of the application.
  - **`App.js`**: Main component, sets up routing for different pages in the application.
  - **`Dashboard.js`**: Displays user-specific compliance information and assessment scores.
  - **`Index.css`**: Additional styles for the app.
  - **`index.js`**: Entry point for the frontend React application.
  - **`Login.js`**: Login form and validation logic.
  - **`Navbar.js`**: Navigation bar for main routes.
  
-#### Registration Form
- **Inspiration**: 
  - User registration form structure and basic field setup were adapted from the Tutorialspoint article *"How to Develop User Registration Form in React Js"*.
  - URL: [https://www.tutorialspoint.com/how-to-develop-user-registration-form-in-react-j](https://www.tutorialspoint.com/how-to-develop-user-registration-form-in-react-j)
  
- **Modifications**:
  - Added fields (`Organisation`, `Role`, `Sector`, `Employee Count`, `Revenue`) to match NIS2 requirements.
  - Dynamically generated sector dropdown with custom data and integrated classification logic based on project-specific rules.



