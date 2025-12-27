import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import Loading from "../components/Loading";
import { Inbox, CheckCircle, XCircle, Clock, Mail, User } from "lucide-react";
import "./Bookings.css";

const OwnerBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const { data } = await api.get("/bookings/received");
        // Sort bookings by createdAt in descending order (latest first)
        const sortedBookings = data.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setBookings(sortedBookings);
      } catch {
        setError("Failed to load booking requests");
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
    };
  }, [bookings]);

  // Filter bookings based on selected filter
  const filteredBookings = useMemo(() => {
    if (filter === "all") return bookings;
    return bookings.filter((b) => b.status === filter);
  }, [bookings, filter]);

  const updateStatus = async (bookingId, status) => {
    const action = status === "accepted" ? "accept" : "reject";
    const confirmMsg = `Are you sure you want to ${action} this booking request?`;

    if (!window.confirm(confirmMsg)) return;

    setUpdatingId(bookingId);
    try {
      const { data } = await api.put(`/bookings/${bookingId}`, { status });
      setBookings((prev) => prev.map((b) => (b._id === bookingId ? data : b)));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update booking");
    } finally {
      setUpdatingId(null);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return formatDate(dateString);
  };

  if (loading) {
    return (
      <div className="bookings-page">
        <div className="bookings-container">
          <Loading message="Loading booking requests..." />
        </div>
      </div>
    );
  }

  return (
    <div className="bookings-page">
      <div className="bookings-container">
        <div className="bookings-header">
          <div className="header-content">
            <h2>Booking Requests</h2>
            <p>Manage incoming booking requests for your skill offers</p>
          </div>

          {/* Stats Summary */}
          {bookings.length > 0 && (
            <div className="bookings-stats">
              <div className="stat-item">
                <span className="stat-value">{stats.total}</span>
                <span className="stat-label">Total</span>
              </div>
              <div className="stat-item pending">
                <span className="stat-value">{stats.pending}</span>
                <span className="stat-label">Pending</span>
              </div>
              <div className="stat-item accepted">
                <span className="stat-value">{stats.accepted}</span>
                <span className="stat-label">Accepted</span>
              </div>
              <div className="stat-item rejected">
                <span className="stat-value">{stats.rejected}</span>
                <span className="stat-label">Rejected</span>
              </div>
            </div>
          )}
        </div>

        {error && <div className="error-message">{error}</div>}

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
              <Inbox size={64} strokeWidth={1} />
            </div>
            <h3>No booking requests yet</h3>
            <p>
              When someone books one of your offers, their request will appear
              here.
            </p>
            <p>
              <Link to="/create-offer">Create a new offer</Link> to start
              receiving bookings!
            </p>
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
                  {booking.offer && (
                    <p className="booking-price">
                      ${booking.offer.price} per session
                    </p>
                  )}
                </div>
                <span className={`booking-status ${booking.status}`}>
                  {booking.status}
                </span>
              </div>

              <div className="booking-body">
                <div className="booking-info-item">
                  <label>Requested by</label>
                  <span className="requester-name">
                    {booking.bookedBy?.name || "Unknown user"}
                  </span>
                </div>
                {booking.bookedBy?.email && (
                  <div className="booking-info-item">
                    <label>Contact Email</label>
                    <span>
                      <a
                        href={`mailto:${booking.bookedBy.email}`}
                        className="email-link"
                      >
                        {booking.bookedBy.email}
                      </a>
                    </span>
                  </div>
                )}
                <div className="booking-info-item">
                  <label>Requested</label>
                  <span
                    title={`${formatDate(booking.createdAt)} at ${formatTime(
                      booking.createdAt
                    )}`}
                  >
                    {getTimeAgo(booking.createdAt)}
                  </span>
                </div>
                {booking.status !== "pending" && (
                  <div className="booking-info-item">
                    <label>Updated</label>
                    <span>{getTimeAgo(booking.updatedAt)}</span>
                  </div>
                )}
              </div>

              {/* Status Messages */}
              {booking.status === "accepted" && (
                <div className="booking-status-message success">
                  <p>
                    ✓ You accepted this booking. The requester has been notified
                    and can now contact you.
                  </p>
                </div>
              )}

              {booking.status === "rejected" && (
                <div className="booking-status-message error">
                  <p>✗ You declined this booking request.</p>
                </div>
              )}

              {/* Action Buttons */}
              {booking.status === "pending" && (
                <div className="booking-actions">
                  <button
                    className="btn-confirm"
                    onClick={() => updateStatus(booking._id, "accepted")}
                    disabled={updatingId === booking._id}
                  >
                    {updatingId === booking._id ? "Updating..." : "✓ Accept"}
                  </button>
                  <button
                    className="btn-cancel-booking"
                    onClick={() => updateStatus(booking._id, "rejected")}
                    disabled={updatingId === booking._id}
                  >
                    {updatingId === booking._id ? "Updating..." : "✗ Reject"}
                  </button>
                  {booking.offer && (
                    <Link
                      to={`/offers/${booking.offer._id}`}
                      className="btn-view-details"
                    >
                      View Offer
                    </Link>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OwnerBookings;
