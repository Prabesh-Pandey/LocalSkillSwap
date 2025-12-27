import { useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { Star, Send, MessageSquare } from "lucide-react";
import "./ReviewForm.css";

const ReviewForm = ({ offerId, onReviewAdded }) => {
  const { user } = useAuth();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!user) {
    return (
      <div className="review-form-container">
        <p className="login-prompt">Please login to leave a review.</p>
      </div>
    );
  }

  const submitHandler = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data } = await api.post("/reviews", {
        offerId,
        rating: Number(rating),
        comment: comment.trim(),
      });

      onReviewAdded((prev) => [data, ...prev]);
      setComment("");
      setRating(5);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit review");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="review-form-container">
      <div className="review-form-header">
        <h3>
          <MessageSquare size={20} /> Leave a Review
        </h3>
      </div>

      {error && <div className="error-message">{error}</div>}

      <form className="review-form" onSubmit={submitHandler}>
        <div className="form-group">
          <label>Rating</label>
          <div className="rating-input">
            <select
              value={rating}
              onChange={(e) => setRating(e.target.value)}
              disabled={loading}
            >
              {[5, 4, 3, 2, 1].map((r) => (
                <option key={r} value={r}>
                  {r} Star{r !== 1 ? "s" : ""}
                </option>
              ))}
            </select>
            <span className="rating-display">
              {[...Array(Number(rating))].map((_, i) => (
                <Star key={i} size={18} fill="#f4a425" stroke="#f4a425" />
              ))}
            </span>
          </div>
        </div>

        <div className="form-group">
          <label>Comment</label>
          <textarea
            placeholder="Write your review..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            required
            disabled={loading}
            minLength={5}
          />
        </div>

        <div className="review-form-actions">
          <button
            className="btn-submit-review"
            type="submit"
            disabled={loading}
          >
            <Send size={16} />
            {loading ? "Submitting..." : "Submit Review"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReviewForm;
