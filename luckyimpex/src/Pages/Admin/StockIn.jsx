import React, { useState, useEffect, useCallback, useRef } from "react";
import {
    Search, Plus, Package, Warehouse, Save, X,
    CheckCircle, RefreshCw, BoxSelect
} from "lucide-react";
import { authRequest, getData } from "../../api/api";


// ─── helpers ───────────────────────────────────────────────────────────────
const stockBadge = (stock, reorder = 5) => {
    if (stock === 0) return { label: "Out of Stock", cls: "badge-danger" };
    if (stock <= reorder) return { label: "Low Stock", cls: "badge-warning" };
    return { label: "In Stock", cls: "badge-success" };
};

const CATEGORIES = [
    "TV & Audio", "Home Appliances", "Kitchen", "Air Conditioning",
    "Refrigeration", "Small Appliances", "Electronics", "Other"
];

// ─── New Product Form ───────────────────────────────────────────────────────
const NewProductForm = ({ onCreated, onCancel }) => {
    const [form, setForm] = useState({
        name: "", model: "", brand: "", category: "", price: "", description: ""
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handle = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

    const submit = async e => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const res = await authRequest("/products/products", {
                method: "POST",
                body: { ...form, price: parseFloat(form.price), stock: 0 }
            });
            onCreated(res.product || res.data || res);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="new-product-panel">
            <div className="np-header">
                <h3><Package size={18} /> Create New Product</h3>
                <button className="icon-btn" onClick={onCancel}><X size={18} /></button>
            </div>
            <form onSubmit={submit} className="np-grid">
                <div className="np-field">
                    <label>Product Name *</label>
                    <input name="name" value={form.name} onChange={handle} required placeholder="e.g. Samsung LED TV 43 inch" />
                </div>
                <div className="np-field">
                    <label>Model *</label>
                    <input name="model" value={form.model} onChange={handle} required placeholder="e.g. UA43T5300" />
                </div>
                <div className="np-field">
                    <label>Brand *</label>
                    <input name="brand" value={form.brand} onChange={handle} required placeholder="e.g. Samsung" />
                </div>
                <div className="np-field">
                    <label>Category *</label>
                    <select name="category" value={form.category} onChange={handle} required>
                        <option value="">Select category</option>
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
                <div className="np-field">
                    <label>Selling Price (NPR) *</label>
                    <input type="number" name="price" value={form.price} onChange={handle} required min="0" step="0.01" placeholder="0.00" />
                </div>
                <div className="np-field np-full">
                    <label>Description</label>
                    <textarea name="description" value={form.description} onChange={handle} rows={2} placeholder="Optional product description..." />
                </div>
                {error && <div className="error-msg np-full">{error}</div>}
                <div className="np-actions np-full">
                    <button type="button" className="btn btn-ghost" onClick={onCancel}>Cancel</button>
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? <RefreshCw size={16} className="spin" /> : <Plus size={16} />}
                        {loading ? "Creating..." : "Create & Add Stock"}
                    </button>
                </div>
            </form>
        </div>
    );
};

// ─── Stock In Modal ─────────────────────────────────────────────────────────
const StockInModal = ({ product, warehouses, onClose, onSuccess }) => {
    const [form, setForm] = useState({
        warehouseId: "", quantity: "", purchasePrice: "",
        referenceType: "MANUAL", referenceId: "", notes: ""
    });
    const [serialNumbers, setSerialNumbers] = useState([""]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handle = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

    const submit = async e => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const validSNs = serialNumbers.filter(s => s.trim() !== "");
            await authRequest("/inventory/stock-in", {
                method: "POST",
                body: {
                    productId: product._id,
                    warehouseId: form.warehouseId,
                    locationId: form.warehouseId,
                    quantity: parseInt(form.quantity),
                    purchasePrice: form.purchasePrice ? parseFloat(form.purchasePrice) : undefined,
                    referenceType: form.referenceType,
                    referenceId: form.referenceId || undefined,
                    serialNumbers: validSNs.length > 0 ? validSNs : undefined,
                    notes: form.notes || undefined
                }
            });
            onSuccess();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="modal-box">
                <div className="modal-hd">
                    <div className="modal-title">
                        <BoxSelect size={20} />
                        <div>
                            <h2>Stock In</h2>
                            <p className="modal-subtitle">{product.name} — <code>{product.model}</code></p>
                        </div>
                    </div>
                    <button className="icon-btn" onClick={onClose}><X size={20} /></button>
                </div>

                <form onSubmit={submit} className="modal-form">
                    <div className="modal-grid">
                        <div className="np-field">
                            <label><Warehouse size={13} /> Destination Warehouse *</label>
                            <select name="warehouseId" value={form.warehouseId} onChange={handle} required>
                                <option value="">Select warehouse</option>
                                {warehouses.map(w => (
                                    <option key={w._id} value={w._id}>{w.name} ({w.code})</option>
                                ))}
                            </select>
                        </div>
                        <div className="np-field">
                            <label><Package size={13} /> Quantity *</label>
                            <input type="number" name="quantity" value={form.quantity} onChange={handle} required min="1" placeholder="Enter quantity" />
                        </div>
                        <div className="np-field">
                            <label>Purchase Price (NPR)</label>
                            <input type="number" name="purchasePrice" value={form.purchasePrice} onChange={handle} min="0" step="0.01" placeholder="Cost per unit" />
                        </div>
                        <div className="np-field">
                            <label>Reference Type</label>
                            <select name="referenceType" value={form.referenceType} onChange={handle}>
                                <option value="MANUAL">Manual Entry</option>
                                <option value="PURCHASE">Purchase Order</option>
                                <option value="RETURN">Customer Return</option>
                            </select>
                        </div>
                        <div className="np-field">
                            <label>Reference / Invoice #</label>
                            <input type="text" name="referenceId" value={form.referenceId} onChange={handle} placeholder="Optional reference number" />
                        </div>
                        <div className="np-field">
                            <label>Notes</label>
                            <input type="text" name="notes" value={form.notes} onChange={handle} placeholder="Optional notes" />
                        </div>
                    </div>

                    <div className="sn-section">
                        <div className="sn-hd">
                            <span>Serial Numbers <em className="opt-tag">optional</em></span>
                            <button type="button" className="btn btn-ghost btn-xs"
                                onClick={() => setSerialNumbers(p => [...p, ""])}>
                                <Plus size={13} /> Add
                            </button>
                        </div>
                        {serialNumbers.map((sn, i) => (
                            <div key={i} className="sn-row">
                                <input
                                    type="text"
                                    value={sn}
                                    onChange={e => {
                                        const n = [...serialNumbers];
                                        n[i] = e.target.value;
                                        setSerialNumbers(n);
                                    }}
                                    placeholder={`Serial number ${i + 1}`}
                                />
                                {serialNumbers.length > 1 && (
                                    <button type="button" className="icon-btn danger"
                                        onClick={() => setSerialNumbers(p => p.filter((_, idx) => idx !== i))}>
                                        <X size={14} />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>

                    {error && <div className="error-msg">{error}</div>}

                    <div className="modal-actions">
                        <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? <RefreshCw size={16} className="spin" /> : <Save size={16} />}
                            {loading ? "Processing..." : "Confirm Stock In"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// ─── Main Page ──────────────────────────────────────────────────────────────
const StockIn = () => {
    const [products, setProducts] = useState([]);
    const [warehouses, setWarehouses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [categories, setCategories] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [showNewProduct, setShowNewProduct] = useState(false);
    const [success, setSuccess] = useState(null);
    const [pagination, setPagination] = useState({ page: 1, total: 0, pages: 1 });
    const debounceRef = useRef(null);

    useEffect(() => {
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            setDebouncedSearch(search);
            setPagination(p => ({ ...p, page: 1 }));
        }, 350);
        return () => clearTimeout(debounceRef.current);
    }, [search]);

    const fetchProducts = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ page, limit: 15 });
            if (debouncedSearch) params.set("search", debouncedSearch);
            if (categoryFilter !== "all") params.set("category", categoryFilter);
            const data = await getData(`/products/products?${params}`);
            setProducts(data.products || []);
            setPagination({
                page: data.pagination?.page || page,
                total: data.pagination?.total || 0,
                pages: data.pagination?.pages || 1
            });
            if (categories.length === 0 && data.products?.length > 0) {
                setCategories([...new Set(data.products.map(p => p.category).filter(Boolean))]);
            }
        } catch (err) {
            console.error("Failed to fetch products:", err);
        } finally {
            setLoading(false);
        }
    }, [debouncedSearch, categoryFilter, categories.length]);

    useEffect(() => { fetchProducts(1); }, [fetchProducts]);

    useEffect(() => {
        authRequest("/inventory/warehouses")
            .then(d => setWarehouses(d.data || []))
            .catch(() => {});
    }, []);

    const handleStockSuccess = () => {
        setSelectedProduct(null);
        setSuccess("Stock added successfully! Inventory has been updated.");
        fetchProducts(pagination.page);
        setTimeout(() => setSuccess(null), 4500);
    };

    const handleNewProductCreated = product => {
        setShowNewProduct(false);
        // immediately open stock-in modal for the new product
        setSelectedProduct(product);
        fetchProducts(1);
    };

    return (
        <div className="stock-in-page">
            {/* Header */}
            <div className="si-header">
                <div>
                    <h1>Stock In</h1>
                    <p className="subtitle">Browse all products, search by name or model, then add stock</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowNewProduct(v => !v)}>
                    <Plus size={18} /> {showNewProduct ? "Cancel" : "New Product"}
                </button>
            </div>

            {/* Success Banner */}
            {success && (
                <div className="success-banner">
                    <CheckCircle size={18} /> {success}
                </div>
            )}

            {/* New Product Panel */}
            {showNewProduct && (
                <NewProductForm
                    onCreated={handleNewProductCreated}
                    onCancel={() => setShowNewProduct(false)}
                />
            )}

            {/* Toolbar */}
            <div className="si-toolbar">
                <div className="search-wrap">
                    <Search size={16} className="search-icon" />
                    <input
                        className="search-input"
                        type="text"
                        placeholder="Search by name, model or brand..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                    {search && <button className="clear-btn" onClick={() => setSearch("")}><X size={14} /></button>}
                </div>
                <select className="filter-select" value={categoryFilter}
                    onChange={e => { setCategoryFilter(e.target.value); setPagination(p => ({ ...p, page: 1 })); }}>
                    <option value="all">All Categories</option>
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <button className="btn btn-ghost btn-sm" onClick={() => fetchProducts(pagination.page)} title="Refresh">
                    <RefreshCw size={15} />
                </button>
            </div>

            {/* Product Table */}
            <div className="product-table-wrap">
                {loading ? (
                    <div className="loading-state">
                        <RefreshCw size={32} className="spin" />
                        <p>Loading products...</p>
                    </div>
                ) : products.length === 0 ? (
                    <div className="empty-state">
                        <Package size={48} />
                        <p>No products found</p>
                        {search && (
                            <span>
                                Try a different search or{" "}
                                <button className="link-btn" onClick={() => setShowNewProduct(true)}>add a new product</button>
                            </span>
                        )}
                    </div>
                ) : (
                    <table className="product-table">
                        <thead>
                            <tr>
                                <th>Product</th>
                                <th>Model</th>
                                <th>Brand</th>
                                <th>Category</th>
                                <th>Stock</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map(product => {
                                const badge = stockBadge(product.stock ?? 0, product.reorderLevel ?? 5);
                                return (
                                    <tr key={product._id} className="product-row">
                                        <td>
                                            <div className="pname-cell">
                                                {product.images?.[0]
                                                    ? <img src={product.images[0]} alt={product.name} className="product-thumb" />
                                                    : <div className="product-thumb-ph"><Package size={16} /></div>
                                                }
                                                <span>{product.name}</span>
                                            </div>
                                        </td>
                                        <td><code className="model-tag">{product.model || "—"}</code></td>
                                        <td>{product.brand || "—"}</td>
                                        <td>{product.category || "—"}</td>
                                        <td>
                                            <span className={`stock-qty ${(product.stock ?? 0) === 0 ? "stock-zero" : ""}`}>
                                                {product.stock ?? 0}
                                            </span>
                                        </td>
                                        <td><span className={`badge ${badge.cls}`}>{badge.label}</span></td>
                                        <td>
                                            <button className="btn btn-primary btn-sm"
                                                onClick={() => setSelectedProduct(product)}>
                                                <Plus size={14} /> Stock In
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Pagination */}
            {!loading && pagination.pages > 1 && (
                <div className="pagination">
                    <span className="page-info">
                        Page {pagination.page} of {pagination.pages} — {pagination.total} products
                    </span>
                    <div className="page-btns">
                        <button className="btn btn-ghost btn-sm" disabled={pagination.page <= 1}
                            onClick={() => fetchProducts(pagination.page - 1)}>Previous</button>
                        {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                            const pg = Math.max(1, pagination.page - 2) + i;
                            if (pg > pagination.pages) return null;
                            return (
                                <button key={pg}
                                    className={`btn btn-sm ${pg === pagination.page ? "btn-primary" : "btn-ghost"}`}
                                    onClick={() => fetchProducts(pg)}>{pg}</button>
                            );
                        })}
                        <button className="btn btn-ghost btn-sm" disabled={pagination.page >= pagination.pages}
                            onClick={() => fetchProducts(pagination.page + 1)}>Next</button>
                    </div>
                </div>
            )}

            {/* Stock In Modal */}
            {selectedProduct && (
                <StockInModal
                    product={selectedProduct}
                    warehouses={warehouses}
                    onClose={() => setSelectedProduct(null)}
                    onSuccess={handleStockSuccess}
                />
            )}
        </div>
    );
};

export default StockIn;

