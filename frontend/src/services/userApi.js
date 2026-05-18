import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const authConfig = (token) => ({
  headers: { Authorization: `Bearer ${token}` },
});

export const updateProfile = async ({
  token,
  currentPassword,
  newPassword,
  theme,
}) => {
  const payload = {
    currentPassword,
    newPassword,
    theme,
  };
  const { data } = await axios.patch(
    `${API_BASE_URL}/api/users/profile`,
    payload,
    authConfig(token),
  );
  return data;
};
