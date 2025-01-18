import React, { useEffect, useState, useContext } from 'react'; // Import React, hooks, and UserContext
import './OrderComponent.css';
import { UserContext } from '../../Components/UserContext';
import { useNavigate } from 'react-router-dom';
const OrderComponent = () => {
    const { user } = useContext(UserContext); // Access the user from context
    const [orders, setOrders] = useState([]); // State to store fetched orders
    const [loading, setLoading] = useState(true); // State to handle loading status
    const [error, setError] = useState(null); // State to handle errors
    const Navigate = useNavigate();

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


    const handleApprove = async (orderId) => {
        try {
            const response = await fetch(`https://lucky-back-2.onrender.com/api/orders/${orderId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status: 'Approved' }), // Update the status to "Approved"
            });

            if (!response.ok) {
                throw new Error('Failed to approve the order');
            }

            const updatedOrder = await response.json();
            setOrders((prevOrders) =>
                prevOrders.map((order) =>
                    order._id === updatedOrder._id ? updatedOrder : order
                )
            );
            alert('Order approved successfully');
        } catch (error) {
            console.error('Error approving order:', error);
            alert('Error approving order');
        }
    };
    const handleReviewClick = (orderId) => {
        Navigate(`/review/${orderId}`); // Navigate to Review page with order ID
    };


    // Delete order (DELETE request)
    const handleDelete = async (orderId) => {
        if (window.confirm('Are you sure you want to delete this order?')) {
            try {
                const response = await fetch(`https://lucky-back-2.onrender.com/api/orders/${orderId}`, {
                    method: 'DELETE',
                });

                if (!response.ok) {
                    throw new Error('Failed to delete the order');
                }

                setOrders((prevOrders) => prevOrders.filter((order) => order._id !== orderId));
                alert('Order deleted successfully');
            } catch (error) {
                console.error('Error deleting order:', error);
                alert('Error deleting order');
            }
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
                <div className="spinner"></div>
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
                            <th scope="col">Status</th>
                            <th scope="col">Delivery Date</th>
                            <th scope="col">Shipping Address</th>
                            <th scope="col">User Name</th>
                            <th scope="col">User Phone</th>
                            <th scope="col">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map((order) => (
                            <tr key={order._id}>
                                <td>{order._id}</td>
                                <td>{order.status}</td>
                                <td>{order.deliveryDate}</td>
                                <td>{order.address}</td>
                                <td>{order.name}</td>
                                <td>{order.phone}</td>
                                <td>
                                    <button onClick={() => handleApprove(order._id)}>Approve</button>
                                    <button onClick={() => handleDelete(order._id)}>Delete</button>
                                    <button onClick={() => handleReviewClick(order._id)}>Review</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default OrderComponent;
