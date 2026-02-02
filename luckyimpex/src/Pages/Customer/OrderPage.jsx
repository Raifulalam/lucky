import React, { useContext, useEffect, useState } from 'react';
import { UserContext } from '../../Components/UserContext';
import './OrderPage.css';
import { FaTrash, FaPrint } from 'react-icons/fa';

const OrderPage = () => {
    const { user, loading: userLoading, error: userError } = useContext(UserContext);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!user?.id) return;

        const fetchOrders = async () => {
            setLoading(true);
            try {
                const res = await fetch(`https://lucky-1-6ma5.onrender.com/api/orders/orders/my/${user.id}`);
                if (!res.ok) throw new Error('Failed to fetch orders');
                const data = await res.json();
                setOrders(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [user?.id]);

    const handleDelete = async (orderId) => {
        if (!window.confirm('Delete this order?')) return;

        try {
            const res = await fetch(`https://lucky-1-6ma5.onrender.com/api/orders/orders/${orderId}`, {
                method: 'DELETE',
            });
            if (!res.ok) throw new Error('Failed to delete');
            setOrders(prev => prev.filter(o => o._id !== orderId));
        } catch (err) {
            alert(err.message);
        }
    };

    if (userLoading) return <div className="loader">Loading user info...</div>;
    if (userError) return <div className="error">Error: {userError}</div>;
    if (!user?.id) return <div className="info">Please login to view your orders.</div>;
    if (loading) return <div className="loader">Loading orders...</div>;
    if (error) return <div className="error">Error: {error}</div>;
    if (orders.length === 0) return <div className="info">No orders found.</div>;

    return (
        <div className="order-page">
            <div className="order-header">
                <h2>My Orders</h2>
                <button className="print-btn" onClick={() => window.print()}><FaPrint /> Print</button>
            </div>

            {orders.map((order) => (
                <div className="order-card" key={order._id}>
                    <div className="order-top">
                        <div>
                            <p><strong>Order ID:</strong> {order._id}</p>
                            <p><strong>Date:</strong> {new Date(order.createdAt).toLocaleDateString()}</p>
                            <p><strong>Status:</strong> {order.status}</p>
                            <p><strong>Total:</strong> ₹{order.totalPrice}</p>
                        </div>
                        <button className="delete-btn" onClick={() => handleDelete(order._id)} title="Delete Order">
                            <FaTrash />
                        </button>
                    </div>

                    <div className="order-progress">
                        {['Order Placed', 'Shipped', 'Delivered'].map(step => (
                            <span
                                key={step}
                                className={`step ${order.status === step ? 'active' : ''}`}
                            >
                                {step}
                            </span>
                        ))}
                    </div>

                    <div className="order-items">
                        <h4>Items</h4>
                        {Array.isArray(order.items) && order.items.length > 0 ? (
                            <ul>
                                {order.items.map((item, idx) => (
                                    <li key={idx} className="item">
                                        <img src={item.image} alt={item.name} />
                                        <div>
                                            <p><strong>{item.name}</strong></p>
                                            <p>Qty: {item.quantity}</p>
                                            <p>Price: ₹{item.price}</p>
                                            <p>Total: ₹{item.quantity * item.price}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p>No items in this order.</p>
                        )}
                    </div>

                    <div className="shipping-details">
                        <h4>Shipping</h4>
                        <p><strong>Address:</strong> {order.address}</p>
                        <p><strong>Phone:</strong> {order.phone}</p>
                        <p><strong>Delivery Date:</strong> {new Date(order.deliveryDate).toLocaleDateString()}</p>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default OrderPage;
