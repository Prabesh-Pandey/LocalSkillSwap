import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import "./CreateOffer.css";

const EditOffer = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [tags, setTags] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchOffer = async () => {
      try {
        const { data } = await api.get(`/offers/${id}`);
        setTitle(data.title);
        setDescription(data.description);
        setPrice(data.price);
        setTags(data.tags?.join(", ") || "");
        setLoading(false);
      } catch (err) {
        setError("Failed to load offer");
        setLoading(false);
      }
    };
    fetchOffer();
  }, [id]);

  const submitHandler = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await api.put(`/offers/${id}`, {
        title,
        description,
        price: Number(price),
        tags: tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
      });

      navigate(`/offers/${id}`);
    } catch (err) {
      setError(err.response?.data?.message || "Update failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading)
    return (
      <div className="create-offer-page">
        <p>Loading...</p>
      </div>
    );

  return (
    <div className="create-offer-page">
      <div className="create-offer-container">
        <div className="create-offer-card">
          <h2>Edit Offer</h2>

          {error && <div className="error-message">{error}</div>}

          <form className="create-offer-form" onSubmit={submitHandler}>
            <div className="form-group">
              <label>Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter offer title"
                required
                disabled={submitting}
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your offer"
                required
                disabled={submitting}
              />
            </div>

            <div className="form-group">
              <label>Price ($)</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="Enter price"
                step="0.01"
                min="0"
                required
                disabled={submitting}
              />
              <small>Price per hour or session</small>
            </div>

            <div className="form-group">
              <label>Tags (Optional)</label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="e.g., programming, javascript, react"
                disabled={submitting}
              />
              <small>Separate tags with commas</small>
            </div>

            <div className="form-actions">
              <button
                className="btn-submit"
                type="submit"
                disabled={submitting}
              >
                {submitting ? "Updating..." : "Update"}
              </button>
              <button
                className="btn-cancel"
                type="button"
                onClick={() => navigate(`/offers/${id}`)}
                disabled={submitting}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditOffer;
