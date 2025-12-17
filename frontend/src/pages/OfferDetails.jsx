import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import ReviewForm from "../components/ReviewForm";
import { useAuth } from "../context/AuthContext";

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
        <div>
            <h2>{offer.title}</h2>
            <p>{offer.description}</p>
            <p>Price: {offer.price}</p>
            <p>By: {offer.user.name}</p>
            <p>⭐ {offer.averageRating} ({offer.numReviews})</p>

            <hr />

            <h3>Reviews</h3>

            {reviews.length === 0 && <p>No reviews yet.</p>}

            {reviews.map((review) => (
                <div
                    key={review._id}
                    style={{ borderBottom: "1px solid #ccc", marginBottom: "10px" }}
                >
                    <strong>{review.user.name}</strong>
                    <p>⭐ {review.rating}</p>
                    <p>{review.comment}</p>
                </div>
            ))}

            {/* OWNER ACTIONS */}
            {user && user._id === offer.user._id && (
                <>
                    <Link to={`/offers/${offer._id}/edit`}>
                        <button>Edit</button>
                    </Link>

                    <button onClick={deleteOffer} style={{ marginLeft: "10px" }}>
                        Delete
                    </button>
                </>
            )}

            <ReviewForm offerId={id} onReviewAdded={setReviews} />
        </div>
    );
};

export default OfferDetails;
