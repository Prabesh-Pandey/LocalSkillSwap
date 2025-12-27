import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { PlusCircle, X, FileText, DollarSign, Tag } from "lucide-react";
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
          <div className="form-header">
            <div className="form-icon">
              <PlusCircle size={28} />
            </div>
            <h2>Create New Offer</h2>
            <p>Share your skills and expertise with others</p>
          </div>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={submitHandler} className="create-offer-form">
            <div className="form-group">
              <label>
                <FileText size={16} /> Title
              </label>
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
              <label>
                <FileText size={16} /> Description
              </label>
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
              <label>
                <DollarSign size={16} /> Price ($)
              </label>
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
              <label>
                <Tag size={16} /> Tags (Optional)
              </label>
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
                <PlusCircle size={18} />
                {loading ? "Creating..." : "Create Offer"}
              </button>
              <button
                type="button"
                className="btn-cancel"
                onClick={() => navigate("/profile")}
                disabled={loading}
              >
                <X size={18} /> Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateOffer;
