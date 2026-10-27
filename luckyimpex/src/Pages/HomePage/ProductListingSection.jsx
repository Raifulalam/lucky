import React, { useState, useRef, useEffect } from "react";

import {

    Building2,
    CheckCircle,
    ChevronLeft,
    ChevronRight,
    FileText,

    ShoppingCart,
    Zap
} from "lucide-react";
import { Link } from "react-router-dom";
import { useWholesale } from "../../Components/WholesaleContext";
import { useCartDispatch } from "../../Components/CreateReducer";
import { getData } from "../../api/api";
import "./ProductListingSection.css";

const ProductListingSection = () => {
    const { isWholesale, openRfqModal, currency } = useWholesale();
    const cartDispatch = useCartDispatch();
    const [addedId, setAddedId] = useState(null);
    const scrollContainerRef = useRef(null);
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [attempt, setAttempt] = useState(0);

    // Fetch featured products from backend
    useEffect(() => {
        const fetchFeaturedProducts = async () => {
            try {
                setIsLoading(true);
                setError(null);
                const data = await getData('/products/products?page=1&limit=12');
                if (data?.products) {
                    // Transform backend data to match component format
                    const transformedProducts = data.products.map((product, index) => ({
                        id: product._id || `prod-${index}`,
                        title: product.name || product.title || 'Product',
                        brand: product.brand || 'Brand',
                        category: product.category || 'Appliances',
                        slug: product.slug || product._id,
                        inStock: Number(product.stock || 0) > 0,
                        image: product.images?.[0] || product.image || '',
                        fallback: '/lucky-logo.png',
                        retail: {
                            // Only real MRP and a real saving are shown; nothing is estimated.
                            mrp: Number(product.mrp) > Number(product.price) ? Number(product.mrp) : 0,
                            price: Number(product.price) || 0,
                            discount: Number(product.mrp) > Number(product.price) && Number(product.price) > 0
                                ? `${Math.round(((product.mrp - product.price) / product.mrp) * 100)}% OFF`
                                : '',
                        },
                    }));
                    setProducts(transformedProducts);
                }
            } catch (err) {
                console.error('Failed to fetch featured products:', err);
                // Technical details stay in the console; customers get a friendly message.
                setError('unavailable');
            } finally {
                setIsLoading(false);
            }
        };

        fetchFeaturedProducts();
    }, [attempt]);

    const filteredProducts = products;

    const scrollLeft = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollBy({ left: -320, behavior: "smooth" });
        }
    };

    const scrollRight = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollBy({ left: 320, behavior: "smooth" });
        }
    };

    const formatPrice = (amount) => {
        if (currency === "USD") {
            const usd = Math.round(amount / 135);
            return `$${usd.toLocaleString()}`;
        }
        return `₨ ${amount.toLocaleString()}`;
    };

    const handleAddToCart = (product) => {
        if (cartDispatch) {
            cartDispatch({
                type: "ADD_ITEM",
                id: product.id,
                name: product.title,
                price: product.retail.price,
                image: product.image,
                mrp: product.retail.mrp,
                quantity: 1,
            });
        }
        setAddedId(product.id);
        setTimeout(() => setAddedId(null), 1800);
    };

    if (isLoading) {
        return (
            <section className="product-listing-section" aria-label="Featured appliances and electronics">
                <div className="product-listing-inner">
                    <div className="product-section-top">
                        <div className="product-title-group">
                            <div className="mode-indicator-pill">
                                {isWholesale ? <Building2 size={13} /> : <Zap size={13} />}
                                <span>{isWholesale ? "Wholesale Dealer Rates Active" : "Retail & In-Store Prices"}</span>
                            </div>
                            <h2 className="section-title">
                                {isWholesale ? "Bulk Electronics & Container Specials" : "Featured Appliances & Electronics"}
                            </h2>
                        </div>
                    </div>
                    <div className="loading-state">
                        <div className="loading-spinner"></div>
                        <p>Loading featured products...</p>
                    </div>
                </div>
            </section>
        );
    }

    if (error) {
        return (
            <section className="product-listing-section" aria-label="Featured appliances and electronics">
                <div className="product-listing-inner">
                    <div className="product-section-top">
                        <div className="product-title-group">
                            <div className="mode-indicator-pill">
                                {isWholesale ? <Building2 size={13} /> : <Zap size={13} />}
                                <span>{isWholesale ? "Wholesale Dealer Rates Active" : "Retail & In-Store Prices"}</span>
                            </div>
                            <h2 className="section-title">
                                {isWholesale ? "Bulk Electronics & Container Specials" : "Featured Appliances & Electronics"}
                            </h2>
                        </div>
                    </div>
                    <div className="error-state">
                        <p>We could not load our products right now. Please try again, or contact us and we will help you directly.</p>
                        <button type="button" onClick={() => setAttempt((n) => n + 1)}>Try again</button>
                        {' '}
                        <a href="https://wa.me/9779802594022?text=Hello%20Lucky%20Impex%2C%20I%20would%20like%20to%20enquire%20about%20a%20product." target="_blank" rel="noopener noreferrer">WhatsApp us</a>
                        {' · '}
                        <a href="tel:+977051531789">Call 051-531789</a>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="product-listing-section" aria-label="Featured appliances and electronics">
            <div className="product-listing-inner">
                {/* Header with Tabs & Mode Indicator */}
                <div className="product-section-top">
                    <div className="product-title-group">
                        <div className="mode-indicator-pill">
                            {isWholesale ? <Building2 size={13} /> : <Zap size={13} />}
                            <span>{isWholesale ? "Wholesale Dealer Rates Active" : "Retail & In-Store Prices"}</span>
                        </div>
                        <h2 className="section-title">
                            {isWholesale ? "Bulk Electronics & Container Specials" : "Featured Appliances & Electronics"}
                        </h2>
                        <p className="section-desc">
                            {isWholesale
                                ? "Wholesale pricing is quoted per order. Send us a quote request with the models and quantities you need."
                                : "Current prices and availability from the Lucky Impex showroom in Birgunj."}
                        </p>
                    </div>

                    {/* Filter Tabs & Scroll Controls */}
                    <div className="tabs-and-controls">
                        <div className="filter-tabs-pills">
                            <span className="filter-tab active">Latest Products</span>
                        </div>

                        <div className="scroll-arrows-desktop">
                            <button
                                type="button"
                                onClick={scrollLeft}
                                className="arrow-btn"
                                aria-label="Scroll left"
                            >
                                <ChevronLeft size={20} />
                            </button>
                            <button
                                type="button"
                                onClick={scrollRight}
                                className="arrow-btn"
                                aria-label="Scroll right"
                            >
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Hybrid Products Grid / Horizontal Scroll Track */}
                <div className="products-scroll-track" ref={scrollContainerRef}>
                    {filteredProducts.map((product) => (
                        <article key={product.id} className="hybrid-product-card">
                            {/* Card Image Wrap */}
                            <div className="prod-img-box">
                                <img
                                    src={product.image}
                                    alt={product.title}
                                    loading="lazy"
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = product.fallback;
                                    }}
                                    className="prod-img"
                                />

                                {/* Stock & Mode Badges */}
                                <div className="prod-badges-row">
                                    {product.inStock && (
                                        <span className="stock-badge">
                                            <CheckCircle size={11} /> In Stock
                                        </span>
                                    )}
                                    {!isWholesale && product.retail.discount && (
                                        <span className="discount-badge-tag">
                                            {product.retail.discount}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Card Content */}
                            <div className="prod-card-body">
                                <div className="prod-meta-row">
                                    <span className="prod-brand">{product.brand}</span>
                                </div>

                                <h3 className="prod-title" title={product.title}>
                                    <Link to={`/product/${encodeURIComponent(product.slug)}`}>
                                        {product.title}
                                    </Link>
                                </h3>

                                {/* PRICE (real catalogue price; wholesale is quoted, never estimated) */}
                                <div className="prod-pricing-block">
                                    <div className="retail-price-wrap">
                                        <div className="price-main-row">
                                            <span className="price-current">
                                                {product.retail.price > 0 ? formatPrice(product.retail.price) : "Ask for price"}
                                            </span>
                                            {product.retail.mrp > 0 && (
                                                <span className="price-mrp">
                                                    {formatPrice(product.retail.mrp)}
                                                </span>
                                            )}
                                        </div>
                                        {isWholesale && (
                                            <div className="bulk-tiered-info">
                                                <Building2 size={12} />
                                                <span>Wholesale rate on request</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* ACTION BUTTONS */}
                                <div className="prod-card-actions">
                                    <button
                                        type="button"
                                        className={`btn-add-cart ${addedId === product.id ? "added" : ""}`}
                                        onClick={() => handleAddToCart(product)}
                                    >
                                        <ShoppingCart size={15} />
                                        <span>{addedId === product.id ? "Added to Cart!" : "Add to Cart"}</span>
                                    </button>

                                    <button
                                        type="button"
                                        className="btn-bulk-quote"
                                        onClick={() => openRfqModal(product)}
                                        title="Request a wholesale quote"
                                    >
                                        <FileText size={15} />
                                        <span>Bulk Quote</span>
                                    </button>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>

                {/* Mobile Swipe Hint */}
                <div className="mobile-scroll-hint">
                    <span>← Swipe to explore more models →</span>
                </div>
            </div>
        </section>
    );
};

export default ProductListingSection;
