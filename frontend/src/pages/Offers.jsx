import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import Loading from "../components/Loading";
import { Star, Plus, Search } from "lucide-react";
import "./Offers.css";

const Offers = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [bookingId, setBookingId] = useState(null);

  // Fetch offers whenever search params change
  useEffect(() => {
    const fetchOffers = async () => {
      setLoading(true);
      setError("");

      try {
        const { data } = await api.get("/offers", {
          params: {
            keyword: searchParams.get("keyword") || "",
            minRating: searchParams.get("minRating") || "",
            minPrice: searchParams.get("minPrice") || "",
            maxPrice: searchParams.get("maxPrice") || "",
            page: Number(searchParams.get("page")) || 1,
            limit: 6,
          },
        });
        setOffers(data.offers);
        setPages(data.pages || 1);
        setPage(Number(searchParams.get("page")) || 1);
      } catch (err) {
        setError("Failed to load offers");
      } finally {
        setLoading(false);
      }
    };

    fetchOffers();
  }, [searchParams]);

  const bookOffer = async (offerId) => {
    if (!user) {
      navigate("/login");
      return;
    }

    setBookingId(offerId);
    try {
      await api.post("/bookings", { offerId });
      alert("Booking request sent! The owner will be notified.");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to book offer");
    } finally {
      setBookingId(null);
    }
  };

  const handlePageChange = (newPage) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", newPage);
    navigate(`/offers?${params.toString()}`);
  };

  if (loading) {
    return (
      <div className="offers-page">
        <div className="container">
          <Loading message="Loading available skills..." />
        </div>
      </div>
    );
  }

  return (
    <div className="offers-page">
      <div className="container">
        <div className="offers-header">
          <h2>Available Skills</h2>
          <div className="offers-actions">
            {user && (
              <Link to="/create-offer" className="btn btn-primary">
                <Plus size={18} /> Create Offer
              </Link>
            )}
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        {offers.length === 0 && !error ? (
          <div className="no-offers">
            <h3>No offers found</h3>
            <p>Try adjusting your search filters or check back later</p>
          </div>
        ) : (
          <>
            <div className="offers-grid">
              {offers.map((offer) => (
                <div key={offer._id} className="offer-card">
                  <h3>{offer.title}</h3>
                  <p className="offer-description">
                    {offer.description.length > 120
                      ? `${offer.description.substring(0, 120)}...`
                      : offer.description}
                  </p>
                  <div className="offer-details">
                    <div className="offer-price">${offer.price}</div>
                    <div className="offer-rating">
                      <Star size={14} fill="#f4a425" stroke="#f4a425" />{" "}
                      {offer.averageRating?.toFixed(1) || "0.0"} (
                      {offer.numReviews} reviews)
                    </div>
                    <p className="offer-owner">
                      By: <strong>{offer.user.name}</strong>
                    </p>
                  </div>
                  <div className="offer-actions">
                    <Link
                      to={`/offers/${offer._id}`}
                      className="btn btn-outline btn-view-details"
                    >
                      View Details
                    </Link>
                    {user && user._id !== offer.user._id && (
                      <button
                        onClick={() => bookOffer(offer._id)}
                        className="btn btn-primary"
                        disabled={bookingId === offer._id}
                      >
                        {bookingId === offer._id ? "Booking..." : "Book Now"}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {pages > 1 && (
              <div className="pagination">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                >
                  Previous
                </button>
                <span className="pagination-info">
                  Page {page} of {pages}
                </span>
                {Array.from({ length: pages }, (_, i) => i + 1).map(
                  (pageNum) => (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={page === pageNum ? "active" : ""}
                    >
                      {pageNum}
                    </button>
                  )
                )}
                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === pages}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Offers;
