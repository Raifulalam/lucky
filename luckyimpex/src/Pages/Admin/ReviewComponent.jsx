import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import './Review.css';

const ReviewPage = () => {
    const { orderId } = useParams(); // Get the orderId from the URL
    const [orderDetails, setOrderDetails] = useState(null); // State to store the order details

    // Fetch order details on component mount
    useEffect(() => {
        const fetchOrderData = async () => {
            try {
                const response = await fetch(`https://lucky-back.onrender.com/api/orders/${orderId}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch order details');
                }

                const orderData = await response.json();
                setOrderDetails(orderData); // Store the fetched order data in the state
            } catch (error) {
                console.error('Error fetching order details:', error);
            }
        };

        fetchOrderData(); // Call the async function to fetch the data
    }, [orderId]); // Re-run this effect when the orderId changes

    // Function to capitalize the first letter of a string
    const capitalize = (str) => {
        if (!str) return ''; // Return empty string if input is falsy (null, undefined, etc.)
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    };

    return (
        <div className="review-container">
            <h1>Order Details</h1>

            {/* Conditionally render order details if fetched successfully */}
            {orderDetails ? (
                <div className="review-details">
                    <table className="order-table">
                        <thead>
                            <tr>
                                <th colSpan="2">Order Information</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* Order Summary */}
                            <tr>
                                <td><strong>Order ID:</strong></td>
                                <td>{orderDetails._id}</td>
                            </tr>
                            <tr>
                                <td><strong>Customer Name:</strong></td>
                                <td>{capitalize(orderDetails.name)}</td>
                            </tr>
                            <tr>
                                <td><strong>Status:</strong></td>
                                <td>{orderDetails.status}</td>
                            </tr>
                            <tr>
                                <td><strong>Delivery Date:</strong></td>
                                <td>{orderDetails.deliveryDate}</td>
                            </tr>
                            <tr>
                                <td><strong>Ordered Date:</strong></td>
                                <td>{new Date(orderDetails.createdAt).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                })}</td>
                            </tr>

                            {/* Ordered Items */}
                            <tr>
                                <td colSpan="2"><strong>Ordered Items</strong></td>
                            </tr>
                            <tr>
                                <td colSpan="2">
                                    <table className="items-table">
                                        <thead>
                                            <tr>
                                                <th>Item Name</th>
                                                <th>Price</th>
                                                <th>Quantity</th>
                                                <th>Image</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {orderDetails.items.map((item, index) => (
                                                <tr key={index}>
                                                    <td>{item.name}</td>
                                                    <td>₹{item.price}</td>
                                                    <td>{item.quantity}</td>
                                                    <td><img src={item.image} alt={item.name} className="item-image" /></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </td>
                            </tr>

                            {/* Total Price and Tax */}
                            <tr>
                                <td><strong>Total Price Before VAT:</strong></td>
                                <td>₹{(orderDetails.totalPrice - orderDetails.tax).toFixed(0)}</td>
                            </tr>
                            <tr>
                                <td><strong>VAT Amount:</strong></td>
                                <td>₹{orderDetails.tax.toFixed(0)}</td>
                            </tr>
                            <tr>
                                <td><strong>Payable Amount:</strong></td>
                                <td>₹{orderDetails.totalPrice.toFixed(0)}</td>
                            </tr>

                            {/* Shipping Info */}
                            <tr>
                                <td><strong>Shipping Address:</strong></td>
                                <td>{orderDetails.address}, {orderDetails.deliveryInstructions}, {orderDetails.postalCode}, {orderDetails.country}</td>
                            </tr>
                            <tr>
                                <td><strong>Phone:</strong></td>
                                <td>{orderDetails.phone}, {orderDetails.additionalPhone}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            ) : (
                <p className="loading-message">Loading order details...</p>
            )}
        </div>
    );
};

export default ReviewPage;
