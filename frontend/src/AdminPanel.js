import React, { useEffect, useState } from "react";

const AdminPanel = () => {
  const [questions, setQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState({
    text: "",
    category: "",
    classification: "",
    type: ""
  });
  const [error, setError] = useState(null);

  // ✅ Get token from localStorage (like your other pages)
  const token = localStorage.getItem("token");

  // ✅ Fetch all questions on mount
  useEffect(() => {
    fetch("http://localhost:5000/admin/questions", {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // 🔥 FIXED: Add missing Authorization header
      },
    })
      .then(async (res) => {
        if (!res.ok) {
          const errText = await res.text();
          throw new Error(`HTTP ${res.status}: ${errText}`);
        }
        return res.json();
      })
      .then((data) => {
        setQuestions(data);
        setError(null);
      })
      .catch((error) => {
        console.error("Error fetching questions:", error);
        setError(error.message);
      });
  }, [token]); // ✅ Ensures token is available when fetching

  // ✅ Add a new question
  const addQuestion = () => {
    fetch("http://localhost:5000/admin/questions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // 🔥 FIXED: Add missing Authorization header
      },
      body: JSON.stringify({
        question_text: newQuestion.text,
        category_id: newQuestion.category,
        classification_type: newQuestion.classification,
        answer_type: newQuestion.type
      }),
      credentials: "include"
    })
      .then(async (res) => {
        if (!res.ok) {
          const errText = await res.text();
          throw new Error(`HTTP ${res.status}: ${errText}`);
        }
        return res.json();
      })
      .then(() => {
        setNewQuestion({ text: "", category: "", classification: "", type: "" });
        window.location.reload();
      })
      .catch((error) => {
        console.error("Error adding question:", error);
        setError(error.message);
      });
  };

  // ✅ Delete a question
  const deleteQuestion = (id) => {
    fetch(`http://localhost:5000/admin/questions/${id}`, {
      method: "DELETE",
      credentials: "include",
      headers: {
        Authorization: `Bearer ${token}`, // 🔥 FIXED: Add missing Authorization header
      },
    })
      .then(async (res) => {
        if (!res.ok) {
          const errText = await res.text();
          throw new Error(`HTTP ${res.status}: ${errText}`);
        }
        return res.json();
      })
      .then(() => window.location.reload())
      .catch((error) => {
        console.error("Error deleting question:", error);
        setError(error.message);
      });
  };

  return (
    <div style={{ padding: "1rem" }}>
      <h2>Admin Panel - Manage Questions</h2>
      {error && <div style={{ color: "red", marginBottom: "1rem" }}>Error: {error}</div>}

      {/* ✅ Form to add questions */}
      <div style={{ marginBottom: "1rem" }}>
        <input
          type="text"
          value={newQuestion.text}
          onChange={(e) => setNewQuestion({ ...newQuestion, text: e.target.value })}
          placeholder="Enter question"
          style={{ padding: "0.5rem", width: "300px", marginRight: "10px" }}
        />
        <select
          value={newQuestion.classification}
          onChange={(e) => setNewQuestion({ ...newQuestion, classification: e.target.value })}
          style={{ marginRight: "10px" }}
        >
          <option value="">Select Classification</option>
          <option value="Essential">Essential</option>
          <option value="Important">Important</option>
          <option value="Sector-Specific">Sector-Specific</option>
        </select>
        <select
          value={newQuestion.type}
          onChange={(e) => setNewQuestion({ ...newQuestion, type: e.target.value })}
          style={{ marginRight: "10px" }}
        >
          <option value="">Select Answer Type</option>
          <option value="yes_no">Yes/No</option>
          <option value="text">Text</option>
          <option value="numeric">Numeric</option>
          <option value="multiple_choice">Multiple Choice</option>
        </select>
        {newQuestion.type === "multiple_choice" && (
          <input
            type="text"
            value={newQuestion.mcqOptions}
            onChange={(e) => setNewQuestion({ ...newQuestion, mcqOptions: e.target.value })}
            placeholder="Comma-separated options (e.g. Yes, No, Not Sure)"
            style={{ padding: "0.5rem", width: "300px" }}
          />
        )}
        <button onClick={addQuestion} style={{ marginLeft: "1rem", padding: "0.5rem 1rem" }}>
          Add Question
        </button>
      </div>

      {/* ✅ Table of Questions */}
      <table border="1" cellPadding="8" cellSpacing="0">
        <thead>
          <tr>
            <th>ID</th>
            <th>Question</th>
            <th>Classification</th>
            <th>Answer Type</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {questions.map((q) => (
            <tr key={q.Question_ID}>
              <td>{q.Question_ID}</td>
              <td>{q.Question_Text}</td>
              <td>{q.Classification_Type}</td>
              <td>{q.Answer_Type}</td>
              <td>
                <button onClick={() => deleteQuestion(q.Question_ID)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminPanel;