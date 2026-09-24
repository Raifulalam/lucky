import React, {
    useState,
    useEffect,
    useMemo,
    useCallback,
    useRef
} from "react";

import {
    Search,
    Plus,
    Edit,
    Trash2,
    Package,
    TrendingUp,
    AlertCircle,
    Download,
    RefreshCw,
    X,
    Image as ImageIcon,
    Sliders,
    Columns,
    Save,
    RotateCcw,
    Grid
} from "lucide-react";

import "./InventoryManagement.css";

import {
    authRequest,
    getData
} from "../../api/api";

import socket from "../../socket";

const DEFAULT_COL_WIDTHS = {
    select: 48,
    image: 65,
    name: 240,
    category: 140,
    brand: 130,
    model: 130,
    capacity: 100,
    price: 110,
    mrp: 110,
    stock: 100,
    status: 120,
    actions: 90
};

const DEFAULT_VISIBLE_COLS = {
    select: true,
    image: true,
    name: true,
    category: true,
    brand: true,
    model: true,
    capacity: true,
    price: true,
    mrp: true,
    stock: true,
    status: true,
    actions: true
};

const InventoryManagement = () => {
    /* =========================================================
       STATE
    ========================================================= */
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [stockFilter, setStockFilter] = useState("all");

    const [sortConfig, setSortConfig] = useState({
        key: "name",
        direction: "asc"
    });

    const [selectedProducts, setSelectedProducts] = useState([]);
    const [categories, setCategories] = useState([]);

    const [pagination, setPagination] = useState({
        page: 1,
        limit: 50,
        total: 0,
        totalPages: 0
    });

    /* =========================================================
       EXCEL SPREADSHEET & ADJUSTABLE GRID STATE
    ========================================================= */
    const [colWidths, setColWidths] = useState(() => {
        const saved = localStorage.getItem("inventory_col_widths");
        return saved ? JSON.parse(saved) : DEFAULT_COL_WIDTHS;
    });

    const [visibleCols, setVisibleCols] = useState(() => {
        const saved = localStorage.getItem("inventory_visible_cols");
        return saved ? JSON.parse(saved) : DEFAULT_VISIBLE_COLS;
    });

    const [rowDensity, setRowDensity] = useState("comfortable"); // "compact" | "comfortable" | "expanded"
    const [rowHeightPx, setRowHeightPx] = useState(48);
    const [showColPicker, setShowColPicker] = useState(false);

    // Inline cell editing state: key = `${productId}_${field}`, val = edited value
    const [editingCell, setEditingCell] = useState(null); // { productId, field }
    const [dirtyEdits, setDirtyEdits] = useState({}); // { [productId]: { [field]: newValue } }
    const [savingBatch, setSavingBatch] = useState(false);

    // Drag column resize ref
    const resizingColRef = useRef(null);
    const startXRef = useRef(0);
    const startWidthRef = useRef(0);

    // Save column config to localStorage
    useEffect(() => {
        localStorage.setItem("inventory_col_widths", JSON.stringify(colWidths));
    }, [colWidths]);

    useEffect(() => {
        localStorage.setItem("inventory_visible_cols", JSON.stringify(visibleCols));
    }, [visibleCols]);

    // Update numeric row height based on density preset
    useEffect(() => {
        if (rowDensity === "compact") setRowHeightPx(36);
        else if (rowDensity === "comfortable") setRowHeightPx(48);
        else if (rowDensity === "expanded") setRowHeightPx(64);
    }, [rowDensity]);

    /* =========================================================
       COLUMN RESIZING HANDLERS
    ========================================================= */
    const handleMouseDownResize = (e, colKey) => {
        e.preventDefault();
        e.stopPropagation();
        resizingColRef.current = colKey;
        startXRef.current = e.clientX;
        startWidthRef.current = colWidths[colKey] || 100;

        const onMouseMove = (moveEvent) => {
            if (!resizingColRef.current) return;
            const delta = moveEvent.clientX - startXRef.current;
            const newW = Math.max(50, startWidthRef.current + delta);
            setColWidths(prev => ({ ...prev, [resizingColRef.current]: newW }));
        };

        const onMouseUp = () => {
            resizingColRef.current = null;
            document.removeEventListener("mousemove", onMouseMove);
            document.removeEventListener("mouseup", onMouseUp);
        };

        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup", onMouseUp);
    };

    const resetLayout = () => {
        setColWidths(DEFAULT_COL_WIDTHS);
        setVisibleCols(DEFAULT_VISIBLE_COLS);
        setRowDensity("comfortable");
    };

    /* =========================================================
       FETCH PRODUCTS
    ========================================================= */
    const fetchProducts = useCallback(async (page = 1) => {
        setLoading(true);
        setError(null);
        try {
            const data = await getData(
                `/products/products?page=${page}&limit=${pagination.limit}`
            );
            const fetchedProducts = data?.products || [];
            setProducts(fetchedProducts);
            setPagination(prev => ({
                ...prev,
                page: data?.page || page,
                total: data?.total || 0,
                totalPages: data?.pages || 1
            }));

            const uniqueCategories = new Set(
                fetchedProducts.map(product => product?.category).filter(Boolean)
            );
            setCategories(["all", ...Array.from(uniqueCategories)]);
        } catch (err) {
            console.error("Failed to fetch products:", err);
            setError(err?.message || "Failed to load products");
        } finally {
            setLoading(false);
        }
    }, [pagination.limit]);

    /* =========================================================
       SEARCH PRODUCTS
    ========================================================= */
    const searchProducts = useCallback(async (query) => {
        const trimmedQuery = query.trim();
        if (!trimmedQuery) {
            await fetchProducts(1);
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const url = `/products/products/search/${encodeURIComponent(trimmedQuery)}?page=1&limit=1000`;
            const data = await getData(url);
            const filteredResults = data?.products || [];

            setProducts(filteredResults);
            setPagination(prev => ({
                ...prev,
                page: 1,
                total: filteredResults.length,
                totalPages: 1
            }));
        } catch (err) {
            console.error("Product search failed:", err);
            setError(err?.message || "Product search failed");
        } finally {
            setLoading(false);
        }
    }, [fetchProducts]);

    useEffect(() => {
        fetchProducts(1);
    }, [fetchProducts]);

    /* =========================================================
       SOCKET.IO REAL-TIME UPDATES
    ========================================================= */
    useEffect(() => {
        const handleProductCreated = (product) => {
            if (!product?._id) return;
            setProducts(prev => {
                const alreadyExists = prev.some(item => item._id === product._id);
                return alreadyExists ? prev : [product, ...prev];
            });
        };

        const handleProductUpdated = (updatedProduct) => {
            if (!updatedProduct?._id) return;
            setProducts(prev =>
                prev.map(product => (product._id === updatedProduct._id ? updatedProduct : product))
            );
        };

        const handleProductDeleted = (productId) => {
            if (!productId) return;
            setProducts(prev => prev.filter(product => product._id !== productId));
        };

        socket.on("productCreated", handleProductCreated);
        socket.on("productUpdated", handleProductUpdated);
        socket.on("productDeleted", handleProductDeleted);

        return () => {
            socket.off("productCreated", handleProductCreated);
            socket.off("productUpdated", handleProductUpdated);
            socket.off("productDeleted", handleProductDeleted);
        };
    }, []);

    /* =========================================================
       DEBOUNCED SEARCH
    ========================================================= */
    useEffect(() => {
        const timer = setTimeout(() => {
            searchProducts(searchTerm);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm, searchProducts]);

    /* =========================================================
       STATISTICS & FILTERING
    ========================================================= */
    const stats = useMemo(() => {
        const totalProducts = products.length;
        const totalStock = products.reduce(
            (sum, product) => sum + (Number(product?.stock) || 0), 0
        );
        const lowStock = products.filter(product => {
            const stock = Number(product?.stock) || 0;
            return stock > 0 && stock < 10;
        }).length;
        const outOfStock = products.filter(product => (Number(product?.stock) || 0) === 0).length;

        return { totalProducts, totalStock, lowStock, outOfStock };
    }, [products]);

    const filteredProducts = useMemo(() => {
        let filtered = [...products];

        if (selectedCategory !== "all") {
            filtered = filtered.filter(product => product?.category === selectedCategory);
        }

        if (stockFilter !== "all") {
            if (stockFilter === "in") {
                filtered = filtered.filter(product => (Number(product?.stock) || 0) >= 10);
            } else if (stockFilter === "low") {
                filtered = filtered.filter(product => {
                    const stock = Number(product?.stock) || 0;
                    return stock > 0 && stock < 10;
                });
            } else if (stockFilter === "out") {
                filtered = filtered.filter(product => (Number(product?.stock) || 0) === 0);
            }
        }

        filtered.sort((a, b) => {
            let aValue = a[sortConfig.key];
            let bValue = b[sortConfig.key];
            if (typeof aValue === "string") aValue = aValue.toLowerCase();
            if (typeof bValue === "string") bValue = bValue.toLowerCase();
            if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
            if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
            return 0;
        });

        return filtered;
    }, [products, selectedCategory, stockFilter, sortConfig]);

    /* =========================================================
       SPREADSHEET CELL EDITING HANDLERS
    ========================================================= */
    const handleCellDoubleClick = (productId, field) => {
        setEditingCell({ productId, field });
    };

    const handleCellChange = (productId, field, value) => {
        setDirtyEdits(prev => ({
            ...prev,
            [productId]: {
                ...(prev[productId] || {}),
                [field]: value
            }
        }));
    };

    const getCellValue = (product, field) => {
        if (dirtyEdits[product._id] && dirtyEdits[product._id][field] !== undefined) {
            return dirtyEdits[product._id][field];
        }
        return product[field] ?? "";
    };

    const handleKeyDownCell = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            setEditingCell(null);
        } else if (e.key === "Escape") {
            setEditingCell(null);
        }
    };

    const handleSaveBatchEdits = async () => {
        const productIds = Object.keys(dirtyEdits);
        if (productIds.length === 0) return;

        setSavingBatch(true);
        try {
            for (const id of productIds) {
                const changes = dirtyEdits[id];
                if (Object.keys(changes).length > 0) {
                    await authRequest(`/products/products/${id}`, {
                        method: "PUT",
                        body: changes
                    });
                }
            }
            // Emit socket event to notify dashboard listeners
            socket.emit("inventoryUpdated", { timestamp: Date.now() });
            alert(`✅ Successfully updated ${productIds.length} products in inventory!`);
            setDirtyEdits({});
            fetchProducts(pagination.page);
        } catch (err) {
            console.error("Batch save error:", err);
            alert("Error saving spreadsheet changes: " + err.message);
        } finally {
            setSavingBatch(false);
        }
    };

    const handleDiscardBatchEdits = () => {
        setDirtyEdits({});
        setEditingCell(null);
    };

    /* =========================================================
       EXPORT CSV
    ========================================================= */
    const handleExportCSV = () => {
        if (filteredProducts.length === 0) {
            alert("No data available to export");
            return;
        }

        const headers = ["ID", "Name", "Category", "Brand", "Model", "Capacity", "Price (Rs)", "MRP (Rs)", "Stock", "Keywords", "Description"];
        const csvContent = [
            headers.join(","),
            ...filteredProducts.map(product => [
                `"${product?._id || ""}"`,
                `"${(product?.name || "").replace(/"/g, '""')}"`,
                `"${(product?.category || "").replace(/"/g, '""')}"`,
                `"${(product?.brand || "").replace(/"/g, '""')}"`,
                `"${(product?.model || "").replace(/"/g, '""')}"`,
                `"${(product?.capacity || "").replace(/"/g, '""')}"`,
                product?.price || 0,
                product?.mrp || 0,
                product?.stock || 0,
                `"${(product?.keywords?.join("; ") || "").replace(/"/g, '""')}"`,
                `"${(product?.description || "").replace(/\r?\n/g, " ").replace(/"/g, '""')}"`
            ].join(","))
        ].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `inventory-spreadsheet-${new Date().toISOString().split("T")[0]}.csv`;
        link.click();
        URL.revokeObjectURL(link.href);
    };

    /* =========================================================
       SELECTION & DELETE HANDLERS
    ========================================================= */
    const handleSelectAll = (checked) => {
        setSelectedProducts(checked ? filteredProducts.map(p => p._id) : []);
    };

    const handleSelectProduct = (productId) => {
        setSelectedProducts(prev =>
            prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]
        );
    };

    const handleDeleteProduct = async (product) => {
        if (!product?._id) return;
        if (!window.confirm(`Are you sure you want to delete ${product.name || "this product"}?`)) return;

        try {
            await authRequest(`/products/products/${product._id}`, { method: "DELETE" });
            setProducts(prev => prev.filter(p => p._id !== product._id));
            socket.emit("inventoryUpdated", { timestamp: Date.now() });
        } catch (err) {
            console.error("Delete failed:", err);
            setError(err?.message || "Failed to delete product");
        }
    };

    const handleBulkDelete = async () => {
        if (selectedProducts.length === 0) return;
        if (!window.confirm(`Are you sure you want to delete ${selectedProducts.length} selected products?`)) return;

        try {
            for (const id of selectedProducts) {
                await authRequest(`/products/products/${id}`, { method: "DELETE" });
            }
            setProducts(prev => prev.filter(p => !selectedProducts.includes(p._id)));
            setSelectedProducts([]);
            socket.emit("inventoryUpdated", { timestamp: Date.now() });
            alert("Selected products deleted successfully.");
        } catch (err) {
            alert("Failed to delete selected products: " + err.message);
        }
    };

    const dirtyCount = Object.keys(dirtyEdits).length;

    if (loading) {
        return (
            <div className="inventory-management">
                <div className="loading-state">
                    <RefreshCw className="spinner" size={40} />
                    <p>Loading spreadsheet inventory...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="inventory-management">
            {error && (
                <div className="error-state">
                    <AlertCircle size={32} />
                    <p>{error}</p>
                    <button className="btn btn-secondary btn-sm" onClick={() => fetchProducts(pagination.page)}>Retry</button>
                </div>
            )}

            {/* ── Statistics Bar ── */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon stat-icon-blue"><Package size={24} /></div>
                    <div className="stat-content">
                        <p className="stat-label">Total Products</p>
                        <p className="stat-value">{stats.totalProducts}</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon stat-icon-green"><TrendingUp size={24} /></div>
                    <div className="stat-content">
                        <p className="stat-label">Total Stock Units</p>
                        <p className="stat-value">{stats.totalStock}</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon stat-icon-orange"><AlertCircle size={24} /></div>
                    <div className="stat-content">
                        <p className="stat-label">Low Stock (&lt;10)</p>
                        <p className="stat-value">{stats.lowStock}</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon stat-icon-red"><AlertCircle size={24} /></div>
                    <div className="stat-content">
                        <p className="stat-label">Out of Stock</p>
                        <p className="stat-value">{stats.outOfStock}</p>
                    </div>
                </div>
            </div>

            {/* ── Page Header ── */}
            <div className="inventory-header">
                <div className="header-left">
                    <h1>Excel Spreadsheet Inventory Grid</h1>
                    <p className="subtitle">Adjust row heights, resize column widths, and edit cell values directly in-place</p>
                </div>
                <div className="header-actions">
                    <button className="btn btn-secondary" onClick={() => fetchProducts(pagination.page)}>
                        <RefreshCw size={18} /> Refresh
                    </button>
                    <button className="btn btn-secondary" onClick={handleExportCSV}>
                        <Download size={18} /> Export CSV
                    </button>
                </div>
            </div>

            {/* ── EXCEL CONTROL TOOLBAR (Density, Column Visibility, Column Resizing) ── */}
            <div className="excel-control-bar">
                <div className="excel-controls-left">
                    {/* Row Density Picker */}
                    <div className="ctrl-group">
                        <span className="ctrl-label"><Grid size={15} /> Row Height:</span>
                        <div className="density-buttons">
                            <button
                                className={`density-btn ${rowDensity === "compact" ? "active" : ""}`}
                                onClick={() => setRowDensity("compact")}
                            >Compact (36px)</button>
                            <button
                                className={`density-btn ${rowDensity === "comfortable" ? "active" : ""}`}
                                onClick={() => setRowDensity("comfortable")}
                            >Normal (48px)</button>
                            <button
                                className={`density-btn ${rowDensity === "expanded" ? "active" : ""}`}
                                onClick={() => setRowDensity("expanded")}
                            >Spacious (64px)</button>
                        </div>
                    </div>

                    {/* Custom Row Height Slider */}
                    <div className="ctrl-group slider-group">
                        <Sliders size={14} className="slider-icon" />
                        <input
                            type="range"
                            min="28"
                            max="80"
                            value={rowHeightPx}
                            onChange={e => setRowHeightPx(Number(e.target.value))}
                            className="height-slider"
                            title="Fine-tune Row Height"
                        />
                        <span className="height-val">{rowHeightPx}px</span>
                    </div>
                </div>

                <div className="excel-controls-right">
                    {/* Column Visibility Toggle Dropdown */}
                    <div className="col-picker-wrapper">
                        <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => setShowColPicker(v => !v)}
                        >
                            <Columns size={16} /> Customize Columns
                        </button>

                        {showColPicker && (
                            <div className="col-picker-dropdown">
                                <div className="col-picker-header">
                                    <span>Show/Hide Columns</span>
                                    <button onClick={() => setShowColPicker(false)}><X size={14} /></button>
                                </div>
                                <div className="col-picker-list">
                                    {Object.keys(visibleCols).map(colKey => (
                                        <label key={colKey} className="col-picker-item">
                                            <input
                                                type="checkbox"
                                                checked={visibleCols[colKey]}
                                                onChange={e => setVisibleCols(prev => ({ ...prev, [colKey]: e.target.checked }))}
                                            />
                                            <span>{colKey.toUpperCase()}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <button className="btn btn-ghost btn-sm" onClick={resetLayout} title="Reset Column Layout">
                        <RotateCcw size={15} /> Reset Layout
                    </button>
                </div>
            </div>

            {/* ── Filters & Search ── */}
            <div className="filters-bar">
                <div className="search-box">
                    <Search size={18} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search products across all fields..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="filter-group">
                    <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)}>
                        <option value="all">All Categories</option>
                        {categories.filter(c => c !== "all").map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>

                    <select value={stockFilter} onChange={e => setStockFilter(e.target.value)}>
                        <option value="all">All Stock Status</option>
                        <option value="in">In Stock (&ge;10)</option>
                        <option value="low">Low Stock (&lt;10)</option>
                        <option value="out">Out of Stock</option>
                    </select>
                </div>

                <div className="results-count">
                    Showing <strong>{filteredProducts.length}</strong> of <strong>{pagination.total}</strong> products
                </div>

                {selectedProducts.length > 0 && (
                    <button className="btn btn-danger btn-sm" onClick={handleBulkDelete}>
                        <Trash2 size={16} /> Delete Selected ({selectedProducts.length})
                    </button>
                )}
            </div>

            {/* ── BATCH SAVE FLOATING BAR ── */}
            {dirtyCount > 0 && (
                <div className="batch-save-bar">
                    <div className="batch-info">
                        <AlertCircle size={18} className="batch-alert-icon" />
                        <span><strong>{dirtyCount}</strong> product(s) modified in spreadsheet grid</span>
                    </div>
                    <div className="batch-actions">
                        <button className="btn btn-ghost btn-sm text-white" onClick={handleDiscardBatchEdits}>
                            Discard
                        </button>
                        <button className="btn btn-success btn-sm" onClick={handleSaveBatchEdits} disabled={savingBatch}>
                            {savingBatch ? <RefreshCw size={14} className="spin" /> : <Save size={16} />}
                            {savingBatch ? "Saving..." : "Save All Changes"}
                        </button>
                    </div>
                </div>
            )}

            {/* ═════════════════════════════════════════════════════════
                INTERACTIVE EXCEL SPREADSHEET TABLE
            ═════════════════════════════════════════════════════════ */}
            <div className="table-container excel-table-container">
                <table className="inventory-table excel-table">
                    <thead>
                        <tr>
                            {visibleCols.select && (
                                <th style={{ width: colWidths.select || 48 }} className="checkbox-cell th-resizable">
                                    <input
                                        type="checkbox"
                                        checked={selectedProducts.length === filteredProducts.length && filteredProducts.length > 0}
                                        onChange={e => handleSelectAll(e.target.checked)}
                                    />
                                    <div className="col-resizer" onMouseDown={e => handleMouseDownResize(e, "select")} />
                                </th>
                            )}

                            {visibleCols.image && (
                                <th style={{ width: colWidths.image || 65 }} className="th-resizable">
                                    Image
                                    <div className="col-resizer" onMouseDown={e => handleMouseDownResize(e, "image")} />
                                </th>
                            )}

                            {visibleCols.name && (
                                <th
                                    style={{ width: colWidths.name || 240 }}
                                    className="sortable th-resizable"
                                    onClick={() => setSortConfig(p => ({ key: "name", direction: p.key === "name" && p.direction === "asc" ? "desc" : "asc" }))}
                                >
                                    Product Name {sortConfig.key === "name" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                                    <div className="col-resizer" onMouseDown={e => handleMouseDownResize(e, "name")} />
                                </th>
                            )}

                            {visibleCols.category && (
                                <th
                                    style={{ width: colWidths.category || 140 }}
                                    className="sortable th-resizable"
                                    onClick={() => setSortConfig(p => ({ key: "category", direction: p.key === "category" && p.direction === "asc" ? "desc" : "asc" }))}
                                >
                                    Category
                                    <div className="col-resizer" onMouseDown={e => handleMouseDownResize(e, "category")} />
                                </th>
                            )}

                            {visibleCols.brand && (
                                <th
                                    style={{ width: colWidths.brand || 130 }}
                                    className="sortable th-resizable"
                                    onClick={() => setSortConfig(p => ({ key: "brand", direction: p.key === "brand" && p.direction === "asc" ? "desc" : "asc" }))}
                                >
                                    Brand
                                    <div className="col-resizer" onMouseDown={e => handleMouseDownResize(e, "brand")} />
                                </th>
                            )}

                            {visibleCols.model && (
                                <th
                                    style={{ width: colWidths.model || 130 }}
                                    className="sortable th-resizable"
                                    onClick={() => setSortConfig(p => ({ key: "model", direction: p.key === "model" && p.direction === "asc" ? "desc" : "asc" }))}
                                >
                                    Model / SKU
                                    <div className="col-resizer" onMouseDown={e => handleMouseDownResize(e, "model")} />
                                </th>
                            )}

                            {visibleCols.capacity && (
                                <th
                                    style={{ width: colWidths.capacity || 100 }}
                                    className="sortable th-resizable"
                                    onClick={() => setSortConfig(p => ({ key: "capacity", direction: p.key === "capacity" && p.direction === "asc" ? "desc" : "asc" }))}
                                >
                                    Capacity
                                    <div className="col-resizer" onMouseDown={e => handleMouseDownResize(e, "capacity")} />
                                </th>
                            )}

                            {visibleCols.price && (
                                <th
                                    style={{ width: colWidths.price || 110 }}
                                    className="sortable th-resizable"
                                    onClick={() => setSortConfig(p => ({ key: "price", direction: p.key === "price" && p.direction === "asc" ? "desc" : "asc" }))}
                                >
                                    Selling Price
                                    <div className="col-resizer" onMouseDown={e => handleMouseDownResize(e, "price")} />
                                </th>
                            )}

                            {visibleCols.mrp && (
                                <th
                                    style={{ width: colWidths.mrp || 110 }}
                                    className="sortable th-resizable"
                                    onClick={() => setSortConfig(p => ({ key: "mrp", direction: p.key === "mrp" && p.direction === "asc" ? "desc" : "asc" }))}
                                >
                                    MRP (Cost)
                                    <div className="col-resizer" onMouseDown={e => handleMouseDownResize(e, "mrp")} />
                                </th>
                            )}

                            {visibleCols.stock && (
                                <th
                                    style={{ width: colWidths.stock || 100 }}
                                    className="sortable th-resizable"
                                    onClick={() => setSortConfig(p => ({ key: "stock", direction: p.key === "stock" && p.direction === "asc" ? "desc" : "asc" }))}
                                >
                                    Stock Qty
                                    <div className="col-resizer" onMouseDown={e => handleMouseDownResize(e, "stock")} />
                                </th>
                            )}

                            {visibleCols.status && (
                                <th style={{ width: colWidths.status || 120 }} className="th-resizable">
                                    Status
                                    <div className="col-resizer" onMouseDown={e => handleMouseDownResize(e, "status")} />
                                </th>
                            )}

                            {visibleCols.actions && (
                                <th style={{ width: colWidths.actions || 90 }} className="th-resizable">
                                    Actions
                                    <div className="col-resizer" onMouseDown={e => handleMouseDownResize(e, "actions")} />
                                </th>
                            )}
                        </tr>
                    </thead>

                    <tbody>
                        {filteredProducts.length > 0 ? (
                            filteredProducts.map(product => {
                                const currentStock = Number(getCellValue(product, "stock")) || 0;
                                const isDirty = Boolean(dirtyEdits[product._id]);

                                return (
                                    <tr
                                        key={product._id}
                                        style={{ height: `${rowHeightPx}px` }}
                                        className={`excel-row ${isDirty ? "row-dirty" : ""}`}
                                    >
                                        {visibleCols.select && (
                                            <td className="checkbox-cell">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedProducts.includes(product._id)}
                                                    onChange={() => handleSelectProduct(product._id)}
                                                />
                                            </td>
                                        )}

                                        {visibleCols.image && (
                                            <td className="img-cell">
                                                {product?.images?.length > 0 ? (
                                                    <img src={product.images[0]} alt={product.name} className="excel-thumb" />
                                                ) : product?.image ? (
                                                    <img src={product.image} alt={product.name} className="excel-thumb" />
                                                ) : (
                                                    <div className="excel-thumb-ph"><ImageIcon size={14} /></div>
                                                )}
                                            </td>
                                        )}

                                        {visibleCols.name && (
                                            <td
                                                className={`editable-cell ${editingCell?.productId === product._id && editingCell?.field === "name" ? "editing" : ""}`}
                                                onDoubleClick={() => handleCellDoubleClick(product._id, "name")}
                                            >
                                                {editingCell?.productId === product._id && editingCell?.field === "name" ? (
                                                    <input
                                                        type="text"
                                                        autoFocus
                                                        value={getCellValue(product, "name")}
                                                        onChange={e => handleCellChange(product._id, "name", e.target.value)}
                                                        onKeyDown={handleKeyDownCell}
                                                        onBlur={() => setEditingCell(null)}
                                                        className="cell-input"
                                                    />
                                                ) : (
                                                    <span className="cell-text font-semibold">{getCellValue(product, "name")}</span>
                                                )}
                                            </td>
                                        )}

                                        {visibleCols.category && (
                                            <td
                                                className={`editable-cell ${editingCell?.productId === product._id && editingCell?.field === "category" ? "editing" : ""}`}
                                                onDoubleClick={() => handleCellDoubleClick(product._id, "category")}
                                            >
                                                {editingCell?.productId === product._id && editingCell?.field === "category" ? (
                                                    <input
                                                        type="text"
                                                        autoFocus
                                                        value={getCellValue(product, "category")}
                                                        onChange={e => handleCellChange(product._id, "category", e.target.value)}
                                                        onKeyDown={handleKeyDownCell}
                                                        onBlur={() => setEditingCell(null)}
                                                        className="cell-input"
                                                    />
                                                ) : (
                                                    <span className="cell-text">{getCellValue(product, "category") || "—"}</span>
                                                )}
                                            </td>
                                        )}

                                        {visibleCols.brand && (
                                            <td
                                                className={`editable-cell ${editingCell?.productId === product._id && editingCell?.field === "brand" ? "editing" : ""}`}
                                                onDoubleClick={() => handleCellDoubleClick(product._id, "brand")}
                                            >
                                                {editingCell?.productId === product._id && editingCell?.field === "brand" ? (
                                                    <input
                                                        type="text"
                                                        autoFocus
                                                        value={getCellValue(product, "brand")}
                                                        onChange={e => handleCellChange(product._id, "brand", e.target.value)}
                                                        onKeyDown={handleKeyDownCell}
                                                        onBlur={() => setEditingCell(null)}
                                                        className="cell-input"
                                                    />
                                                ) : (
                                                    <span className="cell-text">{getCellValue(product, "brand") || "—"}</span>
                                                )}
                                            </td>
                                        )}

                                        {visibleCols.model && (
                                            <td
                                                className={`editable-cell ${editingCell?.productId === product._id && editingCell?.field === "model" ? "editing" : ""}`}
                                                onDoubleClick={() => handleCellDoubleClick(product._id, "model")}
                                            >
                                                {editingCell?.productId === product._id && editingCell?.field === "model" ? (
                                                    <input
                                                        type="text"
                                                        autoFocus
                                                        value={getCellValue(product, "model")}
                                                        onChange={e => handleCellChange(product._id, "model", e.target.value)}
                                                        onKeyDown={handleKeyDownCell}
                                                        onBlur={() => setEditingCell(null)}
                                                        className="cell-input"
                                                    />
                                                ) : (
                                                    <code className="cell-code">{getCellValue(product, "model") || "—"}</code>
                                                )}
                                            </td>
                                        )}

                                        {visibleCols.capacity && (
                                            <td
                                                className={`editable-cell ${editingCell?.productId === product._id && editingCell?.field === "capacity" ? "editing" : ""}`}
                                                onDoubleClick={() => handleCellDoubleClick(product._id, "capacity")}
                                            >
                                                {editingCell?.productId === product._id && editingCell?.field === "capacity" ? (
                                                    <input
                                                        type="text"
                                                        autoFocus
                                                        value={getCellValue(product, "capacity")}
                                                        onChange={e => handleCellChange(product._id, "capacity", e.target.value)}
                                                        onKeyDown={handleKeyDownCell}
                                                        onBlur={() => setEditingCell(null)}
                                                        className="cell-input"
                                                    />
                                                ) : (
                                                    <span className="cell-text">{getCellValue(product, "capacity") || "—"}</span>
                                                )}
                                            </td>
                                        )}

                                        {visibleCols.price && (
                                            <td
                                                className={`editable-cell price-cell ${editingCell?.productId === product._id && editingCell?.field === "price" ? "editing" : ""}`}
                                                onDoubleClick={() => handleCellDoubleClick(product._id, "price")}
                                            >
                                                {editingCell?.productId === product._id && editingCell?.field === "price" ? (
                                                    <input
                                                        type="number"
                                                        autoFocus
                                                        value={getCellValue(product, "price")}
                                                        onChange={e => handleCellChange(product._id, "price", e.target.value)}
                                                        onKeyDown={handleKeyDownCell}
                                                        onBlur={() => setEditingCell(null)}
                                                        className="cell-input num-input"
                                                    />
                                                ) : (
                                                    <span className="cell-text price-text">Rs {Number(getCellValue(product, "price") || 0).toLocaleString()}</span>
                                                )}
                                            </td>
                                        )}

                                        {visibleCols.mrp && (
                                            <td
                                                className={`editable-cell price-cell ${editingCell?.productId === product._id && editingCell?.field === "mrp" ? "editing" : ""}`}
                                                onDoubleClick={() => handleCellDoubleClick(product._id, "mrp")}
                                            >
                                                {editingCell?.productId === product._id && editingCell?.field === "mrp" ? (
                                                    <input
                                                        type="number"
                                                        autoFocus
                                                        value={getCellValue(product, "mrp")}
                                                        onChange={e => handleCellChange(product._id, "mrp", e.target.value)}
                                                        onKeyDown={handleKeyDownCell}
                                                        onBlur={() => setEditingCell(null)}
                                                        className="cell-input num-input"
                                                    />
                                                ) : (
                                                    <span className="cell-text text-muted">Rs {Number(getCellValue(product, "mrp") || 0).toLocaleString()}</span>
                                                )}
                                            </td>
                                        )}

                                        {visibleCols.stock && (
                                            <td
                                                className={`editable-cell stock-cell ${editingCell?.productId === product._id && editingCell?.field === "stock" ? "editing" : ""}`}
                                                onDoubleClick={() => handleCellDoubleClick(product._id, "stock")}
                                            >
                                                {editingCell?.productId === product._id && editingCell?.field === "stock" ? (
                                                    <input
                                                        type="number"
                                                        autoFocus
                                                        value={getCellValue(product, "stock")}
                                                        onChange={e => handleCellChange(product._id, "stock", e.target.value)}
                                                        onKeyDown={handleKeyDownCell}
                                                        onBlur={() => setEditingCell(null)}
                                                        className="cell-input num-input bold-input"
                                                    />
                                                ) : (
                                                    <span className={`stock-badge ${currentStock === 0 ? "out" : currentStock < 10 ? "low" : "good"}`}>
                                                        {currentStock}
                                                    </span>
                                                )}
                                            </td>
                                        )}

                                        {visibleCols.status && (
                                            <td>
                                                <span className={`status-badge ${currentStock === 0 ? "out-of-stock" : currentStock < 10 ? "low-stock" : "in-stock"}`}>
                                                    {currentStock === 0 ? "Out of Stock" : currentStock < 10 ? "Low Stock" : "In Stock"}
                                                </span>
                                            </td>
                                        )}

                                        {visibleCols.actions && (
                                            <td className="actions-cell">
                                                <button className="action-btn action-btn-delete" onClick={() => handleDeleteProduct(product)} title="Delete Product">
                                                    <Trash2 size={14} />
                                                </button>
                                            </td>
                                        )}
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan="12" className="no-data">
                                    <Package size={48} />
                                    <p>No products found in inventory spreadsheet</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* ── Pagination ── */}
            {pagination.totalPages > 1 && (
                <div className="pagination">
                    <button disabled={pagination.page === 1} onClick={() => fetchProducts(pagination.page - 1)}>
                        Previous
                    </button>
                    <span>Page {pagination.page} of {pagination.totalPages}</span>
                    <button disabled={pagination.page === pagination.totalPages} onClick={() => fetchProducts(pagination.page + 1)}>
                        Next
                    </button>
                </div>
            )}
        </div>
    );
};

export default InventoryManagement;