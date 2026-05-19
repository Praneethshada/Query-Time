import React, { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import axios from "axios";
import { selectCurrentUser } from "../features/authSlice";

const DashboardPage = () => {
  const user = useSelector(selectCurrentUser);
  const apiBaseUrl = process.env.REACT_APP_API_URL || "http://localhost:5000";
  const [classes, setClasses] = useState([]);
  const [className, setClassName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const fetchClasses = useCallback(async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get(`${apiBaseUrl}/api/classrooms`, config);
      setClasses(data);
    } catch (err) {
      setError("Failed to fetch classes.");
    }
  }, [user.token]);

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  const handleCreateClass = async (e) => {
    e.preventDefault();
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.post(
        `${apiBaseUrl}/api/classrooms/create`,
        { name: className },
        config,
      );
      setClassName("");
      fetchClasses(); // Refresh list
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create class");
    }
  };

  const handleJoinClass = async (e) => {
    e.preventDefault();
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.post(
        `${apiBaseUrl}/api/classrooms/join`,
        { joinCode },
        config,
      );
      setJoinCode("");
      setMessage("Successfully joined class!");
      setError("");
      fetchClasses(); // Refresh list
    } catch (err) {
      setError(err.response?.data?.message || "Failed to join class");
    }
  };

  return (
    <div className="dashboard">
      <h1>Welcome, {user.name}!</h1>
      {error && <p className="error-message">{error}</p>}
      {message && <p className="success-message">{message}</p>}

      {/* Teacher View */}
      {user.role === "teacher" && (
        <div className="dashboard-section">
          <h3>Create a New Class</h3>
          <form onSubmit={handleCreateClass} className="inline-form">
            <input
              type="text"
              placeholder="Class Name"
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              required
            />
            <button type="submit">Create</button>
          </form>
        </div>
      )}

      {/* Student View */}
      {user.role === "student" && (
        <div className="dashboard-section">
          <h3>Join a Class</h3>
          <form onSubmit={handleJoinClass} className="inline-form">
            <input
              type="text"
              placeholder="Enter Join Code"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
              required
            />
            <button type="submit">Join</button>
          </form>
        </div>
      )}

      {/* Classes List */}
      <div className="dashboard-section">
        <h3>My Classes</h3>
        <div className="class-list">
          {classes.length > 0 ? (
            classes.map((c) => (
              <Link to={`/class/${c._id}`} key={c._id} className="class-card">
                <h4>{c.name}</h4>
                {user.role === "teacher" && (
                  <p>
                    Code: <strong>{c.joinCode}</strong>
                  </p>
                )}
              </Link>
            ))
          ) : (
            <p>You have no classes yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
