import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import "./Navbar.css";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [keyword, setKeyword] = useState("");
  const [minRating, setMinRating] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch unread notification count
  useEffect(() => {
    const fetchUnreadCount = async () => {
      if (user) {
        try {
          const { data } = await api.get("/notifications");
          const unread = data.filter((n) => !n.isRead).length;
          setUnreadCount(unread);
        } catch (err) {
          // Ignore errors
        }
      }
    };

    fetchUnreadCount();
    // Poll every 30 seconds for new notifications
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const submitHandler = (e) => {
    e.preventDefault();

    const params = new URLSearchParams();
    if (keyword) params.set("keyword", keyword);
    if (minRating) params.set("minRating", minRating);
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);

    navigate(`/offers?${params.toString()}`);
    setShowFilters(false);
  };

  const clearFilters = () => {
    setKeyword("");
    setMinRating("");
    setMinPrice("");
    setMaxPrice("");
    navigate("/offers");
    setShowFilters(false);
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
              <option value="4">4+ ⭐</option>
              <option value="3">3+ ⭐</option>
              <option value="2">2+ ⭐</option>
            </select>

            <button type="submit">Search</button>
            <button
              type="button"
              className="btn-filters"
              onClick={() => setShowFilters(!showFilters)}
            >
              {showFilters ? "Hide Filters" : "More Filters"}
            </button>
          </form>

          {showFilters && (
            <div className="advanced-filters">
              <div className="filter-group">
                <label>Min Price ($)</label>
                <input
                  type="number"
                  placeholder="0"
                  min="0"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                />
              </div>
              <div className="filter-group">
                <label>Max Price ($)</label>
                <input
                  type="number"
                  placeholder="Any"
                  min="0"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                />
              </div>
              <button
                type="button"
                className="btn-clear"
                onClick={clearFilters}
              >
                Clear All
              </button>
            </div>
          )}
        </div>

        {/* AUTH LINKS */}
        <div className="navbar-links">
          {user ? (
            <>
              <span className="navbar-user">Hello, {user.name}</span>
              <span className="navbar-divider">|</span>
              <Link to="/notifications" className="notification-link">
                Notifications
                {unreadCount > 0 && (
                  <span className="notification-badge">{unreadCount}</span>
                )}
              </Link>
              <span className="navbar-divider">|</span>
              <Link to="/my-bookings">My Bookings</Link>
              <span className="navbar-divider">|</span>
              <Link to="/owner-bookings">Requests</Link>
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
