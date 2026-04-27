import React, { createContext, useContext, useState, useEffect } from "react";
import { authRequest } from "../api/api";

const UserContext = createContext();

const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const token = localStorage.getItem("authToken");

    const logout = () => {
        localStorage.removeItem("authToken");
        setUser(null);
    };

    useEffect(() => {
        const fetchUserData = async () => {
            if (!token) {
                setLoading(false);
                return;
            }

        try {
                const data = await authRequest("/users/me", { token });
                setUser(data);
            } catch (err) {
                if (
                    err.message === "Access denied. Token missing." ||
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
    }, [token]);

    const value = {
        user,
        loading,
        error,
        isAuthenticated: !!user,
        role: user?.role || null,
        isAdmin: user?.role === "admin",
        isEmployee: user?.role === "employee",
        isUser: user?.role === "user",
        logout,
    };

    return (
        <UserContext.Provider value={value}>
            {children}
        </UserContext.Provider>
    );
};

// custom hook (IMPORTANT)
const useUser = () => useContext(UserContext);

export { UserProvider, UserContext, useUser };
