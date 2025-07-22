// src/contexts/UserContext.js

import React, { createContext, useState, useEffect } from 'react';

const UserContext = createContext();

const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await fetch('https://lucky-back.onrender.com/api/userData', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,  // Use JWT from local storage
                    }
                });
                if (!response.ok) {
                    throw new Error('Failed to fetch user data');
                }
                const data = await response.json();
                setUser(data); // Update state with fetched data
            } catch (err) {
                setError(err.message); // Set error message if the fetch fails
            } finally {
                setLoading(false); // Set loading to false when data is fetched or error occurs
            }
        };

        fetchUserData(); // Call the fetch function when the component mounts
    }, []);


    return (
        <UserContext.Provider value={{ user, loading, error }}>
            {children}
        </UserContext.Provider>
    );
};

export { UserProvider, UserContext };
