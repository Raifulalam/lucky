import React, { useState, useEffect } from "react";
import { ArrowRightLeft, Plus, Check, Send, Package, Warehouse, Save } from "lucide-react";
import { authRequest, getData } from "../../api/api";
import "./StockTransfer.css";

const StockTransfer = () => {
    const [products, setProducts] = useState([]);
    const [warehouses, setWarehouses] = useState([]);
    const [transfers, setTransfers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);

    const [formData, setFormData] = useState({
        fromLocationId: "",
        toLocationId: "",
        items: [{ productId: "", quantity: "", serialNumbers: [""] }],
        notes: ""
    });

    useEffect(() => {
        fetchProducts();
        fetchWarehouses();
        fetchTransfers();
    }, []);

    const fetchProducts = async () => {
        try {
            const data = await getData("/products/products?page=1&limit=100");
            setProducts(data.products || []);
        } catch (err) {
            setError(err.message);
        }
    };

    const fetchWarehouses = async () => {
        try {
            const data = await authRequest("/inventory/warehouses");
            setWarehouses(data.data || []);
        } catch (err) {
            console.error("Failed to fetch warehouses:", err);
        }
    };

    const fetchTransfers = async () => {
        try {
            const data = await authRequest("/inventory/transfers");
            setTransfers(data.data || []);
        } catch (err) {
            console.error("Failed to fetch transfers:", err);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleItemChange = (index, field, value) => {
        const newItems = [...formData.items];
        newItems[index][field] = value;
        setFormData(prev => ({ ...prev, items: newItems }));
    };

    const handleSerialNumberChange = (itemIndex, snIndex, value) => {
        const newItems = [...formData.items];
        newItems[itemIndex].serialNumbers[snIndex] = value;
        setFormData(prev => ({ ...prev, items: newItems }));
    };

    const addItem = () => {
        setFormData(prev => ({
            ...prev,
            items: [...prev.items, { productId: "", quantity: "", serialNumbers: [""] }]
        }));
    };

    const removeItem = (index) => {
        const newItems = formData.items.filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, items: newItems }));
    };

    const addSerialNumber = (itemIndex) => {
        const newItems = [...formData.items];
        newItems[itemIndex].serialNumbers.push("");
        setFormData(prev => ({ ...prev, items: newItems }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const payload = {
                ...formData,
                items: formData.items.map(item => ({
                    ...item,
                    quantity: parseInt(item.quantity),
                    serialNumbers: item.serialNumbers.filter(sn => sn.trim() !== "")
                }))
            };

            await authRequest("/inventory/transfers", {
                method: "POST",
                body: payload
            });

            alert("Transfer request created successfully!");
            setShowForm(false);
            setFormData({
                fromLocationId: "",
                toLocationId: "",
                items: [{ productId: "", quantity: "", serialNumbers: [""] }],
                notes: ""
            });
            fetchTransfers();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (transferId) => {
        try {
            await authRequest(`/inventory/transfers/${transferId}/approve`, {
                method: "PUT"
            });
            alert("Transfer approved!");
            fetchTransfers();
        } catch (err) {
            alert("Error: " + err.message);
        }
    };

    const handleDispatch = async (transferId) => {
        try {
            await authRequest(`/inventory/transfers/${transferId}/dispatch`, {
                method: "PUT"
            });
            alert("Transfer dispatched!");
            fetchTransfers();
        } catch (err) {
            alert("Error: " + err.message);
        }
    };

    const handleReceive = async (transferId) => {
        try {
            await authRequest(`/inventory/transfers/${transferId}/receive`, {
                method: "PUT"
            });
            alert("Transfer received!");
            fetchTransfers();
        } catch (err) {
            alert("Error: " + err.message);
        }
    };

    const getStatusBadge = (status) => {
        const colors = {
            DRAFT: "gray",
            REQUESTED: "blue",
            APPROVED: "green",
            IN_TRANSIT: "orange",
            RECEIVED: "green",
            CANCELLED: "red"
        };
        return colors[status] || "gray";
    };

    return (
        <div className="stock-transfer">
            <div className="page-header">
                <div className="header-left">
                    <h1>Stock Transfer</h1>
                    <p className="subtitle">Transfer inventory between locations</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
                    <Plus size={18} />
                    {showForm ? "Cancel" : "New Transfer"}
                </button>
            </div>

            {showForm && (
                <div className="form-container">
                    <form onSubmit={handleSubmit} className="transfer-form">
                        <div className="form-grid">
                            <div className="form-group">
                                <label>
                                    <Warehouse size={16} />
                                    From Location
                                </label>
                                <select
                                    name="fromLocationId"
                                    value={formData.fromLocationId}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="">Select Source</option>
                                    {warehouses.map(warehouse => (
                                        <option key={warehouse._id} value={warehouse._id}>
                                            {warehouse.name} ({warehouse.code})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>
                                    <Warehouse size={16} />
                                    To Location
                                </label>
                                <select
                                    name="toLocationId"
                                    value={formData.toLocationId}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="">Select Destination</option>
                                    {warehouses.map(warehouse => (
                                        <option key={warehouse._id} value={warehouse._id}>
                                            {warehouse.name} ({warehouse.code})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="items-section">
                            <h3>Items to Transfer</h3>
                            {formData.items.map((item, itemIndex) => (
                                <div key={itemIndex} className="item-row">
                                    <div className="item-header">
                                        <span>Item {itemIndex + 1}</span>
                                        {formData.items.length > 1 && (
                                            <button
                                                type="button"
                                                className="btn-icon btn-danger"
                                                onClick={() => removeItem(itemIndex)}
                                            >
                                                ×
                                            </button>
                                        )}
                                    </div>
                                    <div className="form-grid">
                                        <div className="form-group">
                                            <label>Product</label>
                                            <select
                                                value={item.productId}
                                                onChange={(e) => handleItemChange(itemIndex, "productId", e.target.value)}
                                                required
                                            >
                                                <option value="">Select Product</option>
                                                {products.map(product => (
                                                    <option key={product._id} value={product._id}>
                                                        {product.name} - {product.model}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label>Quantity</label>
                                            <input
                                                type="number"
                                                value={item.quantity}
                                                onChange={(e) => handleItemChange(itemIndex, "quantity", e.target.value)}
                                                min="1"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="serial-numbers">
                                        <label>Serial Numbers (Optional)</label>
                                        {item.serialNumbers.map((sn, snIndex) => (
                                            <div key={snIndex} className="serial-row">
                                                <input
                                                    type="text"
                                                    value={sn}
                                                    onChange={(e) => handleSerialNumberChange(itemIndex, snIndex, e.target.value)}
                                                    placeholder="Serial number"
                                                />
                                            </div>
                                        ))}
                                        <button
                                            type="button"
                                            className="btn btn-secondary btn-sm"
                                            onClick={() => addSerialNumber(itemIndex)}
                                        >
                                            <Plus size={14} />
                                            Add Serial Number
                                        </button>
                                    </div>
                                </div>
                            ))}
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={addItem}
                            >
                                <Plus size={16} />
                                Add Item
                            </button>
                        </div>

                        <div className="form-group full-width">
                            <label>Notes</label>
                            <textarea
                                name="notes"
                                value={formData.notes}
                                onChange={handleInputChange}
                                rows={3}
                                placeholder="Add any notes..."
                            />
                        </div>

                        {error && <div className="error-message">{error}</div>}

                        <div className="form-actions">
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={loading}
                            >
                                <Save size={18} />
                                {loading ? "Processing..." : "Create Transfer"}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="transfers-list">
                <h2>Transfer History</h2>
                {transfers.length === 0 ? (
                    <div className="empty-state">
                        <ArrowRightLeft size={48} />
                        <p>No transfers found</p>
                    </div>
                ) : (
                    <div className="transfers-grid">
                        {transfers.map(transfer => (
                            <div key={transfer._id} className="transfer-card">
                                <div className="transfer-header">
                                    <span className="transfer-number">{transfer.transferNumber}</span>
                                    <span className={`status-badge status-${getStatusBadge(transfer.status)}`}>
                                        {transfer.status}
                                    </span>
                                </div>
                                <div className="transfer-route">
                                    <span>{transfer.fromLocationId?.name || "Unknown"}</span>
                                    <ArrowRightLeft size={16} />
                                    <span>{transfer.toLocationId?.name || "Unknown"}</span>
                                </div>
                                <div className="transfer-items">
                                    {transfer.items.map((item, i) => (
                                        <div key={i} className="transfer-item">
                                            <Package size={14} />
                                            <span>{item.productId?.name || "Unknown"} × {item.quantity}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="transfer-actions">
                                    {transfer.status === "REQUESTED" && (
                                        <button
                                            className="btn btn-sm btn-success"
                                            onClick={() => handleApprove(transfer._id)}
                                        >
                                            <Check size={14} />
                                            Approve
                                        </button>
                                    )}
                                    {transfer.status === "APPROVED" && (
                                        <button
                                            className="btn btn-sm btn-primary"
                                            onClick={() => handleDispatch(transfer._id)}
                                        >
                                            <Send size={14} />
                                            Dispatch
                                        </button>
                                    )}
                                    {transfer.status === "IN_TRANSIT" && (
                                        <button
                                            className="btn btn-sm btn-success"
                                            onClick={() => handleReceive(transfer._id)}
                                        >
                                            <Check size={14} />
                                            Receive
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default StockTransfer;
