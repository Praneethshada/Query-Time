import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout, selectCurrentUser } from "../features/authSlice";

const Header = () => {
  const user = useSelector(selectCurrentUser);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const onLogout = () => {
    dispatch(logout());
    navigate("/auth");
  };

  return (
    <header>
      <div className="header-container">
        <Link to={user ? "/dashboard" : "/"}>
          <h1>Query Time</h1>
        </Link>
        <nav>
          {user ? (
            <>
              <span>Hello, {user.name}</span>
              <Link to="/profile" className="profile-icon-link" title="Profile">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </Link>
              <button onClick={onLogout}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/auth?mode=login" className="nav-link">
                Login
              </Link>
              <Link to="/auth?mode=register" className="nav-cta">
                Register
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
