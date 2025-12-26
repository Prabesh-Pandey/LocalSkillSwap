import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import "./Profile.css";

const Profile = () => {
  const { user } = useAuth();
  const [offers, setOffers] = useState([]);
  const [bookings, setBookings] = useState({ sent: [], received: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("offers");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [offersRes, sentBookingsRes, receivedBookingsRes] =
          await Promise.all([
            api.get("/offers/myoffers"),
            api.get("/bookings/my"),
            api.get("/bookings/received"),
          ]);

        setOffers(offersRes.data);
        setBookings({
          sent: sentBookingsRes.data,
          received: receivedBookingsRes.data,
        });
      } catch {
        setError("Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Calculate stats
  const stats = useMemo(() => {
    const totalOffers = offers.length;
    const totalReviews = offers.reduce(
      (sum, o) => sum + (o.numReviews || 0),
      0
    );
    const avgRating =
      totalReviews > 0
        ? offers.reduce(
            (sum, o) => sum + (o.averageRating || 0) * (o.numReviews || 0),
            0
          ) / totalReviews
        : 0;

    const pendingRequests = bookings.received.filter(
      (b) => b.status === "pending"
    ).length;
    const acceptedBookings = bookings.sent.filter(
      (b) => b.status === "accepted"
    ).length;

    return {
      totalOffers,
      totalReviews,
      avgRating: avgRating.toFixed(1),
      pendingRequests,
      acceptedBookings,
      totalEarnings: offers.reduce((sum, o) => sum + (o.price || 0), 0),
    };
  }, [offers, bookings]);

  const handleDeleteOffer = async (offerId) => {
    if (!window.confirm("Are you sure you want to delete this offer?")) return;

    try {
      await api.delete(`/offers/${offerId}`);
      setOffers((prev) => prev.filter((o) => o._id !== offerId));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete offer");
    }
  };

  const getInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div className="profile-page">
        <div className="profile-container">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        {/* Profile Header */}
        <div className="profile-header">
          <div className="profile-avatar">{getInitials(user.name)}</div>
          <div className="profile-info">
            <h1>{user.name}</h1>
            <p className="profile-email">{user.email}</p>
            <p className="profile-joined">
              Member since{" "}
              {new Date().toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">📦</div>
            <div className="stat-content">
              <span className="stat-value">{stats.totalOffers}</span>
              <span className="stat-label">Active Offers</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">⭐</div>
            <div className="stat-content">
              <span className="stat-value">{stats.avgRating}</span>
              <span className="stat-label">Avg Rating</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">💬</div>
            <div className="stat-content">
              <span className="stat-value">{stats.totalReviews}</span>
              <span className="stat-label">Reviews</span>
            </div>
          </div>
          <div className="stat-card highlight">
            <div className="stat-icon">🔔</div>
            <div className="stat-content">
              <span className="stat-value">{stats.pendingRequests}</span>
              <span className="stat-label">Pending Requests</span>
            </div>
            {stats.pendingRequests > 0 && (
              <Link to="/owner-bookings" className="stat-link">
                View
              </Link>
            )}
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        {/* Quick Actions */}
        <div className="quick-actions">
          <Link to="/create-offer" className="action-btn primary">
            <span className="action-icon">+</span>
            Create New Offer
          </Link>
        </div>

        {/* Tabs */}
        <div className="profile-tabs">
          <button
            className={`tab-btn ${activeTab === "offers" ? "active" : ""}`}
            onClick={() => setActiveTab("offers")}
          >
            My Offers ({offers.length})
          </button>
          <button
            className={`tab-btn ${activeTab === "activity" ? "active" : ""}`}
            onClick={() => setActiveTab("activity")}
          >
            Recent Activity
          </button>
        </div>

        {/* Offers Tab Content */}
        {activeTab === "offers" && (
          <div className="profile-section">
            {offers.length === 0 ? (
              <div className="no-offers-message">
                <div className="empty-icon">📦</div>
                <h3>No offers yet</h3>
                <p>Start sharing your skills with the community!</p>
                <Link to="/create-offer" className="btn-create">
                  Create Your First Offer
                </Link>
              </div>
            ) : (
              <div className="offers-grid">
                {offers.map((offer) => (
                  <div key={offer._id} className="offer-item">
                    <div className="offer-item-header">
                      <h3>
                        <Link to={`/offers/${offer._id}`}>{offer.title}</Link>
                      </h3>
                      <span className="offer-price">${offer.price}</span>
                    </div>
                    <p className="offer-description">
                      {offer.description?.length > 100
                        ? `${offer.description.substring(0, 100)}...`
                        : offer.description}
                    </p>
                    <div className="offer-meta">
                      <span className="offer-rating">
                        ⭐ {offer.averageRating?.toFixed(1) || "0.0"}
                      </span>
                      <span className="offer-reviews">
                        {offer.numReviews} review
                        {offer.numReviews !== 1 ? "s" : ""}
                      </span>
                      {offer.tags?.length > 0 && (
                        <div className="offer-tags">
                          {offer.tags.slice(0, 2).map((tag, i) => (
                            <span key={i} className="tag">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="offer-actions">
                      <Link to={`/offers/${offer._id}`} className="btn-view">
                        View
                      </Link>
                      <Link
                        to={`/offers/${offer._id}/edit`}
                        className="btn-edit"
                      >
                        Edit
                      </Link>
                      <button
                        className="btn-delete"
                        onClick={() => handleDeleteOffer(offer._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Activity Tab Content */}
        {activeTab === "activity" && (
          <div className="profile-section">
            <div className="activity-list">
              {[...bookings.sent, ...bookings.received]
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .slice(0, 10)
                .map((booking) => {
                  const isSent = bookings.sent.some(
                    (b) => b._id === booking._id
                  );
                  return (
                    <div key={booking._id} className="activity-item">
                      <div className={`activity-icon ${booking.status}`}>
                        {isSent ? "📤" : "📥"}
                      </div>
                      <div className="activity-content">
                        <p className="activity-text">
                          {isSent ? (
                            <>
                              You requested{" "}
                              <strong>
                                {booking.offer?.title || "an offer"}
                              </strong>
                            </>
                          ) : (
                            <>
                              <strong>
                                {booking.bookedBy?.name || "Someone"}
                              </strong>{" "}
                              requested{" "}
                              <strong>
                                {booking.offer?.title || "your offer"}
                              </strong>
                            </>
                          )}
                        </p>
                        <div className="activity-meta">
                          <span className={`status-badge ${booking.status}`}>
                            {booking.status}
                          </span>
                          <span className="activity-time">
                            {new Date(booking.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              {bookings.sent.length === 0 && bookings.received.length === 0 && (
                <div className="no-activity">
                  <p>No recent activity</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
