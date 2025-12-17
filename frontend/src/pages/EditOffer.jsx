import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";

const EditOffer = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get(`/offers/${id}`).then((res) => {
            setTitle(res.data.title);
            setDescription(res.data.description);
            setPrice(res.data.price);
            setLoading(false);
        });
    }, [id]);

    const submitHandler = async (e) => {
        e.preventDefault();

        try {
            await api.put(`/offers/${id}`, {
                title,
                description,
                price,
            });

            alert("Offer updated");
            navigate(`/offers/${id}`);
        } catch (err) {
            alert("Update failed");
        }
    };

    if (loading) return <p>Loading...</p>;

    return (
        <div>
            <h2>Edit Offer</h2>

            <form onSubmit={submitHandler}>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                />

                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                />

                <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                />

                <button type="submit">Update</button>
            </form>
        </div>
    );
};

export default EditOffer;
