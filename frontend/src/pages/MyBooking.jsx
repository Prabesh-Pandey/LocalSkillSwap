import { useEffect, useState, useMemo } from "react";
import api from "../api/axios";
import { Link } from "react-router-dom";
import {
  ClipboardList,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
} from "lucide-react";
import "./Bookings.css";

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [cancellingId, setCancellingId] = useState(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const { data } = await api.get("/bookings/my");
        const sorted = data.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setBookings(sorted);
      } catch {
        setError("Failed to load bookings");
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  // Calculate stats
  const stats = useMemo(() => {
    return {
      total: bookings.length,
      pending: bookings.filter((b) => b.status === "pending").length,
      accepted: bookings.filter((b) => b.status === "accepted").length,
      rejected: bookings.filter((b) => b.status === "rejected").length,
      cancelled: bookings.filter((b) => b.status === "cancelled").length,
    };
  }, [bookings]);

  // Filter bookings
  const filteredBookings = useMemo(() => {
    if (filter === "all") return bookings;
    return bookings.filter((b) => b.status === filter);
  }, [bookings, filter]);

  // Time ago helper
  const getTimeAgo = (date) => {
    const now = new Date();
    const diff = now - new Date(date);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} day${days > 1 ? "s" : ""} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
    return "Just now";
  };

  const cancelBooking = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this booking?"))
      return;

    setCancellingId(bookingId);
    try {
      await api.delete(`/bookings/${bookingId}`);
      setBookings((prev) =>
        prev.map((b) =>
          b._id === bookingId ? { ...b, status: "cancelled" } : b
        )
      );
    } catch (err) {
      alert(err.response?.data?.message || "Failed to cancel booking");
    } finally {
      setCancellingId(null);
    }
  };

  if (loading) {
    return (
      <div className="bookings-page">
        <div className="bookings-container">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading your bookings...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bookings-page">
      <div className="bookings-container">
        <div className="bookings-header">
          <h2>My Bookings</h2>
          <p>Track all your booking requests and their status</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        {/* Stats Dashboard */}
        {bookings.length > 0 && (
          <div className="stats-dashboard">
            <div className="stat-card">
              <span className="stat-number">{stats.total}</span>
              <span className="stat-label">Total</span>
            </div>
            <div className="stat-card pending">
              <span className="stat-number">{stats.pending}</span>
              <span className="stat-label">Pending</span>
            </div>
            <div className="stat-card accepted">
              <span className="stat-number">{stats.accepted}</span>
              <span className="stat-label">Accepted</span>
            </div>
            <div className="stat-card rejected">
              <span className="stat-number">{stats.rejected}</span>
              <span className="stat-label">Rejected</span>
            </div>
          </div>
        )}

        {/* Filter Tabs */}
        {bookings.length > 0 && (
          <div className="filter-tabs">
            <button
              className={`filter-tab ${filter === "all" ? "active" : ""}`}
              onClick={() => setFilter("all")}
            >
              All ({stats.total})
            </button>
            <button
              className={`filter-tab ${filter === "pending" ? "active" : ""}`}
              onClick={() => setFilter("pending")}
            >
              Pending ({stats.pending})
            </button>
            <button
              className={`filter-tab ${filter === "accepted" ? "active" : ""}`}
              onClick={() => setFilter("accepted")}
            >
              Accepted ({stats.accepted})
            </button>
            <button
              className={`filter-tab ${filter === "rejected" ? "active" : ""}`}
              onClick={() => setFilter("rejected")}
            >
              Rejected ({stats.rejected})
            </button>
          </div>
        )}

        {/* Empty State */}
        {bookings.length === 0 && !error && (
          <div className="no-bookings">
            <div className="empty-icon">
              <ClipboardList size={64} strokeWidth={1} />
            </div>
            <h3>No bookings yet</h3>
            <p>You haven't made any booking requests.</p>
            <Link to="/offers" className="btn-browse">
              Browse Available Skills
            </Link>
          </div>
        )}

        {/* Filtered Empty State */}
        {bookings.length > 0 && filteredBookings.length === 0 && (
          <div className="no-bookings">
            <h3>No {filter} bookings</h3>
            <p>
              <button className="link-button" onClick={() => setFilter("all")}>
                View all bookings
              </button>
            </p>
          </div>
        )}

        {/* Bookings List */}
        <div className="bookings-list">
          {filteredBookings.map((booking) => (
            <div
              key={booking._id}
              className={`booking-card ${
                booking.status === "pending" ? "highlight-pending" : ""
              }`}
            >
              <div className="booking-header">
                <div className="booking-title">
                  <h3>
                    {booking.offer ? (
                      <Link to={`/offers/${booking.offer._id}`}>
                        {booking.offer.title}
                      </Link>
                    ) : (
                      "Offer not found"
                    )}
                  </h3>
                  {booking.offer?.description && (
                    <p className="booking-description">
                      {booking.offer.description.length > 100
                        ? `${booking.offer.description.substring(0, 100)}...`
                        : booking.offer.description}
                    </p>
                  )}
                </div>
                <span className={`booking-status ${booking.status}`}>
                  {booking.status}
                </span>
              </div>

              <div className="booking-body">
                {booking.offer?.price && (
                  <div className="booking-info-item">
                    <label>Price</label>
                    <span>${booking.offer.price}</span>
                  </div>
                )}
                <div className="booking-info-item">
                  <label>Owner</label>
                  <span>{booking.offerOwner?.name || "Unknown owner"}</span>
                </div>
                {booking.offerOwner?.email && (
                  <div className="booking-info-item">
                    <label>Contact</label>
                    <span>{booking.offerOwner.email}</span>
                  </div>
                )}
                <div className="booking-info-item">
                  <label>Requested</label>
                  <span title={new Date(booking.createdAt).toLocaleString()}>
                    {getTimeAgo(booking.createdAt)}
                  </span>
                </div>
              </div>

              {booking.status === "accepted" && (
                <div className="booking-status-message success">
                  <p>
                    <CheckCircle size={16} /> Booking accepted — you can now{" "}
                    <Link to={`/offers/${booking.offer?._id}`}>
                      leave a review
                    </Link>
                  </p>
                </div>
              )}

              {booking.status === "rejected" && (
                <div className="booking-status-message error">
                  <p>
                    <XCircle size={16} /> Booking was rejected by the owner
                  </p>
                </div>
              )}

              {booking.status === "cancelled" && (
                <div className="booking-status-message warning">
                  <p>
                    <AlertCircle size={16} /> You cancelled this booking
                  </p>
                </div>
              )}

              {booking.status === "pending" && (
                <div className="booking-actions">
                  <span className="waiting-text">
                    <Clock size={16} /> Waiting for response
                  </span>
                  <button
                    className="btn-cancel-booking"
                    onClick={() => cancelBooking(booking._id)}
                    disabled={cancellingId === booking._id}
                  >
                    {cancellingId === booking._id
                      ? "Cancelling..."
                      : "Cancel Booking"}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MyBookings;
