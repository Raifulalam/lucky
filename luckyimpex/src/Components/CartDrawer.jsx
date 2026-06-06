import React, { useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { X, Trash2, ShoppingCart, Plus, Minus, ArrowRight } from "lucide-react";
import { useCartState, useCartDispatch } from "./CreateReducer";
import "./CartDrawer.css";

const formatCurrency = (value) => `Rs ${Number(value || 0).toFixed(0)}`;

const CartDrawer = ({ isOpen, onClose }) => {
    const cart = useCartState() || [];
    const dispatch = useCartDispatch();
    const navigate = useNavigate();
    const drawerRef = useRef(null);

    // Close on escape key
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "Escape") onClose();
        };
        if (isOpen) {
            window.addEventListener("keydown", handleKeyDown);
            document.body.style.overflow = "hidden"; // Prevent background scroll
        }
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            document.body.style.overflow = "";
        };
    }, [isOpen, onClose]);

    // Handle click outside to close
    const handleBackdropClick = (e) => {
        if (drawerRef.current && !drawerRef.current.contains(e.target)) {
            onClose();
        }
    };

    const handleRemove = (id) => {
        dispatch({ type: "REMOVE_ITEM", payload: { id } });
    };

    const handleUpdateQuantity = (id, currentQty, amount) => {
        const nextQty = currentQty + amount;
        if (nextQty >= 1) {
            dispatch({ type: "UPDATE_QUANTITY", payload: { id, quantity: nextQty } });
        }
    };

    const subtotal = cart.reduce((acc, item) => acc + Number(item.price || 0) * Number(item.quantity || 1), 0);
    const tax = subtotal * 0.13;
    const total = subtotal + tax;
    const totalQty = cart.reduce((total, item) => total + (item.quantity || 1), 0);

    return (
        <div className={`cart-drawer-overlay ${isOpen ? "open" : ""}`} onClick={handleBackdropClick}>
            <div className={`cart-drawer-container ${isOpen ? "open" : ""}`} ref={drawerRef} role="dialog" aria-modal="true" aria-label="Shopping Cart Drawer">
                <div className="cart-drawer-header">
                    <div className="cart-drawer-title">
                        <ShoppingCart size={20} />
                        <h2>Shopping Cart</h2>
                        <span className="cart-drawer-count">{totalQty}</span>
                    </div>
                    <button className="cart-drawer-close" onClick={onClose} aria-label="Close cart drawer">
                        <X size={20} />
                    </button>
                </div>

                <div className="cart-drawer-content">
                    {cart.length === 0 ? (
                        <div className="cart-drawer-empty">
                            <ShoppingCart size={48} className="empty-cart-icon" />
                            <h3>Your cart is empty</h3>
                            <p>Add some products to get started!</p>
                            <button className="drawer-shop-btn" onClick={() => { onClose(); navigate("/products"); }}>
                                Shop Products
                            </button>
                        </div>
                    ) : (
                        <div className="cart-drawer-items">
                            {cart.map((item) => (
                                <div key={item.id} className="cart-drawer-item">
                                    <div className="drawer-item-img-container">
                                        <img src={item.image || "/lucky-logo.png"} alt={item.name} className="drawer-item-img" onError={(e) => {
                                            e.currentTarget.onerror = null;
                                            e.currentTarget.src = "/lucky-logo.png";
                                        }} />
                                    </div>
                                    <div className="drawer-item-details">
                                        <h4 className="drawer-item-name">{item.name}</h4>
                                        <div className="drawer-item-pricing">
                                            <span className="drawer-item-mrp">{formatCurrency(item.mrp)}</span>
                                            <span className="drawer-item-price">{formatCurrency(item.price)}</span>
                                        </div>
                                        <div className="drawer-item-actions">
                                            <div className="drawer-item-quantity">
                                                <button type="button" onClick={() => handleUpdateQuantity(item.id, item.quantity, -1)} aria-label="Decrease quantity">
                                                    <Minus size={12} />
                                                </button>
                                                <span>{item.quantity}</span>
                                                <button type="button" onClick={() => handleUpdateQuantity(item.id, item.quantity, 1)} aria-label="Increase quantity">
                                                    <Plus size={12} />
                                                </button>
                                            </div>
                                            <button className="drawer-item-remove" onClick={() => handleRemove(item.id)} aria-label="Remove item">
                                                <Trash2 size={14} /> Remove
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {cart.length > 0 && (
                    <div className="cart-drawer-footer">
                        <div className="drawer-summary-row">
                            <span>Subtotal</span>
                            <span>{formatCurrency(subtotal)}</span>
                        </div>
                        <div className="drawer-summary-row">
                            <span>Tax (13%)</span>
                            <span>{formatCurrency(tax)}</span>
                        </div>
                        <div className="drawer-summary-row drawer-total">
                            <span>Total</span>
                            <span>{formatCurrency(total)}</span>
                        </div>
                        
                        <div className="drawer-footer-actions">
                            <button className="drawer-checkout-btn" onClick={() => { onClose(); navigate("/cart"); }}>
                                Proceed to Checkout <ArrowRight size={16} />
                            </button>
                            <button className="drawer-view-cart-btn" onClick={() => { onClose(); navigate("/cart"); }}>
                                View Full Cart
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CartDrawer;
