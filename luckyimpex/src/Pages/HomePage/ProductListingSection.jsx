import React, { useState, useRef } from "react";
import { Link } from "react-router-dom";
import {
    ArrowRight,
    Building2,
    CheckCircle,
    ChevronLeft,
    ChevronRight,
    FileText,
    Percent,
    Plus,
    ShoppingCart,
    Star,
    Zap
} from "lucide-react";
import { useWholesale } from "../../Components/WholesaleContext";
import { useCartDispatch } from "../../Components/CreateReducer";
import "./ProductListingSection.css";

const PRODUCTS_DATA = [
    {
        id: "prod-1",
        title: "AeroCool 1.5 Ton 5-Star Dual Inverter Split AC",
        brand: "LG Electronics",
        category: "Air Conditioners",
        rating: 4.8,
        reviewsCount: 38,
        inStock: true,
        image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=500&q=80",
        fallback: "/guest1.jpg",
        retail: {
            mrp: 89999,
            price: 74999,
            discount: "17% OFF",
            emiPerMonth: 6250,
        },
        wholesale: {
            minQty: 5,
            tieredDiscount: "Save 16%",
            bulkPrice: 62999,
            tierInfo: "5-9 Units: NPR 62,999 | 10+ Units: NPR 59,500",
        },
        tab: "bestsellers",
    },
    {
        id: "prod-2",
        title: "FrostPro 340L Double Door Convertible Refrigerator",
        brand: "Samsung",
        category: "Refrigerators",
        rating: 4.9,
        reviewsCount: 52,
        inStock: true,
        image: "https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?auto=format&fit=crop&w=500&q=80",
        fallback: "/guest2.jpg",
        retail: {
            mrp: 68500,
            price: 56900,
            discount: "17% OFF",
            emiPerMonth: 4740,
        },
        wholesale: {
            minQty: 4,
            tieredDiscount: "Save 18%",
            bulkPrice: 47990,
            tierInfo: "4-7 Units: NPR 47,990 | 8+ Units: NPR 44,800",
        },
        tab: "bestsellers",
    },
    {
        id: "prod-3",
        title: "CrystalVision 55\" 4K Ultra HD Smart Google TV",
        brand: "Haier",
        category: "Smart LED TVs",
        rating: 4.7,
        reviewsCount: 44,
        inStock: true,
        image: "https://images.unsplash.com/photo-1593784991095-a205069470b6?auto=format&fit=crop&w=500&q=80",
        fallback: "/guest3.jpg",
        retail: {
            mrp: 62000,
            price: 48500,
            discount: "22% OFF",
            emiPerMonth: 4040,
        },
        wholesale: {
            minQty: 6,
            tieredDiscount: "Save 20%",
            bulkPrice: 39900,
            tierInfo: "6-11 Units: NPR 39,900 | 12+ Units: NPR 37,200",
        },
        tab: "bestsellers",
    },
    {
        id: "prod-4",
        title: "AquaWave 8.5 kg AI Direct Drive Front Load Washer",
        brand: "LG Electronics",
        category: "Washing Machines",
        rating: 4.9,
        reviewsCount: 29,
        inStock: true,
        image: "https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?auto=format&fit=crop&w=500&q=80",
        fallback: "/guest4.jpg",
        retail: {
            mrp: 76000,
            price: 63500,
            discount: "16% OFF",
            emiPerMonth: 5290,
        },
        wholesale: {
            minQty: 3,
            tieredDiscount: "Save 15%",
            bulkPrice: 54900,
            tierInfo: "3-5 Units: NPR 54,900 | 6+ Units: NPR 51,800",
        },
        tab: "bestsellers",
    },
    {
        id: "prod-5",
        title: "UltraBreeze 75L Heavy Duty Desert Air Cooler",
        brand: "Symphony",
        category: "Home Appliances",
        rating: 4.6,
        reviewsCount: 67,
        inStock: true,
        image: "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&w=500&q=80",
        fallback: "/guest5.jpg",
        retail: {
            mrp: 24500,
            price: 18900,
            discount: "23% OFF",
            emiPerMonth: 1575,
        },
        wholesale: {
            minQty: 10,
            tieredDiscount: "Save 24%",
            bulkPrice: 14900,
            tierInfo: "10-19 Units: NPR 14,900 | 20+ Units: NPR 13,800",
        },
        tab: "newarrivals",
    },
    {
        id: "prod-6",
        title: "TurboGrind 1000W 4-Jar Commercial Mixer Grinder",
        brand: "Bajaj",
        category: "Kitchen Appliances",
        rating: 4.8,
        reviewsCount: 31,
        inStock: true,
        image: "https://images.unsplash.com/photo-1588854337236-6889d631faa8?auto=format&fit=crop&w=500&q=80",
        fallback: "/guest6.jpg",
        retail: {
            mrp: 14200,
            price: 10999,
            discount: "22% OFF",
            emiPerMonth: 915,
        },
        wholesale: {
            minQty: 8,
            tieredDiscount: "Save 21%",
            bulkPrice: 8750,
            tierInfo: "8-15 Units: NPR 8,750 | 16+ Units: NPR 8,100",
        },
        tab: "newarrivals",
    },
];

const ProductListingSection = () => {
    const { isWholesale, openRfqModal, currency } = useWholesale();
    const cartDispatch = useCartDispatch();
    const [activeTab, setActiveTab] = useState("all");
    const [addedId, setAddedId] = useState(null);
    const scrollContainerRef = useRef(null);

    const filteredProducts = PRODUCTS_DATA.filter((item) => {
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
