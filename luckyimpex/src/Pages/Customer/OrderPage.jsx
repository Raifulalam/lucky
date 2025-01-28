import React, { useContext, useEffect, useState } from 'react';
import { UserContext } from '../../Components/UserContext';
import './OrderPage.css';

export default function OrderPage() {
    const { user, error: userError, loading: userLoading } = useContext(UserContext);
    const [orderData, setOrderData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!user?.id) {
            return;
        }

        const fetchOrders = async () => {
            setLoading(true);
            try {
                const response = await fetch(`https://lucky-back-2.onrender.com/api/orders/${user.id}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch orders');
                }
                const data = await response.json();
                setOrderData(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [user?.id]);

    if (userLoading) {
        return <div className="loading">Loading user data...</div>;
    }

    if (userError) {
        return <div className="error">Error loading user data: {userError}</div>;
    }

    if (!user?.id) {
        return <div>Please log in to view your orders.</div>;
    }

    if (loading) {
        return <div className="loading">Loading orders...</div>;
    }

    if (error) {
        return <div className="error">Error fetching orders: {error}</div>;
    }

    if (orderData.length === 0) {
        return <div>No orders found.</div>;
    }

    return (
        <div className="order-container">
            <div className="order-header">
                <h2>Your Order Summary</h2>
            </div>

            {/* Loop through each order in orderData */}
            {orderData.map((order) => (
                <div key={order._id} className="order-item-container">
                    <div className="order-summary">
                        <div className="order-overview">
                            <h5>Order ID: {order._id}</h5>
                            <p><strong>Date:</strong> {new Date(order.createdAt).toLocaleDateString()}</p>
                            <p><strong>Status:</strong> {order.status}</p>
                            <p><strong>Total Price:</strong> ₹{order.totalPrice}</p>
                        </div>

                        <div className="order-status-tracker">
                            {['Order Placed', 'Shipped', 'Delivered'].map((status, index) => (
                                <div
                                    key={index}
                                    className={`status-step ${order.status === status ? 'completed' : ''}`}
                                >
                                    <span>{status}</span>
                                </div>
                            ))}
                        </div>

                        <div className="order-items">
                            <h3>Order Items</h3>
                            {Array.isArray(order.items) && order.items.length > 0 ? (
                                <ul>
                                    {order.items.map((item, itemIndex) => (
                                        <li key={itemIndex} className="order-item">
                                            <img src={item.image} alt={item.name} className="item-image" />
                                            <div className="item-info">
                                                <h4>{item.name}</h4>
                                                <p><strong>Quantity:</strong> {item.quantity}</p>
                                                <p><strong>Price:</strong> ₹{item.price}</p>
                                                <p><strong>Total:</strong> ₹{item.quantity * item.price}</p>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p>No items found in the order.</p>
                            )}
                        </div>

                        <div className="shipping-info">
                            <h3>Shipping Information</h3>
                            <p><strong>Address:</strong> {order.address}</p>
                            <p><strong>Phone:</strong> {order.phone}</p>
                            <p><strong>Estimated Delivery:</strong> {new Date(order.deliveryDate).toLocaleDateString()}</p>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
