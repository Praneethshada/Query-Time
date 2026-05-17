// frontend/src/pages/ClassroomPage.js
import React, { useState, useEffect, useCallback, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../features/authSlice";
import QuestionForm from "../components/QuestionForm";
import QuestionCard from "../components/QuestionCard";
import FilterControls from "../components/FilterControls"; // <-- Import new component
import { createSocket } from "../realtime/socket";
import {
  fetchQuestions,
  createQuestion,
  updateQuestionStatus,
  updateQuestionAnswer,
  clearQuestions,
} from "../services/questionApi";

const ClassroomPage = () => {
  const { classId } = useParams();
  const user = useSelector(selectCurrentUser);
  const [questions, setQuestions] = useState([]);
  const [filter, setFilter] = useState(""); // <-- New state for filtering
  const [error, setError] = useState("");
  const [submissionMessage, setSubmissionMessage] = useState("");
  const filterRef = useRef(filter);

  const fetchQuestionsForClass = useCallback(async () => {
    try {
      const data = await fetchQuestions({
        classId,
        token: user.token,
        status: user.role === "teacher" ? filter || undefined : undefined,
      });
      setQuestions(data);
    } catch (err) {
      setError("Failed to fetch questions. You may not have permission.");
    }
  }, [classId, user.token, user.role, filter]); // <-- Add filter to dependency array

  useEffect(() => {
    fetchQuestionsForClass();
  }, [fetchQuestionsForClass]);

  useEffect(() => {
    filterRef.current = filter;
  }, [filter]);

  useEffect(() => {
    if (!user?.token) return;

    const socket = createSocket(user.token);
    socket.emit("classroom:join", { classId });

    const handleCreated = ({ classId: incomingClassId, question }) => {
      if (incomingClassId !== classId) return;
      const activeFilter = user.role === "teacher" ? filterRef.current : "";
      if (activeFilter && question.status !== activeFilter) return;
      setQuestions((prev) => [
        question,
        ...prev.filter((q) => q._id !== question._id),
      ]);
    };

    const handleStatusUpdated = ({ classId: incomingClassId, question }) => {
      if (incomingClassId !== classId) return;
      const activeFilter = user.role === "teacher" ? filterRef.current : "";
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

    const handleAnswerUpdated = ({ classId: incomingClassId, question }) => {
      if (incomingClassId !== classId) return;
      setQuestions((prev) => {
        const index = prev.findIndex((q) => q._id === question._id);
        if (index === -1) return prev;
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
    socket.on("question:answer-updated", handleAnswerUpdated);
    socket.on("question:cleared", handleCleared);

    return () => {
      socket.off("question:created", handleCreated);
      socket.off("question:status-updated", handleStatusUpdated);
      socket.off("question:answer-updated", handleAnswerUpdated);
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
        await clearQuestions({ classId, token: user.token });
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
      await createQuestion({ classId, token: user.token, text });
      setSubmissionMessage("Your question has been submitted successfully!");
    } catch (err) {
      // Set the specific error message from the backend response
      setError(err.response?.data?.message || "Failed to post question.");
    }
  };

  const handleStatusChange = async (questionId, status) => {
    try {
      const data = await updateQuestionStatus({
        questionId,
        token: user.token,
        status,
      });
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

  const handleAnswerSubmit = async (questionId, text) => {
    try {
      const data = await updateQuestionAnswer({
        questionId,
        token: user.token,
        text,
      });
      setQuestions((prev) => {
        const index = prev.findIndex((q) => q._id === data._id);
        if (index === -1) return prev;
        const next = [...prev];
        next[index] = data;
        return next;
      });
    } catch (err) {
      alert("Failed to save answer.");
    }
  };

  return (
    <div className="classroom-grid">
      <div className="classroom-main">
        <div className="classroom-header">
          <Link to="/dashboard" className="back-link">
            Back to Dashboard
          </Link>
        </div>
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
        <div className="question-board">
          {questions.length > 0 ? (
            questions.map((q) => (
              <QuestionCard
                key={q._id}
                question={q}
                user={user}
                showAuthor={user.role === "teacher"}
                onStatusChange={handleStatusChange}
                onAnswerSubmit={handleAnswerSubmit}
              />
            ))
          ) : (
            <p>
              {user.role === "teacher" && filter
                ? "No questions match the current filter."
                : "No questions yet."}
            </p>
          )}
        </div>
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
