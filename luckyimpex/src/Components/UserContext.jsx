import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { authRequest, clearAuthToken, getAuthToken } from "../api/api";

const UserContext = createContext();

const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadUser = useCallback(async (token) => {
        const data = await authRequest("/users/me", { token: token || undefined });
        setUser(data);
        return data;
    }, []);

    const logout = useCallback(() => {
        void authRequest("/users/logout", { method: "POST" }).catch(() => {});
        clearAuthToken();
        setUser(null);
        setError(null);
    }, []);

    useEffect(() => {
        const fetchUserData = async () => {
            const token = getAuthToken();

            try {
                await loadUser(token);
            } catch (err) {
                if (err.message === "Access denied. Token missing.") {
                    setUser(null);
                    return;
                }

                if (
                    err.message === "Token expired. Please login again." ||
                    err.message === "Invalid or malformed token"
                ) {
                    logout(); // auto logout on invalid/expired token
                    return;
                }
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [loadUser, logout]);

    const value = useMemo(() => ({
        user,
        loading,
        error,
        isAuthenticated: !!user,
        role: user?.role || null,
        isAdmin: user?.role === "admin",
        isEmployee: user?.role === "employee",
        isUser: user?.role === "user",
        logout,
        refreshUser: loadUser,
    }), [user, loading, error, logout, loadUser]);

    return (
        <UserContext.Provider value={value}>
            {children}
        </UserContext.Provider>
    );
};

// custom hook (IMPORTANT)
const useUser = () => useContext(UserContext);

export { UserProvider, UserContext, useUser };
