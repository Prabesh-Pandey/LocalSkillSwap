import { useEffect, useState } from "react";
import api from "../api/axios";

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

            setBookings((prev) =>
                prev.map((b) =>
                    b._id === bookingId ? data : b
                )
            );
        } catch (err) {
            alert("Failed to update booking");
        }
    };

    if (loading) return <p>Loading...</p>;

    return (
        <div>
            <h2>Booking Requests</h2>

            {bookings.length === 0 && <p>No bookings yet.</p>}

            {bookings.map((booking) => (
                <div
                    key={booking._id}
                    style={{ border: "1px solid #ccc", padding: "10px", margin: "10px" }}
                >
                    <h3>{booking.offer.title}</h3>
                    <p>Booked by: {booking.bookedBy.name}</p>
                    <p>Status: {booking.status}</p>

                    {booking.status === "pending" && (
                        <>
                            <button
                                onClick={() => updateStatus(booking._id, "accepted")}
                            >
                                Accept
                            </button>
                            <button
                                onClick={() => updateStatus(booking._id, "rejected")}
                            >
                                Reject
                            </button>
                        </>
                    )}
                </div>
            ))}
        </div>
    );
};

export default OwnerBookings;
