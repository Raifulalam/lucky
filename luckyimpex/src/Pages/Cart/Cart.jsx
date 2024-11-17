import React from 'react';
import { useCartDispatch, useCartState } from '../../Components/CreateReducer';
import './Cart.css';

// Helper function to format dates
const formatDate = (date) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(date).toLocaleDateString(undefined, options);
};

const CartComponent = () => {
    const cart = useCartState();
    const dispatch = useCartDispatch();

    // Handle removing an item from the cart
    const handleRemove = (id) => {
        dispatch({ type: 'REMOVE_ITEM', payload: { id } });
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
    };

    // Calculate the price excluding tax (sum of all item prices without tax)
    const totalPrice = () => {
        return cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
    };

    const calculateExcludingTax = (totalPrice, tax) => {
        return totalPrice - tax;
    }
    // Calculate 13% tax based on the price excluding tax
    const calculateTax = (priceExcludingTax) => {
        return priceExcludingTax * 0.13;
    };

    // Calculate the price after tax (price + tax)
    const calculatePriceAfterTax = (priceExcludingTax, tax) => {
        return priceExcludingTax + tax;
    };

    // Calculate the total price (price after tax)
    const calculateTotal = () => {
        const total = totalPrice();
        const tax = calculateTax(total);
        return calculatePriceAfterTax(priceExcludingTax, tax);
    };

    // Estimate delivery date (for simplicity, let's assume 5 business days from now)
    const estimateDeliveryDate = () => {
        const deliveryDate = new Date();
        deliveryDate.setDate(deliveryDate.getDate() + 5); // Adding 5 days for delivery
        return formatDate(deliveryDate);
    };

    const total = totalPrice();
    const tax = calculateTax(total);
    const priceExcludingTax = calculateExcludingTax(total, tax);
    const priceAfterTax = calculatePriceAfterTax(priceExcludingTax, tax);

    return (
        <>
            <div className="page-title">Review your order</div>
            <hr />
            <div className="cart-container">

                <div className="cart-items">
                    <button className="clear-cart" onClick={handleClearCart}>Clear Cart</button>
                    {cart.length > 0 ? (
                        cart.map(item => (

                            <div key={item.id} className="cart-item">
                                <div className="delivery-date">
                                    <span>Estimated Delivery Date </span>
                                    <span>{estimateDeliveryDate()}</span>
                                </div>

                                <div className="product-details">
                                    <div className="image">
                                        <img className="item-image" src={item.image} alt={item.name} />
                                    </div>

                                    <div className="item-details">
                                        <h3>{item.name}</h3>
                                        <p>₹{item.price}</p>
                                        <div className="quantity">
                                            <button
                                                onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                                            >
                                                -
                                            </button>
                                            <input
                                                type="number"
                                                value={item.quantity}
                                                onChange={(e) => handleUpdateQuantity(item.id, parseInt(e.target.value) || 1)}
                                                min="1"
                                            />
                                            <button
                                                onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                                            >
                                                +
                                            </button>
                                        </div>

                                    </div>
                                    <button className="remove-item" onClick={() => handleRemove(item.id)}>
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
                        <span>₹{calculateTotal().toFixed(2)}</span>
                    </div>

                    <button className="place-order" >Place Your Order</button>
                </div>
            </div>
        </>

    );
};

export default CartComponent;
