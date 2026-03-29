import React, { useContext, useMemo, useState } from "react";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import { ArrowLeft, CreditCard, MapPin, ShieldCheck, ShoppingBag, Trash2, Truck } from "lucide-react";
import Header from "../../Components/Header";
import Footer from "../../Components/Footer";
import { useCartDispatch, useCartState } from "../../Components/CreateReducer";
import { UserContext } from "../../Components/UserContext";
import { useNotification } from "../../Components/NotificationContext";
import useGoBack from "../../hooks/useGoback";
import "./Cart.css";

const formatCurrency = (value) => `Rs ${Number(value || 0).toFixed(0)}`;

const formatDate = (date) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(date).toLocaleDateString(undefined, options);
};

const calculatePrices = (cart) => {
    const subtotal = cart.reduce((acc, item) => acc + Number(item.price || 0) * Number(item.quantity || 1), 0);
    const tax = subtotal * 0.13;
    const total = subtotal + tax;

    return { subtotal, tax, total };
};

const CartComponent = () => {
    const { user, loading } = useContext(UserContext);
    const cart = useCartState();
    const dispatch = useCartDispatch();
    const { addNotification } = useNotification();
    const token = localStorage.getItem("authToken");
    const goBack = useGoBack();

    const [deliveryDetails, setDeliveryDetails] = useState({
        name: "",
        address: "",
        phone: "",
        postalCode: "",
        country: "",
        deliveryInstructions: "",
        additionalPhone: "",
    });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const estimateDeliveryDate = useMemo(() => {
        const deliveryDate = new Date();
        deliveryDate.setDate(deliveryDate.getDate() + 5);
        return formatDate(deliveryDate);
    }, []);

    const itemCount = useMemo(
        () => cart.reduce((acc, item) => acc + Number(item.quantity || 1), 0),
        [cart]
    );

    const { subtotal, tax, total } = useMemo(() => calculatePrices(cart), [cart]);

    const handleRemove = (id) => {
        dispatch({ type: "REMOVE_ITEM", payload: { id } });
        addNotification({
            title: "Removed",
            message: "Item removed from cart.",
            type: "success",
            container: "top-right",
            dismiss: { duration: 5000 },
        });
    };

    const handleUpdateQuantity = (id, quantity) => {
        const safeQuantity = Math.max(1, quantity || 1);
        dispatch({ type: "UPDATE_QUANTITY", payload: { id, quantity: safeQuantity } });
    };

    const handleClearCart = () => {
        dispatch({ type: "CLEAR_CART" });
        addNotification({
            title: "Cart cleared",
            message: "All cart items have been removed.",
            type: "success",
            container: "top-right",
            dismiss: { duration: 5000 },
        });
    };

    const handleOrderPlace = () => {
        if (!user) {
            addNotification({
                title: "Login required",
                message: "Please login to place your order.",
                type: "error",
                container: "top-right",
                dismiss: { duration: 5000 },
            });
            return;
        }

        setErrorMessage("");
        setIsModalOpen(true);
    };

    const handleOrder = async () => {
        if (!deliveryDetails.name || !deliveryDetails.address || !deliveryDetails.phone || !deliveryDetails.postalCode || !deliveryDetails.country) {
            setErrorMessage("Please fill in all required delivery fields.");
            return;
        }

        if (cart.length === 0) {
            setErrorMessage("Your cart is empty.");
            return;
        }

        const orderData = {
            name: deliveryDetails.name,
            items: cart.map((item) => ({
                itemId: String(item.id),
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                image: item.image,
            })),
            totalPrice: total,
            tax,
            deliveryDate: estimateDeliveryDate,
            address: deliveryDetails.address,
            deliveryName: deliveryDetails.name,
            phone: deliveryDetails.phone,
            postalCode: deliveryDetails.postalCode,
            country: deliveryDetails.country,
            deliveryInstructions: deliveryDetails.deliveryInstructions,
            additionalPhone: deliveryDetails.additionalPhone,
            user: {
                name: user.name,
                email: user.email,
                userId: user.id,
            },
        };

        try {
            const response = await fetch("https://lucky-1-6ma5.onrender.com/api/orders/orders", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(orderData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                setErrorMessage(errorData.message || "Something went wrong.");
                return;
            }

            addNotification({
                title: "Success",
                message: "Order placed successfully.",
                type: "success",
                container: "top-right",
                dismiss: { duration: 5000 },
            });

            dispatch({ type: "CLEAR_CART" });
            setIsModalOpen(false);
        } catch (error) {
            setErrorMessage("Error placing order. Please try again.");
            console.log(error);
        }
    };

    return (
        <div className="cart-page">
            <Helmet>
                <title>Cart | Lucky Impex</title>
                <meta name="description" content="Review the products in your Lucky Impex cart and place your order." />
            </Helmet>

            <Header />

            <main className="cart-main">
                <section className="cart-hero">
                    <button className="cart-back-btn" onClick={goBack}>
                        <ArrowLeft size={18} /> Continue shopping
                    </button>
                    <div className="cart-hero-copy">
                        <span className="cart-kicker">Your Cart</span>
                        <h1>Review your order before checkout.</h1>
                        <p>
                            Adjust quantities, confirm totals, and proceed with delivery details
                            once your order looks right.
                        </p>
                    </div>
                    <div className="cart-trust">
                        <div><Truck size={18} /> Estimated delivery: {estimateDeliveryDate}</div>
                        <div><ShieldCheck size={18} /> Store-backed order processing</div>
                        <div><CreditCard size={18} /> Secure order submission</div>
                    </div>
                </section>

                {cart.length === 0 ? (
                    <section className="cart-empty-state">
                        <ShoppingBag size={40} />
                        <h2>Your cart is empty</h2>
                        <p>Add products to your cart to continue toward checkout.</p>
                        <Link to="/products" className="cart-primary-btn">
                            Browse products
                        </Link>
                    </section>
                ) : (
                    <section className="cart-layout">
                        <div className="cart-items-panel">
                            <div className="cart-panel-header">
                                <div>
                                    <h2>Cart items</h2>
                                    <p>{itemCount} item{itemCount > 1 ? "s" : ""} currently selected</p>
                                </div>
                                <button className="cart-clear-btn" onClick={handleClearCart}>
                                    Clear cart
                                </button>
                            </div>

                            <div className="cart-item-list">
                                {cart.map((item) => (
                                    <article key={item.id} className="cart-item-card">
                                        <div className="cart-item-media">
                                            <img className="item-image" src={item.image} alt={item.name} />
                                        </div>

                                        <div className="cart-item-content">
                                            <div className="cart-item-header">
                                                <div>
                                                    <h3>{item.name}</h3>
                                                    <p className="cart-item-meta">Estimated delivery by {estimateDeliveryDate}</p>
                                                </div>
                                                <button className="remove-item" onClick={() => handleRemove(item.id)} aria-label="Remove item">
                                                    <Trash2 size={16} /> Remove
                                                </button>
                                            </div>

                                            <div className="cart-price-row">
                                                <span>MRP: {formatCurrency(item.mrp)}</span>
                                                <span>Unit price: {formatCurrency(item.price)}</span>
                                                <strong>Subtotal: {formatCurrency(item.price * item.quantity)}</strong>
                                            </div>

                                            <div className="quantity-row">
                                                <span>Quantity</span>
                                                <div className="quantity">
                                                    <button
                                                        type="button"
                                                        aria-label="Decrease quantity"
                                                        onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                                                    >
                                                        -
                                                    </button>
                                                    <input
                                                        type="number"
                                                        value={item.quantity}
                                                        onChange={(e) => handleUpdateQuantity(item.id, parseInt(e.target.value, 10) || 1)}
                                                        min="1"
                                                        aria-label="Quantity"
                                                    />
                                                    <button
                                                        type="button"
                                                        aria-label="Increase quantity"
                                                        onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        </div>

                        <aside className="cart-summary-card">
                            <h2>Order summary</h2>
                            <div className="summary-item">
                                <span>Subtotal</span>
                                <strong>{formatCurrency(subtotal)}</strong>
                            </div>
                            <div className="summary-item">
                                <span>Tax (13%)</span>
                                <strong>{formatCurrency(tax)}</strong>
                            </div>
                            <div className="summary-item">
                                <span>Shipping</span>
                                <strong>Calculated with delivery</strong>
                            </div>
                            <div className="summary-total">
                                <span>Total payable</span>
                                <strong>{formatCurrency(total)}</strong>
                            </div>

                            <div className="summary-note">
                                <MapPin size={16} />
                                Delivery details are collected before final order placement.
                            </div>

                            <button className="place-order" onClick={handleOrderPlace} disabled={loading}>
                                {loading ? "Checking account..." : "Proceed to checkout"}
                            </button>
                        </aside>
                    </section>
                )}
            </main>

            {cart.length > 0 && (
                <div className="cart-mobile-checkout">
                    <div className="cart-mobile-total">
                        <span>Total payable</span>
                        <strong>{formatCurrency(total)}</strong>
                    </div>
                    <button className="place-order mobile-place-order" onClick={handleOrderPlace} disabled={loading}>
                        {loading ? "Checking account..." : "Proceed to checkout"}
                    </button>
                </div>
            )}

            {isModalOpen && (
                <div className="cart-modal-overlay">
                    <div className="cart-modal">
                        <div className="cart-modal-header">
                            <h3>Delivery details</h3>
                            <p>Provide the required information to place your order.</p>
                        </div>

                        {errorMessage && <div className="cart-form-error">{errorMessage}</div>}

                        <form className="cart-modal-form">
                            <div className="user-info">
                                <label>Account email</label>
                                <input type="text" value={user.email} readOnly />
                            </div>

                            <div className="cart-form-grid">
                                <input
                                    type="text"
                                    placeholder="Your Name"
                                    value={deliveryDetails.name}
                                    onChange={(e) => setDeliveryDetails({ ...deliveryDetails, name: e.target.value })}
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
                            </div>

                            <input
                                type="text"
                                placeholder="Delivery Address"
                                value={deliveryDetails.address}
                                onChange={(e) => setDeliveryDetails({ ...deliveryDetails, address: e.target.value })}
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
                                <button type="button" className="cart-secondary-btn" onClick={() => setIsModalOpen(false)}>
                                    Cancel
                                </button>
                                <button type="button" className="cart-primary-btn" onClick={handleOrder}>
                                    Place Order
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
};

export default CartComponent;
