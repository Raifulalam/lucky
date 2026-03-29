import React, { useState, useEffect, useContext, useCallback, useRef } from "react";
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
import { Helmet } from "react-helmet-async";
import { categories as categoryCatalog, brands as brandCatalog } from "../HomePage/Constants";

const CACHE_TTL = 5 * 60 * 1000;
const CACHE_STORAGE_KEY = "lucky-products-cache-v1";

const readStoredProductCache = () => {
    if (typeof window === "undefined") return {};

    try {
        return JSON.parse(sessionStorage.getItem(CACHE_STORAGE_KEY)) || {};
    } catch {
        return {};
    }
};

const writeStoredProductCache = (cache) => {
    if (typeof window === "undefined") return;

    try {
        sessionStorage.setItem(CACHE_STORAGE_KEY, JSON.stringify(cache));
    } catch {
        // Ignore storage write failures.
    }
};

const productCache = readStoredProductCache();

const getCachedProductEntry = (key) => {
    const entry = productCache[key];

    if (!entry) return null;

    if (Date.now() - entry.timestamp > CACHE_TTL) {
        delete productCache[key];
        writeStoredProductCache(productCache);
        return null;
    }

    return entry;
};

const setCachedProductEntry = (key, value) => {
    productCache[key] = {
        ...value,
        timestamp: Date.now(),
    };
    writeStoredProductCache(productCache);
};

const getImageSrc = (src, fallbackSrc) => {
    return src ? `${src}` : fallbackSrc;
};

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
    const [products, setProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [isFetchingMore, setIsFetchingMore] = useState(false);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [sortBy, setSortBy] = useState("featured");
    const [showSlowLoading, setShowSlowLoading] = useState(false);
    const [cacheSource, setCacheSource] = useState("live");
    const { addNotification } = useNotification();
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

    const Navigate = useNavigate();
    const { user } = useContext(UserContext);
    const userRole = user?.role || "user";
    const slowLoadingTimeoutRef = useRef(null);
    const autoLoadObserverRef = useRef(null);
    const abortControllerRef = useRef(null);
    const currentPageRef = useRef(1);
    const totalPagesRef = useRef(1);
    const isRequestInFlightRef = useRef(false);

    const placeholderImage = "/lucky-logo.png";
    const [selectedCategory, setSelectedCategory] = useState(category || "");
    const [selectedBrand, setSelectedBrand] = useState("");
    const supportsAutoLoad =
        typeof window !== "undefined" && "IntersectionObserver" in window;

    const categoryOptions = [...new Set([
        ...categoryCatalog.map((item) => item.name),
        ...products.map((product) => product.category).filter(Boolean),
    ])];

    const brandOptions = [...new Set([
        ...brandCatalog,
        ...products.map((product) => product.brand).filter(Boolean),
    ])];

    const filteredProducts = products.filter((product) => {
        const matchesCategory = selectedCategory === "" || product.category === selectedCategory;
        const matchesBrand = selectedBrand === "" || product.brand === selectedBrand;
        return matchesCategory && matchesBrand;
    });

    const sortedProducts = [...filteredProducts].sort((a, b) => {
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

    const availableCount = sortedProducts.filter((product) => Number(product.stock) > 0).length;
    const activeFilterCount = [selectedCategory, selectedBrand, searchTerm].filter(Boolean).length;

    // slider
    const [currentSlide, setCurrentSlide] = useState(0);
    const images = [backimg, back01, back02, back03, luckyImage];
    useEffect(() => {
        const intervalId = setInterval(
            () => setCurrentSlide((prev) => (prev + 1) % images.length),
            4000
        );
        return () => clearInterval(intervalId);
    }, [currentSlide, images.length]);

    const dispatch = useCartDispatch();

    useEffect(() => {
        currentPageRef.current = page;
    }, [page]);

    useEffect(() => {
        totalPagesRef.current = pages;
    }, [pages]);

    const stopSlowLoadingIndicator = useCallback(() => {
        if (slowLoadingTimeoutRef.current) {
            clearTimeout(slowLoadingTimeoutRef.current);
            slowLoadingTimeoutRef.current = null;
        }
        setShowSlowLoading(false);
    }, []);

    const startSlowLoadingIndicator = useCallback((showForSlowRequests = true) => {
        if (!showForSlowRequests) return;

        stopSlowLoadingIndicator();
        slowLoadingTimeoutRef.current = setTimeout(() => {
            setShowSlowLoading(true);
        }, 700);
    }, [stopSlowLoadingIndicator]);

    const mergeProducts = useCallback((incomingProducts) => {
        setProducts((prev) => {
            const existingIds = new Set(prev.map((item) => item._id));
            const freshProducts = incomingProducts.filter((item) => !existingIds.has(item._id));
            return [...prev, ...freshProducts];
        });
    }, []);

    // ✅ Fetch products from backend with pagination + search + category
    const fetchProducts = useCallback(
        async (requestedPage = 1, { reset = false } = {}) => {
            let url = "";
            const isInitialRequest = reset || requestedPage === 1;
            const controller = new AbortController();

            try {
                if (isRequestInFlightRef.current && !reset) return;

                if (reset && abortControllerRef.current) {
                    abortControllerRef.current.abort();
                }

                abortControllerRef.current = controller;
                isRequestInFlightRef.current = true;

                setError(null);
                setLoading(isInitialRequest);
                setIsFetchingMore(!isInitialRequest);
                startSlowLoadingIndicator(isInitialRequest);

                url = `https://lucky-1-6ma5.onrender.com/api/products/products?page=${requestedPage}&limit=20`;

                if (category) url += `&category=${category}`;
                if (searchTerm) url += `&search=${searchTerm}`;

                const cachedEntry = getCachedProductEntry(url);
                if (cachedEntry) {
                    setPages(cachedEntry.pages || 1);
                    setCacheSource("cache");
                    setPage(requestedPage);

                    if (isInitialRequest) {
                        setProducts(cachedEntry.products);
                    } else {
                        mergeProducts(cachedEntry.products);
                    }

                    stopSlowLoadingIndicator();
                    return;
                }

                const response = await fetch(url, {
                    cache: "force-cache",
                    signal: controller.signal,
                });
                if (!response.ok) throw new Error("Failed to fetch products");

                const data = await response.json();
                setCacheSource("live");
                setPage(requestedPage);

                setCachedProductEntry(url, {
                    products: data.products,
                    pages: data.pages,
                });

                if (isInitialRequest) {
                    setProducts(data.products);
                } else {
                    mergeProducts(data.products);
                }

                setPages(data.pages);
            } catch (err) {
                if (err.name === "AbortError") return;

                setError(err.message);

                const cachedEntry = getCachedProductEntry(url);
                if (cachedEntry) {
                    setPage(requestedPage);

                    if (isInitialRequest) {
                        setProducts(cachedEntry.products);
                    } else {
                        mergeProducts(cachedEntry.products);
                    }
                    setPages(cachedEntry.pages || 1);
                    setCacheSource("cache");
                    setError(null);
                }
            } finally {
                if (abortControllerRef.current === controller) {
                    abortControllerRef.current = null;
                }
                isRequestInFlightRef.current = false;
                stopSlowLoadingIndicator();
                setLoading(false);
                setIsFetchingMore(false);
            }
        },
        [category, mergeProducts, searchTerm, startSlowLoadingIndicator, stopSlowLoadingIndicator]
    );

    const autoLoadTriggerRef = useCallback(
        (node) => {
            if (!supportsAutoLoad) return;

            if (autoLoadObserverRef.current) {
                autoLoadObserverRef.current.disconnect();
            }

            if (loading || isFetchingMore || !node) return;

            autoLoadObserverRef.current = new IntersectionObserver(
                (entries) => {
                    if (
                        entries[0]?.isIntersecting &&
                        currentPageRef.current < totalPagesRef.current &&
                        !isRequestInFlightRef.current
                    ) {
                        fetchProducts(currentPageRef.current + 1, { reset: false });
                    }
                },
                {
                    rootMargin: "0px 0px 520px 0px",
                    threshold: 0,
                }
            );

            autoLoadObserverRef.current.observe(node);
        },
        [fetchProducts, isFetchingMore, loading, supportsAutoLoad]
    );

    useEffect(() => {
        return () => stopSlowLoadingIndicator();
    }, [stopSlowLoadingIndicator]);

    useEffect(() => {
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
            if (autoLoadObserverRef.current) {
                autoLoadObserverRef.current.disconnect();
            }
        };
    }, []);

    useEffect(() => {
        setSelectedCategory(category || "");
    }, [category]);

    // Initial load + when category/search changes
    useEffect(() => {
        const delay = setTimeout(() => {
            fetchProducts(1, { reset: true });
        }, 350);

        return () => clearTimeout(delay);
    }, [category, searchTerm, fetchProducts]);

    // Handle edit
    const handleEdit = (product) => {
        setSelectedProduct(product);
        setIsModalOpen(true);
    };

    const handleSave = async (updatedProduct) => {
        const res = await fetch(
            `https://lucky-1-6ma5.onrender.com/api/products/products/${updatedProduct._id}`,
            {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updatedProduct),
            }
        );
        if (res.ok) {
            setProducts((prev) =>
                prev.map((p) => (p._id === updatedProduct._id ? updatedProduct : p))
            );
        }
    };

    // Delete
    const handleDelete = (productId) => {
        setIsDeleteModalOpen(true);
        setSelectedProduct(products.find((p) => p._id === productId));
    };

    const confirmDelete = async (productId) => {
        const res = await fetch(
            `https://lucky-1-6ma5.onrender.com/api/products/products/${productId}`,
            { method: "DELETE" }
        );
        if (res.ok) {
            setProducts((prev) => prev.filter((p) => p._id !== productId));
            dispatch({ type: "DELETE_PRODUCT", payload: productId });
        }
    };

    // Cart
    const handleAddToCart = (product) => {
        dispatch({
            type: "ADD_ITEM",
            id: product._id,
            image: product.image,
            name: product.name,
            mrp: product.mrp,
            price: product.price,
        });
        addNotification({
            title: "Success!",
            message: "Item added to cart",
            type: "success",
            container: "top-right",
            dismiss: { duration: 5000 },
        });
    };

    // Details
    const handleDetails = (productId) => {
        Navigate(`/productdetails/${productId}`);
    };

    const clearFilters = () => {
        setSearchTerm("");
        setSelectedBrand("");
        setSelectedCategory(category || "");
        setSortBy("featured");
    };

    // Add new product
    const handleNewProductChange = (e) => {
        const { name, value } = e.target;
        setNewProduct((prev) => ({ ...prev, [name]: value }));
    };

    const handleAddNewProduct = async (e) => {
        e.preventDefault();
        const productData = {
            ...newProduct,
            price: newProduct.bestBuyPrice,
            keywords: newProduct.keywords
                ? newProduct.keywords.split(",").map((k) => k.trim())
                : [],
        };
        const res = await fetch("https://lucky-1-6ma5.onrender.com/api/products/products", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(productData),
        });
        if (res.ok) {
            const added = await res.json();
            setProducts((prev) => [added, ...prev]);
            setIsAddModalOpen(false);
            setNewProduct({
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
        }
    };

    const isInitialLoading = loading && products.length === 0;
    if (error) {
        return (
            <div className="error-container">
                <div>Error: {error}</div>
                <button onClick={() => fetchProducts(1, { reset: true })}>Retry</button>
            </div>
        );
    }

    return (
        <>
            <Helmet>
                <title>Buy Products Online | Lucky Impex</title>
                <meta
                    name="description"
                    content="Shop high quality electronics and appliances from Lucky Impex at best prices."
                />
                <meta
                    name="keywords"
                    content="Lucky Impex, electronics, appliances, best price, online shopping"
                />
                <meta property="og:title" content="Lucky Impex Products" />
                <meta
                    property="og:description"
                    content="Explore premium quality products at Lucky Impex."
                />
            </Helmet>
            <Header />
            {showSlowLoading && (
                <div className="slow-loading-banner">
                    <span className="loading-pulse-dot"></span>
                    Fetching products. This is taking a bit longer than usual.
                </div>
            )}
            {/* ✅ Loading Skeleton */}
            {isInitialLoading && (
                <div className="skeleton-grid">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="skeleton-card"></div>
                    ))}
                </div>
            )}

            {/* ✅ Error */}
            {error && (
                <div className="error-container">
                    <p>Error: {error}</p>
                    <button onClick={() => fetchProducts(1, { reset: true })}>Retry</button>
                </div>
            )}
            <div className="home-main">
                <div className="image">
                    <input
                        type="text"
                        placeholder="Search for items..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-bar"
                    />
                    <img
                        src={images[currentSlide]}
                        alt={`Slide ${currentSlide + 1}`}
                        className="slider-image"
                    />
                    <div className="hero-copy">
                        <p className="hero-eyebrow">Lucky Impex Product Store</p>
                        <h1>Find appliances and electronics that fit your home and budget.</h1>
                        <p>
                            Compare brands, filter by category, and shop current offers without
                            digging through clutter.
                        </p>
                    </div>
                </div>
                <div className="seo-static-content">
                    <div className="container">
                        <h1 className="main-title">
                            Lucky Impex – Your Trusted Online Shopping Destination
                        </h1>
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
                            <h2>Filter Products</h2>
                            <p>
                                {sortedProducts.length} results{activeFilterCount > 0 ? ` • ${activeFilterCount} active filters` : ""}
                            </p>
                        </div>
                        <button className="button-secondary clear-filters-btn" onClick={clearFilters}>
                            Clear filters
                        </button>
                    </div>

                    <div className="category-chip-row">
                        <button
                            className={`category-chip ${selectedCategory === "" ? "active" : ""}`}
                            onClick={() => setSelectedCategory("")}
                        >
                            All
                        </button>
                        {categoryOptions.map((item) => (
                            <button
                                key={item}
                                className={`category-chip ${selectedCategory === item ? "active" : ""}`}
                                onClick={() => setSelectedCategory(item)}
                            >
                                {item}
                            </button>
                        ))}
                    </div>
                    <div className="filters">
                        <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                            <option value="">All Categories</option>
                            {categoryOptions.map((item) => (
                                <option key={item} value={item}>
                                    {item}
                                </option>
                            ))}
                        </select>

                        <select value={selectedBrand} onChange={(e) => setSelectedBrand(e.target.value)}>
                            <option value="">All Brands</option>
                            {brandOptions.map((item) => (
                                <option key={item} value={item}>
                                    {item}
                                </option>
                            ))}
                        </select>

                        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                            <option value="featured">Featured</option>
                            <option value="priceLowToHigh">Price: Low to High</option>
                            <option value="priceHighToLow">Price: High to Low</option>
                            <option value="discountHighToLow">Biggest Savings</option>
                            <option value="nameAToZ">Name: A to Z</option>
                        </select>
                    </div>
                    <div className="results-summary">
                        <span>{availableCount} in stock</span>
                        <span>{Math.max(sortedProducts.length - availableCount, 0)} unavailable</span>
                        <span>{products.length} loaded so far</span>
                        <span>Source: {cacheSource === "cache" ? "Cached data" : "Live API"}</span>
                        <span>{page < pages ? "Auto loading enabled" : "All products loaded"}</span>
                    </div>
                </div>
            </div>

            {/* Add Product (Admin only) */}
            {userRole === "admin" && (
                <div className="add-product-button-container">
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="button-primary"
                    >
                        Add New Product
                    </button>
                </div>
            )}

            {/* Product List */}
            <div className="product-grid">
                {sortedProducts.length > 0 ? (
                    sortedProducts.map((product) => {
                        const savings = getSavings(product.mrp, product.price);
                        const isOutOfStock = Number(product.stock) <= 0;

                        return (
                            <div
                                key={product._id}
                                className={`product-container ${isOutOfStock ? "is-unavailable" : ""}`}
                            >
                                <div
                                    className="product-image-container"
                                    onClick={() => handleDetails(product._id)}
                                >
                                    <img
                                        className="product-image"
                                        src={getImageSrc(product.image, placeholderImage)}
                                        alt={product.name || "Product image"}
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
                                </div>

                                <div className="product-card-body">
                                    <div className="product-meta-row">
                                        <span className="meta-badge">{product.brand || "Lucky Impex"}</span>
                                        <span className="meta-badge muted">{product.category || "General"}</span>
                                    </div>

                                    <div
                                        className="product-name"
                                        onClick={() => handleDetails(product._id)}
                                    >
                                        {product.name}
                                    </div>

                                    <p className="stock">
                                        <span
                                            className={`stock-status ${isOutOfStock ? "out-of-stock" : "in-stock"}`}
                                        ></span>
                                        {isOutOfStock ? "Out of stock" : `In stock${product.stock ? ` (${product.stock})` : ""}`}
                                    </p>

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
                                                className="edit-btn"
                                                onClick={() => handleEdit(product)}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                className="delete-btn"
                                                onClick={() => handleDelete(product._id)}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="product-actions customer-actions">
                                            <button
                                                className="details-btn"
                                                onClick={() => handleDetails(product._id)}
                                            >
                                                View Details
                                            </button>
                                            <button
                                                className="add-to-cart-button button-primary"
                                                onClick={() => handleAddToCart(product)}
                                                disabled={isOutOfStock}
                                            >
                                                {isOutOfStock ? "Unavailable" : "Add to Cart"}
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
            {sortedProducts.length > 0 && page < pages && (
                <div ref={autoLoadTriggerRef} className="auto-load-sentinel" aria-hidden="true" />
            )}

            {isFetchingMore && (
                <div className="infinite-loader">
                    <span className="loading-pulse-dot"></span>
                    Loading more products...
                </div>
            )}

            {/* Load More */}
            {!supportsAutoLoad && page < pages && (
                <div className="load-more-container">
                    <button
                        className="button-primary"
                        disabled={loading || isFetchingMore}
                        onClick={() => fetchProducts(page + 1, { reset: false })}
                    >
                        {loading || isFetchingMore ? "Loading..." : "Load More"}
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
                    <input
                        type="text"
                        name="image"
                        value={newProduct.image}
                        onChange={handleNewProductChange}
                        placeholder="Image URL"
                        required
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
                    <button type="submit" className="button-primary">
                        Add Product
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

            {/* Delete Confirmation Modal */}
            <Modal show={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)}>
                <h3>Are you sure you want to delete this product?</h3>
                <div className="modal-actions">
                    <button
                        onClick={() => confirmDelete(selectedProduct?._id)}
                        className="button-primary"
                    >
                        Yes, Delete
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
