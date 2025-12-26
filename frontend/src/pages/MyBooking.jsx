import { useEffect, useState } from "react";
import api from "../api/axios";
import { Link } from "react-router-dom";
import "./Bookings.css";

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const { data } = await api.get("/bookings/my");
        // Sort by date (newest first)
        const sorted = data.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setBookings(sorted);
      } catch (err) {
        setError("Failed to load bookings");
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  const cancelBooking = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this booking?"))
      return;

    try {
      await api.delete(`/bookings/${bookingId}`);
      setBookings((prev) =>
        prev.map((b) =>
          b._id === bookingId ? { ...b, status: "cancelled" } : b
        )
      );
    } catch (err) {
      alert(err.response?.data?.message || "Failed to cancel booking");
    }
  };

  if (loading)
    return (
      <div className="bookings-page">
        <p>Loading...</p>
      </div>
    );

  return (
    <div className="bookings-page">
      <div className="bookings-container">
        <div className="bookings-header">
          <h2>My Bookings</h2>
          <p>View all your booking requests</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        {bookings.length === 0 && !error && (
          <div className="no-bookings">
            <h3>You have no bookings.</h3>
            <p>
              <Link to="/offers">Browse available skills</Link> to book your
              first session!
            </p>
          </div>
        )}

        <div className="bookings-list">
          {bookings.map((booking) => (
            <div key={booking._id} className="booking-card">
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
                  <span>
                    {new Date(booking.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {booking.status === "accepted" && (
                <div className="booking-status-message success">
                  <p>
                    ✔ Booking accepted — you can now{" "}
                    <Link to={`/offers/${booking.offer?._id}`}>
                      leave a review
                    </Link>
                  </p>
                </div>
              )}

              {booking.status === "rejected" && (
                <div className="booking-status-message error">
                  <p>✖ Booking was rejected by the owner</p>
                </div>
              )}

              {booking.status === "cancelled" && (
                <div className="booking-status-message warning">
                  <p>⚠ You cancelled this booking</p>
                </div>
              )}

              {booking.status === "pending" && (
                <div className="booking-actions">
                  <button
                    className="btn-cancel-booking"
                    onClick={() => cancelBooking(booking._id)}
                  >
                    Cancel Booking
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
