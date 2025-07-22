import React, { useEffect, useState, useContext } from 'react';
import { UserContext } from '../../Components/UserContext';
import { useNavigate } from 'react-router-dom';
import { FaCheck, FaTrash, FaEye, FaTruck } from 'react-icons/fa';
import './OrderComponent.css';

const OrderComponent = () => {
    const { user } = useContext(UserContext);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const fetchOrders = async () => {
        try {
            const res = await fetch('https://lucky-back.onrender.com/api/orders');
            if (!res.ok) throw new Error('Failed to fetch orders');
            const data = await res.json();
            setOrders(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (orderId, newStatus) => {
        try {
            const res = await fetch(`https://lucky-back.onrender.com/api/orders/${orderId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });
            if (!res.ok) throw new Error('Failed to update status');
            const updated = await res.json();
            setOrders(prev => prev.map(o => o._id === updated._id ? updated : o));
        } catch (err) {
            alert(err.message);
        }
    };

    const handleDelete = async (orderId) => {
        if (window.confirm('Delete this order?')) {
            try {
                const res = await fetch(`https://lucky-back.onrender.com/api/orders/${orderId}`, {
                    method: 'DELETE',
                });
                if (!res.ok) throw new Error('Delete failed');
                setOrders(prev => prev.filter(order => order._id !== orderId));
                alert('Deleted successfully');
            } catch (err) {
                alert(err.message);
            }
        }
    };

    const handleReviewClick = (orderId) => {
        navigate(`/review/${orderId}`);
    };

    const getNextStatus = (status) => {
        const flow = ['Placed', 'Shipped', 'Delivered'];
        const currentIndex = flow.indexOf(status);
        return currentIndex < flow.length - 1 ? flow[currentIndex + 1] : null;
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    if (!user || user.role !== 'admin') return <div className="unauthorized">❌ Access Denied: Admins only</div>;
    if (loading) return <div className="loading">Loading Orders...</div>;
    if (error) return <div className="error">Error: {error}</div>;

    return (
        <div className="order-container">
            <h2 className="title">📦 Order Management</h2>
            {orders.length === 0 ? (
                <p>No orders found.</p>
            ) : (
                <div className="table-wrapper">
                    <table className="orders-table">
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Status</th>
                                <th>Delivery Date</th>
                                <th>Address</th>
                                <th>User</th>
                                <th>Phone</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map(order => (
                                <tr key={order._id}>
                                    <td>{order._id}</td>
                                    <td>
                                        <span className={`status-badge ${order.status.toLowerCase()}`}>
                                            {order.status}
                                        </span>
                                        {getNextStatus(order.status) && (
                                            <button
                                                className="status-update-btn"
                                                onClick={() => updateStatus(order._id, getNextStatus(order.status))}
                                                title={`Mark as ${getNextStatus(order.status)}`}
                                            >
                                                <FaTruck />
                                            </button>
                                        )}
                                    </td>
                                    <td>{order.deliveryDate || 'N/A'}</td>
                                    <td>{order.address}</td>
                                    <td>{order.name}</td>
                                    <td>{order.phone}</td>
                                    <td className="actions">
                                        <button onClick={() => handleReviewClick(order._id)} title="View">
                                            <FaEye />
                                        </button>
                                        <button onClick={() => handleDelete(order._id)} title="Delete">
                                            <FaTrash />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default OrderComponent;
