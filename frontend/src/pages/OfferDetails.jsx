import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios";
import ReviewForm from "../components/ReviewForm";

const OfferDetails = () => {
    const { id } = useParams();
    const [offer, setOffer] = useState(null);
    const [reviews, setReviews] = useState([]);

    useEffect(() => {
        api.get(`/offers/${id}`).then((res) => setOffer(res.data));
        api.get(`/reviews/offer/${id}`).then((res) => setReviews(res.data));
    }, [id]);

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
                <div key={review._id} style={{ borderBottom: "1px solid #ccc", marginBottom: "10px" }}>
                    <strong>{review.user.name}</strong>
                    <p>⭐ {review.rating}</p>
                    <p>{review.comment}</p>
                </div>
            ))}

            <ReviewForm offerId={id} onReviewAdded={setReviews} />
        </div>
    );
};

export default OfferDetails;
