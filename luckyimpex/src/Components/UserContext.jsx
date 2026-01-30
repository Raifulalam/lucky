import React, { createContext, useContext, useState, useEffect } from "react";

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
                const response = await fetch(
                    "https://lucky-back.onrender.com/api/userData",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                if (response.status === 401 || response.status === 403) {
                    logout(); // auto logout on invalid/expired token
                    return;
                }

                if (!response.ok) {
                    throw new Error("Failed to fetch user data");
                }

                const data = await response.json();
                setUser(data);
            } catch (err) {
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
