import React, { useEffect, useState } from 'react';
import axios from 'axios';

function App() {
  const [complianceData, setComplianceData] = useState([]);
  const [error, setError] = useState(null);  // To display errors if the connection fails

  useEffect(() => {
    axios.get('http://localhost:5000/api/compliance')
      .then(response => {
        setComplianceData(response.data);  // Set the data in state
      })
      .catch(error => {
        setError("Error connecting to the backend.");  // Set error state if there's a connection issue
      });
  }, []);

  return (
    <div className="App">
      <h1>Compliance Dashboard</h1>
      {error && <p>{error}</p>} {/* Show error message if there's an issue */}
      
      <ul>
        {complianceData.length > 0 ? (
          complianceData.map((item) => (
            <li key={item.Task_ID}>
              <strong>{item.Description}:</strong> {item.Status}
            </li>
          ))
        ) : (
          <p>Loading compliance data...</p>  // Show a loading message if the data hasn't arrived yet
        )}
      </ul>
    </div>
  );
}

export default App;


