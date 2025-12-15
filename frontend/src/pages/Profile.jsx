import { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

const Profile = () => {
    const { user } = useAuth();

    const [offers, setOffers] = useState([]);
    const [reviews, setReviews] = useState([]);

    useEffect(() => {
        api.get("/offers/myoffers").then((res) => setOffers(res.data));
        // api.get("/reviews/offer/:offerId").then((res) => setReviews(res.data));
    }, []);

    return (
        <div>
            <h2>My Profile</h2>

            {/* USER INFO */}
            <div style={{ marginBottom: "20px" }}>
                <p><strong>Name:</strong> {user.name}</p>
                <p><strong>Email:</strong> {user.email}</p>
            </div>

            <hr />

            {/* MY OFFERS */}
            <h3>My Offers</h3>
            {offers.length === 0 && <p>You haven’t created any offers.</p>}

            {offers.map((offer) => (
                <div key={offer._id} style={{ border: "1px solid #ccc", margin: "10px", padding: "10px" }}>
                    <h4>
                        <Link to={`/offers/${offer._id}`}>
                            {offer.title}
                        </Link>
                    </h4>
                    <p>Price: {offer.price}</p>
                    <p>⭐ {offer.averageRating} ({offer.numReviews})</p>
                </div>
            ))}

            <hr />

            {/* MY REVIEWS
            <h3>My Reviews</h3>
            {reviews.length === 0 && <p>You haven’t written any reviews.</p>}

            {reviews.map((review) => (
                <div key={review._id} style={{ border: "1px solid #ccc", margin: "10px", padding: "10px" }}>
                    <p>
                        <strong>Offer:</strong>{" "}
                        <Link to={`/offers/${review.offer._id}`}>
                            {review.offer.title}
                        </Link>
                    </p>
                    <p>⭐ {review.rating}</p>
                    <p>{review.comment}</p>
                </div>
            ))} */}
        </div>
    );
};

export default Profile;
