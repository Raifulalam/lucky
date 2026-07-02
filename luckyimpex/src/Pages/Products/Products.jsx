import React, { useState, useEffect, useContext, useCallback, useRef, useMemo } from "react";
import "./products.css";
import Header from "../../Components/Header";
import { useCartDispatch } from "../../Components/CreateReducer";
import { useNavigate, useParams } from "react-router-dom";
import luckyImage from "../../Images/lucky.png";
import backimg from "../../Images/backimg.jpg";
import back01 from "../../Images/back01.png";
import back02 from "../../Images/back04.jpg";
import back03 from "../../Images/back03.jpg";
import { UserContext } from "../../Components/UserContext";
import EditProductModal from "./EditProductModal";
import Modal from "../../Components/Modal";
import { useNotification } from "../../Components/NotificationContext";
import PageSeo from "../../Components/PageSeo";
import { categories as categoryCatalog, brands as brandCatalog } from "../HomePage/Constants";
import { authRequest, BASE_URL } from "../../api/api";
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { buildCatalogCacheKey, clearCatalogCache, clearPersistedQueryCache, readCatalogCache, writeCatalogCache } from "../../utils/catalogCache";
import ProductQuickViewModal from "./ProductQuickViewModal";
import { Eye, Search, X, SlidersHorizontal, Check, ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";

const getImageSrc = (src, fallbackSrc) => {
    return src ? `${src}` : fallbackSrc;
};

const getProductImage = (product) => product?.images?.[0] || product?.image || "";

const formatCurrency = (value) => {
    const amount = Number(value);
    if (Number.isNaN(amount)) return "N/A";
    return `Rs ${amount.toFixed(0)}`;
};

const getSavings = (mrp, price) => {
    const original = Number(mrp);
    const finalPrice = Number(price);

    if (Number.isNaN(original) || Number.isNaN(finalPrice) || original <= finalPrice) {
        return null;
    }

    const amount = original - finalPrice;
    const percentage = Math.round((amount / original) * 100);
    return { amount, percentage };
};

const Products = () => {
    const { category } = useParams();
    const queryClient = useQueryClient();
    const { addNotification } = useNotification();
    const navigate = useNavigate();
    const { user } = useContext(UserContext);
    const userRole = user?.role || "user";
    const dispatch = useCartDispatch();

    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [selectedCategory, setSelectedCategory] = useState(category || "");
    const [selectedBrand, setSelectedBrand] = useState("");
    const [sortBy, setSortBy] = useState("featured");

    // Price range & stock filters
    const [minPrice, setMinPrice] = useState("");
    const [maxPrice, setMaxPrice] = useState("");
    const [showInStockOnly, setShowInStockOnly] = useState(false);
    const [showFiltersPanel, setShowFiltersPanel] = useState(false);

    // Quick view states
    const [quickViewProduct, setQuickViewProduct] = useState(null);
    const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

    // Add loading indicator per product
    const [addingItems, setAddingItems] = useState({});

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);

    const [newProduct, setNewProduct] = useState({
        name: "",
        mrp: "",
        bestBuyPrice: "",
        category: "",
        model: "",
        description: "",
        image: "",
        keywords: "",
        brand: "",
        capacity: "",
        stock: "",
    });
    const [newProductImage, setNewProductImage] = useState(null);
    const [newProductPreview, setNewProductPreview] = useState("");

    const autoLoadObserverRef = useRef(null);
    const placeholderImage = "/lucky-logo.png";
    const supportsAutoLoad = typeof window !== "undefined" && "IntersectionObserver" in window;

    // Debounce search term to prevent flooding queries
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(searchTerm);
        }, 400);
        return () => clearTimeout(handler);
    }, [searchTerm]);

    // Update state category when URL parameter changes
    useEffect(() => {
        setSelectedCategory(category || "");
    }, [category]);

    // TanStack Query: Infinite products fetcher
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        isFetching,
        isError,
        error,
        refetch
    } = useInfiniteQuery({
        queryKey: ["products", { category: selectedCategory, search: debouncedSearch }],
        queryFn: async ({ pageParam = 1, signal }) => {
            const cacheKey = buildCatalogCacheKey("products", selectedCategory, debouncedSearch, pageParam);
            const cached = await readCatalogCache(cacheKey);

            try {
                let url = `${BASE_URL}/products/products?page=${pageParam}&limit=20`;
                if (selectedCategory) url += `&category=${selectedCategory}`;
                if (debouncedSearch) url += `&search=${debouncedSearch}`;

                const response = await fetch(url, { signal });
                if (!response.ok) throw new Error("Failed to fetch products");
                const payload = await response.json();
                await writeCatalogCache(cacheKey, payload);
                return payload;
            } catch (err) {
                if (cached) return cached;
                throw err;
            }
        },
        initialPageParam: 1,
        getNextPageParam: (lastPage, allPages) => {
            const nextPage = allPages.length + 1;
            return nextPage <= lastPage.pages ? nextPage : undefined;
        },
        staleTime: 5 * 60 * 1000, // Cache active for 5 mins
    });

    // Derive flat array of products from pages
    const products = useMemo(() => {
        return data?.pages.flatMap((page) => page.products) || [];
    }, [data]);

    // Mutations for admin actions
    const saveMutation = useMutation({
        mutationFn: async ({ id, payload }) => {
            return authRequest(`/products/products/${id}`, {
                method: "PUT",
                body: payload,
                isFormData: payload instanceof FormData,
            });
        },
        onSuccess: async () => {
            await clearCatalogCache();
            clearPersistedQueryCache();
            queryClient.invalidateQueries({ queryKey: ["products"] });
            queryClient.invalidateQueries({ queryKey: ["product-details"] });
            setIsModalOpen(false);
            addNotification({
                title: "Success!",
                message: "Product updated successfully.",
                type: "success",
                container: "top-right",
                dismiss: { duration: 3000 },
            });
        },
        onError: (err) => {
            addNotification({
                title: "Failed!",
                message: err.message || "Failed to update product.",
                type: "danger",
                container: "top-right",
                dismiss: { duration: 5000 },
            });
        }
    });

    const deleteMutation = useMutation({
        mutationFn: async (productId) => {
            return authRequest(`/products/products/${productId}`, { method: "DELETE" });
        },
        onSuccess: async (data, productId) => {
            await clearCatalogCache();
            clearPersistedQueryCache();
            queryClient.invalidateQueries({ queryKey: ["products"] });
            queryClient.invalidateQueries({ queryKey: ["product-details"] });
            dispatch({ type: "DELETE_PRODUCT", payload: productId });
            setIsDeleteModalOpen(false);
            addNotification({
                title: "Deleted!",
                message: "Product has been deleted.",
                type: "success",
                container: "top-right",
                dismiss: { duration: 3000 },
            });
        },
        onError: (err) => {
            addNotification({
                title: "Failed!",
                message: err.message || "Failed to delete product.",
                type: "danger",
                container: "top-right",
                dismiss: { duration: 5000 },
            });
        }
    });

    const addMutation = useMutation({
        mutationFn: async (productData) => {
            return authRequest("/products/products", {
                method: "POST",
                body: productData,
                isFormData: productData instanceof FormData,
            });
        },
        onSuccess: async () => {
            await clearCatalogCache();
            clearPersistedQueryCache();
            queryClient.invalidateQueries({ queryKey: ["products"] });
            queryClient.invalidateQueries({ queryKey: ["product-details"] });
            setIsAddModalOpen(false);
            setNewProduct({
                name: "", mrp: "", bestBuyPrice: "", category: "", model: "",
                description: "", image: "", keywords: "", brand: "", capacity: "", stock: ""
            });
            setNewProductImage(null);
            setNewProductPreview("");
            addNotification({
                title: "Created!",
                message: "Product added successfully.",
                type: "success",
                container: "top-right",
                dismiss: { duration: 3000 },
            });
        },
        onError: (err) => {
            addNotification({
                title: "Failed!",
                message: err.message || "Failed to add product.",
                type: "danger",
                container: "top-right",
                dismiss: { duration: 5000 },
            });
        }
    });

    const categoryOptions = useMemo(() => {
        return [...new Set([
            ...categoryCatalog.map((item) => item.name),
            ...products.map((product) => product.category).filter(Boolean),
        ])];
    }, [products]);

    const brandOptions = useMemo(() => {
        return [...new Set([
            ...brandCatalog,
            ...products.map((product) => product.brand).filter(Boolean),
        ])];
    }, [products]);

    const filteredProducts = useMemo(() => {
        return products.filter((product) => {
            const matchesCategory = selectedCategory === "" || product.category === selectedCategory;
            const matchesBrand = selectedBrand === "" || product.brand === selectedBrand;

            // Price range check
            const priceVal = Number(product.price || 0);
            const matchesMinPrice = minPrice === "" || priceVal >= Number(minPrice);
            const matchesMaxPrice = maxPrice === "" || priceVal <= Number(maxPrice);

            // In stock check
            const matchesStock = !showInStockOnly || Number(product.stock || 0) > 0;

            return matchesCategory && matchesBrand && matchesMinPrice && matchesMaxPrice && matchesStock;
        });
    }, [products, selectedCategory, selectedBrand, minPrice, maxPrice, showInStockOnly]);

    const sortedProducts = useMemo(() => {
        return [...filteredProducts].sort((a, b) => {
            switch (sortBy) {
                case "priceLowToHigh":
                    return Number(a.price || 0) - Number(b.price || 0);
                case "priceHighToLow":
                    return Number(b.price || 0) - Number(a.price || 0);
                case "discountHighToLow":
                    return (getSavings(b.mrp, b.price)?.amount || 0) - (getSavings(a.mrp, a.price)?.amount || 0);
                case "nameAToZ":
                    return (a.name || "").localeCompare(b.name || "");
                default:
                    return 0;
            }
        });
    }, [filteredProducts, sortBy]);

    const availableCount = useMemo(() => {
        return sortedProducts.filter((product) => Number(product.stock) > 0).length;
    }, [sortedProducts]);

    const activeFilterCount = [
        selectedCategory,
        selectedBrand,
        debouncedSearch,
        minPrice,
        maxPrice,
        showInStockOnly ? "instock" : ""
    ].filter(Boolean).length;

    // Hero Slider logic
    const [currentSlide, setCurrentSlide] = useState(0);
    const images = [backimg, back01, back02, back03, luckyImage];
    useEffect(() => {
        const intervalId = setInterval(
            () => setCurrentSlide((prev) => (prev + 1) % images.length),
            4000
        );
        return () => clearInterval(intervalId);
    }, [images.length]);

    // IntersectionObserver scroll setup
    const autoLoadTriggerRef = useCallback(
        (node) => {
            if (!supportsAutoLoad) return;

            if (autoLoadObserverRef.current) {
                autoLoadObserverRef.current.disconnect();
            }

            if (isLoading || isFetchingNextPage || !node) return;

            autoLoadObserverRef.current = new IntersectionObserver(
                (entries) => {
                    if (
                        entries[0]?.isIntersecting &&
                        hasNextPage &&
                        !isFetchingNextPage
                    ) {
                        fetchNextPage();
                    }
                },
                {
                    rootMargin: "0px 0px 520px 0px",
                    threshold: 0,
                }
            );

            autoLoadObserverRef.current.observe(node);
        },
        [fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, supportsAutoLoad]
    );

    useEffect(() => {
        return () => {
            if (autoLoadObserverRef.current) {
                autoLoadObserverRef.current.disconnect();
            }
        };
    }, []);

    const handleEdit = (product) => {
        setSelectedProduct(product);
        setIsModalOpen(true);
    };

    const handleSave = (updatedProduct) => {
        saveMutation.mutate({
            id: updatedProduct._id,
            payload: updatedProduct.payload,
        });
    };

    const handleDelete = (productId) => {
        setIsDeleteModalOpen(true);
        setSelectedProduct(products.find((p) => p._id === productId));
    };

    const confirmDelete = (productId) => {
        deleteMutation.mutate(productId);
    };

    const handleQuickView = (product) => {
        setQuickViewProduct(product);
        setIsQuickViewOpen(true);
    };

    const handleAddToCart = (product) => {
        setAddingItems((prev) => ({ ...prev, [product._id]: true }));

        dispatch({
            type: "ADD_ITEM",
            id: product._id,
            image: getProductImage(product),
            name: product.name,
            mrp: product.mrp,
            price: product.price,
        });

        // Simulating loading callback state
        setTimeout(() => {
            setAddingItems((prev) => ({ ...prev, [product._id]: false }));
            addNotification({
                title: "Added to Cart!",
                message: `${product.name} has been added to your cart.`,
                type: "success",
                container: "top-right",
                dismiss: { duration: 3000 },
            });
        }, 650);
    };

    const handleDetails = (productId) => {
        navigate(`/productdetails/${productId}`);
    };

    const clearFilters = () => {
        setSearchTerm("");
        setSelectedBrand("");
        setSelectedCategory(category || "");
        setSortBy("featured");
        setMinPrice("");
        setMaxPrice("");
        setShowInStockOnly(false);
    };

    const handleNewProductChange = (e) => {
        const { name, value } = e.target;
        setNewProduct((prev) => ({ ...prev, [name]: value }));
    };

    const handleNewProductImageChange = (e) => {
        const file = e.target.files?.[0] || null;
        setNewProductImage(file);
        setNewProductPreview(file ? URL.createObjectURL(file) : "");
    };

    const handleAddNewProduct = (e) => {
        e.preventDefault();
        const productData = new FormData();
        productData.append("name", newProduct.name);
        productData.append("mrp", newProduct.mrp);
        productData.append("price", newProduct.bestBuyPrice);
        productData.append("category", newProduct.category);
        productData.append("model", newProduct.model);
        productData.append("description", newProduct.description);
        productData.append("keywords", newProduct.keywords);
        productData.append("brand", newProduct.brand);
        productData.append("capacity", newProduct.capacity);
        productData.append("stock", newProduct.stock);
        if (newProductImage) {
            productData.append("image", newProductImage);
        } else if (newProduct.image) {
            productData.append("images", newProduct.image);
        }
        addMutation.mutate(productData);
    };

    if (isError) {
        return (
            <div className="error-container">
                <div>Error: {error.message || "Failed to load products."}</div>
                <button onClick={() => refetch()}>Retry</button>
            </div>
        );
    }

    return (
        <>
            <PageSeo
                title="Buy Products Online"
                description="Shop high quality electronics and appliances from Lucky Impex at best prices."
                canonicalPath="/products"
            />
            <Header />

            {isFetching && !isFetchingNextPage && (
                <div className="slow-loading-banner">
                    <span className="loading-pulse-dot"></span>
                    Syncing product data...
                </div>
            )}

            <div className="products-hero-section">
                <div className="slider-wrapper">
                    <div className="slider-overlay">
                        <div className="hero-search-block">
                            <h1 className="hero-search-title">Discover Premium Appliances</h1>
                            <p className="hero-search-subtitle">Search authorized electronics at best buy prices</p>
                            <div className="search-bar-wrapper">
                                <Search className="search-icon" size={20} />
                                <input
                                    type="text"
                                    placeholder="Search for ACs, refrigerators, TVs..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="search-bar-input"
                                />
                                {searchTerm && (
                                    <button className="search-clear-btn" onClick={() => setSearchTerm("")} aria-label="Clear search">
                                        <X size={18} />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                    <img
                        src={images[currentSlide]}
                        alt={`Slide ${currentSlide + 1}`}
                        className="slider-image-new"
                    />
                </div>
            </div>

            <div className="home-main">
                <div className="seo-static-content">
                    <div className="container">
                        <p className="subtitle">
                            Discover premium electronics, home appliances, and top-quality products
                            at unbeatable prices. Shop smart, shop fast, shop with confidence.
                        </p>
                        <div className="feature-strip">
                            <div className="feature-pill">Trusted local store</div>
                            <div className="feature-pill">Top appliance brands</div>
                            <div className="feature-pill">Best-buy pricing</div>
                            <div className="feature-pill">Stock-ready products</div>
                        </div>
                    </div>
                </div>

                <div className="filter-section">
                    <div className="filter-header">
                        <div>
                            <h2>Catalog Explorer</h2>
                            <p>
                                {sortedProducts.length} results{activeFilterCount > 0 ? ` • ${activeFilterCount} active filters` : ""}
                            </p>
                        </div>
                        <div className="filter-header-buttons">
                            <button className="filter-toggle-btn" onClick={() => setShowFiltersPanel(!showFiltersPanel)}>
                                <SlidersHorizontal size={16} /> {showFiltersPanel ? "Hide Advanced Filters" : "Show Advanced Filters"}
                            </button>
                            <button className="button-secondary clear-filters-btn" onClick={clearFilters}>
                                Clear filters
                            </button>
                        </div>
                    </div>

                    <div className="category-chip-row">
                        <button
                            className={`category-chip ${selectedCategory === "" ? "active" : ""}`}
                            onClick={() => setSelectedCategory("")}
                        >
                            All Categories
                        </button>
                        {categoryOptions.map((item) => (
                            <button
                                key={item}
                                className={`category-chip ${selectedCategory === item ? "active" : ""}`}
                                onClick={() => setSelectedCategory(item)}
                            >
                                {item.replace(/([A-Z])/g, " $1").trim()}
                            </button>
                        ))}
                    </div>

                    {/* Advanced Filters Panel */}
                    <div className={`advanced-filters-panel ${showFiltersPanel ? "show" : ""}`}>
                        <div className="filter-grid">
                            {/* Brand Chips Selection */}
                            <div className="filter-group">
                                <label className="filter-label">Select Brand</label>
                                <div className="brand-chips">
                                    <button
                                        type="button"
                                        className={`brand-chip-btn ${selectedBrand === "" ? "active" : ""}`}
                                        onClick={() => setSelectedBrand("")}
                                    >
                                        All Brands
                                    </button>
                                    {brandOptions.map((brand) => (
                                        <button
                                            key={brand}
                                            type="button"
                                            className={`brand-chip-btn ${selectedBrand === brand ? "active" : ""}`}
                                            onClick={() => setSelectedBrand(brand)}
                                        >
                                            {brand}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Price range and Stock filter */}
                            <div className="filter-group-row">
                                <div className="filter-group">
                                    <label className="filter-label">Price Range (Rs)</label>
                                    <div className="price-inputs">
                                        <input
                                            type="number"
                                            placeholder="Min"
                                            value={minPrice}
                                            onChange={(e) => setMinPrice(e.target.value)}
                                            className="price-input"
                                            min="0"
                                        />
                                        <span className="price-divider">to</span>
                                        <input
                                            type="number"
                                            placeholder="Max"
                                            value={maxPrice}
                                            onChange={(e) => setMaxPrice(e.target.value)}
                                            className="price-input"
                                            min="0"
                                        />
                                    </div>
                                </div>

                                <div className="filter-group justify-end">
                                    <label className="checkbox-container">
                                        <input
                                            type="checkbox"
                                            checked={showInStockOnly}
                                            onChange={(e) => setShowInStockOnly(e.target.checked)}
                                        />
                                        <span className="checkmark"></span>
                                        In Stock Only
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="filters-row">
                        <div className="filters-sorting">
                            <span>Sort By</span>
                            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="sort-select">
                                <option value="featured">Featured / Default</option>
                                <option value="priceLowToHigh">Price: Low to High</option>
                                <option value="priceHighToLow">Price: High to Low</option>
                                <option value="discountHighToLow">Biggest Savings</option>
                                <option value="nameAToZ">Name: A to Z</option>
                            </select>
                        </div>

                        <div className="results-summary">
                            <span className="badge-status-item">{availableCount} In Stock</span>
                            <span className="badge-status-item muted">{Math.max(sortedProducts.length - availableCount, 0)} Out of Stock</span>
                            <span className="badge-status-item muted">{products.length} Loaded</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Add Product (Admin only) */}
            {userRole === "admin" && (
                <div className="add-product-button-container">
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="button-primary"
                        disabled={addMutation.isPending}
                    >
                        {addMutation.isPending ? "Adding..." : "Add New Product"}
                    </button>
                </div>
            )}

            {/* Loading Skeletons for Initial Load */}
            {isLoading && (
                <div className="skeleton-grid">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="skeleton-card" aria-hidden="true">
                            <div className="skeleton-image-placeholder"></div>
                            <div className="skeleton-body-placeholder">
                                <div className="skeleton-line-placeholder short"></div>
                                <div className="skeleton-line-placeholder long"></div>
                                <div className="skeleton-line-placeholder medium"></div>
                                <div className="skeleton-line-placeholder buttons"></div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Product List */}
            {!isLoading && (
                <div className="product-grid">
                    {sortedProducts.length > 0 ? (
                        sortedProducts.map((product) => {
                            const savings = getSavings(product.mrp, product.price);
                            const isOutOfStock = Number(product.stock) <= 0;
                            const isAdding = addingItems[product._id];
                            const isLowStock = !isOutOfStock && Number(product.stock) <= 3;

                            return (
                                <div
                                    key={product._id}
                                    className={`product-container ${isOutOfStock ? "is-unavailable" : ""}`}
                                >
                                    <div className="product-image-container">
                                        <img
                                            className="product-image"
                                            src={getImageSrc(getProductImage(product), placeholderImage)}
                                            alt={product.name || "Product image"}
                                            loading="lazy"
                                            onClick={() => handleDetails(product.slug || product._id)}
                                            onError={(e) => {
                                                e.currentTarget.onerror = null;
                                                e.currentTarget.src = placeholderImage;
                                            }}
                                        />
                                        {savings && (
                                            <div className="product-discount">
                                                <p>Save {formatCurrency(savings.amount)}</p>
                                            </div>
                                        )}

                                        {/* Quick View Hover Button */}
                                        <button
                                            type="button"
                                            className="quick-view-hover-btn"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleQuickView(product);
                                            }}
                                            aria-label="Quick view"
                                        >
                                            <Eye size={16} />
                                        </button>
                                    </div>

                                    <div className="product-card-body">


                                        <div className="product-meta-row">
                                            <Link to={`/products/brand/${product.brand || "lucky-impex"}`}>
                                                <span className="meta-badge">
                                                    {product.brand || "Lucky Impex"}
                                                </span>
                                            </Link>
                                            <span className="meta-badge muted">{product.category || "General"}</span>
                                        </div>

                                        <div
                                            className="product-name"
                                            onClick={() => handleDetails(product.slug || product._id)}
                                        >
                                            {product.name}
                                        </div>

                                        <div className="stock-container-row">
                                            <p className="stock">
                                                <span
                                                    className={`stock-status ${isOutOfStock ? "out-of-stock" : "in-stock"}`}
                                                ></span>
                                                {isOutOfStock ? "Out of stock" : `In stock${product.stock ? ` (${product.stock})` : ""}`}
                                            </p>
                                            {isLowStock && (
                                                <span className="low-stock-warning-badge">Low Stock</span>
                                            )}
                                        </div>

                                        <div className="product-spec-list">
                                            <div className="product-size">Capacity: {product.capacity || "N/A"}</div>
                                            <div className="product-model">Model: {product.model || "N/A"}</div>
                                        </div>

                                        <div className="price-block">
                                            <div className="product-mrp">MRP: {formatCurrency(product.mrp)}</div>
                                            <div className="product-price">
                                                <p>Best Buy: {formatCurrency(product.price)}</p>
                                            </div>
                                            {savings && (
                                                <div className="discount-note">
                                                    {savings.percentage}% off against MRP
                                                </div>
                                            )}
                                        </div>

                                        <p className="product-description-preview">
                                            {product.description || "Product details available on the details page."}
                                        </p>

                                        {userRole === "admin" ? (
                                            <div className="product-actions">
                                                <button
                                                    className="edit-btn action-btn"
                                                    onClick={() => handleEdit(product)}
                                                    disabled={saveMutation.isPending}
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    className="delete-btn action-btn"
                                                    onClick={() => handleDelete(product._id)}
                                                    disabled={deleteMutation.isPending}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="product-actions customer-actions">
                                                <button
                                                    className="details-btn action-btn"
                                                    onClick={() => handleDetails(product.slug || product._id)}
                                                    aria-label="Know more"
                                                >
                                                    <Eye size={16} className="details-btn-icon" />
                                                    <span className="details-btn-text">Know More</span>
                                                </button>
                                                <button
                                                    className="add-to-cart-button button-primary action-btn"
                                                    onClick={() => handleAddToCart(product)}
                                                    disabled={isOutOfStock || isAdding}
                                                >
                                                    {isAdding ? (
                                                        <span className="adding-loader-text">
                                                            <Check size={14} className="check-icon-spin" /> Adding...
                                                        </span>
                                                    ) : isOutOfStock ? (
                                                        <span className="cart-btn-text">Unavailable</span>
                                                    ) : (
                                                        <>
                                                            <ShoppingCart size={16} className="cart-btn-icon" />
                                                            <span className="cart-btn-text">Add to Cart</span>
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="no-products-found">
                            <h3>No products found</h3>
                            <p>Try changing the search, brand, or category filters.</p>
                            <button className="button-primary" onClick={clearFilters}>
                                Reset filters
                            </button>
                        </div>
                    )}
                </div>
            )}

            {sortedProducts.length > 0 && hasNextPage && (
                <div ref={autoLoadTriggerRef} className="auto-load-sentinel" aria-hidden="true" />
            )}

            {isFetchingNextPage && (
                <div className="infinite-loader">
                    <span className="loading-pulse-dot"></span>
                    Loading more products...
                </div>
            )}

            {/* Load More Fallback for non-intersection browsers */}
            {!supportsAutoLoad && hasNextPage && (
                <div className="load-more-container">
                    <button
                        className="button-primary"
                        disabled={isFetchingNextPage}
                        onClick={() => fetchNextPage()}
                    >
                        {isFetchingNextPage ? "Loading..." : "Load More"}
                    </button>
                </div>
            )}

            {/* Add Product Modal */}
            <Modal show={isAddModalOpen} onClose={() => setIsAddModalOpen(false)}>
                <h2>Add New Product</h2>
                <form onSubmit={handleAddNewProduct}>
                    <input
                        type="text"
                        name="name"
                        value={newProduct.name}
                        onChange={handleNewProductChange}
                        placeholder="Product Name"
                        required
                    />
                    <input
                        type="text"
                        name="category"
                        value={newProduct.category}
                        onChange={handleNewProductChange}
                        placeholder="Category"
                        required
                    />
                    <input
                        type="number"
                        name="mrp"
                        value={newProduct.mrp}
                        onChange={handleNewProductChange}
                        placeholder="MRP"
                        required
                    />
                    <input
                        type="number"
                        name="bestBuyPrice"
                        value={newProduct.bestBuyPrice}
                        onChange={handleNewProductChange}
                        placeholder="Best Buy Price"
                        required
                    />
                    <input
                        type="text"
                        name="model"
                        value={newProduct.model}
                        onChange={handleNewProductChange}
                        placeholder="Model"
                        required
                    />
                    <textarea
                        name="description"
                        value={newProduct.description}
                        onChange={handleNewProductChange}
                        placeholder="Description"
                        required
                    ></textarea>
                    <div className="product-image-upload">
                        {newProductPreview ? (
                            <img src={newProductPreview} alt="New product preview" className="product-image-preview" />
                        ) : (
                            <div className="product-image-preview empty">Upload image preview</div>
                        )}
                        <input
                            type="file"
                            name="image"
                            accept="image/*"
                            onChange={handleNewProductImageChange}
                            required
                        />
                    </div>
                    <input
                        type="text"
                        name="image"
                        value={newProduct.image}
                        onChange={handleNewProductChange}
                        placeholder="Or image URL"
                    />
                    <input
                        type="text"
                        name="keywords"
                        value={newProduct.keywords}
                        onChange={handleNewProductChange}
                        placeholder="Keywords (comma separated)"
                        required
                    />
                    <input
                        type="text"
                        name="brand"
                        value={newProduct.brand}
                        onChange={handleNewProductChange}
                        placeholder="Brand"
                    />
                    <input
                        type="text"
                        name="capacity"
                        value={newProduct.capacity}
                        onChange={handleNewProductChange}
                        placeholder="Capacity"
                    />
                    <input
                        type="number"
                        name="stock"
                        value={newProduct.stock}
                        onChange={handleNewProductChange}
                        placeholder="Stock"
                    />
                    <button type="submit" className="button-primary" disabled={addMutation.isPending}>
                        {addMutation.isPending ? "Adding..." : "Add Product"}
                    </button>
                </form>
            </Modal>

            {/* Edit Product Modal */}
            <EditProductModal
                product={selectedProduct}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
            />

            {/* Product Quick View Modal */}
            <ProductQuickViewModal
                isOpen={isQuickViewOpen}
                product={quickViewProduct}
                onClose={() => setIsQuickViewOpen(false)}
                onAddToCart={handleAddToCart}
            />

            {/* Delete Confirmation Modal */}
            <Modal show={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)}>
                <h3>Are you sure you want to delete this product?</h3>
                <div className="modal-actions">
                    <button
                        onClick={() => confirmDelete(selectedProduct?._id)}
                        className="button-primary"
                        disabled={deleteMutation.isPending}
                    >
                        {deleteMutation.isPending ? "Deleting..." : "Yes, Delete"}
                    </button>
                    <button
                        onClick={() => setIsDeleteModalOpen(false)}
                        className="button-secondary"
                    >
                        Cancel
                    </button>
                </div>
            </Modal>
        </>
    );
};

export default Products;
