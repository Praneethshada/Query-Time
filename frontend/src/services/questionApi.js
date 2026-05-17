import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const authConfig = (token, params) => ({
  headers: { Authorization: `Bearer ${token}` },
  params,
});

export const fetchQuestions = async ({ classId, token, status }) => {
  const params = status ? { status } : undefined;
  const { data } = await axios.get(
    `${API_BASE_URL}/api/questions/${classId}`,
    authConfig(token, params),
  );
  return data;
};

export const createQuestion = async ({ classId, token, text }) => {
  const { data } = await axios.post(
    `${API_BASE_URL}/api/questions/${classId}`,
    { text },
    authConfig(token),
  );
  return data;
};

export const updateQuestionStatus = async ({ questionId, token, status }) => {
  const { data } = await axios.patch(
    `${API_BASE_URL}/api/questions/${questionId}/status`,
    { status },
    authConfig(token),
  );
  return data;
};

export const updateQuestionAnswer = async ({ questionId, token, text }) => {
  const { data } = await axios.patch(
    `${API_BASE_URL}/api/questions/${questionId}/answer`,
    { text },
    authConfig(token),
  );
  return data;
};

export const clearQuestions = async ({ classId, token }) => {
  const { data } = await axios.delete(
    `${API_BASE_URL}/api/questions/${classId}/clear`,
    authConfig(token),
  );
  return data;
};
