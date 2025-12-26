import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import "./CreateOffer.css";

const CreateOffer = () => {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [tags, setTags] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submitHandler = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const offerData = {
        title: title.trim(),
        description: description.trim(),
        price: Number(price),
        tags: tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
      };

      await api.post("/offers", offerData);
      navigate("/profile");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create offer");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-offer-page">
      <div className="create-offer-container">
        <div className="create-offer-card">
          <h2>Create New Offer</h2>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={submitHandler} className="create-offer-form">
            <div className="form-group">
              <label>Title</label>
              <input
                type="text"
                placeholder="e.g., Web Development Tutoring"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                disabled={loading}
                minLength={3}
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                placeholder="Describe what you're offering..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                disabled={loading}
                minLength={10}
              />
              <small>Be specific about what you'll teach or help with</small>
            </div>

            <div className="form-group">
              <label>Price ($)</label>
              <input
                type="number"
                placeholder="0.00"
                step="0.01"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                disabled={loading}
              />
              <small>Price per hour or session</small>
            </div>

            <div className="form-group">
              <label>Tags (Optional)</label>
              <input
                type="text"
                placeholder="e.g., programming, javascript, react"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                disabled={loading}
              />
              <small>Separate tags with commas</small>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-submit" disabled={loading}>
                {loading ? "Creating..." : "Create Offer"}
              </button>
              <button
                type="button"
                className="btn-cancel"
                onClick={() => navigate("/profile")}
                disabled={loading}
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

export default CreateOffer;
