import React, { createContext, useContext, useState } from 'react';
import './notification.css'
const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);

    const addNotification = (notification) => {
        setNotifications((prev) => [...prev, notification]);
    };

    const removeNotification = (index) => {
        setNotifications((prev) => prev.filter((_, i) => i !== index));
    };

    return (
        <NotificationContext.Provider value={{ addNotification, removeNotification }}>
            {children}
            <div className="notification-container">
                {notifications.map((notification, index) => (
                    <div
                        key={index}
                        className={`notification ${notification.type}`}
                        style={{ animation: `fadeIn 0.5s, fadeOut 0.5s ${notification.dismiss?.duration / 1000}s` }}
                    >
                        <h4>{notification.title}</h4>
                        <p>{notification.message}</p>
                        <button onClick={() => removeNotification(index)}>X</button>
                    </div>
                ))}
            </div>
        </NotificationContext.Provider>
    );
};

export const useNotification = () => {
    return useContext(NotificationContext);
};
