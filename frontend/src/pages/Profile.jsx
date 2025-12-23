import { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import "./Profile.css";

const Profile = () => {
  const { user } = useAuth();

  const [offers, setOffers] = useState([]);

  useEffect(() => {
    api.get("/offers/myoffers").then((res) => setOffers(res.data));
    // api.get("/reviews/offer/:offerId").then((res) => setReviews(res.data));
  }, []);

  const handleDeleteOffer = async (offerId) => {
    if (!window.confirm("Are you sure you want to delete this offer?")) return;

    try {
      await api.delete(`/offers/${offerId}`);
      setOffers((prev) => prev.filter((o) => o._id !== offerId));
    } catch (err) {
      alert(err.response?.data?.message || "Delete failed");
    }
  };

  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="profile-header">
          <h1>{user.name}</h1>
          <p>{user.email}</p>
        </div>

        {/* MY OFFERS */}
        <div className="profile-section">
          <h2>My Offers</h2>
          {offers.length === 0 && (
            <div className="no-offers-message">
              <p>You haven't created any offers.</p>
            </div>
          )}

          <div className="offers-grid">
            {offers.map((offer) => (
              <div key={offer._id} className="offer-item">
                <h3>
                  <Link to={`/offers/${offer._id}`}>{offer.title}</Link>
                </h3>
                <div className="offer-info">
                  <div className="offer-info-item">
                    <strong>Price:</strong> {offer.price}
                  </div>
                  <div className="offer-info-item">
                    ⭐ {offer.averageRating} ({offer.numReviews} reviews)
                  </div>
                </div>

                <div className="offer-actions">
                  <Link to={`/offers/${offer._id}/edit`}>
                    <button>Edit</button>
                  </Link>
                  <button onClick={() => handleDeleteOffer(offer._id)}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* MY REVIEWS
                <div className="profile-section">
                    <h2>My Reviews</h2>
                    {reviews.length === 0 && <p>You haven't written any reviews.</p>}

                    {reviews.map((review) => (
                        <div key={review._id} className="offer-item">
                            <p>
                                <strong>Offer:</strong>{" "}
                                <Link to={`/offers/${review.offer._id}`}>
                                    {review.offer.title}
                                </Link>
                            </p>
                            <p>⭐ {review.rating}</p>
                            <p>{review.comment}</p>
                        </div>
                    ))}
                </div> */}
      </div>
    </div>
  );
};

export default Profile;
