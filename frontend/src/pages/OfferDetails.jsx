import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import ReviewForm from "../components/ReviewForm";
import { useAuth } from "../context/AuthContext";
import { Star, Check } from "lucide-react";
import "./OfferDetails.css";

const OfferDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [offer, setOffer] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [bookingInProgress, setBookingInProgress] = useState(false);
  const [hasBooked, setHasBooked] = useState(false);
  const [canReview, setCanReview] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [offerRes, reviewsRes] = await Promise.all([
          api.get(`/offers/${id}`),
          api.get(`/reviews/offer/${id}`),
        ]);
        setOffer(offerRes.data);
        setReviews(reviewsRes.data);

        // Check if user has already booked this offer
        if (user) {
          try {
            const bookingsRes = await api.get("/bookings/my");
            const userBooking = bookingsRes.data.find(
              (b) => b.offer?._id === id
            );
            if (userBooking) {
              setHasBooked(true);
              setCanReview(userBooking.status === "accepted");
            }
          } catch (err) {
            // Ignore booking check errors
          }
        }
      } catch (err) {
        setError("Failed to load offer details");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, user]);

  const bookOffer = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    setBookingInProgress(true);
    try {
      await api.post("/bookings", { offerId: id });
      setHasBooked(true);
      alert("Booking request sent! The owner will be notified.");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to book offer");
    } finally {
      setBookingInProgress(false);
    }
  };

  const deleteOffer = async () => {
    if (!window.confirm("Are you sure you want to delete this offer?")) return;

    try {
      await api.delete(`/offers/${offer._id}`);
      navigate("/offers");
    } catch (err) {
      alert(err.response?.data?.message || "Delete failed");
    }
  };

  if (loading) {
    return (
      <div className="offer-details-page">
        <div className="offer-details-container">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !offer) {
    return (
      <div className="offer-details-page">
        <div className="offer-details-container">
          <div className="error-message">{error || "Offer not found"}</div>
          <Link to="/offers" className="btn btn-outline">
            Back to Offers
          </Link>
        </div>
      </div>
    );
  }

  const isOwner = user && user._id === offer.user._id;

  return (
    <div className="offer-details-page">
      <div className="offer-details-container">
        <div className="offer-details-card">
          <div className="offer-header">
            <h1>{offer.title}</h1>
            <div className="offer-meta">
              <div className="offer-meta-item">
                <span className="offer-price-large">${offer.price}</span>
                <small>per session</small>
              </div>
              <div className="offer-meta-item">
                <span className="offer-rating-large">
                  <Star size={20} fill="#f4a425" stroke="#f4a425" />{" "}
                  {offer.averageRating?.toFixed(1) || "0.0"}
                </span>
                <small>({offer.numReviews} reviews)</small>
              </div>
            </div>
          </div>

          <div className="offer-body">
            <h3>Description</h3>
            <p>{offer.description}</p>

            {offer.tags && offer.tags.length > 0 && (
              <div className="offer-tags">
                <h4>Skills/Tags</h4>
                <div className="tags-list">
                  {offer.tags.map((tag, index) => (
                    <span key={index} className="tag">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="offer-owner-info">
            <h3>Offered by</h3>
            <p className="owner-name">{offer.user.name}</p>
            <p className="owner-email">{offer.user.email}</p>
          </div>

          {/* BOOKING/OWNER ACTIONS */}
          <div className="offer-actions-section">
            {isOwner ? (
              <>
                <Link
                  to={`/offers/${offer._id}/edit`}
                  className="btn btn-primary"
                >
                  Edit Offer
                </Link>
                <button className="btn btn-danger" onClick={deleteOffer}>
                  Delete Offer
                </button>
              </>
            ) : (
              <>
                {user ? (
                  hasBooked ? (
                    <button className="btn btn-secondary" disabled>
                      <Check size={16} /> Already Booked
                    </button>
                  ) : (
                    <button
                      className="btn btn-primary"
                      onClick={bookOffer}
                      disabled={bookingInProgress}
                    >
                      {bookingInProgress ? "Booking..." : "Book Now"}
                    </button>
                  )
                ) : (
                  <Link to="/login" className="btn btn-primary">
                    Login to Book
                  </Link>
                )}
              </>
            )}
          </div>
        </div>

        <div className="reviews-section">
          <div className="reviews-header">
            <h2>Reviews</h2>
            <p className="reviews-summary">
              {reviews.length} review{reviews.length !== 1 ? "s" : ""}
            </p>
          </div>

          {reviews.length === 0 && (
            <p className="no-reviews">
              No reviews yet. Be the first to leave one!
            </p>
          )}

          <div className="reviews-list">
            {reviews.map((review) => (
              <div key={review._id} className="review-card">
                <div className="review-header">
                  <strong className="review-author">{review.user.name}</strong>
                  <span className="review-rating">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} size={14} fill="#f4a425" stroke="#f4a425" />
                    ))}
                  </span>
                </div>
                <p className="review-comment">{review.comment}</p>
                <span className="review-date">
                  {new Date(review.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Only show review form if user can review (has accepted booking) */}
        {user && !isOwner && canReview && (
          <ReviewForm offerId={id} onReviewAdded={setReviews} />
        )}

        {user && !isOwner && hasBooked && !canReview && (
          <div className="review-notice">
            <p>You can leave a review once your booking is accepted.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OfferDetails;
