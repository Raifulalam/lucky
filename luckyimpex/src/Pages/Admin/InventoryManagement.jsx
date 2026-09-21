import React, {
    useState,
    useEffect,
    useMemo,
    useCallback
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
    Upload,
    X,
    Image as ImageIcon
} from "lucide-react";

import {
    motion,
    AnimatePresence
} from "framer-motion";

import "./InventoryManagement.css";

import {
    authRequest,
    getData
} from "../../api/api";

import socket from "../../socket";


const InventoryManagement = () => {

    /* =========================================================
       STATE
    ========================================================= */

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [searchTerm, setSearchTerm] = useState("");
    const [searchType, setSearchType] = useState("all");

    const [selectedCategory, setSelectedCategory] = useState("all");
    const [stockFilter, setStockFilter] = useState("all");

    const [sortConfig, setSortConfig] = useState({
        key: "name",
        direction: "asc"
    });

    const [selectedProducts, setSelectedProducts] = useState([]);

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

    const [selectedProduct, setSelectedProduct] = useState(null);

    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    const [uploading, setUploading] = useState(false);

    const [newCategory, setNewCategory] = useState("");

    const [categories, setCategories] = useState([]);

    const [pagination, setPagination] = useState({
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0
    });

    const [newProduct, setNewProduct] = useState({
        name: "",
        slug: "",
        price: "",
        mrp: "",
        category: "",
        brand: "",
        model: "",
        capacity: "",
        stock: "",
        description: "",
        images: [],
        keywords: []
    });


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
                fetchedProducts
                    .map(product => product?.category)
                    .filter(Boolean)
            );

            setCategories([
                "all",
                ...Array.from(uniqueCategories)
            ]);

        } catch (err) {

            console.error("Failed to fetch products:", err);

            setError(
                err?.message ||
                "Failed to load products"
            );

        } finally {

            setLoading(false);

        }

    }, [pagination.limit]);


    /* =========================================================
       SEARCH PRODUCTS
    ========================================================= */

    const searchProducts = useCallback(async (
        query,
        type = "all"
    ) => {

        const trimmedQuery = query.trim();

        if (!trimmedQuery) {

            await fetchProducts(1);

            return;
        }

        setLoading(true);
        setError(null);

        try {

            const url =
                `/products/products/search/${encodeURIComponent(
                    trimmedQuery
                )}?page=1&limit=1000`;

            const data = await getData(url);

            let filteredResults = data?.products || [];

            /*
             * Name search is handled by backend.
             */

            if (type === "model") {

                filteredResults = filteredResults.filter(product =>
                    product?.model
                        ?.toLowerCase()
                        .includes(trimmedQuery.toLowerCase())
                );

            } else if (type === "brand") {

                filteredResults = filteredResults.filter(product =>
                    product?.brand
                        ?.toLowerCase()
                        .includes(trimmedQuery.toLowerCase())
                );

            }

            setProducts(filteredResults);

            setPagination(prev => ({
                ...prev,
                page: 1,
                total: filteredResults.length,
                totalPages: 1
            }));

        } catch (err) {

            console.error("Product search failed:", err);

            setError(
                err?.message ||
                "Product search failed"
            );

        } finally {

            setLoading(false);

        }

    }, [fetchProducts]);


    /* =========================================================
       INITIAL PRODUCT LOAD
    ========================================================= */

    useEffect(() => {

        fetchProducts(1);

    }, [fetchProducts]);


    /* =========================================================
       SOCKET.IO REAL-TIME UPDATES
    ========================================================= */

    useEffect(() => {

        const handleProductCreated = (product) => {

            if (!product?._id) {
                return;
            }

            setProducts(prev => {

                const alreadyExists = prev.some(
                    item => item._id === product._id
                );

                if (alreadyExists) {
                    return prev;
                }

                return [
                    product,
                    ...prev
                ];
            });

        };


        const handleProductUpdated = (updatedProduct) => {

            if (!updatedProduct?._id) {
                return;
            }

            setProducts(prev =>
                prev.map(product =>
                    product._id === updatedProduct._id
                        ? updatedProduct
                        : product
                )
            );

        };


        const handleProductDeleted = (productId) => {

            if (!productId) {
                return;
            }

            setProducts(prev =>
                prev.filter(
                    product => product._id !== productId
                )
            );

        };


        socket.on(
            "productCreated",
            handleProductCreated
        );

        socket.on(
            "productUpdated",
            handleProductUpdated
        );

        socket.on(
            "productDeleted",
            handleProductDeleted
        );


        return () => {

            socket.off(
                "productCreated",
                handleProductCreated
            );

            socket.off(
                "productUpdated",
                handleProductUpdated
            );

            socket.off(
                "productDeleted",
                handleProductDeleted
            );

        };

    }, []);


    /* =========================================================
       DEBOUNCED SEARCH
    ========================================================= */

    useEffect(() => {

        const timer = setTimeout(() => {

            searchProducts(
                searchTerm,
                searchType
            );

        }, 500);


        return () => {

            clearTimeout(timer);

        };

    }, [
        searchTerm,
        searchType,
        searchProducts
    ]);


    /* =========================================================
       PAGE CHANGE
    ========================================================= */

    const handlePageChange = useCallback((newPage) => {

        if (
            newPage >= 1 &&
            newPage <= pagination.totalPages
        ) {

            fetchProducts(newPage);

        }

    }, [
        fetchProducts,
        pagination.totalPages
    ]);


    /* =========================================================
       SEARCH HANDLERS
    ========================================================= */

    const handleSearchChange = (e) => {

        setSearchTerm(
            e.target.value
        );

    };


    const handleSearchTypeChange = (e) => {

        setSearchType(
            e.target.value
        );

    };


    /* =========================================================
       STATISTICS
    ========================================================= */

    const stats = useMemo(() => {

        const totalProducts =
            products.length;


        const totalStock =
            products.reduce(
                (sum, product) =>
                    sum +
                    (Number(product?.stock) || 0),
                0
            );


        const lowStock =
            products.filter(product => {

                const stock =
                    Number(product?.stock) || 0;

                return (
                    stock > 0 &&
                    stock < 10
                );

            }).length;


        const outOfStock =
            products.filter(product =>
                Number(product?.stock) === 0
            ).length;


        const totalValue =
            products.reduce(
                (sum, product) =>
                    sum +
                    (
                        Number(product?.price) || 0
                    ) *
                    (
                        Number(product?.stock) || 0
                    ),
                0
            );


        return {
            totalProducts,
            totalStock,
            lowStock,
            outOfStock,
            totalValue
        };

    }, [products]);


    /* =========================================================
       FILTER + SORT
    ========================================================= */

    const filteredProducts = useMemo(() => {

        let filtered = [
            ...products
        ];


        /*
         * Category filter
         */

        if (
            selectedCategory !== "all"
        ) {

            filtered =
                filtered.filter(
                    product =>
                        product?.category ===
                        selectedCategory
                );

        }


        /*
         * Stock filter
         */

        if (stockFilter === "low") {

            filtered =
                filtered.filter(product => {

                    const stock =
                        Number(product?.stock) || 0;

                    return (
                        stock > 0 &&
                        stock < 10
                    );

                });

        } else if (
            stockFilter === "out"
        ) {

            filtered =
                filtered.filter(product =>
                    Number(product?.stock) === 0
                );

        } else if (
            stockFilter === "in"
        ) {

            filtered =
                filtered.filter(product =>
                    Number(product?.stock) > 0
                );

        }


        /*
         * Sorting
         */

        filtered.sort((a, b) => {

            let aValue =
                a?.[sortConfig.key];

            let bValue =
                b?.[sortConfig.key];


            /*
             * Convert numeric fields
             */

            if (
                ["price", "mrp", "stock"].includes(
                    sortConfig.key
                )
            ) {

                aValue =
                    Number(aValue) || 0;

                bValue =
                    Number(bValue) || 0;

            } else {

                aValue =
                    String(
                        aValue ?? ""
                    ).toLowerCase();

                bValue =
                    String(
                        bValue ?? ""
                    ).toLowerCase();

            }


            if (aValue < bValue) {

                return sortConfig.direction === "asc"
                    ? -1
                    : 1;

            }


            if (aValue > bValue) {

                return sortConfig.direction === "asc"
                    ? 1
                    : -1;

            }


            return 0;

        });


        return filtered;

    }, [
        products,
        selectedCategory,
        stockFilter,
        sortConfig
    ]);


    /* =========================================================
       SORT
    ========================================================= */

    const handleSort = (key) => {

        setSortConfig(prev => ({

            key,

            direction:
                prev.key === key &&
                prev.direction === "asc"
                    ? "desc"
                    : "asc"

        }));

    };


    /* =========================================================
       SELECT PRODUCTS
    ========================================================= */

    const handleSelectAll = (checked) => {

        setSelectedProducts(
            checked
                ? filteredProducts.map(
                    product => product._id
                )
                : []
        );

    };


    const handleSelectProduct = (productId) => {

        setSelectedProducts(prev =>

            prev.includes(productId)

                ? prev.filter(
                    id => id !== productId
                )

                : [
                    ...prev,
                    productId
                ]

        );

    };


    /* =========================================================
       DELETE
    ========================================================= */

    const handleDeleteProduct = (product) => {

        setSelectedProduct(product);

        setIsDeleteModalOpen(true);

    };


    const confirmDelete = async () => {

        if (!selectedProduct?._id) {
            return;
        }

        try {

            await authRequest(
                `/products/products/${selectedProduct._id}`,
                {
                    method: "DELETE"
                }
            );


            setProducts(prev =>
                prev.filter(
                    product =>
                        product._id !==
                        selectedProduct._id
                )
            );


            setIsDeleteModalOpen(false);

            setSelectedProduct(null);

        } catch (err) {

            console.error(
                "Delete product failed:",
                err
            );

            setError(
                err?.message ||
                "Failed to delete product"
            );

        }

    };


    const handleBulkDelete = async () => {

        if (
            selectedProducts.length === 0
        ) {
            return;
        }


        try {

            await Promise.all(

                selectedProducts.map(
                    id =>
                        authRequest(
                            `/products/products/${id}`,
                            {
                                method: "DELETE"
                            }
                        )
                )

            );


            setProducts(prev =>
                prev.filter(
                    product =>
                        !selectedProducts.includes(
                            product._id
                        )
                )
            );


            setSelectedProducts([]);

        } catch (err) {

            console.error(
                "Bulk delete failed:",
                err
            );

            setError(
                err?.message ||
                "Failed to delete selected products"
            );

        }

    };


    /* =========================================================
       FORM INPUT
    ========================================================= */

    const handleInputChange = (e) => {

        const {
            name,
            value
        } = e.target;


        setNewProduct(prev => ({
            ...prev,
            [name]: value
        }));

    };


    /* =========================================================
       IMAGE
    ========================================================= */

    const handleImageUpload = (e) => {

        const file =
            e.target.files?.[0];


        if (!file) {
            return;
        }


        setImageFile(file);


        const reader =
            new FileReader();


        reader.onloadend = () => {

            setImagePreview(
                reader.result
            );

        };


        reader.readAsDataURL(file);

    };


    const removeImage = () => {

        setImageFile(null);

        setImagePreview(null);

    };


    /* =========================================================
       ADD PRODUCT
    ========================================================= */

    const handleAddProduct = async (e) => {

        e.preventDefault();

        setUploading(true);

        setError(null);


        try {

            const formData =
                new FormData();


            Object.keys(newProduct)
                .forEach(key => {

                    if (
                        key !== "images" &&
                        key !== "specifications" &&
                        key !== "features"
                    ) {

                        formData.append(
                            key,
                            newProduct[key]
                        );

                    }

                });


            if (imageFile) {

                formData.append(
                    "image",
                    imageFile
                );

            }


            formData.append(
                "images",
                JSON.stringify(
                    newProduct.images || []
                )
            );


            formData.append(
                "specifications",
                JSON.stringify(
                    newProduct.specifications || {}
                )
            );


            formData.append(
                "features",
                JSON.stringify(
                    newProduct.features || []
                )
            );


            const addedProduct =
                await authRequest(
                    "/products/products",
                    {
                        method: "POST",
                        body: formData,
                        isFormData: true
                    }
                );


            setProducts(prev => [
                addedProduct,
                ...prev
            ]);


            resetForm();

            setIsAddModalOpen(false);

        } catch (err) {

            console.error(
                "Add product failed:",
                err
            );

            setError(
                err?.message ||
                "Failed to add product"
            );

        } finally {

            setUploading(false);

        }

    };


    /* =========================================================
       EDIT PRODUCT
    ========================================================= */

    const handleEditProduct = async (e) => {

        e.preventDefault();

        if (!selectedProduct?._id) {
            return;
        }

        setUploading(true);

        setError(null);


        try {

            const formData =
                new FormData();


            Object.keys(newProduct)
                .forEach(key => {

                    if (
                        key !== "images" &&
                        key !== "specifications" &&
                        key !== "features"
                    ) {

                        formData.append(
                            key,
                            newProduct[key]
                        );

                    }

                });


            if (imageFile) {

                formData.append(
                    "image",
                    imageFile
                );

            }


            formData.append(
                "images",
                JSON.stringify(
                    newProduct.images || []
                )
            );


            formData.append(
                "specifications",
                JSON.stringify(
                    newProduct.specifications || {}
                )
            );


            formData.append(
                "features",
                JSON.stringify(
                    newProduct.features || []
                )
            );


            const updatedProduct =
                await authRequest(
                    `/products/products/${selectedProduct._id}`,
                    {
                        method: "PUT",
                        body: formData,
                        isFormData: true
                    }
                );


            setProducts(prev =>
                prev.map(product =>
                    product._id ===
                    selectedProduct._id
                        ? updatedProduct
                        : product
                )
            );


            resetForm();

            setIsEditModalOpen(false);

            setSelectedProduct(null);

        } catch (err) {

            console.error(
                "Update product failed:",
                err
            );

            setError(
                err?.message ||
                "Failed to update product"
            );

        } finally {

            setUploading(false);

        }

    };


    /* =========================================================
       RESET FORM
    ========================================================= */

    const resetForm = () => {

        setNewProduct({

            name: "",
            slug: "",
            price: "",
            mrp: "",
            category: "",
            brand: "",
            model: "",
            capacity: "",
            stock: "",
            description: "",
            images: [],
            keywords: []

        });


        setImageFile(null);

        setImagePreview(null);

    };


    /* =========================================================
       OPEN EDIT MODAL
    ========================================================= */

    const openEditModal = (product) => {

        setSelectedProduct(product);


        setNewProduct({

            name:
                product?.name || "",

            slug:
                product?.slug || "",

            price:
                product?.price || "",

            mrp:
                product?.mrp || "",

            category:
                product?.category || "",

            brand:
                product?.brand || "",

            model:
                product?.model || "",

            capacity:
                product?.capacity || "",

            stock:
                product?.stock ?? "",

            description:
                product?.description || "",

            images:
                product?.images || [],

            keywords:
                product?.keywords || []

        });


        const productImage =
            product?.images?.[0] ||
            product?.image ||
            null;


        setImagePreview(
            productImage
        );


        setIsEditModalOpen(true);

    };


    /* =========================================================
       CATEGORY
    ========================================================= */

    const handleAddCategory = async () => {

        const category =
            newCategory.trim();


        if (!category) {
            return;
        }


        setCategories(prev => {

            if (
                prev.includes(category)
            ) {
                return prev;
            }

            return [
                ...prev,
                category
            ];

        });


        setNewProduct(prev => ({
            ...prev,
            category
        }));


        setNewCategory("");

        setIsCategoryModalOpen(false);

    };


    /* =========================================================
       CSV EXPORT
    ========================================================= */

    const handleExportCSV = () => {

        const headers = [
            "ID",
            "Name",
            "Slug",
            "Category",
            "Brand",
            "Model",
            "Capacity",
            "Price",
            "MRP",
            "Stock",
            "Keywords",
            "Description"
        ];


        const csvContent = [

            headers.join(","),

            ...filteredProducts.map(product => [

                product?._id || "",

                `"${(
                    product?.name || ""
                ).replace(/"/g, '""')}"`,

                `"${(
                    product?.slug || ""
                ).replace(/"/g, '""')}"`,

                `"${(
                    product?.category || ""
                ).replace(/"/g, '""')}"`,

                `"${(
                    product?.brand || ""
                ).replace(/"/g, '""')}"`,

                `"${(
                    product?.model || ""
                ).replace(/"/g, '""')}"`,

                `"${(
                    product?.capacity || ""
                ).replace(/"/g, '""')}"`,

                product?.price || 0,

                product?.mrp || 0,

                product?.stock || 0,

                `"${(
                    product?.keywords?.join("; ") ||
                    ""
                ).replace(/"/g, '""')}"`,

                `"${(
                    product?.description || ""
                )
                    .replace(/\r?\n/g, " ")
                    .replace(/"/g, '""')}"`
            ].join(","))

        ].join("\n");


        const blob =
            new Blob(
                [csvContent],
                {
                    type:
                        "text/csv;charset=utf-8;"
                }
            );


        const link =
            document.createElement("a");


        link.href =
            URL.createObjectURL(blob);


        link.download =
            `inventory-export-${new Date()
                .toISOString()
                .split("T")[0]
            }.csv`;


        link.click();


        URL.revokeObjectURL(
            link.href
        );

    };


    /* =========================================================
       LOADING
    ========================================================= */

    if (loading) {

        return (

            <div className="inventory-management">

                <div className="loading-state">

                    <RefreshCw
                        className="spinner"
                        size={40}
                    />

                    <p>
                        Loading inventory...
                    </p>

                </div>

            </div>

        );

    }


    /* =========================================================
       ERROR
    ========================================================= */

    if (error) {

        return (

            <div className="inventory-management">

                <div className="error-state">

                    <AlertCircle size={40} />

                    <p>
                        Error: {error}
                    </p>

                    <button
                        onClick={() => {
                            setError(null);
                            fetchProducts(
                                pagination.page
                            );
                        }}
                    >
                        Retry
                    </button>

                </div>

            </div>

        );

    }


    /* =========================================================
       UI
    ========================================================= */

    return (

        <div className="inventory-management">

            {/* =================================================
                STATISTICS
            ================================================= */}

            <div className="stats-grid">

                <div className="stat-card">

                    <div className="stat-icon stat-icon-blue">
                        <Package size={24} />
                    </div>

                    <div className="stat-content">

                        <p className="stat-label">
                            Total Products
                        </p>

                        <p className="stat-value">
                            {stats.totalProducts}
                        </p>

                    </div>

                </div>


                <div className="stat-card">

                    <div className="stat-icon stat-icon-green">
                        <TrendingUp size={24} />
                    </div>

                    <div className="stat-content">

                        <p className="stat-label">
                            Total Stock
                        </p>

                        <p className="stat-value">
                            {stats.totalStock}
                        </p>

                    </div>

                </div>


                <div className="stat-card">

                    <div className="stat-icon stat-icon-orange">
                        <AlertCircle size={24} />
                    </div>

                    <div className="stat-content">

                        <p className="stat-label">
                            Low Stock
                        </p>

                        <p className="stat-value">
                            {stats.lowStock}
                        </p>

                    </div>

                </div>


                <div className="stat-card">

                    <div className="stat-icon stat-icon-red">
                        <AlertCircle size={24} />
                    </div>

                    <div className="stat-content">

                        <p className="stat-label">
                            Out of Stock
                        </p>

                        <p className="stat-value">
                            {stats.outOfStock}
                        </p>

                    </div>

                </div>

            </div>


            {/* =================================================
                HEADER
            ================================================= */}

            <div className="inventory-header">

                <div className="header-left">

                    <h1>
                        Inventory Management
                    </h1>

                    <p className="subtitle">
                        Manage your product inventory efficiently
                    </p>

                </div>


                <div className="header-actions">

                    <button
                        className="btn btn-secondary"
                        onClick={() =>
                            fetchProducts(
                                pagination.page
                            )
                        }
                    >
                        <RefreshCw size={18} />
                        Refresh
                    </button>


                    <button
                        className="btn btn-secondary"
                        onClick={handleExportCSV}
                    >
                        <Download size={18} />
                        Export CSV
                    </button>


                    <button
                        className="btn btn-primary"
                        onClick={() =>
                            setIsAddModalOpen(true)
                        }
                    >
                        <Plus size={18} />
                        Add Product
                    </button>

                </div>

            </div>


            {/* =================================================
                FILTERS
            ================================================= */}

            <div className="filters-bar">

                <div className="search-box">

                    <Search
                        size={18}
                        className="search-icon"
                    />

                    <input
                        type="text"
                        placeholder="Search products across all pages..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                    />


                    <select
                        value={searchType}
                        onChange={
                            handleSearchTypeChange
                        }
                        className="search-type-select"
                    >

                        <option value="all">
                            All Fields
                        </option>

                        <option value="name">
                            By Name
                        </option>

                        <option value="model">
                            By Model
                        </option>

                        <option value="brand">
                            By Brand
                        </option>

                    </select>

                </div>


                <div className="filter-group">

                    <select
                        value={selectedCategory}
                        onChange={(e) => {

                            if (
                                e.target.value ===
                                "add-new"
                            ) {

                                setIsCategoryModalOpen(
                                    true
                                );

                            } else {

                                setSelectedCategory(
                                    e.target.value
                                );

                            }

                        }}
                        className="filter-select"
                    >

                        <option value="all">
                            All Categories
                        </option>

                        {categories
                            .slice(1)
                            .map(category => (

                                <option
                                    key={category}
                                    value={category}
                                >
                                    {category}
                                </option>

                            ))}

                        <option value="add-new">
                            + Add New Category
                        </option>

                    </select>


                    <select
                        value={stockFilter}
                        onChange={(e) =>
                            setStockFilter(
                                e.target.value
                            )
                        }
                        className="filter-select"
                    >

                        <option value="all">
                            All Stock
                        </option>

                        <option value="in">
                            In Stock
                        </option>

                        <option value="low">
                            Low Stock (&lt;10)
                        </option>

                        <option value="out">
                            Out of Stock
                        </option>

                    </select>

                </div>


                <div className="results-count">

                    Showing{" "}
                    {filteredProducts.length}{" "}
                    of{" "}
                    {pagination.total}{" "}
                    products

                </div>


                {selectedProducts.length > 0 && (

                    <button
                        className="btn btn-danger btn-sm"
                        onClick={handleBulkDelete}
                    >

                        <Trash2 size={16} />

                        Delete Selected (
                        {selectedProducts.length}
                        )

                    </button>

                )}

            </div>


            {/* =================================================
                TABLE
            ================================================= */}

            <div className="table-container">

                <table className="inventory-table">

                    <thead>

                        <tr>

                            <th className="checkbox-cell">

                                <input
                                    type="checkbox"
                                    checked={
                                        selectedProducts.length ===
                                            filteredProducts.length &&
                                        filteredProducts.length > 0
                                    }
                                    onChange={(e) =>
                                        handleSelectAll(
                                            e.target.checked
                                        )
                                    }
                                />

                            </th>


                            <th
                                onClick={() =>
                                    handleSort("name")
                                }
                                className="sortable"
                            >
                                Product Name{" "}
                                {sortConfig.key === "name" &&
                                    (
                                        sortConfig.direction ===
                                        "asc"
                                            ? "↑"
                                            : "↓"
                                    )}
                            </th>


                            <th
                                onClick={() =>
                                    handleSort("category")
                                }
                                className="sortable"
                            >
                                Category
                            </th>


                            <th
                                onClick={() =>
                                    handleSort("brand")
                                }
                                className="sortable"
                            >
                                Brand
                            </th>


                            <th
                                onClick={() =>
                                    handleSort("model")
                                }
                                className="sortable"
                            >
                                Model
                            </th>


                            <th
                                onClick={() =>
                                    handleSort("capacity")
                                }
                                className="sortable"
                            >
                                Capacity
                            </th>


                            <th
                                onClick={() =>
                                    handleSort("price")
                                }
                                className="sortable"
                            >
                                Price
                            </th>


                            <th
                                onClick={() =>
                                    handleSort("mrp")
                                }
                                className="sortable"
                            >
                                MRP
                            </th>


                            <th
                                onClick={() =>
                                    handleSort("stock")
                                }
                                className="sortable"
                            >
                                Stock
                            </th>


                            <th>
                                Status
                            </th>


                            <th>
                                Actions
                            </th>

                        </tr>

                    </thead>


                    <tbody>

                        {filteredProducts.length > 0 ? (

                            filteredProducts.map(
                                product => {

                                    const stock =
                                        Number(
                                            product?.stock
                                        ) || 0;


                                    return (

                                        <tr
                                            key={
                                                product._id
                                            }
                                        >

                                            <td className="checkbox-cell">

                                                <input
                                                    type="checkbox"
                                                    checked={
                                                        selectedProducts.includes(
                                                            product._id
                                                        )
                                                    }
                                                    onChange={() =>
                                                        handleSelectProduct(
                                                            product._id
                                                        )
                                                    }
                                                />

                                            </td>


                                            <td className="product-cell">

                                                <div className="product-info">

                                                    {product?.images?.length >
                                                    0 ? (

                                                        <img
                                                            src={
                                                                product.images[0]
                                                            }
                                                            alt={
                                                                product.name
                                                            }
                                                            className="product-thumb"
                                                        />

                                                    ) : product?.image ? (

                                                        <img
                                                            src={
                                                                product.image
                                                            }
                                                            alt={
                                                                product.name
                                                            }
                                                            className="product-thumb"
                                                        />

                                                    ) : (

                                                        <div className="product-thumb-placeholder">

                                                            <ImageIcon
                                                                size={20}
                                                            />

                                                        </div>

                                                    )}


                                                    <div>

                                                        <p className="product-name">

                                                            {product?.name ||
                                                                "Unnamed Product"}

                                                        </p>


                                                        <p className="product-sku">

                                                            ID:{" "}
                                                            {product?._id?.slice(
                                                                -8
                                                            )}

                                                        </p>

                                                    </div>

                                                </div>

                                            </td>


                                            <td>
                                                {product?.category ||
                                                    "-"}
                                            </td>


                                            <td>
                                                {product?.brand ||
                                                    "-"}
                                            </td>


                                            <td>
                                                {product?.model ||
                                                    "-"}
                                            </td>


                                            <td>
                                                {product?.capacity ||
                                                    "-"}
                                            </td>


                                            <td className="price-cell">

                                                Rs{" "}
                                                {Number(
                                                    product?.price ||
                                                    0
                                                ).toLocaleString()}

                                            </td>


                                            <td className="price-cell">

                                                Rs{" "}
                                                {Number(
                                                    product?.mrp ||
                                                    0
                                                ).toLocaleString()}

                                            </td>


                                            <td className="stock-cell">

                                                <span
                                                    className={`stock-badge ${
                                                        stock === 0
                                                            ? "out"
                                                            : stock < 10
                                                                ? "low"
                                                                : "good"
                                                    }`}
                                                >
                                                    {stock}
                                                </span>

                                            </td>


                                            <td>

                                                <span
                                                    className={`status-badge ${
                                                        stock === 0
                                                            ? "out-of-stock"
                                                            : stock < 10
                                                                ? "low-stock"
                                                                : "in-stock"
                                                    }`}
                                                >

                                                    {stock === 0
                                                        ? "Out of Stock"
                                                        : stock < 10
                                                            ? "Low Stock"
                                                            : "In Stock"}

                                                </span>

                                            </td>


                                            <td className="actions-cell">

                                                <button
                                                    className="action-btn action-btn-edit"
                                                    onClick={() =>
                                                        openEditModal(
                                                            product
                                                        )
                                                    }
                                                    title="Edit"
                                                >

                                                    <Edit
                                                        size={16}
                                                    />

                                                </button>


                                                <button
                                                    className="action-btn action-btn-delete"
                                                    onClick={() =>
                                                        handleDeleteProduct(
                                                            product
                                                        )
                                                    }
                                                    title="Delete"
                                                >

                                                    <Trash2
                                                        size={16}
                                                    />

                                                </button>

                                            </td>

                                        </tr>

                                    );

                                }

                            )

                        ) : (

                            <tr>

                                <td
                                    colSpan="11"
                                    className="no-data"
                                >

                                    <Package
                                        size={48}
                                    />

                                    <p>
                                        No products found
                                    </p>

                                </td>

                            </tr>

                        )}

                    </tbody>

                </table>

            </div>


            {/* =================================================
                PAGINATION
            ================================================= */}

            {pagination.totalPages > 1 && (

                <div className="pagination">

                    <button
                        className="pagination-btn"
                        onClick={() =>
                            handlePageChange(
                                pagination.page - 1
                            )
                        }
                        disabled={
                            pagination.page === 1
                        }
                    >
                        Previous
                    </button>


                    <div className="pagination-numbers">

                        {Array.from(
                            {
                                length:
                                    Math.min(
                                        5,
                                        pagination.totalPages
                                    )
                            },
                            (_, i) => {

                                let pageNum;


                                if (
                                    pagination.totalPages <=
                                    5
                                ) {

                                    pageNum =
                                        i + 1;

                                } else if (
                                    pagination.page <=
                                    3
                                ) {

                                    pageNum =
                                        i + 1;

                                } else if (
                                    pagination.page >=
                                    pagination.totalPages - 2
                                ) {

                                    pageNum =
                                        pagination.totalPages -
                                        4 +
                                        i;

                                } else {

                                    pageNum =
                                        pagination.page -
                                        2 +
                                        i;

                                }


                                return (

                                    <button
                                        key={pageNum}
                                        className={`pagination-number ${
                                            pagination.page ===
                                            pageNum
                                                ? "active"
                                                : ""
                                        }`}
                                        onClick={() =>
                                            handlePageChange(
                                                pageNum
                                            )
                                        }
                                    >
                                        {pageNum}
                                    </button>

                                );

                            }
                        )}

                    </div>


                    <button
                        className="pagination-btn"
                        onClick={() =>
                            handlePageChange(
                                pagination.page + 1
                            )
                        }
                        disabled={
                            pagination.page ===
                            pagination.totalPages
                        }
                    >
                        Next
                    </button>

                </div>

            )}


            {/* =================================================
                ADD PRODUCT MODAL
            ================================================= */}

            <AnimatePresence>

                {isAddModalOpen && (

                    <motion.div
                        className="modal-overlay"
                        initial={{
                            opacity: 0
                        }}
                        animate={{
                            opacity: 1
                        }}
                        exit={{
                            opacity: 0
                        }}
                        onClick={() =>
                            setIsAddModalOpen(
                                false
                            )
                        }
                    >

                        <motion.div
                            className="modal-content"
                            initial={{
                                scale: 0.95,
                                y: 20
                            }}
                            animate={{
                                scale: 1,
                                y: 0
                            }}
                            exit={{
                                scale: 0.95,
                                y: 20
                            }}
                            transition={{
                                type: "spring",
                                damping: 25,
                                stiffness: 300
                            }}
                            onClick={(e) =>
                                e.stopPropagation()
                            }
                        >

                            <div className="modal-header">

                                <h2>
                                    Add New Product
                                </h2>

                                <button
                                    className="modal-close"
                                    onClick={() => {
                                        setIsAddModalOpen(false);
                                        resetForm();
                                    }}
                                >
                                    ×
                                </button>

                            </div>


                            <form
                                onSubmit={
                                    handleAddProduct
                                }
                                className="product-form"
                            >

                                <div className="form-grid">

                                    <div className="form-group">

                                        <label>
                                            Product Name *
                                        </label>

                                        <input
                                            type="text"
                                            name="name"
                                            value={
                                                newProduct.name
                                            }
                                            onChange={
                                                handleInputChange
                                            }
                                            required
                                        />

                                    </div>


                                    <div className="form-group">

                                        <label>
                                            Slug
                                        </label>

                                        <input
                                            type="text"
                                            name="slug"
                                            value={
                                                newProduct.slug
                                            }
                                            onChange={
                                                handleInputChange
                                            }
                                            placeholder="url-friendly-name"
                                        />

                                    </div>


                                    <div className="form-group">

                                        <label>
                                            Brand
                                        </label>

                                        <input
                                            type="text"
                                            name="brand"
                                            value={
                                                newProduct.brand
                                            }
                                            onChange={
                                                handleInputChange
                                            }
                                        />

                                    </div>


                                    <div className="form-group">

                                        <label>
                                            Category *
                                        </label>

                                        <select
                                            name="category"
                                            value={
                                                newProduct.category
                                            }
                                            onChange={
                                                handleInputChange
                                            }
                                            required
                                            className="filter-select"
                                        >

                                            <option value="">
                                                Select Category
                                            </option>

                                            {categories
                                                .slice(1)
                                                .map(category => (

                                                    <option
                                                        key={
                                                            category
                                                        }
                                                        value={
                                                            category
                                                        }
                                                    >
                                                        {category}
                                                    </option>

                                                ))}

                                        </select>

                                    </div>


                                    <div className="form-group">

                                        <label>
                                            Model
                                        </label>

                                        <input
                                            type="text"
                                            name="model"
                                            value={
                                                newProduct.model
                                            }
                                            onChange={
                                                handleInputChange
                                            }
                                        />

                                    </div>


                                    <div className="form-group">

                                        <label>
                                            Capacity
                                        </label>

                                        <input
                                            type="text"
                                            name="capacity"
                                            value={
                                                newProduct.capacity
                                            }
                                            onChange={
                                                handleInputChange
                                            }
                                            placeholder="e.g., 350 LTR"
                                        />

                                    </div>


                                    <div className="form-group">

                                        <label>
                                            Price *
                                        </label>

                                        <input
                                            type="number"
                                            name="price"
                                            value={
                                                newProduct.price
                                            }
                                            onChange={
                                                handleInputChange
                                            }
                                            required
                                        />

                                    </div>


                                    <div className="form-group">

                                        <label>
                                            MRP
                                        </label>

                                        <input
                                            type="number"
                                            name="mrp"
                                            value={
                                                newProduct.mrp
                                            }
                                            onChange={
                                                handleInputChange
                                            }
                                        />

                                    </div>


                                    <div className="form-group">

                                        <label>
                                            Stock *
                                        </label>

                                        <input
                                            type="number"
                                            name="stock"
                                            min="0"
                                            value={
                                                newProduct.stock
                                            }
                                            onChange={
                                                handleInputChange
                                            }
                                            required
                                        />

                                    </div>


                                    <div className="form-group full-width">

                                        <label>
                                            Keywords (comma separated)
                                        </label>

                                        <input
                                            type="text"
                                            name="keywords"
                                            value={
                                                newProduct.keywords.join(
                                                    ", "
                                                )
                                            }
                                            onChange={(e) =>
                                                setNewProduct(
                                                    prev => ({
                                                        ...prev,
                                                        keywords:
                                                            e.target.value
                                                                .split(
                                                                    ","
                                                                )
                                                                .map(
                                                                    k =>
                                                                        k.trim()
                                                                )
                                                                .filter(
                                                                    Boolean
                                                                )
                                                    })
                                                )
                                            }
                                            placeholder="e.g., Refrigerator, Single Door, CG"
                                        />

                                    </div>


                                    <div className="form-group full-width">

                                        <label>
                                            Product Image
                                        </label>

                                        <div className="image-upload-area">

                                            <input
                                                type="file"
                                                id="product-image"
                                                accept="image/*"
                                                onChange={
                                                    handleImageUpload
                                                }
                                                className="image-input"
                                            />


                                            <label
                                                htmlFor="product-image"
                                                className="image-upload-label"
                                            >

                                                {imagePreview ? (

                                                    <div className="image-preview-container">

                                                        <img
                                                            src={
                                                                imagePreview
                                                            }
                                                            alt="Preview"
                                                            className="image-preview"
                                                        />

                                                        <button
                                                            type="button"
                                                            className="remove-image-btn"
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                removeImage();
                                                            }}
                                                        >
                                                            <X
                                                                size={16}
                                                            />
                                                        </button>

                                                    </div>

                                                ) : (

                                                    <div className="upload-placeholder">

                                                        <Upload
                                                            size={32}
                                                        />

                                                        <span>
                                                            Click to upload image
                                                        </span>

                                                    </div>

                                                )}

                                            </label>

                                        </div>

                                    </div>


                                    <div className="form-group full-width">

                                        <label>
                                            Description
                                        </label>

                                        <textarea
                                            name="description"
                                            value={
                                                newProduct.description
                                            }
                                            onChange={
                                                handleInputChange
                                            }
                                            rows={4}
                                        />

                                    </div>

                                </div>


                                <div className="modal-actions">

                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={() => {
                                            setIsAddModalOpen(false);
                                            resetForm();
                                        }}
                                    >
                                        Cancel
                                    </button>


                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={
                                            uploading
                                        }
                                    >

                                        {uploading ? (

                                            <RefreshCw
                                                className="spinner"
                                                size={16}
                                            />

                                        ) : (
                                            "Add Product"
                                        )}

                                    </button>

                                </div>

                            </form>

                        </motion.div>

                    </motion.div>

                )}

            </AnimatePresence>


            {/* =================================================
                EDIT PRODUCT MODAL
            ================================================= */}

            <AnimatePresence>

                {isEditModalOpen && (

                    <motion.div
                        className="modal-overlay"
                        initial={{
                            opacity: 0
                        }}
                        animate={{
                            opacity: 1
                        }}
                        exit={{
                            opacity: 0
                        }}
                        onClick={() =>
                            setIsEditModalOpen(false)
                        }
                    >

                        <motion.div
                            className="modal-content"
                            initial={{
                                scale: 0.95,
                                y: 20
                            }}
                            animate={{
                                scale: 1,
                                y: 0
                            }}
                            exit={{
                                scale: 0.95,
                                y: 20
                            }}
                            transition={{
                                type: "spring",
                                damping: 25,
                                stiffness: 300
                            }}
                            onClick={(e) =>
                                e.stopPropagation()
                            }
                        >

                            <div className="modal-header">

                                <h2>
                                    Edit Product
                                </h2>

                                <button
                                    className="modal-close"
                                    onClick={() => {
                                        setIsEditModalOpen(false);
                                        resetForm();
                                        setSelectedProduct(null);
                                    }}
                                >
                                    ×
                                </button>

                            </div>


                            <form
                                onSubmit={
                                    handleEditProduct
                                }
                                className="product-form"
                            >

                                <div className="form-grid">

                                    <div className="form-group">

                                        <label>
                                            Product Name *
                                        </label>

                                        <input
                                            type="text"
                                            name="name"
                                            value={
                                                newProduct.name
                                            }
                                            onChange={
                                                handleInputChange
                                            }
                                            required
                                        />

                                    </div>


                                    <div className="form-group">

                                        <label>
                                            Slug
                                        </label>

                                        <input
                                            type="text"
                                            name="slug"
                                            value={
                                                newProduct.slug
                                            }
                                            onChange={
                                                handleInputChange
                                            }
                                            placeholder="url-friendly-name"
                                        />

                                    </div>


                                    <div className="form-group">

                                        <label>
                                            Brand
                                        </label>

                                        <input
                                            type="text"
                                            name="brand"
                                            value={
                                                newProduct.brand
                                            }
                                            onChange={
                                                handleInputChange
                                            }
                                        />

                                    </div>


                                    <div className="form-group">

                                        <label>
                                            Category *
                                        </label>

                                        <select
                                            name="category"
                                            value={
                                                newProduct.category
                                            }
                                            onChange={
                                                handleInputChange
                                            }
                                            required
                                            className="filter-select"
                                        >

                                            <option value="">
                                                Select Category
                                            </option>

                                            {categories
                                                .slice(1)
                                                .map(category => (

                                                    <option
                                                        key={
                                                            category
                                                        }
                                                        value={
                                                            category
                                                        }
                                                    >
                                                        {category}
                                                    </option>

                                                ))}

                                        </select>

                                    </div>


                                    <div className="form-group">

                                        <label>
                                            Model
                                        </label>

                                        <input
                                            type="text"
                                            name="model"
                                            value={
                                                newProduct.model
                                            }
                                            onChange={
                                                handleInputChange
                                            }
                                        />

                                    </div>


                                    <div className="form-group">

                                        <label>
                                            Capacity
                                        </label>

                                        <input
                                            type="text"
                                            name="capacity"
                                            value={
                                                newProduct.capacity
                                            }
                                            onChange={
                                                handleInputChange
                                            }
                                            placeholder="e.g., 350 LTR"
                                        />

                                    </div>


                                    <div className="form-group">

                                        <label>
                                            Price *
                                        </label>

                                        <input
                                            type="number"
                                            name="price"
                                            value={
                                                newProduct.price
                                            }
                                            onChange={
                                                handleInputChange
                                            }
                                            required
                                        />

                                    </div>


                                    <div className="form-group">

                                        <label>
                                            MRP
                                        </label>

                                        <input
                                            type="number"
                                            name="mrp"
                                            value={
                                                newProduct.mrp
                                            }
                                            onChange={
                                                handleInputChange
                                            }
                                        />

                                    </div>


                                    <div className="form-group">

                                        <label>
                                            Stock *
                                        </label>

                                        <input
                                            type="number"
                                            name="stock"
                                            min="0"
                                            value={
                                                newProduct.stock
                                            }
                                            onChange={
                                                handleInputChange
                                            }
                                            required
                                        />

                                    </div>


                                    <div className="form-group full-width">

                                        <label>
                                            Keywords (comma separated)
                                        </label>

                                        <input
                                            type="text"
                                            name="keywords"
                                            value={
                                                newProduct.keywords.join(
                                                    ", "
                                                )
                                            }
                                            onChange={(e) =>
                                                setNewProduct(
                                                    prev => ({
                                                        ...prev,
                                                        keywords:
                                                            e.target.value
                                                                .split(
                                                                    ","
                                                                )
                                                                .map(
                                                                    k =>
                                                                        k.trim()
                                                                )
                                                                .filter(
                                                                    Boolean
                                                                )
                                                    })
                                                )
                                            }
                                            placeholder="e.g., Refrigerator, Single Door, CG"
                                        />

                                    </div>


                                    <div className="form-group full-width">

                                        <label>
                                            Product Image
                                        </label>

                                        <div className="image-upload-area">

                                            <input
                                                type="file"
                                                id="edit-product-image"
                                                accept="image/*"
                                                onChange={
                                                    handleImageUpload
                                                }
                                                className="image-input"
                                            />


                                            <label
                                                htmlFor="edit-product-image"
                                                className="image-upload-label"
                                            >

                                                {imagePreview ? (

                                                    <div className="image-preview-container">

                                                        <img
                                                            src={
                                                                imagePreview
                                                            }
                                                            alt="Preview"
                                                            className="image-preview"
                                                        />

                                                        <button
                                                            type="button"
                                                            className="remove-image-btn"
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                removeImage();
                                                            }}
                                                        >

                                                            <X
                                                                size={16}
                                                            />

                                                        </button>

                                                    </div>

                                                ) : (

                                                    <div className="upload-placeholder">

                                                        <Upload
                                                            size={32}
                                                        />

                                                        <span>
                                                            Click to upload new image
                                                        </span>

                                                    </div>

                                                )}

                                            </label>

                                        </div>

                                    </div>


                                    <div className="form-group full-width">

                                        <label>
                                            Description
                                        </label>

                                        <textarea
                                            name="description"
                                            value={
                                                newProduct.description
                                            }
                                            onChange={
                                                handleInputChange
                                            }
                                            rows={4}
                                        />

                                    </div>

                                </div>


                                <div className="modal-actions">

                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={() => {
                                            setIsEditModalOpen(false);
                                            resetForm();
                                            setSelectedProduct(null);
                                        }}
                                    >
                                        Cancel
                                    </button>


                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={
                                            uploading
                                        }
                                    >

                                        {uploading ? (

                                            <RefreshCw
                                                className="spinner"
                                                size={16}
                                            />

                                        ) : (
                                            "Update Product"
                                        )}

                                    </button>

                                </div>

                            </form>

                        </motion.div>

                    </motion.div>

                )}

            </AnimatePresence>


            {/* =================================================
                DELETE MODAL
            ================================================= */}

            <AnimatePresence>

                {isDeleteModalOpen && (

                    <motion.div
                        className="modal-overlay"
                        initial={{
                            opacity: 0
                        }}
                        animate={{
                            opacity: 1
                        }}
                        exit={{
                            opacity: 0
                        }}
                        onClick={() =>
                            setIsDeleteModalOpen(
                                false
                            )
                        }
                    >

                        <motion.div
                            className="modal-content modal-sm"
                            initial={{
                                scale: 0.95,
                                y: 20
                            }}
                            animate={{
                                scale: 1,
                                y: 0
                            }}
                            exit={{
                                scale: 0.95,
                                y: 20
                            }}
                            transition={{
                                type: "spring",
                                damping: 25,
                                stiffness: 300
                            }}
                            onClick={(e) =>
                                e.stopPropagation()
                            }
                        >

                            <div className="modal-header">

                                <h2>
                                    Confirm Delete
                                </h2>

                                <button
                                    className="modal-close"
                                    onClick={() =>
                                        setIsDeleteModalOpen(
                                            false
                                        )
                                    }
                                >
                                    ×
                                </button>

                            </div>


                            <div className="modal-body">

                                <p>

                                    Are you sure you want
                                    to delete{" "}

                                    <strong>
                                        {
                                            selectedProduct?.name ||
                                            selectedProduct?.title
                                        }
                                    </strong>
                                    ?

                                </p>


                                <p className="text-muted">
                                    This action cannot be undone.
                                </p>

                            </div>


                            <div className="modal-actions">

                                <button
                                    className="btn btn-secondary"
                                    onClick={() =>
                                        setIsDeleteModalOpen(
                                            false
                                        )
                                    }
                                >
                                    Cancel
                                </button>


                                <button
                                    className="btn btn-danger"
                                    onClick={
                                        confirmDelete
                                    }
                                >
                                    Delete
                                </button>

                            </div>

                        </motion.div>

                    </motion.div>

                )}

            </AnimatePresence>


            {/* =================================================
                CATEGORY MODAL
            ================================================= */}

            <AnimatePresence>

                {isCategoryModalOpen && (

                    <motion.div
                        className="modal-overlay"
                        initial={{
                            opacity: 0
                        }}
                        animate={{
                            opacity: 1
                        }}
                        exit={{
                            opacity: 0
                        }}
                        onClick={() =>
                            setIsCategoryModalOpen(
                                false
                            )
                        }
                    >

                        <motion.div
                            className="modal-content modal-sm"
                            initial={{
                                scale: 0.95,
                                y: 20
                            }}
                            animate={{
                                scale: 1,
                                y: 0
                            }}
                            exit={{
                                scale: 0.95,
                                y: 20
                            }}
                            transition={{
                                type: "spring",
                                damping: 25,
                                stiffness: 300
                            }}
                            onClick={(e) =>
                                e.stopPropagation()
                            }
                        >

                            <div className="modal-header">

                                <h2>
                                    Add New Category
                                </h2>

                                <button
                                    className="modal-close"
                                    onClick={() =>
                                        setIsCategoryModalOpen(
                                            false
                                        )
                                    }
                                >
                                    ×
                                </button>

                            </div>


                            <div className="modal-body">

                                <div className="form-group">

                                    <label>
                                        Category Name
                                    </label>

                                    <input
                                        type="text"
                                        value={
                                            newCategory
                                        }
                                        onChange={(e) =>
                                            setNewCategory(
                                                e.target.value
                                            )
                                        }
                                        placeholder="Enter category name"
                                        autoFocus
                                    />

                                </div>

                            </div>


                            <div className="modal-actions">

                                <button
                                    className="btn btn-secondary"
                                    onClick={() =>
                                        setIsCategoryModalOpen(
                                            false
                                        )
                                    }
                                >
                                    Cancel
                                </button>


                                <button
                                    className="btn btn-primary"
                                    onClick={
                                        handleAddCategory
                                    }
                                >
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