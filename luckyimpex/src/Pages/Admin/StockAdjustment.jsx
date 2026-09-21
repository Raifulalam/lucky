import React, { useState, useEffect } from "react";
import {  Package, Warehouse, Save } from "lucide-react";
import { authRequest, getData } from "../../api/api";
import "./StockOperations.css";

const StockAdjustment = () => {
    const [products, setProducts] = useState([]);
    const [warehouses, setWarehouses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [formData, setFormData] = useState({
        productId: "",
        locationId: "",
        adjustmentType: "PHYSICAL_COUNT",
        currentQuantity: "",
        adjustedQuantity: "",
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const currentQty = parseInt(formData.currentQuantity);
            const adjustedQty = parseInt(formData.adjustedQuantity);
            const difference = adjustedQty - currentQty;

            const payload = {
                ...formData,
                currentQuantity: currentQty,
                adjustedQuantity: adjustedQty,
                difference
            };

            await authRequest("/inventory/adjustment", {
                method: "POST",
                body: payload
            });

            alert("Stock adjustment recorded successfully!");
            setFormData({
                productId: "",
                locationId: "",
                adjustmentType: "PHYSICAL_COUNT",
                currentQuantity: "",
                adjustedQuantity: "",
                reason: "",
                notes: ""
            });
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
                    <h1>Stock Adjustment</h1>
                    <p className="subtitle">Correct inventory discrepancies</p>
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
                                onChange={handleInputChange}
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
                            <label>Adjustment Type</label>
                            <select
                                name="adjustmentType"
                                value={formData.adjustmentType}
                                onChange={handleInputChange}
                            >
                                <option value="PHYSICAL_COUNT">Physical Count</option>
                                <option value="DAMAGED">Damaged</option>
                                <option value="MISSING">Missing</option>
                                <option value="FOUND">Found</option>
                                <option value="DATA_CORRECTION">Data Correction</option>
                                <option value="OTHER">Other</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Current Quantity</label>
                            <input
                                type="number"
                                name="currentQuantity"
                                value={formData.currentQuantity}
                                onChange={handleInputChange}
                                min="0"
                                required
                                placeholder="Current system quantity"
                            />
                        </div>

                        <div className="form-group">
                            <label>Adjusted Quantity</label>
                            <input
                                type="number"
                                name="adjustedQuantity"
                                value={formData.adjustedQuantity}
                                onChange={handleInputChange}
                                min="0"
                                required
                                placeholder="Actual physical quantity"
                            />
                        </div>

                        <div className="form-group">
                            <label>Reason</label>
                            <input
                                type="text"
                                name="reason"
                                value={formData.reason}
                                onChange={handleInputChange}
                                placeholder="Reason for adjustment"
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
                            placeholder="Add detailed notes..."
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
                            {loading ? "Processing..." : "Record Adjustment"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default StockAdjustment;
