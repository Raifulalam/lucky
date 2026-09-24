import React, { useState, useEffect, useRef, useCallback } from "react";
import {
    ArrowRightLeft, Plus, Check, Send, Package, Warehouse,
    Save, Search, X, RefreshCw, ChevronDown, ChevronUp,
    AlertTriangle,
} from "lucide-react";
import { authRequest, getData } from "../../api/api";
import "./StockTransfer.css";

// ─── Warehouse Stock Card ────────────────────────────────────────────────────
const WarehouseStockCard = ({ data, onTransferFrom }) => {
    const [expanded, setExpanded] = useState(true);
    const [search, setSearch] = useState("");

    const filtered = data.items.filter(item => {
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        return (
            item.name?.toLowerCase().includes(q) ||
            item.model?.toLowerCase().includes(q) ||
            item.brand?.toLowerCase().includes(q)
        );
    });

    return (
        <div className="wh-card">
            <div className="wh-card-header" onClick={() => setExpanded(v => !v)}>
                <div className="wh-card-title">
                    <Warehouse size={18} className="wh-icon" />
                    <div>
                        <h3>{data.warehouse.name}</h3>
                        <span className="wh-code">{data.warehouse.code}</span>
                    </div>
                </div>
                <div className="wh-stats">
                    <div className="wh-stat">
                        <span className="stat-val">{data.totalItems}</span>
                        <span className="stat-lbl">Products</span>
                    </div>
                    <div className="wh-stat">
                        <span className="stat-val">{data.totalStock}</span>
                        <span className="stat-lbl">Total Stock</span>
                    </div>
                    {data.lowStockCount > 0 && (
                        <div className="wh-stat warn">
                            <AlertTriangle size={14} />
                            <span className="stat-lbl">{data.lowStockCount} low</span>
                        </div>
                    )}
                    {data.outOfStockCount > 0 && (
                        <div className="wh-stat danger">
                            <span className="stat-lbl">{data.outOfStockCount} out</span>
                        </div>
                    )}
                    <button
                        className="btn btn-primary btn-sm"
                        onClick={e => { e.stopPropagation(); onTransferFrom(data.warehouse); }}
                    >
                        <ArrowRightLeft size={13} /> Transfer From
                    </button>
                    {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </div>
            </div>

            {expanded && (
                <div className="wh-card-body">
                    {/* Per-warehouse search */}
                    <div className="wh-search-wrap">
                        <Search size={14} className="wh-search-icon" />
                        <input
                            className="wh-search-input"
                            type="text"
                            placeholder={`Search stock in ${data.warehouse.name}...`}
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            onClick={e => e.stopPropagation()}
                        />
                        {search && (
                            <button className="wh-search-clear" onClick={e => { e.stopPropagation(); setSearch(""); }}>
                                <X size={12} />
                            </button>
                        )}
                    </div>

                    {filtered.length === 0 ? (
                        <div className="wh-empty">
                            <Package size={24} />
                            <p>{search ? "No products match your search" : "No stock in this warehouse"}</p>
                        </div>
                    ) : (
                        <table className="wh-stock-table">
                            <thead>
                                <tr>
                                    <th>Product</th>
                                    <th>Model</th>
                                    <th>Brand</th>
                                    <th>Stock</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map(item => {
                                    const isOut = item.currentStock === 0;
                                    const isLow = !isOut && item.currentStock <= item.reorderLevel;
                                    return (
                                        <tr key={item.inventoryId} className="wh-stock-row">
                                            <td>
                                                <div className="wh-pname">
                                                    {item.image
                                                        ? <img src={item.image} alt={item.name} className="wh-thumb" />
                                                        : <div className="wh-thumb-ph"><Package size={12} /></div>
                                                    }
                                                    <span>{item.name}</span>
                                                </div>
                                            </td>
                                            <td><code className="model-chip">{item.model || "—"}</code></td>
                                            <td><span className="brand-chip">{item.brand || "—"}</span></td>
                                            <td>
                                                <span className={`wh-qty ${isOut ? "qty-out" : isLow ? "qty-low" : "qty-ok"}`}>
                                                    {item.currentStock}
                                                </span>
                                            </td>
                                            <td>
                                                {isOut
                                                    ? <span className="st-badge st-out">Out of Stock</span>
                                                    : isLow
                                                        ? <span className="st-badge st-low">Low Stock</span>
                                                        : <span className="st-badge st-ok">In Stock</span>
                                                }
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            )}
        </div>
    );
};

// ─── Main StockTransfer Component ───────────────────────────────────────────
const StockTransfer = () => {
    const [activeTab, setActiveTab] = useState("warehouse"); // "warehouse" | "transfers"
    const [products, setProducts] = useState([]);
    const [warehouses, setWarehouses] = useState([]);
    const [transfers, setTransfers] = useState([]);
    const [warehouseStock, setWarehouseStock] = useState([]);
    const [globalSearch, setGlobalSearch] = useState("");
    const [debouncedGlobal, setDebouncedGlobal] = useState("");
    const [loading, setLoading] = useState(false);
    const [whLoading, setWhLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const debounceRef = useRef(null);

    const [formData, setFormData] = useState({
        fromLocationId: "",
        toLocationId: "",
        items: [{ productId: "", quantity: "", serialNumbers: [""] }],
        notes: ""
    });

    // Debounce global search
    useEffect(() => {
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => setDebouncedGlobal(globalSearch), 400);
        return () => clearTimeout(debounceRef.current);
    }, [globalSearch]);

    useEffect(() => {
        fetchProducts();
        fetchWarehouses();
        fetchTransfers();
    }, []);

    const fetchWarehouseStock = useCallback(async () => {
        setWhLoading(true);
        try {
            const params = new URLSearchParams();
            if (debouncedGlobal.trim()) params.set("search", debouncedGlobal.trim());
            const data = await authRequest(`/inventory/warehouses/stock?${params}`);
            setWarehouseStock(data.data || []);
        } catch (err) {
            console.error("Warehouse stock error:", err);
        } finally {
            setWhLoading(false);
        }
    }, [debouncedGlobal]);

    useEffect(() => {
        if (activeTab === "warehouse") fetchWarehouseStock();
    }, [activeTab, fetchWarehouseStock]);

    const fetchProducts = async () => {
        try {
            const data = await getData("/products/products?page=1&limit=200");
            setProducts(data.products || []);
        } catch (err) { console.error(err); }
    };

    const fetchWarehouses = async () => {
        try {
            const data = await authRequest("/inventory/warehouses");
            setWarehouses(data.data || []);
        } catch (err) { console.error(err); }
    };

    const fetchTransfers = async () => {
        try {
            const data = await authRequest("/inventory/transfers");
            setTransfers(data.data || []);
        } catch (err) { console.error(err); }
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

    const handleTransferFrom = (warehouse) => {
        setFormData(prev => ({ ...prev, fromLocationId: warehouse._id }));
        setShowForm(true);
        setActiveTab("transfers");
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
            await authRequest("/inventory/transfers", { method: "POST", body: payload });
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
            await authRequest(`/inventory/transfers/${transferId}/approve`, { method: "PUT" });
            fetchTransfers();
        } catch (err) { alert("Error: " + err.message); }
    };

    const handleDispatch = async (transferId) => {
        try {
            await authRequest(`/inventory/transfers/${transferId}/dispatch`, { method: "PUT" });
            fetchTransfers();
        } catch (err) { alert("Error: " + err.message); }
    };

    const handleReceive = async (transferId) => {
        try {
            await authRequest(`/inventory/transfers/${transferId}/receive`, { method: "PUT" });
            fetchTransfers();
        } catch (err) { alert("Error: " + err.message); }
    };

    const statusColor = (status) => ({
        DRAFT: "gray", REQUESTED: "blue", APPROVED: "green",
        IN_TRANSIT: "orange", RECEIVED: "green", CANCELLED: "red"
    }[status] || "gray");

    return (
        <div className="stock-transfer">
            {/* ── Page Header ── */}
            <div className="page-header">
                <div className="header-left">
                    <h1>Stock Transfer</h1>
                    <p className="subtitle">View warehouse stock and transfer inventory between locations</p>
                </div>
                <button className="btn btn-primary" onClick={() => { setShowForm(v => !v); setActiveTab("transfers"); }}>
                    <Plus size={18} /> {showForm ? "Cancel" : "New Transfer"}
                </button>
            </div>

            {/* ── Tabs ── */}
            <div className="transfer-tabs">
                <button
                    className={`tab-btn ${activeTab === "warehouse" ? "tab-active" : ""}`}
                    onClick={() => setActiveTab("warehouse")}
                >
                    <Warehouse size={16} /> Warehouse Stock
                </button>
                <button
                    className={`tab-btn ${activeTab === "transfers" ? "tab-active" : ""}`}
                    onClick={() => setActiveTab("transfers")}
                >
                    <ArrowRightLeft size={16} /> Transfer History
                    {transfers.filter(t => t.status === "REQUESTED").length > 0 && (
                        <span className="tab-badge">{transfers.filter(t => t.status === "REQUESTED").length}</span>
                    )}
                </button>
            </div>

            {/* ═══════════════════════════════════════
                TAB: WAREHOUSE STOCK VIEW
            ═══════════════════════════════════════ */}
            {activeTab === "warehouse" && (
                <div className="warehouse-stock-view">
                    {/* Global search across all warehouses */}
                    <div className="global-search-bar">
                        <div className="search-wrap">
                            <Search size={16} className="search-icon" />
                            <input
                                className="search-input"
                                type="text"
                                placeholder="Search across all warehouses by product name, model, or brand..."
                                value={globalSearch}
                                onChange={e => setGlobalSearch(e.target.value)}
                            />
                            {globalSearch && (
                                <button className="clear-btn" onClick={() => setGlobalSearch("")}><X size={14} /></button>
                            )}
                        </div>
                        <button className="btn btn-ghost btn-sm" onClick={fetchWarehouseStock} title="Refresh">
                            <RefreshCw size={15} className={whLoading ? "spin" : ""} />
                        </button>
                    </div>

                    {whLoading ? (
                        <div className="loading-state">
                            <RefreshCw size={32} className="spin" />
                            <p>Loading warehouse stock...</p>
                        </div>
                    ) : warehouseStock.length === 0 ? (
                        <div className="empty-state">
                            <Warehouse size={48} />
                            <p>No warehouses found</p>
                        </div>
                    ) : (
                        <div className="warehouse-cards">
                            {warehouseStock.map(whData => (
                                <WarehouseStockCard
                                    key={whData.warehouse._id}
                                    data={whData}
                                    onTransferFrom={handleTransferFrom}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* ═══════════════════════════════════════
                TAB: TRANSFER HISTORY + FORM
            ═══════════════════════════════════════ */}
            {activeTab === "transfers" && (
                <>
                    {/* New Transfer Form */}
                    {showForm && (
                        <div className="form-container">
                            <form onSubmit={handleSubmit} className="transfer-form">
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label><Warehouse size={16} /> From Location</label>
                                        <select name="fromLocationId" value={formData.fromLocationId} onChange={handleInputChange} required>
                                            <option value="">Select Source</option>
                                            {warehouses.map(w => (
                                                <option key={w._id} value={w._id}>{w.name} ({w.code})</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label><Warehouse size={16} /> To Location</label>
                                        <select name="toLocationId" value={formData.toLocationId} onChange={handleInputChange} required>
                                            <option value="">Select Destination</option>
                                            {warehouses.map(w => (
                                                <option key={w._id} value={w._id}>{w.name} ({w.code})</option>
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
                                                    <button type="button" className="btn-icon btn-danger" onClick={() => removeItem(itemIndex)}>×</button>
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
                                                        {products.map(p => (
                                                            <option key={p._id} value={p._id}>{p.name} — {p.model}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div className="form-group">
                                                    <label>Quantity</label>
                                                    <input
                                                        type="number"
                                                        value={item.quantity}
                                                        onChange={(e) => handleItemChange(itemIndex, "quantity", e.target.value)}
                                                        min="1" required
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
                                                <button type="button" className="btn btn-secondary btn-sm"
                                                    onClick={() => {
                                                        const newItems = [...formData.items];
                                                        newItems[itemIndex].serialNumbers.push("");
                                                        setFormData(p => ({ ...p, items: newItems }));
                                                    }}>
                                                    <Plus size={14} /> Add Serial Number
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    <button type="button" className="btn btn-secondary" onClick={addItem}>
                                        <Plus size={16} /> Add Item
                                    </button>
                                </div>

                                <div className="form-group full-width">
                                    <label>Notes</label>
                                    <textarea name="notes" value={formData.notes} onChange={handleInputChange} rows={3} placeholder="Add any notes..." />
                                </div>

                                {error && <div className="error-message">{error}</div>}

                                <div className="form-actions">
                                    <button type="submit" className="btn btn-primary" disabled={loading}>
                                        {loading ? <RefreshCw size={16} className="spin" /> : <Save size={18} />}
                                        {loading ? "Processing..." : "Create Transfer"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Transfer History */}
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
                                            <span className={`status-badge status-${statusColor(transfer.status)}`}>
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
                                                <button className="btn btn-sm btn-success" onClick={() => handleApprove(transfer._id)}>
                                                    <Check size={14} /> Approve
                                                </button>
                                            )}
                                            {transfer.status === "APPROVED" && (
                                                <button className="btn btn-sm btn-primary" onClick={() => handleDispatch(transfer._id)}>
                                                    <Send size={14} /> Dispatch
                                                </button>
                                            )}
                                            {transfer.status === "IN_TRANSIT" && (
                                                <button className="btn btn-sm btn-success" onClick={() => handleReceive(transfer._id)}>
                                                    <Check size={14} /> Receive
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default StockTransfer;
