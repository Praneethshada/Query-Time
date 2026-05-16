// frontend/src/pages/ClassroomPage.js
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import { selectCurrentUser } from "../features/authSlice";
import QuestionForm from "../components/QuestionForm";
import QuestionCard from "../components/QuestionCard";
import FilterControls from "../components/FilterControls"; // <-- Import new component
import { createSocket } from "../realtime/socket";

const ClassroomPage = () => {
  const { classId } = useParams();
  const user = useSelector(selectCurrentUser);
  const [questions, setQuestions] = useState([]);
  const [filter, setFilter] = useState(""); // <-- New state for filtering
  const [error, setError] = useState("");
  const [submissionMessage, setSubmissionMessage] = useState("");
  const filterRef = useRef(filter);

  const fetchQuestions = useCallback(async () => {
    if (user.role !== "teacher") return;
    try {
      const config = {
        headers: { Authorization: `Bearer ${user.token}` },
        params: { status: filter || undefined }, // <-- Add filter to request
      };
      const { data } = await axios.get(
        `http://localhost:5000/api/questions/${classId}`,
        config,
      );
      setQuestions(data);
    } catch (err) {
      setError("Failed to fetch questions. You may not have permission.");
    }
  }, [classId, user.token, user.role, filter]); // <-- Add filter to dependency array

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  useEffect(() => {
    filterRef.current = filter;
  }, [filter]);

  useEffect(() => {
    if (!user?.token || user.role !== "teacher") return;

    const socket = createSocket(user.token);
    socket.emit("classroom:join", { classId });

    const handleCreated = ({ classId: incomingClassId, question }) => {
      if (incomingClassId !== classId) return;
      const activeFilter = filterRef.current;
      if (activeFilter && question.status !== activeFilter) return;
      setQuestions((prev) => [
        question,
        ...prev.filter((q) => q._id !== question._id),
      ]);
    };

    const handleStatusUpdated = ({ classId: incomingClassId, question }) => {
      if (incomingClassId !== classId) return;
      const activeFilter = filterRef.current;
      setQuestions((prev) => {
        const index = prev.findIndex((q) => q._id === question._id);
        if (index === -1) return prev;
        if (activeFilter && question.status !== activeFilter) {
          return prev.filter((q) => q._id !== question._id);
        }
        const next = [...prev];
        next[index] = question;
        return next;
      });
    };

    const handleCleared = ({ classId: incomingClassId }) => {
      if (incomingClassId !== classId) return;
      setQuestions([]);
    };

    socket.on("question:created", handleCreated);
    socket.on("question:status-updated", handleStatusUpdated);
    socket.on("question:cleared", handleCleared);

    return () => {
      socket.off("question:created", handleCreated);
      socket.off("question:status-updated", handleStatusUpdated);
      socket.off("question:cleared", handleCleared);
      socket.disconnect();
    };
  }, [classId, user?.token, user?.role]);

  const handleClearAll = async () => {
    if (
      window.confirm(
        "Are you sure you want to delete all questions in this class? This cannot be undone.",
      )
    ) {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        await axios.delete(
          `http://localhost:5000/api/questions/${classId}/clear`,
          config,
        );
        setQuestions([]);
      } catch (err) {
        alert("Failed to clear questions.");
      }
    }
  };

  // --- (handleQuestionSubmit and handleStatusChange functions remain unchanged) ---

  // in frontend/src/pages/ClassroomPage.js

  const handleQuestionSubmit = async (text) => {
    setSubmissionMessage(""); // Clear previous success messages
    setError(""); // Clear previous error messages

    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.post(
        `http://localhost:5000/api/questions/${classId}`,
        { text },
        config,
      );
      setSubmissionMessage("Your question has been submitted successfully!");
      if (user.role === "teacher") {
        fetchQuestions();
      }
    } catch (err) {
      // Set the specific error message from the backend response
      setError(err.response?.data?.message || "Failed to post question.");
    }
  };

  const handleStatusChange = async (questionId, status) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.patch(
        `http://localhost:5000/api/questions/${questionId}/status`,
        { status },
        config,
      );
      const activeFilter = filterRef.current;
      setQuestions((prev) => {
        const index = prev.findIndex((q) => q._id === data._id);
        if (index === -1) return prev;
        if (activeFilter && data.status !== activeFilter) {
          return prev.filter((q) => q._id !== data._id);
        }
        const next = [...prev];
        next[index] = data;
        return next;
      });
    } catch (err) {
      alert("Failed to update status.");
    }
  };

  return (
    <div className="classroom-grid">
      <div className="classroom-main">
        <h2>Classroom Q&A</h2>
        {error && <p className="error-message">{error}</p>}
        {user.role === "student" && (
          <>
            <QuestionForm onSubmit={handleQuestionSubmit} />
            {submissionMessage && (
              <p className="success-message">{submissionMessage}</p>
            )}
          </>
        )}
        {user.role === "teacher" && (
          <div className="question-board">
            {questions.length > 0 ? (
              questions.map((q) => (
                <QuestionCard
                  key={q._id}
                  question={q}
                  user={user}
                  onStatusChange={handleStatusChange}
                />
              ))
            ) : (
              <p>No questions match the current filter.</p>
            )}
          </div>
        )}
      </div>
      {user.role === "teacher" && (
        <aside className="classroom-sidebar">
          <FilterControls setFilter={setFilter} onClear={handleClearAll} />
        </aside>
      )}
    </div>
  );
};

export default ClassroomPage;
