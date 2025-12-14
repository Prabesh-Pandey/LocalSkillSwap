import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

const CreateOffer = () => {
    const navigate = useNavigate();

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [tags, setTags] = useState("");
    const [error, setError] = useState("");

    const submitHandler = async (e) => {
        e.preventDefault();
        setError("");

        try {
            const offerData = {
                title,
                description,
                price: Number(price),
                tags: tags.split(",").map((tag) => tag.trim()),
            };

            await api.post("/offers", offerData);
            navigate("/"); // go back to offers list
        } catch (err) {
            setError(err.response?.data?.message || "Failed to create offer");
        }
    };

    return (
        <form
            onSubmit={submitHandler}
            style={{ maxWidth: "500px", margin: "40px auto" }}
        >
            <h2>Create Offer</h2>

            {error && <p style={{ color: "red" }}>{error}</p>}

            <input
                type="text"
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
            />

            <textarea
                placeholder="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
            />

            <input
                type="number"
                placeholder="Price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
            />

            <input
                type="text"
                placeholder="Tags (comma separated)"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
            />

            <button type="submit">Create</button>
        </form>
    );
};

export default CreateOffer;
