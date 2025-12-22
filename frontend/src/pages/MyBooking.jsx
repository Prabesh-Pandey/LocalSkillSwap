import { useEffect, useState } from "react";
import api from "../api/axios";
import "./Bookings.css";

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/bookings/my").then((res) => {
      setBookings(res.data);
      setLoading(false);
    });
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <div className="bookings-page">
      <div className="bookings-container">
        <div className="bookings-header">
          <h2>My Bookings</h2>
          <p>View all your booking requests</p>
        </div>

        {bookings.length === 0 && (
          <div className="no-bookings">
            <h3>You have no bookings.</h3>
          </div>
        )}

        <div className="bookings-list">
          {bookings.map((booking) => (
            <div key={booking._id} className="booking-card">
              <div className="booking-header">
                <div className="booking-title">
                  <h3>{booking.offer?.title || "Offer not found"}</h3>
                  {booking.offer?.description && (
                    <p>{booking.offer.description}</p>
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
              </div>

              {booking.status === "accepted" && (
                <p style={{ color: "green", marginTop: "1rem" }}>
                  ✔ Booking accepted — you can leave a review
                </p>
              )}

              {booking.status === "rejected" && (
                <p style={{ color: "red", marginTop: "1rem" }}>
                  ✖ Booking rejected
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MyBookings;
