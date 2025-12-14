import { useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const ReviewForm = ({ offerId, onReviewAdded }) => {
    const { user } = useAuth();
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const [error, setError] = useState("");

    if (!user) {
        return <p>Login to leave a review.</p>;
    }

    const submitHandler = async (e) => {
        e.preventDefault();
        setError("");

        try {
            const { data } = await api.post("/reviews", {
                offerId,
                rating,
                comment,
            });

            onReviewAdded((prev) => [data, ...prev]);
            setComment("");
            setRating(5);
        } catch (err) {
            setError(err.response?.data?.message || "Cannot leave review");
        }
    };

    return (
        <form onSubmit={submitHandler} style={{ marginTop: "20px" }}>
            <h4>Leave a Review</h4>

            {error && <p style={{ color: "red" }}>{error}</p>}

            <select value={rating} onChange={(e) => setRating(e.target.value)}>
                {[1, 2, 3, 4, 5].map((r) => (
                    <option key={r} value={r}>{r}</option>
                ))}
            </select>

            <textarea
                placeholder="Write your review..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                required
            />

            <button type="submit">Submit Review</button>
        </form>
    );
};

export default ReviewForm;
