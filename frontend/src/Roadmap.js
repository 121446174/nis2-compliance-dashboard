
import React, { useEffect, useState } from 'react';
import axios from 'axios';

function Roadmap() {
  const [complianceData, setComplianceData] = useState([]);
  const [newTask, setNewTask] = useState({ description: '', status: '', due_date: '', priority: '' });
  const [error, setError] = useState(null);

  // Fetch compliance data (Read)
  useEffect(() => {
    fetchComplianceData();
  }, []);

  const fetchComplianceData = () => {
    axios.get('http://localhost:5000/api/compliance')
      .then(response => {
        setComplianceData(response.data);
      })
      .catch(error => {
        setError(`Error connecting to the backend: ${error.message}`);
      });
  };

  const handleCreateTask = (e) => {
    e.preventDefault();
    if (!newTask.description || !newTask.status) {
      setError("Description and status are required.");
      return;
    }

    axios.post('http://localhost:5000/api/compliance', newTask)
      .then(() => {
        fetchComplianceData();
        setNewTask({ description: '', status: '', due_date: '', priority: '' });
      })
      .catch(error => {
        setError(`Error creating new task: ${error.message}`);
      });
  };

  const handleDeleteTask = (taskId) => {
    axios.delete(`http://localhost:5000/api/compliance/${taskId}`)
      .then(() => {
        fetchComplianceData();
      })
      .catch(error => {
        setError(`Error deleting task: ${error.message}`);
      });
  };

  return (
    <div className="roadmap">
      <h1>Compliance Dashboard</h1>
      {error && <p>{error}</p>}

      <ul>
        {complianceData.length > 0 ? (
          complianceData.map((item) => (
            <li key={item.Task_ID}>
              <strong>{item.Description}:</strong> {item.Status}
              <button onClick={() => handleDeleteTask(item.Task_ID)}>Delete</button>
            </li>
          ))
        ) : (
          <p>Loading compliance data...</p>
        )}
      </ul>

      <form onSubmit={handleCreateTask}>
        <h3>Create New Task</h3>
        <input
          type="text"
          placeholder="Task Description"
          value={newTask.description}
          onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
        />
        <input
          type="text"
          placeholder="Task Status"
          value={newTask.status}
          onChange={(e) => setNewTask({ ...newTask, status: e.target.value })}
        />
        <input
          type="date"
          value={newTask.due_date}
          onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
        />
        <input
          type="text"
          placeholder="Priority"
          value={newTask.priority}
          onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
        />
        <button type="submit">Create Task</button>
      </form>
    </div>
  );
}

export default Roadmap;