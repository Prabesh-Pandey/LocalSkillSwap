import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import ReviewForm from "../components/ReviewForm";
import { useAuth } from "../context/AuthContext";
import "./OfferDetails.css";

const OfferDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [offer, setOffer] = useState(null);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    api.get(`/offers/${id}`).then((res) => setOffer(res.data));
    api.get(`/reviews/offer/${id}`).then((res) => setReviews(res.data));
  }, [id]);

  const deleteOffer = async () => {
    if (!window.confirm("Are you sure you want to delete this offer?")) return;

    try {
      await api.delete(`/offers/${offer._id}`);
      alert("Offer deleted");
      navigate("/offers");
    } catch (err) {
      alert("Delete failed");
    }
  };

  if (!offer) return <p>Loading...</p>;

  return (
    <div className="offer-details-page">
      <div className="offer-details-container">
        <div className="offer-details-card">
          <div className="offer-header">
            <h1>{offer.title}</h1>
            <div className="offer-meta">
              <div className="offer-meta-item">
                <span className="offer-price-large">{offer.price}</span>
              </div>
              <div className="offer-meta-item">
                ⭐ {offer.averageRating} ({offer.numReviews} reviews)
              </div>
            </div>
          </div>

          <div className="offer-body">
            <h3>Description</h3>
            <p>{offer.description}</p>
          </div>

          <div className="offer-owner-info">
            <h3>Offered by</h3>
            <p>{offer.user.name}</p>
          </div>

          {/* OWNER ACTIONS */}
          {user && user._id === offer.user._id && (
            <div className="offer-actions-section">
              <Link to={`/offers/${offer._id}/edit`}>
                <button>Edit</button>
              </Link>
              <button onClick={deleteOffer}>Delete</button>
            </div>
          )}
        </div>

        <div className="reviews-section">
          <div className="reviews-header">
            <h2>Reviews</h2>
            <p className="reviews-summary">{reviews.length} review(s)</p>
          </div>

          {reviews.length === 0 && (
            <p className="no-reviews">No reviews yet.</p>
          )}

          <div className="reviews-list">
            {reviews.map((review) => (
              <div key={review._id} className="review-card">
                <div className="review-header">
                  <strong className="review-author">{review.user.name}</strong>
                  <span className="review-rating">⭐ {review.rating}</span>
                </div>
                <p className="review-comment">{review.comment}</p>
              </div>
            ))}
          </div>
        </div>

        <ReviewForm offerId={id} onReviewAdded={setReviews} />
      </div>
    </div>
  );
};

export default OfferDetails;
