import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setCredentials, selectCurrentUser } from "../features/authSlice";
import { updateProfile } from "../services/userApi";

const ProfilePage = () => {
  const user = useSelector(selectCurrentUser);
  const dispatch = useDispatch();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [theme, setTheme] = useState(user?.theme || "light");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (newPassword && newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    try {
      const data = await updateProfile({
        token: user.token,
        currentPassword: newPassword ? currentPassword : undefined,
        newPassword: newPassword || undefined,
        theme,
      });
      dispatch(setCredentials(data));
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setMessage("Profile updated successfully.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile.");
    }
  };

  return (
    <div className="profile-container">
      <h2>Profile Settings</h2>
      <form className="profile-form" onSubmit={handleSubmit}>
        <label>
          Name
          <input type="text" value={user?.name || ""} disabled />
        </label>
        <label>
          Email
          <input type="email" value={user?.email || ""} disabled />
        </label>

        <div className="profile-section">
          <h3>Change Password</h3>
          <input
            type="password"
            placeholder="Current password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
          <input
            type="password"
            placeholder="New password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <input
            type="password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>

        <div className="profile-section">
          <h3>Appearance</h3>
          <select value={theme} onChange={(e) => setTheme(e.target.value)}>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </div>

        {error && <p className="error-message">{error}</p>}
        {message && <p className="success-message">{message}</p>}
        <button type="submit">Save Changes</button>
      </form>
    </div>
  );
};

export default ProfilePage;
