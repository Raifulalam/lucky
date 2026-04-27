import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import {
    ArrowRight,
    BadgePercent,
    Search,
    ShieldCheck,
    ShoppingBag,
    Sparkles,
    Store,
    Truck,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import "./products.css";
import Header from "../../Components/Header";
import Footer from "../../Components/Footer";
import { useCartDispatch } from "../../Components/CreateReducer";
import { UserContext } from "../../Components/UserContext";
import EditProductModal from "./EditProductModal";
import Modal from "../../Components/Modal";
import { useNotification } from "../../Components/NotificationContext";
import { brands as brandCatalog } from "../HomePage/Constants";
import luckyImage from "../../Images/lucky.png";
import backimg from "../../Images/backimg.jpg";
import back01 from "../../Images/back01.png";
import back02 from "../../Images/back04.jpg";
import back03 from "../../Images/back03.jpg";
import { authRequest, BASE_URL } from "../../api/api";

const CACHE_TTL = 5 * 60 * 1000;
const BRAND_CACHE_STORAGE_KEY = "lucky-brand-products-cache-v1";

const readStoredBrandCache = () => {
    if (typeof window === "undefined") return {};

    try {
        return JSON.parse(sessionStorage.getItem(BRAND_CACHE_STORAGE_KEY)) || {};
    } catch {
        return {};
    }
};

const writeStoredBrandCache = (cache) => {
    if (typeof window === "undefined") return;

    try {
        sessionStorage.setItem(BRAND_CACHE_STORAGE_KEY, JSON.stringify(cache));
    } catch {
        // Ignore storage write failures.
    }
};

const brandProductCache = readStoredBrandCache();

const getCachedBrandEntry = (key) => {
    const entry = brandProductCache[key];

    if (!entry) return null;

    if (Date.now() - entry.timestamp > CACHE_TTL) {
        delete brandProductCache[key];
        writeStoredBrandCache(brandProductCache);
        return null;
    }

    return entry;
};

const setCachedBrandEntry = (key, value) => {
    brandProductCache[key] = {
        ...value,
        timestamp: Date.now(),
    };
    writeStoredBrandCache(brandProductCache);
};

const invalidateBrandCache = () => {
    Object.keys(brandProductCache).forEach((key) => {
        delete brandProductCache[key];
    });
    writeStoredBrandCache(brandProductCache);
};

const getImageSrc = (src, fallbackSrc) => (src ? `${src}` : fallbackSrc);

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

const BrandSearch = () => {
    const { brand } = useParams();
    const navigate = useNavigate();
    const dispatch = useCartDispatch();
    const { user } = useContext(UserContext);
    const { addNotification } = useNotification();
    const userRole = user?.role || "user";
    const slowLoadingTimeoutRef = useRef(null);

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showSlowLoading, setShowSlowLoading] = useState(false);
    const [cacheSource, setCacheSource] = useState("live");
    const [error, setError] = useState(null);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortBy, setSortBy] = useState("featured");
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
        brand: brand || "",
        capacity: "",
        stock: "",
    });

    const placeholderImage = "/lucky-logo.png";
    const heroImages = [backimg, back01, back02, back03, luckyImage];
    const normalizedBrand = decodeURIComponent(brand || "").replace(/-/g, " ");
    const brandLogo = `/${normalizedBrand.toLowerCase()}.png`;

    const stopSlowLoadingIndicator = useCallback(() => {
        if (slowLoadingTimeoutRef.current) {
            clearTimeout(slowLoadingTimeoutRef.current);
            slowLoadingTimeoutRef.current = null;
        }
        setShowSlowLoading(false);
    }, []);

    const startSlowLoadingIndicator = useCallback(() => {
        stopSlowLoadingIndicator();
        slowLoadingTimeoutRef.current = setTimeout(() => {
            setShowSlowLoading(true);
        }, 700);
    }, [stopSlowLoadingIndicator]);

    const fetchProducts = useCallback(async () => {
        const url = `${BASE_URL}/products/products/brand/${brand}`;

        setLoading(true);
        setError(null);
        startSlowLoadingIndicator();

        try {
            const cachedEntry = getCachedBrandEntry(url);

            if (cachedEntry) {
                setProducts(Array.isArray(cachedEntry.products) ? cachedEntry.products : []);
                setCacheSource("cache");
                return;
            }

            const response = await fetch(url, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
                cache: "force-cache",
            });

            if (!response.ok) throw new Error("Failed to fetch products");

            const data = await response.json();
            const nextProducts = Array.isArray(data.products) ? data.products : [];

            setProducts(nextProducts);
            setCacheSource("live");
            setCachedBrandEntry(url, { products: nextProducts });
        } catch (err) {
            const cachedEntry = getCachedBrandEntry(url);

            if (cachedEntry) {
                setProducts(Array.isArray(cachedEntry.products) ? cachedEntry.products : []);
                setCacheSource("cache");
                setError(null);
            } else {
                setError(err.message);
            }
        } finally {
            stopSlowLoadingIndicator();
            setLoading(false);
        }
    }, [brand, startSlowLoadingIndicator, stopSlowLoadingIndicator]);

    useEffect(() => {
        if (brand) {
            fetchProducts();
        }
    }, [brand, fetchProducts]);

    useEffect(() => {
        setNewProduct((prev) => ({ ...prev, brand: normalizedBrand || "" }));
    }, [normalizedBrand]);

    useEffect(() => {
        const intervalId = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % heroImages.length);
        }, 4500);

        return () => clearInterval(intervalId);
    }, [heroImages.length]);

    useEffect(() => {
        return () => stopSlowLoadingIndicator();
    }, [stopSlowLoadingIndicator]);

    const filteredProducts = useMemo(() => {
        const loweredSearch = searchTerm.trim().toLowerCase();

        const brandFiltered = products.filter((item) => {
            const searchableText = `${item.name || ""} ${item.model || ""} ${item.brand || ""} ${item.category || ""} ${item.capacity || ""}`;
            return searchableText.toLowerCase().includes(loweredSearch);
        });

        return [...brandFiltered].sort((a, b) => {
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
    }, [products, searchTerm, sortBy]);

    const availableCount = filteredProducts.filter((product) => Number(product.stock) > 0).length;
    const unavailableCount = Math.max(filteredProducts.length - availableCount, 0);
    const savingsCount = filteredProducts.filter((product) => getSavings(product.mrp, product.price)).length;
    const relatedBrands = brandCatalog.filter(
        (item) => item.toLowerCase() !== normalizedBrand.toLowerCase()
    );

    const clearFilters = () => {
        setSearchTerm("");
        setSortBy("featured");
    };

    const handleEdit = (product) => {
        setSelectedProduct(product);
        setIsModalOpen(true);
    };

    const handleSave = async (updatedProduct) => {
        try {
            const data = await authRequest(`/products/products/${updatedProduct._id}`, {
                method: "PUT",
                body: updatedProduct,
            });
            setProducts((prev) =>
                prev.map((prod) =>
                    prod._id === updatedProduct._id ? data : prod
                )
            );
            invalidateBrandCache();
            setIsModalOpen(false);
        } catch (err) {
            setError(err.message);
        }
    };

    const handleDelete = (productId) => {
        setIsDeleteModalOpen(true);
        setSelectedProduct(products.find((product) => product._id === productId));
    };

    const confirmDelete = async (productId) => {
        try {
            await authRequest(`/products/products/${productId}`, {
                method: "DELETE",
            });
            setProducts((prev) => prev.filter((prod) => prod._id !== productId));
            dispatch({ type: "DELETE_PRODUCT", payload: productId });
            invalidateBrandCache();
        } catch (err) {
            setError(err.message);
        }
    };

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
            title: "Success",
            message: "Item added to cart.",
            type: "success",
            container: "top-right",
            dismiss: { duration: 5000 },
        });
    };

    const handleDetails = (productId) => {
        navigate(`/productdetails/${productId}`);
    };

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
                ? newProduct.keywords.split(",").map((keyword) => keyword.trim())
                : [],
        };

        try {
            const data = await authRequest("/products/products", {
                method: "POST",
                body: productData,
            });
            setProducts((prev) => [data, ...prev]);
            invalidateBrandCache();
            setNewProduct({
                name: "",
                mrp: "",
                bestBuyPrice: "",
                category: "",
                model: "",
                description: "",
                image: "",
                keywords: "",
                brand: normalizedBrand || "",
                capacity: "",
                stock: "",
            });
            setIsAddModalOpen(false);
        } catch (err) {
            setError(err.message);
        }
    };

    if (error && !loading) {
        return (
            <div className="details-page">
                <Header />
                <div className="details-error">
                    <p>Error: {error}</p>
                    <button onClick={fetchProducts}>Retry</button>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="brand-page-shell">
            <Helmet>
                <title>{normalizedBrand} Products | Lucky Impex</title>
                <meta
                    name="description"
                    content={`Browse ${normalizedBrand} products, pricing, and offers at Lucky Impex.`}
                />
            </Helmet>

            <Header />

            {showSlowLoading && (
                <div className="slow-loading-banner">
                    <span className="loading-pulse-dot"></span>
                    Loading {normalizedBrand} products. This is taking a bit longer than usual.
                </div>
            )}

            <main className="brand-page-main">
                <section className="brand-hero">
                    <img
                        src={heroImages[currentSlide]}
                        alt={`${normalizedBrand} collection hero`}
                        className="brand-hero-image"
                    />
                    <div className="brand-hero-overlay">
                        <div className="brand-brandmark">
                            <img
                                src={brandLogo}
                                alt={`${normalizedBrand} logo`}
                                className="brand-brandmark-logo"
                                onError={(e) => {
                                    e.currentTarget.onerror = null;
                                    e.currentTarget.src = placeholderImage;
                                }}
                            />
                            <div>
                                <span className="brand-kicker">{normalizedBrand} Collection</span>
                                <h1>Shop {normalizedBrand} with a cleaner, faster collection experience.</h1>
                            </div>
                        </div>
                        <p className="brand-hero-description">
                            Browse current {normalizedBrand} inventory, compare prices against MRP,
                            and move into product details or checkout without switching between
                            unrelated categories.
                        </p>
                        <div className="brand-hero-metrics">
                            <div><ShoppingBag size={18} /> {filteredProducts.length} products</div>
                            <div><Truck size={18} /> {availableCount} ready to order</div>
                            <div><ShieldCheck size={18} /> Store-backed support</div>
                        </div>
                        <div className="brand-hero-actions">
                            <button className="button-primary" onClick={() => navigate("/products")}>
                                View all products
                            </button>
                            <button className="brand-secondary-action" onClick={clearFilters}>
                                Reset brand filters
                            </button>
                        </div>
                    </div>
                </section>

                <section className="brand-summary-grid">
                    <article className="brand-summary-card">
                        <Sparkles size={18} />
                        <div>
                            <strong>{normalizedBrand} focus</strong>
                            <span>Only products from this brand are shown on this page.</span>
                        </div>
                    </article>
                    <article className="brand-summary-card">
                        <BadgePercent size={18} />
                        <div>
                            <strong>{savingsCount} discounted items</strong>
                            <span>Cards surface savings and price positioning immediately.</span>
                        </div>
                    </article>
                    <article className="brand-summary-card">
                        <Store size={18} />
                        <div>
                            <strong>Source: {cacheSource === "cache" ? "Cached data" : "Live API"}</strong>
                            <span>Fallback cache keeps the collection usable during slow responses.</span>
                        </div>
                    </article>
                </section>

                <section className="brand-toolbar">
                    <div className="brand-toolbar-copy">
                        <span className="brand-kicker muted">Shop by Brand</span>
                        <h2>{normalizedBrand} listings</h2>
                        <p>Search this collection, sort by price or savings, and compare what is in stock right now.</p>
                    </div>

                    <div className="brand-toolbar-actions">
                        <div className="brand-search-wrap">
                            <Search size={16} />
                            <input
                                type="text"
                                placeholder={`Search ${normalizedBrand} products`}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="brand-search-input"
                            />
                        </div>

                        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                            <option value="featured">Featured</option>
                            <option value="priceLowToHigh">Price: Low to High</option>
                            <option value="priceHighToLow">Price: High to Low</option>
                            <option value="discountHighToLow">Biggest Savings</option>
                            <option value="nameAToZ">Name: A to Z</option>
                        </select>
                    </div>
                </section>

                <section className="brand-proof-strip">
                    <article className="brand-proof-card">
                        <Sparkles size={20} />
                        <div>
                            <strong>Brand-focused catalog</strong>
                            <span>Faster comparison because this page removes cross-brand clutter.</span>
                        </div>
                    </article>
                    <article className="brand-proof-card">
                        <BadgePercent size={20} />
                        <div>
                            <strong>Visible price savings</strong>
                            <span>MRP comparisons and discount cues are surfaced on each card.</span>
                        </div>
                    </article>
                    <article className="brand-proof-card">
                        <ShieldCheck size={20} />
                        <div>
                            <strong>Store-backed shopping</strong>
                            <span>Browse online while keeping access to Lucky Impex support.</span>
                        </div>
                    </article>
                </section>

                <section className="brand-results-meta">
                    <span>{availableCount} in stock</span>
                    <span>{unavailableCount} unavailable</span>
                    <span>{filteredProducts.length} results shown</span>
                </section>

                <section className="brand-chip-section">
                    <div className="brand-chip-header">
                        <div>
                            <h3>Browse other brands</h3>
                            <p>Move between major collections without going back to the home page.</p>
                        </div>
                        <button className="clear-filters-btn" onClick={() => navigate("/products")}>
                            Explore full catalog
                        </button>
                    </div>

                    <div className="brand-chip-list">
                        {relatedBrands.map((item) => (
                            <button
                                key={item}
                                className="brand-nav-chip"
                                onClick={() => navigate(`/products/brand/${item}`)}
                            >
                                {item}
                                <ArrowRight size={14} />
                            </button>
                        ))}
                    </div>
                </section>

                {userRole === "admin" && (
                    <div className="add-product-button-container">
                        <button onClick={() => setIsAddModalOpen(true)} className="button-primary">
                            Add New Product
                        </button>
                    </div>
                )}

                {loading && products.length === 0 ? (
                    <div className="brand-inline-loader">
                        <span className="loading-pulse-dot"></span>
                        Preparing the {normalizedBrand} collection...
                    </div>
                ) : (
                    <div className="product-grid">
                        {filteredProducts.length > 0 ? (
                            filteredProducts.map((product) => {
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
                                                <span className="meta-badge">{product.brand || normalizedBrand}</span>
                                                <span className="meta-badge muted">{product.category || "General"}</span>
                                            </div>

                                            <div className="product-name" onClick={() => handleDetails(product._id)}>
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
                                                {product.description || "More product information is available on the details page."}
                                            </p>

                                            {userRole === "admin" ? (
                                                <div className="product-actions">
                                                    <button className="edit-btn" onClick={() => handleEdit(product)}>
                                                        Edit
                                                    </button>
                                                    <button className="delete-btn" onClick={() => handleDelete(product._id)}>
                                                        Delete
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="product-actions customer-actions">
                                                    <button className="details-btn" onClick={() => handleDetails(product._id)}>
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
                            <div className="no-products-found brand-empty-state">
                                <h3>No {normalizedBrand} products matched your search</h3>
                                <p>Try a different search term, reset filters, or explore another brand collection.</p>
                                <div className="brand-empty-actions">
                                    <button className="button-primary" onClick={clearFilters}>
                                        Reset filters
                                    </button>
                                    <button className="brand-secondary-action" onClick={() => navigate("/products")}>
                                        Back to products
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </main>

            <Modal show={isAddModalOpen} onClose={() => setIsAddModalOpen(false)}>
                <h2>Add New Product</h2>
                <form onSubmit={handleAddNewProduct}>
                    <input type="text" name="name" value={newProduct.name} onChange={handleNewProductChange} placeholder="Product Name" required />
                    <input type="text" name="category" value={newProduct.category} onChange={handleNewProductChange} placeholder="Category" required />
                    <input type="number" name="mrp" value={newProduct.mrp} onChange={handleNewProductChange} placeholder="MRP" required />
                    <input type="number" name="bestBuyPrice" value={newProduct.bestBuyPrice} onChange={handleNewProductChange} placeholder="Best Buy Price" required />
                    <input type="text" name="brand" value={newProduct.brand} onChange={handleNewProductChange} placeholder="Brand Name" required />
                    <input type="text" name="capacity" value={newProduct.capacity} onChange={handleNewProductChange} placeholder="Capacity or Size" required />
                    <input type="text" name="model" value={newProduct.model} onChange={handleNewProductChange} placeholder="Model Number" required />
                    <textarea name="description" value={newProduct.description} onChange={handleNewProductChange} placeholder="Description" required />
                    <input type="url" name="image" value={newProduct.image} onChange={handleNewProductChange} placeholder="Image URL" required />
                    <input type="text" name="keywords" value={newProduct.keywords} onChange={handleNewProductChange} placeholder="Keywords (comma separated)" required />
                    <input type="number" name="stock" value={newProduct.stock} onChange={handleNewProductChange} placeholder="Stock Quantity" required />
                    <button type="submit" className="button-primary">Add Product</button>
                </form>
            </Modal>

            <EditProductModal
                product={selectedProduct}
                onSave={handleSave}
                onClose={() => setIsModalOpen(false)}
                isOpen={isModalOpen}
            />

            <Modal show={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)}>
                <h3>Are you sure you want to delete this product?</h3>
                <div className="modal-actions">
                    <button
                        onClick={() => {
                            confirmDelete(selectedProduct?._id);
                            setIsDeleteModalOpen(false);
                        }}
                        className="button-primary"
                    >
                        Yes, Delete
                    </button>
                    <button onClick={() => setIsDeleteModalOpen(false)} className="button-secondary">
                        Cancel
                    </button>
                </div>
            </Modal>

            <Footer />
        </div>
    );
};

export default BrandSearch;
