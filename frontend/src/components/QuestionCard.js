import React, { useEffect, useState } from "react";

const QuestionCard = ({
  question,
  user,
  showAuthor = false,
  onStatusChange,
  onAnswerSubmit,
}) => {
  const [answerText, setAnswerText] = useState(question.answer?.text || "");

  useEffect(() => {
    setAnswerText(question.answer?.text || "");
  }, [question.answer?.text]);
  const cardColor = {
    unanswered: "#fffac8",
    answered: "#c8e6c9",
    important: "#ffcdd2",
  };

  return (
    <div
      className="question-card"
      style={{ backgroundColor: cardColor[question.status] }}
    >
      <p className="question-text">{question.text}</p>
      {showAuthor && question.author?.name && (
        <p className="question-author">- {question.author.name}</p>
      )}

      {question.answer?.text && (
        <div className="question-answer">
          <strong>Answer:</strong> {question.answer.text}
        </div>
      )}

      {/* TEACHER CONTROLS */}
      {user.role === "teacher" && (
        <div className="instructor-controls">
          <button onClick={() => onStatusChange(question._id, "answered")}>
            Answered
          </button>
          <button onClick={() => onStatusChange(question._id, "important")}>
            Important
          </button>
          <button onClick={() => onStatusChange(question._id, "unanswered")}>
            Un-Answer
          </button>
        </div>
      )}

      {user.role === "teacher" && onAnswerSubmit && (
        <form
          className="answer-form"
          onSubmit={(e) => {
            e.preventDefault();
            onAnswerSubmit(question._id, answerText);
          }}
        >
          <textarea
            value={answerText}
            onChange={(e) => setAnswerText(e.target.value)}
            placeholder="Optional: add an answer for students"
          />
          <button type="submit">Save Answer</button>
        </form>
      )}
    </div>
  );
};

export default QuestionCard;
