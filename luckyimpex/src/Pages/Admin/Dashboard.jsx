import React, { useEffect, useState } from 'react';
import {
    FaUsers,
    FaShoppingCart,
    FaComments,
    FaStar,
    FaTachometerAlt,
    FaCogs,
    FaSignOutAlt,
    FaProductHunt,
    FaTags,
} from 'react-icons/fa';
import './Dashboard.css';

const Sidebar = () => (
    <div className="sidebar">
        <h1 className="sidebar-title">Admin Panel</h1>
        <ul className="menus">
            <li><a href="#"><FaTachometerAlt /> Dashboard</a></li>
            <li><a href="#"><FaShoppingCart /> Orders</a></li>
            <li><a href="#"><FaUsers /> Users</a></li>
            <li><a href="#"><FaComments /> Complaints</a></li>
            <li><a href="#"><FaStar /> Reviews</a></li>
            <li><a href="#"><FaCogs /> Settings</a></li>
            <li><a href="#"><FaSignOutAlt /> Logout</a></li>
        </ul>
    </div>
);

const NotificationCard = ({ icon, message }) => (
    <div className="notification-card">
        <span className="icon">{icon}</span>
        <span>{message}</span>
    </div>
);

export default function Dashboard() {
    const [statsData, setStatsData] = useState({
        users: 0,
        orders: 0,
        complaints: 0,
        reviews: 0,
        products: 0,
        brands: 0,
    });

    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Replace with your actual backend URLs
        const fetchStats = async () => {
            try {
                const res = await fetch('https://lucky-back.onrender.com/api/dashboard/stats');
                const data = await res.json();
                setStatsData(data);
            } catch (err) {
                console.error('Failed to fetch stats:', err);
            }
        };

        const fetchNotifications = async () => {
            try {
                const res = await fetch('https://lucky-back.onrender.com/api/dashboard/notifications');
                const data = await res.json();
                setNotifications(data);
            } catch (err) {
                console.error('Failed to fetch notifications:', err);
            }
        };

        Promise.all([fetchStats(), fetchNotifications()]).finally(() => setLoading(false));
    }, []);

    const statCards = [
        { title: 'Total Users', value: statsData.users, icon: <FaUsers /> },
        { title: 'Orders', value: statsData.orders, icon: <FaShoppingCart /> },
        { title: 'Complaints', value: statsData.complaints, icon: <FaComments /> },
        { title: 'Reviews', value: statsData.reviews, icon: <FaStar /> },
        { title: 'Products', value: statsData.products, icon: <FaProductHunt /> },
        { title: 'Brands', value: statsData.brands, icon: <FaTags /> },
    ];

    if (loading) return <div className="loading">Loading Dashboard...</div>;

    return (
        <div className="dashboard-container">
            <Sidebar />

            <div className="dashboard-main">
                <h1 className="main-title">Dashboard Overview</h1>

                <div className="stats-grid">
                    {statCards.map((item, idx) => (
                        <div className="stat-card" key={idx}>
                            <div className="stat-icon">{item.icon}</div>
                            <div className="stat-info">
                                <p className="stat-title">{item.title}</p>
                                <p className="stat-value">{item.value}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="notifications">
                    <h2>Recent Notifications</h2>
                    <div className="notification-list">
                        {notifications.length > 0 ? (
                            notifications.map((n, i) => (
                                <NotificationCard key={i} icon={<FaShoppingCart />} message={n.message} />
                            ))
                        ) : (
                            <p>No notifications yet.</p>
                        )}
                    </div>
                </div>

                <div className="dashboard-right">
                    <button className="manage-products-btn">Manage Products</button>
                </div>
            </div>
        </div>
    );
}
