import React, { useContext, useState, useMemo } from 'react';
import { useCartDispatch, useCartState } from '../../Components/CreateReducer';
import './Cart.css';
import { UserContext } from '../../Components/UserContext';
import { useNotification } from '../../Components/NotificationContext';

// Helper function to format dates
const formatDate = (date) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(date).toLocaleDateString(undefined, options);
};

// Helper function to calculate tax and prices
const calculatePrices = (cart) => {
    const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const tax = total * 0.13;
    const priceExcludingTax = total - tax;
    const priceAfterTax = total + tax;

    return { total, tax, priceExcludingTax, priceAfterTax };
};

const CartComponent = () => {
    const { user, error, loading } = useContext(UserContext);
    const cart = useCartState();
    const dispatch = useCartDispatch();
    const { addNotification } = useNotification();

    // State to manage user details for order
    const [deliveryDetails, setDeliveryDetails] = useState({
        name: '',
        address: '',
        phone: '',
        postalCode: '',
        country: '',
        deliveryInstructions: '',
        additionalPhone: '',
    });
    const [isModalOpen, setIsModalOpen] = useState(false); // State to manage modal visibility
    const [errorMessage, setErrorMessage] = useState('');

    // Handle removing an item from the cart
    const handleRemove = (id) => {
        dispatch({ type: 'REMOVE_ITEM', payload: { id } });
        addNotification({
            title: 'Success!',
            message: 'Item removed successfully ',
            type: 'success', // Notification type 'success'
            container: 'top-right',
            dismiss: { duration: 5000 },
        });
    };

    // Handle updating the quantity of an item in the cart
    const handleUpdateQuantity = (id, quantity) => {
        if (quantity < 1) {
            quantity = 1; // Prevent quantity from going below 1
        }
        dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });
    };

    // Handle clearing all items in the cart
    const handleClearCart = () => {
        dispatch({ type: 'CLEAR_CART' });
        addNotification({
            title: 'Success!',
            message: 'Sucessfully cleared all cart items',
            type: 'success', // Notification type 'success'
            container: 'top-right',
            dismiss: { duration: 5000 },
        });
    };

    // Estimate delivery date (for simplicity, let's assume 5 business days from now)
    const estimateDeliveryDate = useMemo(() => {
        const deliveryDate = new Date();
        deliveryDate.setDate(deliveryDate.getDate() + 5); // Adding 5 days for delivery
        return formatDate(deliveryDate);
    }, []);

    const handleOrderPlace = () => {
        // Validate user details
        if (!user) {
            addNotification({
                title: 'Error!',
                message: 'Please Login to process your order !',
                type: 'error', // Notification type 'success'
                container: 'top-right',
                dismiss: { duration: 5000 },
            });
        } else {
            setIsModalOpen(true);
        }
    }
    // Calculate prices (without tax, tax, and with tax)
    const { tax, priceExcludingTax, priceAfterTax } = useMemo(() => calculatePrices(cart), [cart]);

    const handleOrder = async () => {

        // Check if the name and other required fields are filled out
        if (!deliveryDetails.name || !deliveryDetails.address || !deliveryDetails.phone || !deliveryDetails.postalCode || !deliveryDetails.country) {
            setErrorMessage('Please fill in all required fields');
            return;
        }

        // Check if the cart is empty
        if (cart.length === 0) {
            setErrorMessage('Your cart is empty');
            return;
        }

        // Prepare the order data based on the structure provided
        const orderData = {
            name: deliveryDetails.name, // Assuming 'name' field is filled in the modal
            items: cart.map(item => ({
                itemId: String(item.id), // Ensure itemId is a valid MongoDB ObjectId string
                name: item.name, // Product name
                price: item.price, // Product price
                quantity: item.quantity, // Quantity of the product
                image: item.image, // Product image URL
            })),
            totalPrice: priceAfterTax, // Total price after tax
            tax: tax, // Tax amount
            deliveryDate: estimateDeliveryDate, // Estimated delivery date
            address: deliveryDetails.address, // Shipping address
            deliveryName: deliveryDetails.name, // Delivery name
            phone: deliveryDetails.phone, // Delivery phone
            postalCode: deliveryDetails.postalCode, // Postal code
            country: deliveryDetails.country, // Country
            deliveryInstructions: deliveryDetails.deliveryInstructions, // Delivery instructions
            additionalPhone: deliveryDetails.additionalPhone, // Additional contact number
            user: {
                name: user.name,
                email: user.email,
                userId: user.id,
            }
        };
        try {
            // Send the POST request to create the order
            const response = await fetch('https://lucky-back.onrender.com/api/createOrder', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(orderData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                setErrorMessage(errorData.message || 'Something went wrong. Please try again later.');
                return;
            }


            addNotification({
                title: 'Success!',
                message: 'Order placed successfully ',
                type: 'success', // Notification type 'success'
                container: 'top-right',
                dismiss: { duration: 5000 },
            });
            dispatch({ type: 'CLEAR_CART' });
            setIsModalOpen(false);
        } catch (error) {
            setErrorMessage('Error placing order. Please try again.');
        }


    };



    return (
        <>
            <div className="page-title">Review Your Order</div>
            <hr />


            <div className="cart-container">
                <div className="cart-items">
                    <button className="clear-cart" onClick={handleClearCart}>Clear Cart</button>

                    {cart.length > 0 ? (
                        cart.map(item => (
                            <div key={item.id} className="cart-item">
                                <div className="delivery-date">
                                    <span>Estimated Delivery Date </span>
                                    <span>{estimateDeliveryDate}</span>
                                </div>

                                <div className="product-details">
                                    <div className="image-cart">
                                        <img className="item-image" src={item.image} alt={item.name} />
                                    </div>

                                    <div className="item-details">
                                        <h4>{item.name}</h4>
                                        <p>MRP:{item.mrp}</p>
                                        <p>Price:{item.price}</p>
                                        <p>Quantity:{item.quantity}</p>
                                        <p>Subtotal:{item.price * item.quantity}</p>



                                        <div className="quantity">
                                            <button
                                                aria-label="Decrease quantity"
                                                onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                                            >
                                                -
                                            </button>
                                            <input
                                                type="number"
                                                value={item.quantity}
                                                onChange={(e) => handleUpdateQuantity(item.id, parseInt(e.target.value) || 1)}
                                                min="1"
                                                aria-label="Quantity"
                                            />
                                            <button
                                                aria-label="Increase quantity"
                                                onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>
                                    <button className="remove-item" onClick={() => handleRemove(item.id)} aria-label="Remove item">
                                        Remove
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p>Your cart is empty</p>
                    )}
                </div>

                <div className="cart-summary">
                    <h3>Order Summary</h3>
                    <div className="summary-item">
                        <span>Price Excluding Tax</span>
                        <span>₹{priceExcludingTax.toFixed(2)}</span>
                    </div>
                    <div className="summary-item">
                        <span>Tax (13%)</span>
                        <span>₹{tax.toFixed(2)}</span>
                    </div>
                    <div className="summary-item">
                        <span>Price After Tax</span>
                        <span>₹{priceAfterTax.toFixed(2)}</span>
                    </div>
                    <div className="summary-item">
                        <span>Total</span>
                        <span>₹{priceAfterTax.toFixed(2)}</span>
                    </div>

                    <button className="place-order" onClick={() => handleOrderPlace()} disabled={loading}>
                        {loading ? 'Placing Order...' : 'Place Your Order'}
                    </button>
                </div>
            </div>

            {/* Modal for Delivery Details */}
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Enter Delivery Details</h3>
                        {errorMessage && <div className="error">{errorMessage}</div>}
                        <form>
                            <div className="user-info">
                                <input type="text" value={user.email} readOnly />
                            </div>

                            <input
                                type="text"
                                placeholder="Your Name"
                                value={deliveryDetails.name}
                                onChange={(e) => setDeliveryDetails({ ...deliveryDetails, name: e.target.value })}
                            />
                            <input
                                type="text"
                                placeholder="Delivery Address"
                                value={deliveryDetails.address}
                                onChange={(e) => setDeliveryDetails({ ...deliveryDetails, address: e.target.value })}
                            />
                            <input
                                type="text"
                                placeholder="Phone Number"
                                value={deliveryDetails.phone}
                                onChange={(e) => setDeliveryDetails({ ...deliveryDetails, phone: e.target.value })}
                            />
                            <input
                                type="text"
                                placeholder="Postal Code"
                                value={deliveryDetails.postalCode}
                                onChange={(e) => setDeliveryDetails({ ...deliveryDetails, postalCode: e.target.value })}
                            />
                            <input
                                type="text"
                                placeholder="Country"
                                value={deliveryDetails.country}
                                onChange={(e) => setDeliveryDetails({ ...deliveryDetails, country: e.target.value })}
                            />
                            <textarea
                                placeholder="Delivery Instructions"
                                value={deliveryDetails.deliveryInstructions}
                                onChange={(e) => setDeliveryDetails({ ...deliveryDetails, deliveryInstructions: e.target.value })}
                            />
                            <input
                                type="text"
                                placeholder="Additional Contact Number"
                                value={deliveryDetails.additionalPhone}
                                onChange={(e) => setDeliveryDetails({ ...deliveryDetails, additionalPhone: e.target.value })}
                            />

                            <div className="modal-buttons">
                                <button type="button" onClick={() => setIsModalOpen(false)}>Cancel</button>
                                <button type="button" onClick={handleOrder}>Place Order</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default CartComponent;
