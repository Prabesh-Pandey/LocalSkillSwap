import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [keyword, setKeyword] = useState("");
    const [minRating, setMinRating] = useState("");

    const submitHandler = (e) => {
        e.preventDefault();

        navigate(
            `/offers?keyword=${keyword}&minRating=${minRating}`
        );
    };

    return (
        <nav style={{ borderBottom: "1px solid #ccc", padding: "10px" }}>
            <Link to="/">SkillSwap</Link>

            {/* SEARCH */}
            <form onSubmit={submitHandler} style={{ display: "inline-block", marginLeft: "20px" }}>
                <input
                    type="text"
                    placeholder="Search skills..."
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                />

                <select
                    value={minRating}
                    onChange={(e) => setMinRating(e.target.value)}
                >
                    <option value="">Any ⭐</option>
                    <option value="4">4+</option>
                    <option value="3">3+</option>
                    <option value="2">2+</option>
                </select>

                <button type="submit">Search</button>
            </form>

            {/* AUTH LINKS */}
            <div style={{ float: "right" }}>
                {user ? (
                    <>
                        <span>Hello, {user.name}</span>{" | "}
                        <Link to="/my-bookings">My Bookings</Link>{" | "}
                        <Link to="/owner-bookings">Bookings</Link>{" | "}
                        <Link to="/profile">Profile</Link>{" | "}

                        <button onClick={logout}>Logout</button>
                    </>
                ) : (
                    <>
                        <Link to="/login">Login</Link>{" | "}
                        <Link to="/register">Register</Link>
                    </>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
