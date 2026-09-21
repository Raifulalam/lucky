import React, { useState, useRef, useEffect } from "react";

import {

    Building2,
    CheckCircle,
    ChevronLeft,
    ChevronRight,
    FileText,
    Percent,

    ShoppingCart,
    Star,
    Zap
} from "lucide-react";
import { useWholesale } from "../../Components/WholesaleContext";
import { useCartDispatch } from "../../Components/CreateReducer";
import { getData } from "../../api/api";
import "./ProductListingSection.css";

const ProductListingSection = () => {
    const { isWholesale, openRfqModal, currency } = useWholesale();
    const cartDispatch = useCartDispatch();
    const [activeTab, setActiveTab] = useState("all");
    const [addedId, setAddedId] = useState(null);
    const scrollContainerRef = useRef(null);
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch featured products from backend
    useEffect(() => {
        const fetchFeaturedProducts = async () => {
            try {
                setIsLoading(true);
                const data = await getData('/products/products?page=1&limit=12');
                if (data?.products) {
                    // Transform backend data to match component format
                    const transformedProducts = data.products.map((product, index) => ({
                        id: product._id || `prod-${index}`,
                        title: product.name || product.title || 'Product',
                        brand: product.brand || 'Brand',
                        category: product.category || 'Appliances',
                        rating: 4.5 + Math.random() * 0.5, // Random rating between 4.5-5.0
                        reviewsCount: Math.floor(Math.random() * 50) + 20,
                        inStock: Number(product.stock || 0) > 0,
                        image: product.images?.[0] || product.image || '',
                        fallback: '/lucky-logo.png',
                        retail: {
                            mrp: Number(product.mrp) || Number(product.price) * 1.2,
                            price: Number(product.price) || Number(product.bestBuyPrice) || 0,
                            discount: product.mrp && product.price ? `${Math.round(((product.mrp - product.price) / product.mrp) * 100)}% OFF` : '10% OFF',
                            emiPerMonth: Math.round((Number(product.price) || 0) / 12),
                        },
                        wholesale: {
                            minQty: 5,
                            tieredDiscount: 'Save 15%',
                            bulkPrice: Math.round((Number(product.price) || 0) * 0.85),
                            tierInfo: '5-9 Units: NPR ' + Math.round((Number(product.price) || 0) * 0.85).toLocaleString() + ' | 10+ Units: NPR ' + Math.round((Number(product.price) || 0) * 0.8).toLocaleString(),
                        },
                        tab: index < 4 ? 'bestsellers' : 'newarrivals',
                    }));
                    setProducts(transformedProducts);
                }
            } catch (err) {
                console.error('Failed to fetch featured products:', err);
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchFeaturedProducts();
    }, []);

    const filteredProducts = products.filter((item) => {
        if (activeTab === "all") return true;
        return item.tab === activeTab;
    });

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
                price: isWholesale ? product.wholesale.bulkPrice : product.retail.price,
                image: product.image,
                mrp: product.retail.mrp,
                quantity: isWholesale ? product.wholesale.minQty : 1,
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
                        <p>Failed to load products: {error}</p>
                        <button onClick={() => window.location.reload()}>Retry</button>
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
                                ? "Displaying bulk tiered discount quotes. Add to cart with MOQ or request an official GST/VAT commercial RFQ quote."
                                : "Authorized brand warranties, low-cost EMI breakdowns, and same-day showroom dispatch in Birgunj."}
                        </p>
                    </div>

                    {/* Filter Tabs & Scroll Controls */}
                    <div className="tabs-and-controls">
                        <div className="filter-tabs-pills">
                            <button
                                type="button"
                                className={`filter-tab ${activeTab === "all" ? "active" : ""}`}
                                onClick={() => setActiveTab("all")}
                            >
                                All Featured
                            </button>
                            <button
                                type="button"
                                className={`filter-tab ${activeTab === "bestsellers" ? "active" : ""}`}
                                onClick={() => setActiveTab("bestsellers")}
                            >
                                Best Sellers
                            </button>
                            <button
                                type="button"
                                className={`filter-tab ${activeTab === "newarrivals" ? "active" : ""}`}
                                onClick={() => setActiveTab("newarrivals")}
                            >
                                New Arrivals
                            </button>
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
                                    <span className="stock-badge">
                                        <CheckCircle size={11} /> In Stock
                                    </span>
                                    {isWholesale ? (
                                        <span className="wholesale-badge-tag">
                                            {product.wholesale.tieredDiscount}
                                        </span>
                                    ) : (
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
                                    <div className="prod-rating">
                                        <Star size={12} className="star-icon" />
                                        <span>{product.rating}</span>
                                        <span className="review-num">({product.reviewsCount})</span>
                                    </div>
                                </div>

                                <h3 className="prod-title" title={product.title}>
                                    {product.title}
                                </h3>

                                {/* DYNAMIC PRICE DISPLAY */}
                                <div className="prod-pricing-block">
                                    {!isWholesale ? (
                                        /* Retail Price Display */
                                        <div className="retail-price-wrap">
                                            <div className="price-main-row">
                                                <span className="price-current">
                                                    {formatPrice(product.retail.price)}
                                                </span>
                                                <span className="price-mrp">
                                                    {formatPrice(product.retail.mrp)}
                                                </span>
                                            </div>
                                            <div className="emi-breakdown-row">
                                                <Percent size={12} className="emi-icon" />
                                                <span>
                                                    EMI from <strong>{formatPrice(product.retail.emiPerMonth)}</strong>/mo
                                                </span>
                                            </div>
                                        </div>
                                    ) : (
                                        /* Wholesale Price Display */
                                        <div className="wholesale-price-wrap">
                                            <div className="price-main-row">
                                                <span className="price-current price-wholesale">
                                                    {formatPrice(product.wholesale.bulkPrice)}
                                                </span>
                                                <span className="moq-pill">
                                                    Min {product.wholesale.minQty} Units
                                                </span>
                                            </div>
                                            <div className="bulk-tiered-info">
                                                <Building2 size={12} />
                                                <span>{product.wholesale.tierInfo}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* ACTION BUTTONS */}
                                <div className="prod-card-actions">
                                    <button
                                        type="button"
                                        className={`btn-add-cart ${addedId === product.id ? "added" : ""}`}
                                        onClick={() => handleAddToCart(product)}
                                    >
                                        <ShoppingCart size={15} />
                                        <span>{addedId === product.id ? "Added to Cart!" : isWholesale ? `Order MOQ (${product.wholesale.minQty})` : "Add to Cart"}</span>
                                    </button>

                                    <button
                                        type="button"
                                        className="btn-bulk-quote"
                                        onClick={() => openRfqModal(product)}
                                        title="Request Bulk Quote / Dealer Rates"
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
