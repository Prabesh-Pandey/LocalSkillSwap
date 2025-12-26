import { createContext, useState, useEffect } from "react";
import api from "../api/axios";
import { useContext } from "react";

const AuthContext = createContext();

// Normalize user data to ensure consistent _id field
const normalizeUser = (data) => {
  if (!data) return null;
  return {
    ...data,
    _id: data._id || data.id, // Ensure _id is always available
  };
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("user");
    return stored ? normalizeUser(JSON.parse(stored)) : null;
  });
  const [loading, setLoading] = useState(true);

  // Hydrate user details when only a token is stored (backward compatibility)
  useEffect(() => {
    const hydrate = async () => {
      try {
        const stored = JSON.parse(localStorage.getItem("user"));
        if (stored && stored.token) {
          // If token exists but we don't have user fields, fetch /auth/me
          const hasUserFields =
            stored.name || stored.email || stored._id || stored.id;
          if (!hasUserFields) {
            const { data } = await api.get("/auth/me");
            const merged = normalizeUser({ token: stored.token, ...data });
            localStorage.setItem("user", JSON.stringify(merged));
            setUser(merged);
          }
        }
      } catch (err) {
        // Token may be invalid, clear user
        localStorage.removeItem("user");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    hydrate();
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    const normalized = normalizeUser(data);
    localStorage.setItem("user", JSON.stringify(normalized));
    setUser(normalized);
  };

  const register = async (name, email, password) => {
    const { data } = await api.post("/auth/register", {
      name,
      email,
      password,
    });
    const normalized = normalizeUser(data);
    localStorage.setItem("user", JSON.stringify(normalized));
    setUser(normalized);
  };

  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
