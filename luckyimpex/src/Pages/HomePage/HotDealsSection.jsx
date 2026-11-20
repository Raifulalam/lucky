import React, { useState, useEffect } from "react";
import { ArrowRight, Flame, Clock, Percent } from "lucide-react";
import { Link } from "react-router-dom";
import { getData } from "../../api/api";
import "./HotDealsSection.css";

const HotDealsSection = () => {
    const [deals, setDeals] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchHotDeals = async () => {
            try {
                setIsLoading(true);
                setError(null);
                // Fetch products with high discounts (where MRP is significantly higher than price)
                const data = await getData('/products/products?page=1&limit=12');
                if (data?.products) {
                    // Filter products with meaningful discounts (at least 10% off)
                    const dealsWithDiscount = data.products
                        .filter(product => {
                            const mrp = Number(product.mrp);
                            const price = Number(product.price);
                            if (mrp > 0 && price > 0 && mrp > price) {
                                const discount = ((mrp - price) / mrp) * 100;
                                return discount >= 10; // At least 10% discount
                            }
                            return false;
                        })
                        .map((product, index) => ({
                            id: product._id || `deal-${index}`,
                            title: product.name || product.title || 'Product',
                            brand: product.brand || 'Brand',
                            category: product.category || 'Appliances',
                            slug: product.slug || product._id,
                            image: product.images?.[0] || product.image || '',
                            fallback: '/lucky-logo.png',
                            mrp: Number(product.mrp),
                            price: Number(product.price),
                            discount: Math.round(((Number(product.mrp) - Number(product.price)) / Number(product.mrp)) * 100),
                            inStock: Number(product.stock || 0) > 0,
                        }))
                        .sort((a, b) => b.discount - a.discount) // Sort by highest discount first
                        .slice(0, 8); // Show top 8 deals

                    setDeals(dealsWithDiscount);
                }
            } catch (err) {
                console.error('Failed to fetch hot deals:', err);
                setError('Could not load deals');
            } finally {
                setIsLoading(false);
            }
        };

        fetchHotDeals();
    }, []);

    const formatPrice = (amount) => `₨ ${amount.toLocaleString()}`;

    if (isLoading) {
        return (
            <section className="hot-deals-section" aria-label="Hot deals and offers">
                <div className="hot-deals-inner">
                    <div className="deals-header">
                        <div className="deals-badge">
                            <Flame size={20} />
                            <span>HOT DEALS</span>
                        </div>
                        <h2 className="deals-title">Summer Special Offers</h2>
                        <p className="deals-subtitle">Limited time discounts on top products</p>
                    </div>
                    <div className="deals-loading">
                        <div className="loading-spinner"></div>
                        <p>Loading hot deals...</p>
                    </div>
                </div>
            </section>
        );
    }

    if (error || deals.length === 0) {
        return null; // Don't show section if no deals available
    }

    return (
        <section className="hot-deals-section" aria-label="Hot deals and offers">
            <div className="hot-deals-inner">
                {/* Header */}
                <div className="deals-header">
                    <div className="deals-badge">
                        <Flame size={20} />
                        <span>HOT DEALS</span>
                    </div>
                    <h2 className="deals-title">Summer Special Offers</h2>
                    <p className="deals-subtitle">Limited time discounts on premium appliances</p>
                    <Link to="/products" className="deals-view-all">
                        View All Deals <ArrowRight size={16} />
                    </Link>
                </div>

                {/* Deals Grid */}
                <div className="deals-grid">
                    {deals.map((deal) => (
                        <article key={deal.id} className="deal-card">
                            <div className="deal-image-wrapper">
                                <img
                                    src={deal.image}
                                    alt={deal.title}
                                    loading="lazy"
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = deal.fallback;
                                    }}
                                    className="deal-image"
                                />
                                <div className="deal-discount-badge">
                                    <Percent size={14} />
                                    <span>{deal.discount}% OFF</span>
                                </div>
                                {deal.inStock && (
                                    <div className="deal-stock-badge">
                                        <Clock size={12} />
                                        <span>Limited Stock</span>
                                    </div>
                                )}
                            </div>

                            <div className="deal-content">
                                <div className="deal-brand">{deal.brand}</div>
                                <h3 className="deal-title" title={deal.title}>
                                    <Link to={`/product/${encodeURIComponent(deal.slug)}`}>
                                        {deal.title}
                                    </Link>
                                </h3>

                                <div className="deal-pricing">
                                    <div className="deal-current-price">{formatPrice(deal.price)}</div>
                                    <div className="deal-mrp">{formatPrice(deal.mrp)}</div>
                                    <div className="deal-savings">
                                        Save {formatPrice(deal.mrp - deal.price)}
                                    </div>
                                </div>

                                <Link
                                    to={`/product/${encodeURIComponent(deal.slug)}`}
                                    className="deal-cta-btn"
                                >
                                    View Deal <ArrowRight size={14} />
                                </Link>
                            </div>
                        </article>
                    ))}
                </div>

                {/* Bottom CTA */}
                <div className="deals-bottom-cta">
                    <div className="cta-content">
                        <h3>Don't Miss Out!</h3>
                        <p>These offers are valid for a limited time. Grab your favorite appliances before they're gone.</p>
                    </div>
                    <Link to="/products" className="cta-button">
                        Shop All Products
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default HotDealsSection;
