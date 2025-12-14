import { useEffect, useState } from "react";
import api from "../api/axios";

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
        <div>
            <h2>My Bookings</h2>

            {bookings.length === 0 && <p>You have no bookings.</p>}

            {bookings.map((booking) => (
                <div
                    key={booking._id}
                    style={{
                        border: "1px solid #ccc",
                        margin: "10px",
                        padding: "10px",
                    }}
                >
                    <h3>{booking.offer.title}</h3>
                    <p>Price: {booking.offer.price}</p>
                    <p>Owner: {booking.offerOwner.name}</p>
                    <p>Status: <strong>{booking.status}</strong></p>

                    {booking.status === "accepted" && (
                        <p style={{ color: "green" }}>
                            ✔ Booking accepted — you can leave a review
                        </p>
                    )}

                    {booking.status === "rejected" && (
                        <p style={{ color: "red" }}>
                            ✖ Booking rejected
                        </p>
                    )}
                </div>
            ))}
        </div>
    );
};

export default MyBookings;
