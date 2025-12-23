import { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { useSearchParams } from "react-router-dom";
import "./Offers.css";

const Offers = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [offers, setOffers] = useState([]);
  const [keyword, setKeyword] = useState(searchParams.get("keyword") || "");
  const [minRating, setMinRating] = useState(
    searchParams.get("minRating") || ""
  );
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");

  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  const { user } = useAuth();

  // Fetch offers whenever search params change
  const fetchOffers = async () => {
    const keywordParam = searchParams.get("keyword") || "";
    const minRatingParam = searchParams.get("minRating") || "";
    const minPriceParam = searchParams.get("minPrice") || "";
    const maxPriceParam = searchParams.get("maxPrice") || "";
    const pageParam = Number(searchParams.get("page")) || 1;

    const { data } = await api.get("/offers", {
      params: {
        keyword: keywordParam,
        minRating: minRatingParam,
        minPrice: minPriceParam,
        maxPrice: maxPriceParam,
        page: pageParam,
        limit: 5,
      },
    });
    setOffers(data.offers);
    setPages(data.pages || 1);
    setPage(pageParam);
  };

  useEffect(() => {
    fetchOffers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const bookOffer = async (offerId) => {
    try {
      await api.post("/bookings", { offerId });
      alert("Booking request sent!");
    } catch (error) {
      alert(error.response?.data?.message || "Failed to book offer");
    }
  };

  useEffect(() => {
    setKeyword(searchParams.get("keyword") || "");
    setMinRating(searchParams.get("minRating") || "");
    setMinPrice(searchParams.get("minPrice") || "");
    setMaxPrice(searchParams.get("maxPrice") || "");
    setPage(Number(searchParams.get("page")) || 1);
  }, [searchParams]);

  const handlePageChange = (newPage) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", newPage);
    navigate(`/offers?${params.toString()}`);
  };

  return (
    <div className="offers-page">
      <div className="container">
        <div className="offers-header">
          <h2>Available Skills</h2>
          <div className="offers-actions">
            {user && (
              <Link to="/create-offer" className="btn btn-primary">
                Create Offer
              </Link>
            )}
          </div>
        </div>

        {offers.length === 0 ? (
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
                  <p className="offer-description">{offer.description}</p>
                  <div className="offer-details">
                    <div className="offer-price">${offer.price}</div>
                    <div className="offer-rating">
                      ⭐ {offer.averageRating.toFixed(1)} ({offer.numReviews}{" "}
                      reviews)
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
                      >
                        Book Now
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
