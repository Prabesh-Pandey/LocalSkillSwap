import { createContext, useState, useEffect } from 'react';
import api from "../api/axios";
import { useContext } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(
        JSON.parse(localStorage.getItem('user'))
    );

    // Hydrate user details when only a token is stored (backward compatibility)
    useEffect(() => {
        const hydrate = async () => {
            try {
                const stored = JSON.parse(localStorage.getItem('user'));
                if (stored && stored.token) {
                    // If token exists but we don't have user fields, fetch /auth/me
                    const hasUserFields = stored.name || stored.email || stored.id;
                    if (!hasUserFields) {
                        const { data } = await api.get('/auth/me');
                        const merged = { token: stored.token, ...data };
                        localStorage.setItem('user', JSON.stringify(merged));
                        setUser(merged);
                        return;
                    }
                }
            } catch (err) {
                // ignore and leave as-is (user may need to re-login)
            }
        };

        hydrate();
    }, []);

    const login = async (email , password) => {
        const { data } = await api.post('/auth/login', { email, password });
        localStorage.setItem('user', JSON.stringify(data));
        setUser(data);
    };

    const register = async (name, email, password) => {
        const { data } = await api.post('/auth/register', { name, email, password });
        localStorage.setItem('user', JSON.stringify(data));
        setUser(data);
    };

    const logout = () => {
        localStorage.removeItem('user');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);