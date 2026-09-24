import React, { useState, useEffect } from "react";
import { 
    Package, TrendingUp, AlertTriangle, DollarSign, 
    ArrowDown, ArrowUp, Plus, Minus, ArrowRightLeft, 
    Settings, BarChart3, RefreshCw 
} from "lucide-react";
import { motion } from "framer-motion";
import { authRequest } from "../../api/api";
import socket from "../../socket";
import "./InventoryDashboard.css";

const InventoryDashboard = () => {
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedPeriod, setSelectedPeriod] = useState("today");

    useEffect(() => {
        fetchSummary();

        // Socket listener for real-time updates
        socket.on("inventoryUpdated", (data) => {
            fetchSummary();
        });

        return () => {
            socket.off("inventoryUpdated");
        };
    }, []);

    const fetchSummary = async () => {
        setLoading(true);
        try {
            const data = await authRequest("/inventory/summary");
            setSummary(data.data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const StatCard = ({ title, value, icon: Icon, color, trend, subtext }) => (
        <motion.div
            className={`stat-card stat-card-${color}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <div className="stat-icon">
                <Icon size={24} />
            </div>
            <div className="stat-content">
                <p className="stat-label">{title}</p>
                <p className="stat-value">{value}</p>
                {subtext && <p className="stat-subtext">{subtext}</p>}
                {trend && (
                    <div className={`stat-trend ${trend > 0 ? "positive" : "negative"}`}>
                        {trend > 0 ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                        <span>{Math.abs(trend)}%</span>
                    </div>
                )}
            </div>
        </motion.div>
    );

    const QuickAction = ({ title, icon: Icon, color, onClick }) => (
        <motion.button
            className={`quick-action quick-action-${color}`}
            onClick={onClick}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
        >
            <Icon size={20} />
            <span>{title}</span>
        </motion.button>
    );

    if (loading) {
        return (
            <div className="inventory-dashboard">
                <div className="loading-state">
                    <RefreshCw className="spinner" size={40} />
                    <p>Loading inventory dashboard...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="inventory-dashboard">
                <div className="error-state">
                    <AlertTriangle size={40} />
                    <p>Error: {error}</p>
                    <button onClick={fetchSummary}>Retry</button>
                </div>
            </div>
        );
    }

    return (
        <div className="inventory-dashboard">
            {/* Header */}
            <div className="dashboard-header">
                <div className="header-left">
                    <h1>Inventory Dashboard</h1>
                    <p className="subtitle">Overview of your inventory status and performance</p>
                </div>
                <div className="header-actions">
                    <select 
                        value={selectedPeriod} 
                        onChange={(e) => setSelectedPeriod(e.target.value)}
                        className="period-select"
                    >
                        <option value="today">Today</option>
                        <option value="week">This Week</option>
                        <option value="month">This Month</option>
                        <option value="year">This Year</option>
                    </select>
                    <button className="btn btn-secondary" onClick={fetchSummary}>
                        <RefreshCw size={18} />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="stats-grid">
                <StatCard
                    title="Total Products"
                    value={summary?.totalProducts || 0}
                    icon={Package}
                    color="blue"
                    subtext="Active SKUs"
                />
                <StatCard
                    title="Total Stock"
                    value={summary?.totalStock || 0}
                    icon={TrendingUp}
                    color="green"
                    subtext="Units in inventory"
                />
                <StatCard
                    title="Inventory Value"
                    value={`Rs ${(summary?.totalValue || 0).toLocaleString()}`}
                    icon={DollarSign}
                    color="purple"
                    subtext="Total valuation"
                />
                <StatCard
                    title="Low Stock"
                    value={summary?.lowStock || 0}
                    icon={AlertTriangle}
                    color="orange"
                    subtext="Items below reorder level"
                />
                <StatCard
                    title="Out of Stock"
                    value={summary?.outOfStock || 0}
                    icon={AlertTriangle}
                    color="red"
                    subtext="Items with zero stock"
                />
            </div>

            {/* Quick Actions */}
            <div className="quick-actions-section">
                <h2>Quick Actions</h2>
                <div className="quick-actions-grid">
                    <QuickAction
                        title="Excel Grid Spreadsheet"
                        icon={Package}
                        color="blue"
                        onClick={() => window.location.href = "/admin/inventory"}
                    />
                    <QuickAction
                        title="Stock In"
                        icon={Plus}
                        color="green"
                        onClick={() => window.location.href = "/admin/inventory/stock-in"}
                    />
                    <QuickAction
                        title="Stock Out"
                        icon={Minus}
                        color="red"
                        onClick={() => window.location.href = "/admin/inventory/stock-out"}
                    />
                    <QuickAction
                        title="Stock Transfer"
                        icon={ArrowRightLeft}
                        color="blue"
                        onClick={() => window.location.href = "/admin/inventory/transfer"}
                    />
                    <QuickAction
                        title="Stock Adjustment"
                        icon={Settings}
                        color="orange"
                        onClick={() => window.location.href = "/admin/inventory/adjustment"}
                    />
                    <QuickAction
                        title="Low Stock Report"
                        icon={AlertTriangle}
                        color="orange"
                        onClick={() => window.location.href = "/admin/inventory/low-stock"}
                    />
                    <QuickAction
                        title="Inventory Reports"
                        icon={BarChart3}
                        color="purple"
                        onClick={() => window.location.href = "/admin/inventory/reports"}
                    />
                </div>
            </div>

            {/* Charts Section */}
            <div className="charts-section">
                <div className="chart-card">
                    <h3>Stock Movement</h3>
                    <div className="chart-placeholder">
                        <BarChart3 size={48} />
                        <p>Stock In vs Stock Out chart</p>
                    </div>
                </div>
                <div className="chart-card">
                    <h3>Inventory by Category</h3>
                    <div className="chart-placeholder">
                        <BarChart3 size={48} />
                        <p>Category-wise distribution</p>
                    </div>
                </div>
                <div className="chart-card">
                    <h3>Top Moving Products</h3>
                    <div className="chart-placeholder">
                        <BarChart3 size={48} />
                        <p>Fastest selling items</p>
                    </div>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="recent-activity-section">
                <h2>Recent Activity</h2>
                <div className="activity-list">
                    <div className="activity-item">
                        <div className="activity-icon activity-icon-green">
                            <Plus size={16} />
                        </div>
                        <div className="activity-content">
                            <p className="activity-title">Stock received for LG Refrigerator</p>
                            <p className="activity-time">2 hours ago</p>
                        </div>
                    </div>
                    <div className="activity-item">
                        <div className="activity-icon activity-icon-red">
                            <Minus size={16} />
                        </div>
                        <div className="activity-content">
                            <p className="activity-title">Stock issued for Samsung TV</p>
                            <p className="activity-time">3 hours ago</p>
                        </div>
                    </div>
                    <div className="activity-item">
                        <div className="activity-icon activity-icon-blue">
                            <ArrowRightLeft size={16} />
                        </div>
                        <div className="activity-content">
                            <p className="activity-title">Transfer from Warehouse to Main Showroom</p>
                            <p className="activity-time">5 hours ago</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InventoryDashboard;
