import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import "./Navbar.css";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [keyword, setKeyword] = useState("");
  const [minRating, setMinRating] = useState("");

  const submitHandler = (e) => {
    e.preventDefault();

    navigate(`/offers?keyword=${keyword}&minRating=${minRating}`);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          🤝 SkillSwap
        </Link>

        {/* SEARCH */}
        <div className="navbar-search">
          <form onSubmit={submitHandler}>
            <input
              type="text"
              placeholder="Search skills..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />

            <select
              value={minRating}
              onChange={(e) => setMinRating(e.target.value)}
            >
              <option value="">Any ⭐</option>
              <option value="4">4+</option>
              <option value="3">3+</option>
              <option value="2">2+</option>
            </select>

            <button type="submit">Search</button>
          </form>
        </div>

        {/* AUTH LINKS */}
        <div className="navbar-links">
          {user ? (
            <>
              <span className="navbar-user">Hello, {user.name}</span>
              <span className="navbar-divider">|</span>
              <Link to="/notifications">Notifications</Link>
              <span className="navbar-divider">|</span>
              <Link to="/my-bookings">My Bookings</Link>
              <span className="navbar-divider">|</span>
              <Link to="/owner-bookings">Bookings</Link>
              <span className="navbar-divider">|</span>
              <Link to="/profile">Profile</Link>
              <span className="navbar-divider">|</span>
              <button onClick={logout}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <span className="navbar-divider">|</span>
              <Link to="/register">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
