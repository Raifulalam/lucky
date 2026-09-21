import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Search, Plus, Edit, Trash2, Package, TrendingUp, AlertCircle, Filter, Download, RefreshCw, Upload, X, Image as ImageIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import './InventoryManagement.css';
import { authRequest, getData } from "../../api/api";
import socket from "../../socket";

const InventoryManagement = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [searchType, setSearchType] = useState("all");
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [stockFilter, setStockFilter] = useState("all");
    const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [newCategory, setNewCategory] = useState('');
    const [categories, setCategories] = useState([]);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0
    });
    const [newProduct, setNewProduct] = useState({
        name: '',
        slug: '',
        price: '',
        mrp: '',
        category: '',
        brand: '',
        model: '',
        capacity: '',
        stock: '',
        description: '',
        images: [],
        keywords: []
    });

    // Fetch products with pagination
    const fetchProducts = async (page = 1) => {
        setLoading(true);
        try {
            const data = await getData(`/products/products?page=${page}&limit=${pagination.limit}`);
            setProducts(data.products || []);
            setPagination(prev => ({
                ...prev,
                page: data.page || page,
                total: data.total || 0,
                totalPages: data.pages || 1
            }));
            
            // Extract unique categories
            const uniqueCategories = new Set(data.products?.map(p => p.category).filter(Boolean));
            setCategories(['all', ...Array.from(uniqueCategories)]);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Search all products across all pages
    const searchProducts = async (query, type = 'all') => {
        if (!query.trim()) {
            fetchProducts(1);
            return;
        }
        setLoading(true);
        try {
            let url = `/products/products/search/${encodeURIComponent(query.trim())}?page=1&limit=1000`;
            
            // Add search type filter if not searching all
            if (type === 'name') {
                // Backend search by name is default, no need to modify
            } else if (type === 'model') {
                // Filter by model after getting results
            } else if (type === 'brand') {
                // Filter by brand after getting results
            }
            
            const data = await getData(url);
            let filteredResults = data.products || [];
            
            // Apply additional filtering based on search type
            if (type === 'model') {
                filteredResults = filteredResults.filter(p => 
                    p.model?.toLowerCase().includes(query.toLowerCase())
                );
            } else if (type === 'brand') {
                filteredResults = filteredResults.filter(p => 
                    p.brand?.toLowerCase().includes(query.toLowerCase())
                );
            }
            
            setProducts(filteredResults);
            setPagination(prev => ({
                ...prev,
                page: 1,
                total: filteredResults.length || 0,
                totalPages: 1
            }));
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts(1);

        // Socket.IO listeners for real-time updates
        socket.on('productCreated', (product) => {
            setProducts(prev => [product, ...prev]);
            fetchProducts(pagination.page);
        });

        socket.on('productUpdated', (updatedProduct) => {
            setProducts(prev =>
                prev.map(p => p._id === updatedProduct._id ? updatedProduct : p)
            );
        });

        socket.on('productDeleted', (productId) => {
            setProducts(prev => prev.filter(p => p._id !== productId));
            fetchProducts(pagination.page);
        });

        return () => {
            socket.off('productCreated');
            socket.off('productUpdated');
            socket.off('productDeleted');
        };
    }, []);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            fetchProducts(newPage);
        }
    };

    // Debounced search handler
    const debouncedSearch = useCallback(
        (query, type) => {
            const timer = setTimeout(() => {
                searchProducts(query, type);
            }, 500);
            return () => clearTimeout(timer);
        },
        []
    );

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        debouncedSearch(value, searchType);
    };

    const handleSearchTypeChange = (e) => {
        const type = e.target.value;
        setSearchType(type);
        if (searchTerm) {
            searchProducts(searchTerm, type);
        }
    };

    // Calculate statistics
    const stats = useMemo(() => {
        const totalProducts = products.length;
        const totalStock = products.reduce((sum, p) => sum + (Number(p.stock) || 0), 0);
        const lowStock = products.filter(p => Number(p.stock) < 10 && Number(p.stock) > 0).length;
        const outOfStock = products.filter(p => Number(p.stock) === 0).length;
        const totalValue = products.reduce((sum, p) => sum + (Number(p.price) || 0) * (Number(p.stock) || 0), 0);
        
        return { totalProducts, totalStock, lowStock, outOfStock, totalValue };
    }, [products]);


    // Filter and sort products
    const filteredProducts = useMemo(() => {
        let filtered = [...products];

        // Category filter
        if (selectedCategory !== 'all') {
            filtered = filtered.filter(p => p.category === selectedCategory);
        }

        // Stock filter
        if (stockFilter === 'low') {
            filtered = filtered.filter(p => Number(p.stock) > 0 && Number(p.stock) < 10);
        } else if (stockFilter === 'out') {
            filtered = filtered.filter(p => Number(p.stock) === 0);
        } else if (stockFilter === 'in') {
            filtered = filtered.filter(p => Number(p.stock) > 0);
        }

        // Sort
        filtered.sort((a, b) => {
            const aValue = a[sortConfig.key];
            const bValue = b[sortConfig.key];
            
            if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });

        return filtered;
    }, [products, selectedCategory, stockFilter, sortConfig]);

    const handleSort = (key) => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    const handleSelectAll = (checked) => {
        setSelectedProducts(checked ? filteredProducts.map(p => p._id) : []);
    };

    const handleSelectProduct = (productId) => {
        setSelectedProducts(prev =>
            prev.includes(productId)
                ? prev.filter(id => id !== productId)
                : [...prev, productId]
        );
    };

    const handleDeleteProduct = (product) => {
        setSelectedProduct(product);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        try {
            await authRequest(`/products/products/${selectedProduct._id}`, {
                method: "DELETE",
            });
            setProducts(prev => prev.filter(p => p._id !== selectedProduct._id));
            setIsDeleteModalOpen(false);
            setSelectedProduct(null);
        } catch (err) {
            setError(err.message);
        }
    };

    const handleBulkDelete = async () => {
        try {
            await Promise.all(
                selectedProducts.map(id =>
                    authRequest(`/products/products/${id}`, { method: "DELETE" })
                )
            );
            setProducts(prev => prev.filter(p => !selectedProducts.includes(p._id)));
            setSelectedProducts([]);
        } catch (err) {
            setError(err.message);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewProduct(prev => ({ ...prev, [name]: value }));
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        setImageFile(null);
        setImagePreview(null);
    };

    const handleAddProduct = async (e) => {
        e.preventDefault();
        setUploading(true);
        try {
            const formData = new FormData();
            
            // Add all text fields
            Object.keys(newProduct).forEach(key => {
                if (key !== 'images' && key !== 'specifications' && key !== 'features') {
                    formData.append(key, newProduct[key]);
                }
            });

            // Add image file if present
            if (imageFile) {
                formData.append('image', imageFile);
            }

            // Add arrays as JSON strings
            formData.append('images', JSON.stringify(newProduct.images || []));
            formData.append('specifications', JSON.stringify(newProduct.specifications || {}));
            formData.append('features', JSON.stringify(newProduct.features || []));

            const addedProduct = await authRequest("/products/products", {
                method: "POST",
                body: formData,
                isFormData: true,
            });
            
            setProducts(prev => [addedProduct, ...prev]);
            resetForm();
            setIsAddModalOpen(false);
        } catch (err) {
            setError(err.message);
        } finally {
            setUploading(false);
        }
    };

    const handleEditProduct = async (e) => {
        e.preventDefault();
        setUploading(true);
        try {
            const formData = new FormData();
            
            Object.keys(newProduct).forEach(key => {
                if (key !== 'images' && key !== 'specifications' && key !== 'features') {
                    formData.append(key, newProduct[key]);
                }
            });

            if (imageFile) {
                formData.append('image', imageFile);
            }

            formData.append('images', JSON.stringify(newProduct.images || []));
            formData.append('specifications', JSON.stringify(newProduct.specifications || {}));
            formData.append('features', JSON.stringify(newProduct.features || []));

            const updatedProduct = await authRequest(`/products/products/${selectedProduct._id}`, {
                method: "PUT",
                body: formData,
                isFormData: true,
            });
            
            setProducts(prev =>
                prev.map(p => p._id === selectedProduct._id ? updatedProduct : p)
            );
            resetForm();
            setIsEditModalOpen(false);
            setSelectedProduct(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setUploading(false);
        }
    };

    const resetForm = () => {
        setNewProduct({
            name: '',
            slug: '',
            price: '',
            mrp: '',
            category: '',
            brand: '',
            model: '',
            capacity: '',
            stock: '',
            description: '',
            images: [],
            keywords: []
        });
        setImageFile(null);
        setImagePreview(null);
    };

    const openEditModal = (product) => {
        setSelectedProduct(product);
        setNewProduct({
            name: product.name || '',
            slug: product.slug || '',
            price: product.price || '',
            mrp: product.mrp || '',
            category: product.category || '',
            brand: product.brand || '',
            model: product.model || '',
            capacity: product.capacity || '',
            stock: product.stock || '',
            description: product.description || '',
            images: product.images || [],
            keywords: product.keywords || []
        });
        const productImage = product.images?.[0] || product.image || null;
        setImagePreview(productImage);
        setIsEditModalOpen(true);
    };

    const handleAddCategory = async () => {
        if (newCategory.trim()) {
            setCategories(prev => [...prev, newCategory.trim()]);
            setNewProduct(prev => ({ ...prev, category: newCategory.trim() }));
            setNewCategory('');
            setIsCategoryModalOpen(false);
        }
    };

    const handleExportCSV = () => {
        const headers = ['ID', 'Name', 'Slug', 'Category', 'Brand', 'Model', 'Capacity', 'Price', 'MRP', 'Stock', 'Keywords', 'Description'];
        const csvContent = [
            headers.join(','),
            ...filteredProducts.map(product => [
                product._id || '',
                `"${(product.name || '').replace(/"/g, '""')}"`,
                `"${(product.slug || '').replace(/"/g, '""')}"`,
                `"${(product.category || '').replace(/"/g, '""')}"`,
                `"${(product.brand || '').replace(/"/g, '""')}"`,
                `"${(product.model || '').replace(/"/g, '""')}"`,
                `"${(product.capacity || '').replace(/"/g, '""')}"`,
                product.price || 0,
                product.mrp || 0,
                product.stock || 0,
                `"${(product.keywords?.join('; ') || '').replace(/"/g, '""')}"`,
                `"${(product.description || '').replace(/\r?\n/g, ' ').replace(/"/g, '""')}"`
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `inventory-export-${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    };

    if (loading) {
        return (
            <div className="inventory-management">
                <div className="loading-state">
                    <RefreshCw className="spinner" size={40} />
                    <p>Loading inventory...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="inventory-management">
                <div className="error-state">
                    <AlertCircle size={40} />
                    <p>Error: {error}</p>
                    <button onClick={() => window.location.reload()}>Retry</button>
                </div>
            </div>
        );
    }

    return (
        <div className="inventory-management">
            {/* Statistics Dashboard */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon stat-icon-blue">
                        <Package size={24} />
                    </div>
                    <div className="stat-content">
                        <p className="stat-label">Total Products</p>
                        <p className="stat-value">{stats.totalProducts}</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon stat-icon-green">
                        <TrendingUp size={24} />
                    </div>
                    <div className="stat-content">
                        <p className="stat-label">Total Stock</p>
                        <p className="stat-value">{stats.totalStock}</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon stat-icon-orange">
                        <AlertCircle size={24} />
                    </div>
                    <div className="stat-content">
                        <p className="stat-label">Low Stock</p>
                        <p className="stat-value">{stats.lowStock}</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon stat-icon-red">
                        <AlertCircle size={24} />
                    </div>
                    <div className="stat-content">
                        <p className="stat-label">Out of Stock</p>
                        <p className="stat-value">{stats.outOfStock}</p>
                    </div>
                </div>
            </div>

            {/* Header and Actions */}
            <div className="inventory-header">
                <div className="header-left">
                    <h1>Inventory Management</h1>
                    <p className="subtitle">Manage your product inventory efficiently</p>
                </div>
                <div className="header-actions">
                    <button className="btn btn-secondary" onClick={() => fetchProducts(pagination.page)}>
                        <RefreshCw size={18} />
                        Refresh
                    </button>
                    <button className="btn btn-secondary" onClick={handleExportCSV}>
                        <Download size={18} />
                        Export CSV
                    </button>
                    <button className="btn btn-primary" onClick={() => setIsAddModalOpen(true)}>
                        <Plus size={18} />
                        Add Product
                    </button>
                </div>
            </div>

            {/* Filters and Search */}
            <div className="filters-bar">
                <div className="search-box">
                    <Search size={18} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search products across all pages..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                    />
                    <select
                        value={searchType}
                        onChange={handleSearchTypeChange}
                        className="search-type-select"
                    >
                        <option value="all">All Fields</option>
                        <option value="name">By Name</option>
                        <option value="model">By Model</option>
                        <option value="brand">By Brand</option>
                    </select>
                </div>
                <div className="filter-group">
                    <select
                        value={selectedCategory}
                        onChange={(e) => {
                            if (e.target.value === 'add-new') {
                                setIsCategoryModalOpen(true);
                            } else {
                                setSelectedCategory(e.target.value);
                            }
                        }}
                        className="filter-select"
                    >
                        <option value="all">All Categories</option>
                        {categories.slice(1).map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                        <option value="add-new">+ Add New Category</option>
                    </select>
                    <select
                        value={stockFilter}
                        onChange={(e) => setStockFilter(e.target.value)}
                        className="filter-select"
                    >
                        <option value="all">All Stock</option>
                        <option value="in">In Stock</option>
                        <option value="low">Low Stock (&lt;10)</option>
                        <option value="out">Out of Stock</option>
                    </select>
                </div>
                <div className="results-count">
                    Showing {filteredProducts.length} of {pagination.total} products
                </div>
                {selectedProducts.length > 0 && (
                    <button className="btn btn-danger btn-sm" onClick={handleBulkDelete}>
                        <Trash2 size={16} />
                        Delete Selected ({selectedProducts.length})
                    </button>
                )}
            </div>

            {/* Products Table */}
            <div className="table-container">
                <table className="inventory-table">
                    <thead>
                        <tr>
                            <th className="checkbox-cell">
                                <input
                                    type="checkbox"
                                    checked={selectedProducts.length === filteredProducts.length && filteredProducts.length > 0}
                                    onChange={(e) => handleSelectAll(e.target.checked)}
                                />
                            </th>
                            <th onClick={() => handleSort('name')} className="sortable">
                                Product Name {sortConfig.key === 'name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                            </th>
                            <th onClick={() => handleSort('category')} className="sortable">
                                Category {sortConfig.key === 'category' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                            </th>
                            <th onClick={() => handleSort('brand')} className="sortable">
                                Brand {sortConfig.key === 'brand' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                            </th>
                            <th onClick={() => handleSort('model')} className="sortable">
                                Model {sortConfig.key === 'model' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                            </th>
                            <th onClick={() => handleSort('capacity')} className="sortable">
                                Capacity {sortConfig.key === 'capacity' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                            </th>
                            <th onClick={() => handleSort('price')} className="sortable">
                                Price {sortConfig.key === 'price' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                            </th>
                            <th onClick={() => handleSort('mrp')} className="sortable">
                                MRP {sortConfig.key === 'mrp' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                            </th>
                            <th onClick={() => handleSort('stock')} className="sortable">
                                Stock {sortConfig.key === 'stock' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                            </th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredProducts.length > 0 ? (
                            filteredProducts.map((product) => (
                                <tr key={product._id}>
                                    <td className="checkbox-cell">
                                        <input
                                            type="checkbox"
                                            checked={selectedProducts.includes(product._id)}
                                            onChange={() => handleSelectProduct(product._id)}
                                        />
                                    </td>
                                    <td className="product-cell">
                                        <div className="product-info">
                                            {product.images && product.images.length > 0 ? (
                                                <img src={product.images[0]} alt={product.name} className="product-thumb" />
                                            ) : product.image ? (
                                                <img src={product.image} alt={product.name} className="product-thumb" />
                                            ) : (
                                                <div className="product-thumb-placeholder">
                                                    <ImageIcon size={20} />
                                                </div>
                                            )}
                                            <div>
                                                <p className="product-name">{product.name || 'Unnamed Product'}</p>
                                                <p className="product-sku">ID: {product._id?.slice(-8)}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td>{product.category || '-'}</td>
                                    <td>{product.brand || '-'}</td>
                                    <td>{product.model || '-'}</td>
                                    <td>{product.capacity || '-'}</td>
                                    <td className="price-cell">Rs {Number(product.price || 0).toLocaleString()}</td>
                                    <td className="price-cell">Rs {Number(product.mrp || 0).toLocaleString()}</td>
                                    <td className="stock-cell">
                                        <span className={`stock-badge ${
                                            Number(product.stock) === 0 ? 'out' :
                                            Number(product.stock) < 10 ? 'low' : 'good'
                                        }`}>
                                            {product.stock ?? 0}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`status-badge ${
                                            Number(product.stock) === 0 ? 'out-of-stock' :
                                            Number(product.stock) < 10 ? 'low-stock' : 'in-stock'
                                        }`}>
                                            {Number(product.stock) === 0 ? 'Out of Stock' :
                                             Number(product.stock) < 10 ? 'Low Stock' : 'In Stock'}
                                        </span>
                                    </td>
                                    <td className="actions-cell">
                                        <button
                                            className="action-btn action-btn-edit"
                                            onClick={() => openEditModal(product)}
                                            title="Edit"
                                        >
                                            <Edit size={16} />
                                        </button>
                                        <button
                                            className="action-btn action-btn-delete"
                                            onClick={() => handleDeleteProduct(product)}
                                            title="Delete"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="8" className="no-data">
                                    <Package size={48} />
                                    <p>No products found</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
                <div className="pagination">
                    <button
                        className="pagination-btn"
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={pagination.page === 1}
                    >
                        Previous
                    </button>
                    <div className="pagination-numbers">
                        {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                            let pageNum;
                            if (pagination.totalPages <= 5) {
                                pageNum = i + 1;
                            } else if (pagination.page <= 3) {
                                pageNum = i + 1;
                            } else if (pagination.page >= pagination.totalPages - 2) {
                                pageNum = pagination.totalPages - 4 + i;
                            } else {
                                pageNum = pagination.page - 2 + i;
                            }
                            return (
                                <button
                                    key={pageNum}
                                    className={`pagination-number ${pagination.page === pageNum ? 'active' : ''}`}
                                    onClick={() => handlePageChange(pageNum)}
                                >
                                    {pageNum}
                                </button>
                            );
                        })}
                    </div>
                    <button
                        className="pagination-btn"
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={pagination.page === pagination.totalPages}
                    >
                        Next
                    </button>
                </div>
            )}

            {/* Add Product Modal */}
            <AnimatePresence>
                {isAddModalOpen && (
                    <motion.div
                        className="modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsAddModalOpen(false)}
                    >
                        <motion.div
                            className="modal-content"
                            initial={{ scale: 0.95, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 20 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="modal-header">
                                <h2>Add New Product</h2>
                                <button className="modal-close" onClick={() => setIsAddModalOpen(false)}>×</button>
                            </div>
                            <form onSubmit={handleAddProduct} className="product-form">
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>Product Name *</label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={newProduct.name}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Slug</label>
                                        <input
                                            type="text"
                                            name="slug"
                                            value={newProduct.slug}
                                            onChange={handleInputChange}
                                            placeholder="url-friendly-name"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Brand</label>
                                        <input
                                            type="text"
                                            name="brand"
                                            value={newProduct.brand}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Category *</label>
                                        <select
                                            name="category"
                                            value={newProduct.category}
                                            onChange={handleInputChange}
                                            required
                                            className="filter-select"
                                        >
                                            <option value="">Select Category</option>
                                            {categories.slice(1).map(cat => (
                                                <option key={cat} value={cat}>{cat}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Model</label>
                                        <input
                                            type="text"
                                            name="model"
                                            value={newProduct.model}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Capacity</label>
                                        <input
                                            type="text"
                                            name="capacity"
                                            value={newProduct.capacity}
                                            onChange={handleInputChange}
                                            placeholder="e.g., 350 LTR"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Price *</label>
                                        <input
                                            type="number"
                                            name="price"
                                            value={newProduct.price}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>MRP</label>
                                        <input
                                            type="number"
                                            name="mrp"
                                            value={newProduct.mrp}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Stock *</label>
                                        <input
                                            type="number"
                                            name="stock"
                                            value={newProduct.stock}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    <div className="form-group full-width">
                                        <label>Keywords (comma separated)</label>
                                        <input
                                            type="text"
                                            name="keywords"
                                            value={newProduct.keywords.join(', ')}
                                            onChange={(e) => setNewProduct(prev => ({ ...prev, keywords: e.target.value.split(',').map(k => k.trim()).filter(Boolean) }))}
                                            placeholder="e.g., Refrigerator, Single Door, CG"
                                        />
                                    </div>
                                    <div className="form-group full-width">
                                        <label>Product Image</label>
                                        <div className="image-upload-area">
                                            <input
                                                type="file"
                                                id="product-image"
                                                accept="image/*"
                                                onChange={handleImageUpload}
                                                className="image-input"
                                            />
                                            <label htmlFor="product-image" className="image-upload-label">
                                                {imagePreview ? (
                                                    <div className="image-preview-container">
                                                        <img src={imagePreview} alt="Preview" className="image-preview" />
                                                        <button type="button" className="remove-image-btn" onClick={(e) => { e.preventDefault(); removeImage(); }}>
                                                            <X size={16} />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="upload-placeholder">
                                                        <Upload size={32} />
                                                        <span>Click to upload image</span>
                                                    </div>
                                                )}
                                            </label>
                                        </div>
                                    </div>
                                    <div className="form-group full-width">
                                        <label>Description</label>
                                        <textarea
                                            name="description"
                                            value={newProduct.description}
                                            onChange={handleInputChange}
                                            rows={4}
                                        />
                                    </div>
                                </div>
                                <div className="modal-actions">
                                    <button type="button" className="btn btn-secondary" onClick={() => { setIsAddModalOpen(false); resetForm(); }}>
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn btn-primary" disabled={uploading}>
                                        {uploading ? <RefreshCw className="spinner" size={16} /> : 'Add Product'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Edit Product Modal */}
            <AnimatePresence>
                {isEditModalOpen && (
                    <motion.div
                        className="modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsEditModalOpen(false)}
                    >
                        <motion.div
                            className="modal-content"
                            initial={{ scale: 0.95, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 20 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="modal-header">
                                <h2>Edit Product</h2>
                                <button className="modal-close" onClick={() => { setIsEditModalOpen(false); resetForm(); setSelectedProduct(null); }}>×</button>
                            </div>
                            <form onSubmit={handleEditProduct} className="product-form">
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>Product Name *</label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={newProduct.name}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Slug</label>
                                        <input
                                            type="text"
                                            name="slug"
                                            value={newProduct.slug}
                                            onChange={handleInputChange}
                                            placeholder="url-friendly-name"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Brand</label>
                                        <input
                                            type="text"
                                            name="brand"
                                            value={newProduct.brand}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Category *</label>
                                        <select
                                            name="category"
                                            value={newProduct.category}
                                            onChange={handleInputChange}
                                            required
                                            className="filter-select"
                                        >
                                            <option value="">Select Category</option>
                                            {categories.slice(1).map(cat => (
                                                <option key={cat} value={cat}>{cat}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Model</label>
                                        <input
                                            type="text"
                                            name="model"
                                            value={newProduct.model}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Capacity</label>
                                        <input
                                            type="text"
                                            name="capacity"
                                            value={newProduct.capacity}
                                            onChange={handleInputChange}
                                            placeholder="e.g., 350 LTR"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Price *</label>
                                        <input
                                            type="number"
                                            name="price"
                                            value={newProduct.price}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>MRP</label>
                                        <input
                                            type="number"
                                            name="mrp"
                                            value={newProduct.mrp}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Stock *</label>
                                        <input
                                            type="number"
                                            name="stock"
                                            value={newProduct.stock}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    <div className="form-group full-width">
                                        <label>Keywords (comma separated)</label>
                                        <input
                                            type="text"
                                            name="keywords"
                                            value={newProduct.keywords.join(', ')}
                                            onChange={(e) => setNewProduct(prev => ({ ...prev, keywords: e.target.value.split(',').map(k => k.trim()).filter(Boolean) }))}
                                            placeholder="e.g., Refrigerator, Single Door, CG"
                                        />
                                    </div>
                                    <div className="form-group full-width">
                                        <label>Product Image</label>
                                        <div className="image-upload-area">
                                            <input
                                                type="file"
                                                id="edit-product-image"
                                                accept="image/*"
                                                onChange={handleImageUpload}
                                                className="image-input"
                                            />
                                            <label htmlFor="edit-product-image" className="image-upload-label">
                                                {imagePreview ? (
                                                    <div className="image-preview-container">
                                                        <img src={imagePreview} alt="Preview" className="image-preview" />
                                                        <button type="button" className="remove-image-btn" onClick={(e) => { e.preventDefault(); removeImage(); }}>
                                                            <X size={16} />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="upload-placeholder">
                                                        <Upload size={32} />
                                                        <span>Click to upload new image</span>
                                                    </div>
                                                )}
                                            </label>
                                        </div>
                                    </div>
                                    <div className="form-group full-width">
                                        <label>Description</label>
                                        <textarea
                                            name="description"
                                            value={newProduct.description}
                                            onChange={handleInputChange}
                                            rows={4}
                                        />
                                    </div>
                                </div>
                                <div className="modal-actions">
                                    <button type="button" className="btn btn-secondary" onClick={() => { setIsEditModalOpen(false); resetForm(); setSelectedProduct(null); }}>
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn btn-primary" disabled={uploading}>
                                        {uploading ? <RefreshCw className="spinner" size={16} /> : 'Update Product'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {isDeleteModalOpen && (
                    <motion.div
                        className="modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsDeleteModalOpen(false)}
                    >
                        <motion.div
                            className="modal-content modal-sm"
                            initial={{ scale: 0.95, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 20 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="modal-header">
                                <h2>Confirm Delete</h2>
                                <button className="modal-close" onClick={() => setIsDeleteModalOpen(false)}>×</button>
                            </div>
                            <div className="modal-body">
                                <p>Are you sure you want to delete <strong>{selectedProduct?.name || selectedProduct?.title}</strong>?</p>
                                <p className="text-muted">This action cannot be undone.</p>
                            </div>
                            <div className="modal-actions">
                                <button className="btn btn-secondary" onClick={() => setIsDeleteModalOpen(false)}>
                                    Cancel
                                </button>
                                <button className="btn btn-danger" onClick={confirmDelete}>
                                    Delete
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Add Category Modal */}
            <AnimatePresence>
                {isCategoryModalOpen && (
                    <motion.div
                        className="modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsCategoryModalOpen(false)}
                    >
                        <motion.div
                            className="modal-content modal-sm"
                            initial={{ scale: 0.95, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 20 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="modal-header">
                                <h2>Add New Category</h2>
                                <button className="modal-close" onClick={() => setIsCategoryModalOpen(false)}>×</button>
                            </div>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label>Category Name</label>
                                    <input
                                        type="text"
                                        value={newCategory}
                                        onChange={(e) => setNewCategory(e.target.value)}
                                        placeholder="Enter category name"
                                        autoFocus
                                    />
                                </div>
                            </div>
                            <div className="modal-actions">
                                <button className="btn btn-secondary" onClick={() => setIsCategoryModalOpen(false)}>
                                    Cancel
                                </button>
                                <button className="btn btn-primary" onClick={handleAddCategory}>
                                    Add Category
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default InventoryManagement;
