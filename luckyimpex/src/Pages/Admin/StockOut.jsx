import React, { useState, useEffect } from "react";
import { Package, Warehouse, Save } from "lucide-react";
import { authRequest, getData } from "../../api/api";
import "./StockOperations.css";

const StockOut = () => {
    const [products, setProducts] = useState([]);
    const [warehouses, setWarehouses] = useState([]);
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

    // Fetch products and warehouses when component loads
    useEffect(() => {
        fetchProducts();
        fetchWarehouses();
    }, []);

    // Fetch products
    const fetchProducts = async () => {
        try {
            const data = await getData(
                "/products/products?page=1&limit=100"
            );

            setProducts(data.products || []);
        } catch (err) {
            console.error("Failed to fetch products:", err);

            setError(
                err.message || "Failed to fetch products."
            );
        }
    };

    // Fetch warehouses
    const fetchWarehouses = async () => {
        try {
            const data = await authRequest(
                "/inventory/warehouses"
            );

            setWarehouses(data.data || []);
        } catch (err) {
            console.error(
                "Failed to fetch warehouses:",
                err
            );
        }
    };

    // Handle normal input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    // Handle product selection
    const handleProductChange = (e) => {
        const productId = e.target.value;

        setFormData((prev) => ({
            ...prev,
            productId
        }));
    };

    // Submit stock-out request
    const handleSubmit = async (e) => {
        e.preventDefault();

        setLoading(true);
        setError(null);

        try {
            // Validate product
            if (!formData.productId) {
                throw new Error(
                    "Please select a product."
                );
            }

            // Validate location
            if (!formData.locationId) {
                throw new Error(
                    "Please select a location."
                );
            }

            // Validate quantity
            const quantity = Number(formData.quantity);

            if (
                !Number.isInteger(quantity) ||
                quantity <= 0
            ) {
                throw new Error(
                    "Please enter a valid quantity."
                );
            }

            // Create payload
            const payload = {
                productId: formData.productId,
                locationId: formData.locationId,
                quantity,
                referenceType: formData.referenceType,
                serialNumber:
                    formData.serialNumber?.trim() || undefined,
                reason:
                    formData.reason?.trim() || undefined,
                notes:
                    formData.notes?.trim() || undefined
            };

            /*
             * Only send referenceId if the user actually
             * entered a value.
             *
             * This prevents sending:
             *
             * referenceId: ""
             *
             * which can cause MongoDB ObjectId errors.
             */
            if (formData.referenceId?.trim()) {
                payload.referenceId =
                    formData.referenceId.trim();
            }

            console.log(
                "Stock Out Payload:",
                payload
            );

            // Send request
            await authRequest(
                "/inventory/stock-out",
                {
                    method: "POST",
                    body: payload
                }
            );

            // Success message
            alert(
                "Stock issued successfully!"
            );

            // Reset form
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

        } catch (err) {
            console.error(
                "Stock out error:",
                err
            );

            setError(
                err.message ||
                "Failed to issue stock."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="stock-operations">

            {/* Page Header */}
            <div className="page-header">
                <div className="header-left">
                    <h1>Stock Out</h1>

                    <p className="subtitle">
                        Issue inventory from your warehouse
                    </p>
                </div>
            </div>

            {/* Form Container */}
            <div className="form-container">

                <form
                    onSubmit={handleSubmit}
                    className="stock-form"
                >

                    {/* First Row */}
                    <div className="form-grid">

                        {/* Product */}
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
                                <option value="">
                                    Select Product
                                </option>

                                {products.map((product) => (
                                    <option
                                        key={product._id}
                                        value={product._id}
                                    >
                                        {product.name}
                                        {product.model
                                            ? ` - ${product.model}`
                                            : ""}
                                        {product.brand
                                            ? ` - ${product.brand}`
                                            : ""}
                                    </option>
                                ))}
                            </select>

                        </div>

                        {/* Location */}
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
                                <option value="">
                                    Select Location
                                </option>

                                {warehouses.map(
                                    (warehouse) => (
                                        <option
                                            key={warehouse._id}
                                            value={warehouse._id}
                                        >
                                            {warehouse.name}
                                            {warehouse.code
                                                ? ` (${warehouse.code})`
                                                : ""}
                                        </option>
                                    )
                                )}
                            </select>

                        </div>

                        {/* Quantity */}
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
                                step="1"
                                required
                                placeholder="Enter quantity"
                            />

                        </div>

                        {/* Reference Type */}
                        <div className="form-group">

                            <label>
                                Reference Type
                            </label>

                            <select
                                name="referenceType"
                                value={formData.referenceType}
                                onChange={handleInputChange}
                            >
                                <option value="MANUAL">
                                    Manual Issue
                                </option>

                                <option value="SALE">
                                    Sale
                                </option>

                                <option value="DAMAGE">
                                    Damaged
                                </option>

                                <option value="INTERNAL">
                                    Internal Use
                                </option>
                            </select>

                        </div>

                        {/* Reference ID */}
                        <div className="form-group">

                            <label>
                                Reference ID
                            </label>

                            <input
                                type="text"
                                name="referenceId"
                                value={formData.referenceId}
                                onChange={handleInputChange}
                                placeholder="Reference ID (optional)"
                            />

                        </div>

                        {/* Serial Number */}
                        <div className="form-group">

                            <label>
                                Serial Number
                            </label>

                            <input
                                type="text"
                                name="serialNumber"
                                value={formData.serialNumber}
                                onChange={handleInputChange}
                                placeholder="Serial number (optional)"
                            />

                        </div>

                    </div>

                    {/* Reason */}
                    <div className="form-grid">

                        <div className="form-group full-width">

                            <label>
                                Reason
                            </label>

                            <input
                                type="text"
                                name="reason"
                                value={formData.reason}
                                onChange={handleInputChange}
                                placeholder="Reason for stock out"
                            />

                        </div>

                    </div>

                    {/* Notes */}
                    <div className="form-group full-width">

                        <label>
                            Notes
                        </label>

                        <textarea
                            name="notes"
                            value={formData.notes}
                            onChange={handleInputChange}
                            rows={3}
                            placeholder="Add any notes..."
                        />

                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="error-message">
                            {error}
                        </div>
                    )}

                    {/* Submit Button */}
                    <div className="form-actions">

                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={loading}
                        >
                            <Save size={18} />

                            {loading
                                ? "Processing..."
                                : "Issue Stock"}
                        </button>

                    </div>

                </form>

            </div>

        </div>
    );
};

export default StockOut;

