import React, { useState, useEffect } from "react";
import { AlertTriangle, Package, RefreshCw, Download } from "lucide-react";
import { authRequest } from "../../api/api";
import "./LowStock.css";

const LowStock = () => {
    const [lowStock, setLowStock] = useState([]);
    const [outOfStock, setOutOfStock] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState("low");

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [lowData, outData] = await Promise.all([
                authRequest("/inventory/low-stock"),
                authRequest("/inventory/out-of-stock")
            ]);
            setLowStock(lowData.data || []);
            setOutOfStock(outData.data || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleExportCSV = () => {
        const data = activeTab === "low" ? lowStock : outOfStock;
        const headers = ["Product", "Model", "Brand", "Category", "Current Stock", "Reorder Level", "Status"];
        const csvContent = [
            headers.join(","),
            ...data.map(item => [
                `"${(item.productId?.name || "").replace(/"/g, '""')}"`,
                `"${(item.productId?.model || "").replace(/"/g, '""')}"`,
                `"${(item.productId?.brand || "").replace(/"/g, '""')}"`,
                `"${(item.productId?.category || "").replace(/"/g, '""')}"`,
                item.currentStock || 0,
                item.reorderLevel || 0,
                item.currentStock === 0 ? "Out of Stock" : "Low Stock"
            ].join(","))
        ].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `${activeTab}-stock-report-${new Date().toISOString().split("T")[0]}.csv`;
        link.click();
    };

    if (loading) {
        return (
            <div className="low-stock">
                <div className="loading-state">
                    <RefreshCw className="spinner" size={40} />
                    <p>Loading stock data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="low-stock">
            <div className="page-header">
                <div className="header-left">
                    <h1>Low Stock Alerts</h1>
                    <p className="subtitle">Products that need attention</p>
                </div>
                <button className="btn btn-secondary" onClick={handleExportCSV}>
                    <Download size={18} />
                    Export CSV
                </button>
            </div>

            <div className="tabs">
                <button
                    className={`tab ${activeTab === "low" ? "active" : ""}`}
                    onClick={() => setActiveTab("low")}
                >
                    <AlertTriangle size={18} />
                    Low Stock ({lowStock.length})
                </button>
                <button
                    className={`tab ${activeTab === "out" ? "active" : ""}`}
                    onClick={() => setActiveTab("out")}
                >
                    <Package size={18} />
                    Out of Stock ({outOfStock.length})
                </button>
            </div>

            <div className="table-container">
                <table className="stock-table">
                    <thead>
                        <tr>
                            <th>Product</th>
                            <th>Model</th>
                            <th>Brand</th>
                            <th>Category</th>
                            <th>Current Stock</th>
                            <th>Reorder Level</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {(activeTab === "low" ? lowStock : outOfStock).length > 0 ? (
                            (activeTab === "low" ? lowStock : outOfStock).map(item => (
                                <tr key={item._id}>
                                    <td className="product-cell">
                                        {item.productId?.name || "Unknown"}
                                    </td>
                                    <td>{item.productId?.model || "-"}</td>
                                    <td>{item.productId?.brand || "-"}</td>
                                    <td>{item.productId?.category || "-"}</td>
                                    <td className="stock-cell">
                                        <span className="stock-value">{item.currentStock || 0}</span>
                                    </td>
                                    <td>{item.reorderLevel || 0}</td>
                                    <td>
                                        <span className={`status-badge ${item.currentStock === 0 ? "out" : "low"}`}>
                                            {item.currentStock === 0 ? "Out of Stock" : "Low Stock"}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7" className="no-data">
                                    <AlertTriangle size={48} />
                                    <p>No {activeTab === "low" ? "low stock" : "out of stock"} items found</p>
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

export default LowStock;
