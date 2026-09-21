import React, { useState, useEffect } from "react";
import { Search, Package, RefreshCw } from "lucide-react";
import { authRequest, getData } from "../../api/api";
import "./SerialNumberManagement.css";

const SerialNumberManagement = () => {
    const [serialNumbers, setSerialNumbers] = useState([]);
    const [products, setProducts] = useState([]);
    const [warehouses, setWarehouses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [filters, setFilters] = useState({
        productId: "",
        status: "",
        locationId: ""
    });

    const [searchTerm, setSearchTerm] = useState("");

useEffect(() => {
    const fetchSerialNumbers = async () => {
        setLoading(true);

        try {
            const params = new URLSearchParams();

            if (filters.productId) {
                params.append("productId", filters.productId);
            }

            if (filters.status) {
                params.append("status", filters.status);
            }

            if (filters.locationId) {
                params.append("locationId", filters.locationId);
            }

            const data = await authRequest(
                `/inventory/serial-numbers?${params.toString()}`
            );

            setSerialNumbers(data.data || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    fetchSerialNumbers();
    fetchProducts();
    fetchWarehouses();
}, [filters]);
    const fetchProducts = async () => {
        try {
            const data = await getData("/products/products?page=1&limit=100");
            setProducts(data.products || []);
        } catch (err) {
            console.error("Failed to fetch products:", err);
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

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const getStatusBadge = (status) => {
        const colors = {
            IN_STOCK: "green",
            RESERVED: "blue",
            SOLD: "purple",
            RETURNED: "orange",
            DAMAGED: "red",
            WARRANTY: "yellow",
            TRANSFERRED: "gray"
        };
        return colors[status] || "gray";
    };

    const filteredSerialNumbers = serialNumbers.filter(sn =>
        sn.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (sn.model && sn.model.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (loading) {
        return (
            <div className="serial-number-management">
                <div className="loading-state">
                    <RefreshCw className="spinner" size={40} />
                    <p>Loading serial numbers...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="serial-number-management">
            <div className="page-header">
                <div className="header-left">
                    <h1>Serial Number Management</h1>
                    <p className="subtitle">Track individual product serial numbers</p>
                </div>
            </div>

            <div className="filters-bar">
                <div className="search-box">
                    <Search size={18} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search serial numbers..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="filter-group">
                    <select
                        name="productId"
                        value={filters.productId}
                        onChange={handleFilterChange}
                    >
                        <option value="">All Products</option>
                        {products.map(product => (
                            <option key={product._id} value={product._id}>
                                {product.name} - {product.model}
                            </option>
                        ))}
                    </select>
                    <select
                        name="status"
                        value={filters.status}
                        onChange={handleFilterChange}
                    >
                        <option value="">All Status</option>
                        <option value="IN_STOCK">In Stock</option>
                        <option value="RESERVED">Reserved</option>
                        <option value="SOLD">Sold</option>
                        <option value="RETURNED">Returned</option>
                        <option value="DAMAGED">Damaged</option>
                        <option value="WARRANTY">Warranty</option>
                        <option value="TRANSFERRED">Transferred</option>
                    </select>
                    <select
                        name="locationId"
                        value={filters.locationId}
                        onChange={handleFilterChange}
                    >
                        <option value="">All Locations</option>
                        {warehouses.map(warehouse => (
                            <option key={warehouse._id} value={warehouse._id}>
                                {warehouse.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="table-container">
                <table className="serial-table">
                    <thead>
                        <tr>
                            <th>Serial Number</th>
                            <th>Product</th>
                            <th>Model</th>
                            <th>Location</th>
                            <th>Status</th>
                            <th>Purchase Date</th>
                            <th>Sale Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredSerialNumbers.length > 0 ? (
                            filteredSerialNumbers.map(sn => (
                                <tr key={sn._id}>
                                    <td className="serial-cell">{sn.serialNumber}</td>
                                    <td>{sn.productId?.name || "-"}</td>
                                    <td>{sn.model || "-"}</td>
                                    <td>{sn.currentLocationId?.name || "-"}</td>
                                    <td>
                                        <span className={`status-badge status-${getStatusBadge(sn.status)}`}>
                                            {sn.status}
                                        </span>
                                    </td>
                                    <td>
                                        {sn.purchaseDate 
                                            ? new Date(sn.purchaseDate).toLocaleDateString() 
                                            : "-"}
                                    </td>
                                    <td>
                                        {sn.saleDate 
                                            ? new Date(sn.saleDate).toLocaleDateString() 
                                            : "-"}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7" className="no-data">
                                    <Package size={48} />
                                    <p>No serial numbers found</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {error && <div className="error-message">{error}</div>}
        </div>
    );
};

export default SerialNumberManagement;
