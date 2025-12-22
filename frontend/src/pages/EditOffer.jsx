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
    <div className="create-offer-page">
      <div className="create-offer-container">
        <div className="create-offer-card">
          <h2>Edit Offer</h2>

          <form className="create-offer-form" onSubmit={submitHandler}>
            <div className="form-group">
              <label>Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter offer title"
                required
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your offer"
                required
              />
            </div>

            <div className="form-group">
              <label>Price</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="Enter price"
                required
              />
            </div>

            <div className="form-actions">
              <button className="btn-submit" type="submit">
                Update
              </button>
              <button
                className="btn-cancel"
                type="button"
                onClick={() => navigate(`/offers/${id}`)}
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
