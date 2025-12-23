import { useEffect, useState } from "react";
import api from "../api/axios";
import "./Bookings.css";

const OwnerBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/bookings/received").then((res) => {
      setBookings(res.data);
      setLoading(false);
    });
  }, []);

  const updateStatus = async (bookingId, status) => {
    try {
      const { data } = await api.put(`/bookings/${bookingId}`, { status });

      setBookings((prev) => prev.map((b) => (b._id === bookingId ? data : b)));
    } catch (err) {
      alert("Failed to update booking");
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="bookings-page">
      <div className="bookings-container">
        <div className="bookings-header">
          <h2>Booking Requests</h2>
          <p>Manage booking requests for your offers</p>
        </div>

        {bookings.length === 0 && (
          <div className="no-bookings">
            <h3>No bookings yet.</h3>
          </div>
        )}

        <div className="bookings-list">
          {bookings.map((booking) => (
            <div key={booking._id} className="booking-card">
              <div className="booking-header">
                <div className="booking-title">
                  <h3>{booking.offer?.title || "Offer not found"}</h3>
                  {booking.offer && <p>Price: ${booking.offer.price}</p>}
                </div>
                <span className={`booking-status ${booking.status}`}>
                  {booking.status}
                </span>
              </div>

              <div className="booking-body">
                <div className="booking-info-item">
                  <label>Booked by</label>
                  <span>{booking.bookedBy?.name || "Unknown user"}</span>
                </div>
                {booking.bookedBy?.email && (
                  <div className="booking-info-item">
                    <label>Email</label>
                    <span>{booking.bookedBy.email}</span>
                  </div>
                )}
              </div>

              {booking.status === "pending" && (
                <div className="booking-actions">
                  <button
                    className="btn-confirm"
                    onClick={() => updateStatus(booking._id, "accepted")}
                  >
                    Accept
                  </button>
                  <button
                    className="btn-cancel-booking"
                    onClick={() => updateStatus(booking._id, "rejected")}
                  >
                    Reject
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

export default OwnerBookings;
