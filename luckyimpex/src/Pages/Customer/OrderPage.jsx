import React, { useContext, useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import { ArrowLeft, PackageSearch, Printer, ReceiptText, Trash2, Truck } from "lucide-react";
import { UserContext } from "../../Components/UserContext";
import Header from "../../Components/Header";
import Footer from "../../Components/Footer";
import "./OrderPage.css";
import useGoBack from "../../hooks/useGoback";
import Invoice from "../../Components/invoice";
import { printInvoice, printShippingSlip } from "../../Components/invoiceUtils";

const API_BASE = "https://lucky-1-6ma5.onrender.com/api/orders";
const ORDER_STEPS = ["Order Placed", "Shipped", "Delivered"];

const formatCurrency = (value) => `Rs ${Number(value || 0).toFixed(0)}`;

const getStatusIndex = (status) => {
    const normalizedStatus = ORDER_STEPS.findIndex((step) => step.toLowerCase() === String(status || "").toLowerCase());
    return normalizedStatus === -1 ? 0 : normalizedStatus;
};

const OrderPage = () => {
    const { user, loading: userLoading, error: userError } = useContext(UserContext);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const token = localStorage.getItem("authToken");
    const goBack = useGoBack();

    useEffect(() => {
        if (!token) return;

        const fetchOrders = async () => {
            setLoading(true);
            setError("");

            try {
                const res = await fetch(`${API_BASE}/orders/my`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!res.ok) throw new Error("Failed to fetch orders");

                const data = await res.json();
                setOrders(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [token]);

    const company = useMemo(
        () => ({
            name: "Lucky Impex",
            address: "Link road, Birgunj, Nepal",
            gst: "304510575",
            logo: "/lucky-logo.png",
        }),
        []
    );

    const handleDelete = async (orderId) => {
        if (!window.confirm("Delete this order permanently?")) return;

        try {
            const res = await fetch(`${API_BASE}/orders/${orderId}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!res.ok) throw new Error("Failed to delete order");

            setOrders((prev) => prev.filter((order) => order._id !== orderId));
        } catch (err) {
            alert(err.message);
        }
    };

    const renderContent = () => {
        if (userLoading) return <div className="order-state">Loading user...</div>;
        if (userError) return <div className="order-state error">{userError}</div>;
        if (!user?._id) {
            return (
                <div className="order-empty">
                    <PackageSearch size={38} />
                    <h2>Please login to view orders</h2>
                    <p>Your order history is available after sign in.</p>
                    <Link to="/login" className="order-primary-btn">Login</Link>
                </div>
            );
        }
        if (loading) return <div className="order-state">Loading orders...</div>;
        if (error) return <div className="order-state error">{error}</div>;
        if (orders.length === 0) {
            return (
                <div className="order-empty">
                    <ReceiptText size={38} />
                    <h2>No orders found</h2>
                    <p>Once you place an order, it will appear here with item, shipping, and invoice details.</p>
                    <Link to="/products" className="order-primary-btn">Browse products</Link>
                </div>
            );
        }

        return (
            <div className="order-list">
                {orders.map((order) => {
                    const statusIndex = getStatusIndex(order.status);

                    return (
                        <article className="order-card" key={order._id}>
                            <div style={{ display: "none" }}>
                                <Invoice order={order} company={company} />
                            </div>

                            <div className="order-top">
                                <div className="order-top-copy">
                                    <span className="order-label">Order #{order._id.slice(-6)}</span>
                                    <h3>{order.name || "Customer Order"}</h3>
                                    <p>
                                        Placed on {new Date(order.createdAt).toLocaleDateString()} ·
                                        Total {formatCurrency(order.totalPrice)}
                                    </p>
                                </div>

                                <div className="order-actions">
                                    <button
                                        className="order-icon-btn"
                                        onClick={() => printInvoice(order._id, company)}
                                        title="Print Invoice"
                                    >
                                        <Printer size={16} />
                                        Invoice
                                    </button>
                                    <button
                                        className="order-icon-btn"
                                        onClick={() => printShippingSlip(order)}
                                    >
                                        <Truck size={16} />
                                        Shipping Slip
                                    </button>
                                    <button
                                        className="order-icon-btn danger"
                                        onClick={() => handleDelete(order._id)}
                                        title="Delete Order"
                                    >
                                        <Trash2 size={16} />
                                        Delete
                                    </button>
                                </div>
                            </div>

                            <div className="order-progress">
                                {ORDER_STEPS.map((step, index) => (
                                    <div key={step} className={`step ${index <= statusIndex ? "active" : ""}`}>
                                        <span className="step-dot"></span>
                                        <span>{step}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="order-card-grid">
                                <section className="order-items">
                                    <h4>Items</h4>
                                    {order.items?.length ? (
                                        <div className="order-items-list">
                                            {order.items.map((item, idx) => (
                                                <div key={idx} className="item">
                                                    <img src={item.image} alt={item.name} />
                                                    <div>
                                                        <p><strong>{item.name}</strong></p>
                                                        <p>Qty: {item.quantity}</p>
                                                        <p>Price: {formatCurrency(item.price)}</p>
                                                        <p>Total: {formatCurrency(item.quantity * item.price)}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p>No items in this order.</p>
                                    )}
                                </section>

                                <aside className="shipping-details">
                                    <h4>Shipping details</h4>
                                    <p><strong>Address:</strong> {order.address}</p>
                                    <p><strong>Phone:</strong> {order.phone}</p>
                                    <p><strong>Delivery Date:</strong> {new Date(order.deliveryDate).toLocaleDateString()}</p>
                                    <p><strong>Status:</strong> {order.status}</p>
                                </aside>
                            </div>
                        </article>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="orders-page">
            <Helmet>
                <title>Orders | Lucky Impex</title>
                <meta name="description" content="Track your Lucky Impex orders, print invoices, and review shipping details." />
            </Helmet>

            <Header />

            <main className="order-page">
                <section className="orders-hero">
                    <button className="orders-back-btn" onClick={goBack}>
                        <ArrowLeft size={18} /> Back
                    </button>
                    <span className="orders-kicker">Order History</span>
                    <h1>Track and manage your orders.</h1>
                    <p>
                        Review placed orders, print invoices, and keep delivery details available
                        whenever you need them.
                    </p>
                </section>

                {renderContent()}
            </main>

            <Footer />
        </div>
    );
};

export default OrderPage;
