import { useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import "./ReviewForm.css";

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
    <div className="review-form-container">
      <div className="review-form-header">
        <h3>Leave a Review</h3>
      </div>

      <form className="review-form" onSubmit={submitHandler}>
        {error && <p style={{ color: "red" }}>{error}</p>}

        <div className="form-group">
          <label>Rating</label>
          <div className="rating-input">
            <select value={rating} onChange={(e) => setRating(e.target.value)}>
              {[1, 2, 3, 4, 5].map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
            <span className="rating-display">{"⭐".repeat(rating)}</span>
          </div>
        </div>

        <div className="form-group">
          <label>Comment</label>
          <textarea
            placeholder="Write your review..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            required
          />
        </div>

        <div className="review-form-actions">
          <button className="btn-submit-review" type="submit">
            Submit Review
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReviewForm;
