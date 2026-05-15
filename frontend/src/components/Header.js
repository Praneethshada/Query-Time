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
        <Link to={user ? "/dashboard" : "/auth"}>
          <h1>Query Time</h1>
        </Link>
        <nav>
          {user ? (
            <>
              <span>Hello, {user.name}</span>
              <button onClick={onLogout}>Logout</button>
            </>
          ) : (
            <Link to="/auth">Login</Link>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
