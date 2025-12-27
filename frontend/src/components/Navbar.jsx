import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import {
  Handshake,
  MessageSquare,
  Bell,
  ClipboardList,
  Inbox,
  User,
  LogOut,
  LogIn,
  UserPlus,
  Search,
} from "lucide-react";
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
  const [unreadMessages, setUnreadMessages] = useState(0);

  // Fetch unread notification and message counts
  useEffect(() => {
    const fetchUnreadCounts = async () => {
      if (user) {
        try {
          const [notifRes, msgRes] = await Promise.all([
            api.get("/notifications"),
            api.get("/messages/unread"),
          ]);
          const unread = notifRes.data.filter((n) => !n.isRead).length;
          setUnreadCount(unread);
          setUnreadMessages(msgRes.data.unreadCount || 0);
        } catch {
          // Ignore errors
        }
      }
    };

    fetchUnreadCounts();
    // Poll every 30 seconds for new notifications/messages
    const interval = setInterval(fetchUnreadCounts, 30000);
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
          <Handshake size={24} /> SkillSwap
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
              <option value="">Any ★</option>
              <option value="4">4+ ★</option>
              <option value="3">3+ ★</option>
              <option value="2">2+ ★</option>
            </select>

            <button type="submit">
              <Search size={16} /> Search
            </button>
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
              <Link to="/notifications" className="notification-link">
                <Bell size={16} /> Notifications
                {unreadCount > 0 && (
                  <span className="notification-badge">{unreadCount}</span>
                )}
              </Link>
              <span className="navbar-divider">|</span>
              <Link to="/messages" className="notification-link">
                <MessageSquare size={16} /> Messages
                {unreadMessages > 0 && (
                  <span className="notification-badge">{unreadMessages}</span>
                )}
              </Link>
              <span className="navbar-divider">|</span>
              <Link to="/my-bookings">
                <ClipboardList size={16} /> My Bookings
              </Link>
              <span className="navbar-divider">|</span>
              <Link to="/owner-bookings">
                <Inbox size={16} /> Requests
              </Link>
              <span className="navbar-divider">|</span>
              <Link to="/profile">
                <User size={16} /> Profile
              </Link>
              <span className="navbar-divider">|</span>
              <button onClick={logout}>
                <LogOut size={16} /> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login">
                <LogIn size={16} /> Login
              </Link>
              <span className="navbar-divider">|</span>
              <Link to="/register">
                <UserPlus size={16} /> Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
