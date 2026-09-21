import React, { useState, useEffect } from "react";
import { Plus, Search, Package, Warehouse, Save, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { authRequest, getData } from "../../api/api";
import "./StockOperations.css";

const StockIn = () => {
    const [products, setProducts] = useState([]);
    const [warehouses, setWarehouses] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [serialNumbers, setSerialNumbers] = useState([""]);

    const [formData, setFormData] = useState({
        productId: "",
        locationId: "",
        quantity: "",
        purchasePrice: "",
        referenceType: "MANUAL",
        referenceId: "",
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

    const handleSerialNumberChange = (index, value) => {
        const newSerialNumbers = [...serialNumbers];
        newSerialNumbers[index] = value;
        setSerialNumbers(newSerialNumbers);
    };

    const addSerialNumberField = () => {
        setSerialNumbers([...serialNumbers, ""]);
    };

    const removeSerialNumberField = (index) => {
        const newSerialNumbers = serialNumbers.filter((_, i) => i !== index);
        setSerialNumbers(newSerialNumbers);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const validSerialNumbers = serialNumbers.filter(sn => sn.trim() !== "");
            
            const payload = {
                ...formData,
                quantity: parseInt(formData.quantity),
                purchasePrice: formData.purchasePrice ? parseFloat(formData.purchasePrice) : undefined,
                serialNumbers: validSerialNumbers.length > 0 ? validSerialNumbers : undefined
            };

            await authRequest("/inventory/stock-in", {
                method: "POST",
                body: payload
            });

            alert("Stock added successfully!");
            setFormData({
                productId: "",
                locationId: "",
                quantity: "",
                purchasePrice: "",
                referenceType: "MANUAL",
                referenceId: "",
                notes: ""
            });
            setSerialNumbers([""]);
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
                    <h1>Stock In</h1>
                    <p className="subtitle">Add inventory to your warehouse</p>
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
                            <label>Purchase Price</label>
                            <input
                                type="number"
                                name="purchasePrice"
                                value={formData.purchasePrice}
                                onChange={handleInputChange}
                                min="0"
                                step="0.01"
                                placeholder="Enter purchase price"
                            />
                        </div>

                        <div className="form-group">
                            <label>Reference Type</label>
                            <select
                                name="referenceType"
                                value={formData.referenceType}
                                onChange={handleInputChange}
                            >
                                <option value="MANUAL">Manual Entry</option>
                                <option value="PURCHASE">Purchase Order</option>
                                <option value="RETURN">Customer Return</option>
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
                    </div>

                    {/* Serial Numbers Section */}
                    <div className="form-section">
                        <h3>Serial Numbers (Optional)</h3>
                        {serialNumbers.map((sn, index) => (
                            <div key={index} className="serial-number-row">
                                <input
                                    type="text"
                                    value={sn}
                                    onChange={(e) => handleSerialNumberChange(index, e.target.value)}
                                    placeholder="Enter serial number"
                                />
                                {serialNumbers.length > 1 && (
                                    <button
                                        type="button"
                                        className="btn-icon btn-danger"
                                        onClick={() => removeSerialNumberField(index)}
                                    >
                                        <X size={16} />
                                    </button>
                                )}
                            </div>
                        ))}
                        <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={addSerialNumberField}
                        >
                            <Plus size={16} />
                            Add Serial Number
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
                            {loading ? "Processing..." : "Add Stock"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default StockIn;
