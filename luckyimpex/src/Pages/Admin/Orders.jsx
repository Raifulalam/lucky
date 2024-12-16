import React, { useEffect, useState } from 'react'; // Import React and hooks
import { Link } from 'react-router-dom'; // Import Link component for routing
import './OrderComponent.css'; // Assuming we will add some basic styling

const OrderComponent = () => {
    const [orders, setOrders] = useState([]); // State to store fetched orders
    const [loading, setLoading] = useState(true); // State to handle loading status
    const [error, setError] = useState(null); // State to handle errors

    // Fetch orders data when the component mounts
    const handleOrderData = async () => {
        try {
            const response = await fetch('https://lucky-back-2.onrender.com/api/orders');

            if (!response.ok) {
                throw new Error('Failed to fetch orders');
            }

            const data = await response.json();
            setOrders(data);
        } catch (error) {
            setError(error.message); // Handle errors
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    // Fetch orders on component mount
    useEffect(() => {
        handleOrderData();
    }, []);

    // Loading state rendering
    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <img className="spinner-gif" src="spinner.gif" alt="loading products..." />
            </div>
        );
    }

    // Error state rendering
    if (error) {
        return <div>Error: {error}</div>;
    }

    // Render orders
    return (
        <div className="order-container">
            <h1>Orders</h1>

            {/* Conditionally render orders */}
            {orders.length === 0 ? (
                <p>No orders found.</p>
            ) : (
                <table className="orders-table">
                    <thead>
                        <tr>
                            <th>Order ID</th>
                            <th>Item ID</th>
                            <th>Item Name</th>
                            <th>Quantity</th>
                            <th>Price</th>
                            <th>Total Price</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map(order => (
                            order.items && order.items.length > 0 ? (
                                order.items.map(item => (
                                    <tr key={item.id}>
                                        {/* Order ID should be the same for each item */}
                                        <td>{order._id}</td>
                                        <td>{item.id}</td>
                                        <td>{item.name}</td>
                                        <td>{item.quantity}</td>
                                        <td>₹{item.price}</td>
                                        {/* Total price for each order will be displayed after all items */}
                                        {order.items.length === 1 && (
                                            <td rowSpan={order.items.length}>₹{order.totalPrice}</td>
                                        )}
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6">No items in this order.</td>
                                </tr>
                            )
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default OrderComponent;
