import { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { useSearchParams } from "react-router-dom";

const Offers = () => {
    const [searchParams] = useSearchParams();
    const [offers, setOffers] = useState([]);
    const [keyword, setKeyword] = useState(searchParams.get("keyword") || "");
    const [minRating, setMinRating] = useState(searchParams.get("minRating") || "");
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
            await api.post("/bookings", { offerId});
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


    return (

        

        <div>
            <h2>Offers</h2>
            {offers.map((offer) => (
                <div key={offer._id}>
                    <h3>{offer.title}</h3>
                    <p>{offer.description}</p>
                    <p>Price: {offer.price}</p>
                    <p>Rating: ⭐ {offer.averageRating} ({offer.numReviews})</p>
                    <p>By: {offer.user.name}</p>
                    {user && user._id !== offer.user._id && (
                        <button onClick={() => bookOffer(offer._id)}>Book</button>
                    )}
                    <Link to={`/offers/${offer._id}`}>View Details</Link>
                </div>
            ))}
        </div>
    );
};

export default Offers;
