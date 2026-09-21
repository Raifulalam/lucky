import React, { useState, useEffect } from "react";
import { Minus, Package, Warehouse, Save, User } from "lucide-react";
import { authRequest, getData } from "../../api/api";
import "./StockOperations.css";

const StockOut = () => {
    const [products, setProducts] = useState([]);
    const [warehouses, setWarehouses] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [formData, setFormData] = useState({
        productId: "",
        locationId: "",
        quantity: "",
        referenceType: "MANUAL",
        referenceId: "",
        serialNumber: "",
        reason: "",
        notes: ""
    });

    useEffect(() => {
        fetchProducts();
        fetchWarehouses();
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

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleProductChange = (e) => {
        const productId = e.target.value;
        const product = products.find(p => p._id === productId);
        setSelectedProduct(product);
        setFormData(prev => ({ ...prev, productId }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const payload = {
                ...formData,
                quantity: parseInt(formData.quantity),
                serialNumber: formData.serialNumber || undefined
            };

            await authRequest("/inventory/stock-out", {
                method: "POST",
                body: payload
            });

            alert("Stock issued successfully!");
            setFormData({
                productId: "",
                locationId: "",
                quantity: "",
                referenceType: "MANUAL",
                referenceId: "",
                serialNumber: "",
                reason: "",
                notes: ""
            });
            setSelectedProduct(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="stock-operations">
            <div className="page-header">
                <div className="header-left">
                    <h1>Stock Out</h1>
                    <p className="subtitle">Issue inventory from your warehouse</p>
                </div>
            </div>

            <div className="form-container">
                <form onSubmit={handleSubmit} className="stock-form">
                    <div className="form-grid">
                        <div className="form-group">
                            <label>
                                <Package size={16} />
                                Product
                            </label>
                            <select
                                name="productId"
                                value={formData.productId}
                                onChange={handleProductChange}
                                required
                            >
                                <option value="">Select Product</option>
                                {products.map(product => (
                                    <option key={product._id} value={product._id}>
                                        {product.name} - {product.model} - {product.brand}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label>
                                <Warehouse size={16} />
                                Location
                            </label>
                            <select
                                name="locationId"
                                value={formData.locationId}
                                onChange={handleInputChange}
                                required
                            >
                                <option value="">Select Location</option>
                                {warehouses.map(warehouse => (
                                    <option key={warehouse._id} value={warehouse._id}>
                                        {warehouse.name} ({warehouse.code})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label>
                                <Package size={16} />
                                Quantity
                            </label>
                            <input
                                type="number"
                                name="quantity"
                                value={formData.quantity}
                                onChange={handleInputChange}
                                min="1"
                                required
                                placeholder="Enter quantity"
                            />
                        </div>

                        <div className="form-group">
                            <label>Reference Type</label>
                            <select
                                name="referenceType"
                                value={formData.referenceType}
                                onChange={handleInputChange}
                            >
                                <option value="MANUAL">Manual Issue</option>
                                <option value="SALE">Sale</option>
                                <option value="DAMAGE">Damaged</option>
                                <option value="INTERNAL">Internal Use</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Reference ID</label>
                            <input
                                type="text"
                                name="referenceId"
                                value={formData.referenceId}
                                onChange={handleInputChange}
                                placeholder="Reference number (optional)"
                            />
                        </div>

                        <div className="form-group">
                            <label>Serial Number</label>
                            <input
                                type="text"
                                name="serialNumber"
                                value={formData.serialNumber}
                                onChange={handleInputChange}
                                placeholder="Serial number (optional)"
                            />
                        </div>
                    </div>

                    <div className="form-grid">
                        <div className="form-group full-width">
                            <label>Reason</label>
                            <input
                                type="text"
                                name="reason"
                                value={formData.reason}
                                onChange={handleInputChange}
                                placeholder="Reason for stock out"
                            />
                        </div>
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
                            {loading ? "Processing..." : "Issue Stock"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default StockOut;
