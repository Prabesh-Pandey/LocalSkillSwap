import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import "./Profile.css";

const Profile = () => {
  const { user } = useAuth();
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const { data } = await api.get("/offers/myoffers");
        setOffers(data);
      } catch (err) {
        setError("Failed to load your offers");
      } finally {
        setLoading(false);
      }
    };
    fetchOffers();
  }, []);

  const handleDeleteOffer = async (offerId) => {
    if (!window.confirm("Are you sure you want to delete this offer?")) return;

    try {
      await api.delete(`/offers/${offerId}`);
      setOffers((prev) => prev.filter((o) => o._id !== offerId));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete offer");
    }
  };

  if (loading) {
    return (
      <div className="profile-page">
        <div className="profile-container">
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="profile-header">
          <h1>{user.name}</h1>
          <p>{user.email}</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        {/* My Offers Section */}
        <div className="profile-section">
          <div className="section-header">
            <h2>My Offers</h2>
            <Link to="/create-offer" className="btn-create">
              + Create New Offer
            </Link>
          </div>

          {offers.length === 0 && !error && (
            <div className="no-offers-message">
              <p>You haven't created any offers yet.</p>
              <p>
                <Link to="/create-offer">Create your first offer</Link> to start
                sharing your skills!
              </p>
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
                    <strong>Price:</strong> ${offer.price}
                  </div>
                  <div className="offer-info-item">
                    ⭐ {offer.averageRating?.toFixed(1) || "0.0"} (
                    {offer.numReviews} reviews)
                  </div>
                </div>

                <div className="offer-actions">
                  <Link to={`/offers/${offer._id}/edit`} className="btn-edit">
                    Edit
                  </Link>
                  <button
                    className="btn-delete"
                    onClick={() => handleDeleteOffer(offer._id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
