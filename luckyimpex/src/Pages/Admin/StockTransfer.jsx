import React, { useState, useEffect, useRef, useCallback } from "react";
import {
    ArrowRightLeft, Plus, Check, Send, Package, Warehouse,
    Save, Search, X, RefreshCw, ChevronDown, ChevronUp,
    AlertTriangle, BarChart3, Layers, CheckCircle2, AlertCircle
} from "lucide-react";
import { authRequest, getData } from "../../api/api";
import "./StockTransfer.css";

// ─── Image Hover Preview Component ───────────────────────────────────────────
const ImageHoverPreview = ({ src, name, onClose }) => {
    if (!src) return null;
    return (
        <div className="img-preview-modal-backdrop" onClick={onClose}>
            <div className="img-preview-modal-content" onClick={e => e.stopPropagation()}>
                <button className="img-preview-close" onClick={onClose}><X size={18} /></button>
                <div className="img-preview-body">
                    <img src={src} alt={name || "Product"} className="img-full-view" />
                    {name && <span className="img-preview-title">{name}</span>}
                </div>
            </div>
        </div>
    );
};

// ─── Warehouse Stock Card Component ──────────────────────────────────────────
const WarehouseStockCard = ({ data, onTransferFrom, density, onPreviewImage }) => {
    const [expanded, setExpanded] = useState(true);
    const [search, setSearch] = useState("");
    const [hoverImg, setHoverImg] = useState(null);

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
        <div className={`wh-card density-${density}`}>
            <div className="wh-card-header" onClick={() => setExpanded(v => !v)}>
                <div className="wh-card-title">
                    <Warehouse size={20} className="wh-icon" />
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
                            <span className="stat-lbl">{data.lowStockCount} Low</span>
                        </div>
                    )}
                    {data.outOfStockCount > 0 && (
                        <div className="wh-stat danger">
                            <span className="stat-lbl">{data.outOfStockCount} Out</span>
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
                            placeholder={`Search stock in ${data.warehouse.name} by name or Model No...`}
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
                        <div className="wh-table-container">
                            <table className="wh-stock-table">
                                <thead>
                                    <tr>
                                        <th style={{ width: "60px" }}>Image</th>
                                        <th>Product Name</th>
                                        <th>Model / SKU</th>
                                        <th>Brand</th>
                                        <th>Stock Qty</th>
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
                                                    <div
                                                        className="wh-thumb-wrapper"
                                                        onMouseEnter={() => item.image && setHoverImg({ src: item.image, name: item.name })}
                                                        onMouseLeave={() => setHoverImg(null)}
                                                        onClick={() => item.image && onPreviewImage(item.image, item.name)}
                                                    >
                                                        {item.image ? (
                                                            <img src={item.image} alt={item.name} className="wh-thumb" />
                                                        ) : (
                                                            <div className="wh-thumb-ph"><Package size={14} /></div>
                                                        )}
                                                        {hoverImg?.src === item.image && (
                                                            <div className="hover-zoom-preview">
                                                                <img src={item.image} alt={item.name} />
                                                                <span>Click for full view</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className="wh-pname-text">{item.name}</span>
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
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

// ─── Main StockTransfer Component ───────────────────────────────────────────
const StockTransfer = () => {
    const [activeTab, setActiveTab] = useState("warehouse"); // "warehouse" | "transfers" | "reports"
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

    // Table view controls
    const [density, setDensity] = useState("comfortable"); // "compact" | "comfortable" | "expanded"
    const [modalImage, setModalImage] = useState(null);

    const debounceRef = useRef(null);

    const [formData, setFormData] = useState({
        fromLocationId: "",
        toLocationId: "",
        items: [{ productId: "", quantity: "", serialNumbers: [""], modelSearch: "" }],
        notes: ""
    });

    // Validation state
    const [validationErrors, setValidationErrors] = useState({});

    // Debounce global search
    useEffect(() => {
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => setDebouncedGlobal(globalSearch), 400);
        return () => clearTimeout(debounceRef.current);
    }, [globalSearch]);

    // Fetch initial data
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
        if (activeTab === "warehouse" || activeTab === "reports" || showForm) {
            fetchWarehouseStock();
        }
    }, [activeTab, showForm, fetchWarehouseStock]);

    const fetchProducts = async () => {
        try {
            const data = await getData("/products/products?page=1&limit=300");
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

    // Find available stock for a product in selected source warehouse
    const getAvailableStockInSource = (productId, fromWarehouseId) => {
        if (!productId || !fromWarehouseId) return null;
        const whData = warehouseStock.find(w => w.warehouse._id === fromWarehouseId);
        if (!whData) return null;
        const item = whData.items.find(i => (i.productId?._id || i.productId) === productId);
        return item ? item.currentStock : 0;
    };

    // Get list of products available ONLY in selected source warehouse with currentStock > 0
    const getAvailableProductsForSource = (fromWarehouseId, modelSearchQuery = "") => {
        if (!fromWarehouseId) return [];

        const whData = warehouseStock.find(w => w.warehouse._id === fromWarehouseId);
        let availableList = [];

        if (whData && whData.items) {
            availableList = whData.items
                .filter(i => (i.currentStock || 0) > 0)
                .map(i => ({
                    _id: i.productId?._id || i.productId,
                    name: i.name,
                    model: i.model || "",
                    brand: i.brand || "",
                    stock: i.currentStock
                }));
        } else {
            // Fallback to products if stock state is still loading
            availableList = products.map(p => ({
                _id: p._id,
                name: p.name,
                model: p.model || "",
                brand: p.brand || "",
                stock: Number(p.stock) || 0
            })).filter(p => p.stock > 0);
        }

        if (modelSearchQuery.trim()) {
            const q = modelSearchQuery.toLowerCase().trim();
            availableList = availableList.filter(p =>
                p.name.toLowerCase().includes(q) ||
                p.model.toLowerCase().includes(q) ||
                p.brand.toLowerCase().includes(q)
            );
        }

        return availableList;
    };

    // Validate stock transfer form items
    const validateForm = (updatedFormData) => {
        const errors = {};
        const { fromLocationId, toLocationId, items } = updatedFormData;

        if (fromLocationId && toLocationId && fromLocationId === toLocationId) {
            errors.location = "Source and Destination locations cannot be the same.";
        }

        items.forEach((item, index) => {
            if (item.productId) {
                const available = getAvailableStockInSource(item.productId, fromLocationId);
                const qty = parseInt(item.quantity, 10);

                if (isNaN(qty) || qty <= 0) {
                    errors[`item_${index}`] = "Quantity must be greater than 0";
                } else if (available !== null && qty > available) {
                    errors[`item_${index}`] = `Cannot transfer ${qty} units. Only ${available} available in source warehouse.`;
                }
            }
        });

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        const newFormData = { ...formData, [name]: value };
        setFormData(newFormData);
        validateForm(newFormData);
    };

    const handleItemChange = (index, field, value) => {
        const newItems = [...formData.items];
        newItems[index][field] = value;
        const newFormData = { ...formData, items: newItems };
        setFormData(newFormData);
        validateForm(newFormData);
    };

    const handleSerialNumberChange = (itemIndex, snIndex, value) => {
        const newItems = [...formData.items];
        newItems[itemIndex].serialNumbers[snIndex] = value;
        setFormData(prev => ({ ...prev, items: newItems }));
    };

    const addItem = () => {
        setFormData(prev => ({
            ...prev,
            items: [...prev.items, { productId: "", quantity: "", serialNumbers: [""], modelSearch: "" }]
        }));
    };

    const removeItem = (index) => {
        const newItems = formData.items.filter((_, i) => i !== index);
        const newFormData = { ...formData, items: newItems };
        setFormData(newFormData);
        validateForm(newFormData);
    };

    const handleTransferFrom = (warehouse) => {
        const newFormData = { ...formData, fromLocationId: warehouse._id };
        setFormData(newFormData);
        validateForm(newFormData);
        setShowForm(true);
        setActiveTab("transfers");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm(formData)) {
            setError("Please resolve form validation errors before creating the transfer.");
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const payload = {
                ...formData,
                items: formData.items.map(item => ({
                    productId: item.productId,
                    quantity: parseInt(item.quantity, 10),
                    serialNumbers: item.serialNumbers.filter(sn => sn.trim() !== "")
                }))
            };
            await authRequest("/inventory/transfers", { method: "POST", body: payload });
            alert("Stock transfer request created successfully!");
            setShowForm(false);
            setFormData({
                fromLocationId: "",
                toLocationId: "",
                items: [{ productId: "", quantity: "", serialNumbers: [""], modelSearch: "" }],
                notes: ""
            });
            setValidationErrors({});
            fetchTransfers();
            fetchWarehouseStock();
        } catch (err) {
            setError(err.message || "Failed to create transfer");
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (transferId) => {
        try {
            await authRequest(`/inventory/transfers/${transferId}/approve`, { method: "PUT" });
            fetchTransfers();
            fetchWarehouseStock();
        } catch (err) { alert("Error: " + err.message); }
    };

    const handleDispatch = async (transferId) => {
        try {
            await authRequest(`/inventory/transfers/${transferId}/dispatch`, { method: "PUT" });
            fetchTransfers();
            fetchWarehouseStock();
        } catch (err) { alert("Error: " + err.message); }
    };

    const handleReceive = async (transferId) => {
        try {
            await authRequest(`/inventory/transfers/${transferId}/receive`, { method: "PUT" });
            fetchTransfers();
            fetchWarehouseStock();
        } catch (err) { alert("Error: " + err.message); }
    };

    const statusColor = (status) => ({
        DRAFT: "gray", REQUESTED: "blue", APPROVED: "green",
        IN_TRANSIT: "orange", RECEIVED: "green", CANCELLED: "red"
    }[status] || "gray");

    // Compute report analytics
    const reportData = React.useMemo(() => {
        let totalItems = 0;
        let totalQty = 0;
        let lowStockCount = 0;
        let outOfStockCount = 0;
        const productMap = {};

        warehouseStock.forEach(whData => {
            whData.items.forEach(item => {
                totalQty += item.currentStock || 0;
                if (item.currentStock === 0) outOfStockCount++;
                else if (item.currentStock <= item.reorderLevel) lowStockCount++;

                const key = item.productId?._id || item.productId || item.name;
                if (!productMap[key]) {
                    productMap[key] = {
                        name: item.name,
                        model: item.model,
                        brand: item.brand,
                        image: item.image,
                        stocks: {}
                    };
                    totalItems++;
                }
                productMap[key].stocks[whData.warehouse.name] = item.currentStock;
            });
        });

        return { totalItems, totalQty, lowStockCount, outOfStockCount, productMap };
    }, [warehouseStock]);

    return (
        <div className="stock-transfer">
            {/* Modal preview image */}
            {modalImage && (
                <ImageHoverPreview
                    src={modalImage.src}
                    name={modalImage.name}
                    onClose={() => setModalImage(null)}
                />
            )}

            {/* ── Page Header ── */}
            <div className="page-header">
                <div className="header-left">
                    <h1>Systematic Inventory & Stock Transfers</h1>
                    <p className="subtitle">Real-time warehouse stock, side-by-side comparison, and controlled stock transfers</p>
                </div>
                <div className="header-actions">
                    <button className="btn btn-primary" onClick={() => { setShowForm(v => !v); setActiveTab("transfers"); }}>
                        <Plus size={18} /> {showForm ? "Cancel Form" : "New Transfer"}
                    </button>
                </div>
            </div>

            {/* ── Tabs & Density Control Bar ── */}
            <div className="transfer-toolbar">
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
                    <button
                        className={`tab-btn ${activeTab === "reports" ? "tab-active" : ""}`}
                        onClick={() => setActiveTab("reports")}
                    >
                        <BarChart3 size={16} /> Stock Comparison & Report
                    </button>
                </div>

                {activeTab === "warehouse" && (
                    <div className="density-toggle">
                        <span className="density-label"><Layers size={14} /> Density:</span>
                        <button
                            className={`density-btn ${density === "compact" ? "active" : ""}`}
                            onClick={() => setDensity("compact")}
                        >Compact</button>
                        <button
                            className={`density-btn ${density === "comfortable" ? "active" : ""}`}
                            onClick={() => setDensity("comfortable")}
                        >Normal</button>
                        <button
                            className={`density-btn ${density === "expanded" ? "active" : ""}`}
                            onClick={() => setDensity("expanded")}
                        >Spacious</button>
                    </div>
                )}
            </div>

            {/* ═══════════════════════════════════════
                TAB 1: WAREHOUSE STOCK VIEW
            ═══════════════════════════════════════ */}
            {activeTab === "warehouse" && (
                <div className="warehouse-stock-view">
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
                        <button className="btn btn-ghost btn-sm" onClick={fetchWarehouseStock} title="Refresh Stock">
                            <RefreshCw size={15} className={whLoading ? "spin" : ""} />
                        </button>
                    </div>

                    {whLoading ? (
                        <div className="loading-state">
                            <RefreshCw size={32} className="spin" />
                            <p>Loading warehouse stock data...</p>
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
                                    density={density}
                                    onTransferFrom={handleTransferFrom}
                                    onPreviewImage={(src, name) => setModalImage({ src, name })}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* ═══════════════════════════════════════
                TAB 2: TRANSFER HISTORY + VALIDATED FORM
            ═══════════════════════════════════════ */}
            {activeTab === "transfers" && (
                <>
                    {showForm && (
                        <div className="form-container">
                            <div className="form-header-title">
                                <h2>Create Stock Transfer Request</h2>
                                <p>Transfer stock safely with instant source availability & model search</p>
                            </div>
                            <form onSubmit={handleSubmit} className="transfer-form">
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label><Warehouse size={16} /> From Source Warehouse (A)</label>
                                        <select
                                            name="fromLocationId"
                                            value={formData.fromLocationId}
                                            onChange={handleInputChange}
                                            required
                                        >
                                            <option value="">Select Source Warehouse A</option>
                                            {warehouses.map(w => (
                                                <option key={w._id} value={w._id}>{w.name} ({w.code})</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label><Warehouse size={16} /> To Destination Warehouse (B)</label>
                                        <select
                                            name="toLocationId"
                                            value={formData.toLocationId}
                                            onChange={handleInputChange}
                                            required
                                        >
                                            <option value="">Select Destination Warehouse B</option>
                                            {warehouses.map(w => (
                                                <option key={w._id} value={w._id}>{w.name} ({w.code})</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {validationErrors.location && (
                                    <div className="validation-alert danger">
                                        <AlertTriangle size={16} /> {validationErrors.location}
                                    </div>
                                )}

                                <div className="items-section">
                                    <h3>Items to Transfer (Available in Source A)</h3>
                                    {formData.items.map((item, itemIndex) => {
                                        const available = getAvailableStockInSource(item.productId, formData.fromLocationId);
                                        const itemError = validationErrors[`item_${itemIndex}`];
                                        const availableProducts = getAvailableProductsForSource(formData.fromLocationId, item.modelSearch || "");

                                        return (
                                            <div key={itemIndex} className={`item-row ${itemError ? "has-error" : ""}`}>
                                                <div className="item-header">
                                                    <span>Item #{itemIndex + 1}</span>
                                                    {formData.items.length > 1 && (
                                                        <button type="button" className="btn-icon btn-danger" onClick={() => removeItem(itemIndex)}>×</button>
                                                    )}
                                                </div>

                                                {/* Filter by Model No / Name Search Input */}
                                                <div className="form-group">
                                                    <label><Search size={14} /> Filter Products by Model No or Name</label>
                                                    <input
                                                        type="text"
                                                        placeholder="Type Model No or product name to filter list..."
                                                        value={item.modelSearch || ""}
                                                        onChange={(e) => handleItemChange(itemIndex, "modelSearch", e.target.value)}
                                                        disabled={!formData.fromLocationId}
                                                    />
                                                </div>

                                                <div className="form-grid">
                                                    <div className="form-group">
                                                        <label>Product (Only items available in Source A)</label>
                                                        <select
                                                            value={item.productId}
                                                            onChange={(e) => handleItemChange(itemIndex, "productId", e.target.value)}
                                                            disabled={!formData.fromLocationId}
                                                            required
                                                        >
                                                            {!formData.fromLocationId ? (
                                                                <option value="">⚠️ Select Source Warehouse A first</option>
                                                            ) : availableProducts.length === 0 ? (
                                                                <option value="">No available products match in Source A</option>
                                                            ) : (
                                                                <>
                                                                    <option value="">Select Available Product ({availableProducts.length} items)...</option>
                                                                    {availableProducts.map(p => (
                                                                        <option key={p._id} value={p._id}>
                                                                            {p.name} — Model: {p.model || "N/A"} (Stock: {p.stock} units)
                                                                        </option>
                                                                    ))}
                                                                </>
                                                            )}
                                                        </select>
                                                        {formData.fromLocationId && item.productId && available !== null && (
                                                            <span className={`stock-hint ${available === 0 ? "out" : available <= 5 ? "low" : "ok"}`}>
                                                                Available in Source A: <strong>{available} units</strong>
                                                            </span>
                                                        )}
                                                    </div>

                                                    <div className="form-group">
                                                        <label>Quantity to Transfer</label>
                                                        <input
                                                            type="number"
                                                            value={item.quantity}
                                                            onChange={(e) => handleItemChange(itemIndex, "quantity", e.target.value)}
                                                            min="1"
                                                            max={available !== null && available > 0 ? available : undefined}
                                                            placeholder="Enter quantity"
                                                            required
                                                        />
                                                        {itemError && (
                                                            <span className="validation-error-text">
                                                                <AlertCircle size={13} /> {itemError}
                                                            </span>
                                                        )}
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
                                                                placeholder="Enter item serial number"
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
                                        );
                                    })}
                                    <button type="button" className="btn btn-secondary" onClick={addItem}>
                                        <Plus size={16} /> Add Another Item
                                    </button>
                                </div>

                                <div className="form-group full-width">
                                    <label>Notes / Reason</label>
                                    <textarea name="notes" value={formData.notes} onChange={handleInputChange} rows={3} placeholder="Add transfer rationale or tracking notes..." />
                                </div>

                                {error && <div className="error-message">{error}</div>}

                                <div className="form-actions">
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={loading || Object.keys(validationErrors).length > 0}
                                    >
                                        {loading ? <RefreshCw size={16} className="spin" /> : <Save size={18} />}
                                        {loading ? "Creating..." : "Submit Transfer Request"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    <div className="transfers-list">
                        <h2>Transfer History & Tracking</h2>
                        {transfers.length === 0 ? (
                            <div className="empty-state">
                                <ArrowRightLeft size={48} />
                                <p>No stock transfer records found</p>
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
                                                    <span>{item.productId?.name || "Product"} × {item.quantity}</span>
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

            {/* ═══════════════════════════════════════
                TAB 3: STOCK COMPARISON & REPORT VIEW
            ═══════════════════════════════════════ */}
            {activeTab === "reports" && (
                <div className="reports-view">
                    {/* Key Inventory Metrics Summary */}
                    <div className="report-summary-cards">
                        <div className="rep-card">
                            <div className="rep-icon icon-blue"><Package size={22} /></div>
                            <div>
                                <span className="rep-val">{reportData.totalItems}</span>
                                <span className="rep-lbl">Total Catalog Products</span>
                            </div>
                        </div>
                        <div className="rep-card">
                            <div className="rep-icon icon-green"><CheckCircle2 size={22} /></div>
                            <div>
                                <span className="rep-val">{reportData.totalQty}</span>
                                <span className="rep-lbl">Total Units in Stock</span>
                            </div>
                        </div>
                        <div className="rep-card">
                            <div className="rep-icon icon-amber"><AlertTriangle size={22} /></div>
                            <div>
                                <span className="rep-val">{reportData.lowStockCount}</span>
                                <span className="rep-lbl">Low Stock Alerts</span>
                            </div>
                        </div>
                        <div className="rep-card">
                            <div className="rep-icon icon-red"><AlertCircle size={22} /></div>
                            <div>
                                <span className="rep-val">{reportData.outOfStockCount}</span>
                                <span className="rep-lbl">Out of Stock Items</span>
                            </div>
                        </div>
                    </div>

                    {/* Warehouse Stock Comparison Table */}
                    <div className="comparison-card">
                        <div className="comp-card-header">
                            <h3><BarChart3 size={18} /> Warehouse Side-by-Side Stock Comparison</h3>
                            <span className="comp-subtitle">Compare inventory quantity across all physical locations</span>
                        </div>
                        <div className="wh-table-container">
                            <table className="comparison-table">
                                <thead>
                                    <tr>
                                        <th style={{ width: "50px" }}>Image</th>
                                        <th>Product Name</th>
                                        <th>Model / SKU</th>
                                        {warehouses.map(w => (
                                            <th key={w._id} className="th-center">{w.name} ({w.code})</th>
                                        ))}
                                        <th className="th-center">Total Stock</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Object.values(reportData.productMap).map((prod, idx) => {
                                        let sumQty = 0;
                                        return (
                                            <tr key={idx} className="comp-row">
                                                <td>
                                                    <div
                                                        className="wh-thumb-wrapper"
                                                        onClick={() => prod.image && setModalImage({ src: prod.image, name: prod.name })}
                                                    >
                                                        {prod.image ? (
                                                            <img src={prod.image} alt={prod.name} className="wh-thumb" />
                                                        ) : (
                                                            <div className="wh-thumb-ph"><Package size={14} /></div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className="wh-pname-text">{prod.name}</span>
                                                </td>
                                                <td><code className="model-chip">{prod.model || "—"}</code></td>
                                                {warehouses.map(w => {
                                                    const qty = prod.stocks[w.name] || 0;
                                                    sumQty += qty;
                                                    return (
                                                        <td key={w._id} className="td-center">
                                                            <span className={`stock-cell-badge ${qty === 0 ? "zero" : qty <= 5 ? "low" : "ok"}`}>
                                                                {qty}
                                                            </span>
                                                        </td>
                                                    );
                                                })}
                                                <td className="td-center">
                                                    <strong className="total-stock-cell">{sumQty}</strong>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StockTransfer;
