import React, { useContext, useEffect, useState } from "react";
import { UserContext } from "../../Components/UserContext";
import "./OrderPage.css";
import { FaTrash, FaPrint } from "react-icons/fa";

import useGoBack from "../../hooks/useGoback";

import Invoice from "../../Components/invoice";
import {

    printInvoice,
    printShippingSlip,
} from "../../Components/invoiceUtils";

const API_BASE = "https://lucky-1-6ma5.onrender.com/api/orders";

const OrderPage = () => {
    const { user, loading: userLoading, error: userError } =
        useContext(UserContext);

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const token = localStorage.getItem("authToken");

    const goBack = useGoBack();
    /* ================= FETCH ORDERS ================= */
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

    /* ================= DELETE ORDER ================= */
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

            setOrders((prev) => prev.filter((o) => o._id !== orderId));
        } catch (err) {
            alert(err.message);
        }
    };

    /* ================= UI STATES ================= */
    if (userLoading) return <div className="loader">Loading user...</div>;
    if (userError) return <div className="error">{userError}</div>;
    if (!user?._id)
        return <div className="info">Please login to view orders.</div>;
    if (loading) return <div className="loader">Loading orders...</div>;
    if (error) return <div className="error">{error}</div>;
    if (orders.length === 0)
        return <div className="info">No orders found.</div>;

    /* ================= COMPANY INFO ================= */
    const company = {
        name: "Lucky Impex",
        address: "Link road, Birgunj, Nepal",
        gst: "304510575",
        logo: "/lucky-logo.png",
    };

    /* ================= RENDER ================= */
    return (
        <div className="order-page">
            <button onClick={goBack}>⬅ Back</button>
            {orders.map((order) => (
                <div className="order-card" key={order._id}>
                    {/* ---------- HEADER ---------- */}
                    <div className="order-top">
                        <div>
                            <h3>Order #{order._id.slice(-6)}</h3>
                            <p>
                                <strong>Date:</strong>{" "}
                                {new Date(order.createdAt).toLocaleDateString()}
                            </p>
                            <p>
                                <strong>Status:</strong>{" "}
                                <span className={`status ${order.status}`}>
                                    {order.status}
                                </span>
                            </p>
                            <p>
                                <strong>Total:</strong> ₹{order.totalPrice}
                            </p>
                        </div>
                        <div style={{ display: "none" }}>
                            <Invoice order={order} company={company} />
                        </div>
                        <div className="order-actions">
                            <button
                                onClick={() => printInvoice(order._id, company)}
                                title="Print Invoice"
                            >
                                <FaPrint />
                            </button>



                            <button
                                className="danger"
                                onClick={() => handleDelete(order._id)}
                                title="Delete Order"
                            >
                                <FaTrash />
                            </button>
                        </div>
                    </div>

                    {/* ---------- PROGRESS ---------- */}
                    <div className="order-progress">
                        {["Order Placed", "Shipped", "Delivered"].map((step) => (
                            <span
                                key={step}
                                className={`step ${order.status === step ? "active" : ""
                                    }`}
                            >
                                {step}
                            </span>
                        ))}
                    </div>

                    {/* ---------- ITEMS ---------- */}
                    <div className="order-items">
                        <h4>Items</h4>

                        {order.items?.length ? (
                            <ul>
                                {order.items.map((item, idx) => (
                                    <li key={idx} className="item">
                                        <img src={item.image} alt={item.name} />
                                        <div>
                                            <p>
                                                <strong>{item.name}</strong>
                                            </p>
                                            <p>Qty: {item.quantity}</p>
                                            <p>Price: ₹{item.price}</p>
                                            <p>Total: ₹{item.quantity * item.price}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p>No items in this order.</p>
                        )}
                    </div>

                    {/* ---------- SHIPPING ---------- */}
                    <div className="shipping-details">
                        <h4>Shipping Details</h4>
                        <p>
                            <strong>Address:</strong> {order.address}
                        </p>
                        <p>
                            <strong>Phone:</strong> {order.phone}
                        </p>
                        <p>
                            <strong>Delivery Date:</strong>{" "}
                            {new Date(order.deliveryDate).toLocaleDateString()}
                        </p>

                        <button
                            className="print-slip"
                            onClick={() => printShippingSlip(order)}
                        >
                            Print Shipping Slip
                        </button>
                    </div>

                    {/* ---------- INVOICE COMPONENT ---------- */}
                    <Invoice order={order} company={company} />
                </div>
            ))}
        </div>
    );
};

export default OrderPage;
