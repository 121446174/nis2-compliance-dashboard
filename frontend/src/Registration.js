import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Registration() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    sector: '',
    employeeCount: '',
    revenue: '',
  });
  const [classification, setClassification] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(''); // Reset error message before submission
    try {
      const response = await fetch('http://localhost:5000/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (response.ok) {
        setClassification(data.classification); // Display the classification result
      } else {
        setErrorMessage(data.error || 'Registration failed');
      }
    } catch (error) {
      setErrorMessage('An error occurred during registration');
    }
  };

  return (
    <div>
      <h2>Register Your Organization</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" name="username" placeholder="Name" onChange={handleChange} required />
        <input type="email" name="email" placeholder="Email" onChange={handleChange} required />
        <input type="password" name="password" placeholder="Password" onChange={handleChange} required />

        <label>Sector</label>
        <select name="sector" onChange={handleChange} required>
          <option value="">Select Sector</option>
          <option value="energy">Energy</option>
          <option value="transport">Transport</option>
          <option value="health">Health</option>
        </select>

        <label>Employee Count</label>
        <select name="employeeCount" onChange={handleChange} required>
          <option value="">Select</option>
          <option value="<50">Less than 50</option>
          <option value="50-249">50-249</option>
          <option value=">250">250+</option>
        </select>

        <label>Revenue</label>
        <select name="revenue" onChange={handleChange} required>
          <option value="">Select</option>
          <option value="<10">Under 10 million</option>
          <option value="10-50">10-50 million</option>
          <option value=">50">Over 50 million</option>
        </select>

        <button type="submit">Register</button>
      </form>

      {errorMessage && <p>{errorMessage}</p>}

      {classification && (
        <div>
          <h3>Your Classification: {classification}</h3>
          <button onClick={() => navigate('/login')}>Proceed to Login</button>
        </div>
      )}
    </div>
  );
}

export default Registration;


