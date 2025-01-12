import React, { useEffect, useState, useContext } from 'react'; // Import React, hooks, and UserContext
import './OrderComponent.css';
import { UserContext } from '../../Components/UserContext'; // Assuming UserContext provides user details

const OrderComponent = () => {
    const { user } = useContext(UserContext); // Access the user from context
    const [orders, setOrders] = useState([]); // State to store fetched orders
    const [loading, setLoading] = useState(true); // State to handle loading status
    const [error, setError] = useState(null); // State to handle errors
    const [loggedIn, setLoggedIn] = useState("localStorage.getAuthToken()"); // 

    // Fetch orders data when the component mounts
    const handleOrderData = async () => {
        try {
            const response = await fetch('https://lucky-back-2.onrender.com/api/orders');

            if (!response.ok) {
                throw new Error('Failed to fetch orders');
            }

            const data = await response.json();
            setOrders(data); // Set the fetched orders to state
        } catch (error) {
            setError(error.message); // Handle errors
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false); // Stop loading when the request finishes
        }
    };

    // Fetch orders on component mount
    useEffect(() => {
        handleOrderData();
    }, []);

    // Check if user is logged in and is an admin
    if (!user || user.role !== 'admin') {
        return <div>You need to be an admin to view this page.</div>;
    }

    // Loading state rendering
    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div> {/* Only use a CSS spinner for simplicity */}
            </div>
        );
    }

    // Error state rendering
    if (error) {
        return <div className="error-message">Error: {error}</div>;
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
                            <th scope="col">Order ID</th>
                            <th scope="col">Products ID</th>
                            <th scope="col">Item Name</th>

                            <th scope="col">Quantity</th>
                            <th scope="col">Rate</th>
                            <th scope="col">Total Price</th>
                            <th scope="col">Order Date</th>

                            <th scope="col">Delivery Date</th>
                            <th scope="col">Status</th>
                            <th scope="col">Shipping Address</th>
                            <th scope="col">User Name</th>
                            <th scope="col">User Phone</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map(order => (
                            order.items && order.items.length > 0 ? (
                                order.items.map((item, index) => (
                                    <tr key={item.id}>
                                        {/* Order ID should be the same for each item */}
                                        <td>{order._id}</td>
                                        <td>{item._id}</td>
                                        <td>{item.name}</td>
                                        <td>{item.quantity}</td>
                                        <td>₹{item.price}</td>
                                        {index === 0 && (
                                            <td rowSpan={order.items.length}>₹{order.totalPrice}</td>
                                        )}
                                        {index === 0 && (
                                            <td rowSpan={order.items.length}>
                                                {new Date(order.createdAt).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric',
                                                })}
                                            </td>
                                        )}


                                        {/* Delivery Date */}
                                        {index === 0 && (
                                            <td rowSpan={order.items.length}>{order.deliveryDate}</td>
                                        )}
                                        {/* Status */}
                                        {index === 0 && (
                                            <td rowSpan={order.items.length}>{order.status}</td>
                                        )}
                                        {/* Shipping Address */}
                                        {index === 0 && (
                                            <td rowSpan={order.items.length}>{order.address}</td>
                                        )}
                                        {/* User Name */}
                                        {index === 0 && (
                                            <td rowSpan={order.items.length}>{order.name}</td>
                                        )}
                                        {/* User Phone */}
                                        {index === 0 && (
                                            <td rowSpan={order.items.length}>{order.phone}</td>
                                        )}
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="11">No items in this order.</td>
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
