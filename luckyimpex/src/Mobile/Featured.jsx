import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { featuredMobiles } from './data';
import { useCartDispatch } from '../Components/CreateReducer';
import { useNotification } from '../Components/NotificationContext';
import { 
    Cpu, 
    HardDrive, 
    Camera, 
    Battery, 
    ShoppingCart, 
    ArrowRight, 
    Check, 
    ShieldCheck, 
    Flame,
    CreditCard
} from 'lucide-react';

export default function Featured() {
    const navigate = useNavigate();
    const cartDispatch = useCartDispatch();
    const { showNotification } = useNotification();
    const [selectedBrand, setSelectedBrand] = useState('All');
    const [addedIds, setAddedIds] = useState({});

    const brands = ['All', 'Samsung', 'Apple', 'OnePlus', 'Xiaomi'];

    const filteredMobiles = useMemo(() => {
        if (selectedBrand === 'All') return featuredMobiles;
        return featuredMobiles.filter(
            (m) => m.brand.toLowerCase() === selectedBrand.toLowerCase()
        );
    }, [selectedBrand]);

    const handleAddToCart = (e, item) => {
        e.stopPropagation();
        cartDispatch({
            type: "ADD_ITEM",
            id: item._id,
            name: item.name,
            price: item.salePrice || item.price,
            image: item.image,
            mrp: item.mrp || item.price,
            quantity: 1,
        });

        setAddedIds((prev) => ({ ...prev, [item._id]: true }));
        setTimeout(() => {
            setAddedIds((prev) => ({ ...prev, [item._id]: false }));
        }, 1800);

        if (showNotification) {
            showNotification(`${item.name} added to cart!`, 'success');
        }
    };

    const formatPrice = (val) => {
        return Number(val || 0).toLocaleString('en-IN');
    };

    const calcEmi = (price) => {
        return Math.round(Number(price || 0) / 12).toLocaleString('en-IN');
    };

    return (
        <section className="featured-mobiles-section" id="featured-mobiles">
            <div className="section-header-block">
                <div className="section-title-wrap">
                    <span className="section-eyebrow">
                        <Flame size={14} className="flame-icon" />
                        FLAGSHIP SPOTLIGHT · BIRGUNJ
                    </span>
                    <h2 className="section-title">
                        Trending Flagships & 5G Best Sellers
                    </h2>
                    <p className="section-desc">
                        Official MDMS certified models with 1-Year National Warranty, 0% EMI financing, and immediate Birgunj showroom pickup.
                    </p>
                </div>

                <div className="brand-filter-tabs">
                    {brands.map((b) => (
                        <button
                            key={b}
                            type="button"
                            className={`brand-tab-btn ${selectedBrand === b ? 'active' : ''}`}
                            onClick={() => setSelectedBrand(b)}
                        >
                            {b === 'All' ? 'All Flagships' : b}
                        </button>
                    ))}
                    <button
                        type="button"
                        className="view-all-cta-btn"
                        onClick={() => navigate('/mobile products')}
                    >
                        View Full Catalog <ArrowRight size={14} />
                    </button>
                </div>
            </div>

            <div className="featured-mobiles-grid">
                {filteredMobiles.map((item) => {
                    const discount = item.mrp && item.price && item.mrp > item.price
                        ? Math.round(((item.mrp - item.price) / item.mrp) * 100)
                        : null;
                    const isAdded = addedIds[item._id];

                    return (
                        <div 
                            key={item._id} 
                            className="mobile-flagship-card"
                            onClick={() => navigate(`/mobile products?search=${encodeURIComponent(item.name)}`)}
                        >
                            {/* Card Top Badges */}
                            <div className="card-top-badges">
                                <span className="brand-tag">{item.brand}</span>
                                <div className="right-badge-group">
                                    {discount && (
                                        <span className="discount-tag">Save {discount}%</span>
                                    )}
                                    {item.fiveG && (
                                        <span className="fiveg-tag">5G</span>
                                    )}
                                </div>
                            </div>

                            {/* Product Image */}
                            <div className="card-media-wrapper">
                                <img 
                                    src={item.image} 
                                    alt={item.name} 
                                    className="card-product-img"
                                    loading="lazy"
                                />
                            </div>

                            {/* Info Area */}
                            <div className="card-content-area">
                                <h3 className="card-product-name">{item.name}</h3>

                                {/* Key Specs Pills */}
                                <div className="specs-pills-row">
                                    {item.processor && (
                                        <span className="spec-pill" title="Processor">
                                            <Cpu size={12} />
                                            {item.processor.replace('Snapdragon', 'SD')}
                                        </span>
                                    )}
                                    <span className="spec-pill" title="Memory & Storage">
                                        <HardDrive size={12} />
                                        {item.ram}GB / {item.storage}GB
                                    </span>
                                    {item.camera && (
                                        <span className="spec-pill" title="Camera">
                                            <Camera size={12} />
                                            {item.camera}MP
                                        </span>
                                    )}
                                    {item.battery && (
                                        <span className="spec-pill" title="Battery">
                                            <Battery size={12} />
                                            {item.battery}
                                        </span>
                                    )}
                                </div>

                                {/* Price Area */}
                                <div className="card-pricing-block">
                                    <div className="price-main-row">
                                        <span className="price-current">Rs. {formatPrice(item.price)}</span>
                                        {item.mrp && item.mrp > item.price && (
                                            <span className="price-mrp">Rs. {formatPrice(item.mrp)}</span>
                                        )}
                                    </div>

                                    <div className="emi-calculator-pill">
                                        <CreditCard size={12} />
                                        <span>0% EMI from <strong>Rs. {calcEmi(item.price)}/mo</strong></span>
                                    </div>
                                </div>

                                {/* MDMS Verified & Warranty Tag */}
                                <div className="card-trust-line">
                                    <ShieldCheck size={14} className="text-emerald" />
                                    <span>MDMS Registered · 1-Yr Official Warranty</span>
                                </div>

                                {/* Action Buttons */}
                                <div className="card-actions-row">
                                    <button
                                        type="button"
                                        className={`btn-card-cart ${isAdded ? 'added' : ''}`}
                                        onClick={(e) => handleAddToCart(e, item)}
                                        aria-label={`Add ${item.name} to cart`}
                                    >
                                        {isAdded ? (
                                            <>
                                                <Check size={16} /> Added!
                                            </>
                                        ) : (
                                            <>
                                                <ShoppingCart size={15} /> Add to Cart
                                            </>
                                        )}
                                    </button>
                                    <button
                                        type="button"
                                        className="btn-card-explore"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            navigate(`/mobile products?search=${encodeURIComponent(item.name)}`);
                                        }}
                                        title="View Full Specifications"
                                    >
                                        Specs <ArrowRight size={13} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
