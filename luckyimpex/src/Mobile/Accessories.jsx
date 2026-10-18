import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartDispatch } from '../Components/CreateReducer';
import { useNotification } from '../Components/NotificationContext';
import { 
    Headphones, 
    Shield, 
    Zap, 
    Watch, 
    BatteryCharging, 
    Sparkles, 
    ShoppingCart, 
    Check, 
    Star 
} from 'lucide-react';

export default function Features() {
    const navigate = useNavigate();
    const cartDispatch = useCartDispatch();
    const { showNotification } = useNotification();
    const [addedIds, setAddedIds] = useState({});

    const accessories = [
        {
            id: 'acc-1',
            name: "Active Noise Cancelling Earbuds",
            category: "Audio & Wearables",
            description: "Spatial audio with 42dB hybrid ANC, transparency mode, and 36-hour total battery life.",
            price: 4999,
            mrp: 6999,
            rating: 4.8,
            reviewsCount: 84,
            icon: Headphones,
            image: "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=600&auto=format&fit=crop&q=80",
            tag: "Best Seller"
        },
        {
            id: 'acc-2',
            name: "MagSafe Military Armor Case",
            category: "Protection",
            description: "12ft drop-tested polycarbonate with built-in N52 strong magnets and raised camera guard ring.",
            price: 1499,
            mrp: 2199,
            rating: 4.9,
            reviewsCount: 112,
            icon: Shield,
            image: "https://images.unsplash.com/photo-1601593346740-925612772716?w=600&auto=format&fit=crop&q=80",
            tag: "Popular"
        },
        {
            id: 'acc-3',
            name: "65W GaN Dual-Port Fast Charger",
            category: "Charging",
            description: "Ultra-compact Gallium Nitride charger with Type-C Power Delivery and smart power allocation.",
            price: 2799,
            mrp: 3499,
            rating: 4.8,
            reviewsCount: 65,
            icon: Zap,
            image: "https://images.unsplash.com/photo-1609592424847-7d6a7a6e4b1e?w=600&auto=format&fit=crop&q=80",
            tag: "Essential"
        },
        {
            id: 'acc-4',
            name: "Magnetic Qi2 Wireless Powerbank",
            category: "Charging",
            description: "10,000mAh slim battery pack with snap-on 15W wireless charging and fold-out kickstand.",
            price: 3899,
            mrp: 4999,
            rating: 4.7,
            reviewsCount: 48,
            icon: BatteryCharging,
            image: "https://images.unsplash.com/photo-1622445262464-84b1456045b6?w=600&auto=format&fit=crop&q=80",
            tag: "New Arrival"
        },
        {
            id: 'acc-5',
            name: "AMOLED Bluetooth Smartwatch",
            category: "Wearables",
            description: "Always-on high brightness display, Bluetooth calling, SpO2 sensor, and 100+ sport modes.",
            price: 6499,
            mrp: 8999,
            rating: 4.9,
            reviewsCount: 92,
            icon: Watch,
            image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80",
            tag: "Top Rated"
        },
        {
            id: 'acc-6',
            name: "9H Edge-to-Edge Diamond Screen Guard",
            category: "Protection",
            description: "Ultra-clear oleophobic tempered glass with self-aligning installation frame and anti-fingerprint.",
            price: 699,
            mrp: 1199,
            rating: 4.9,
            reviewsCount: 176,
            icon: Shield,
            image: "https://images.unsplash.com/photo-1580910051074-3eb694886505?w=600&auto=format&fit=crop&q=80",
            tag: "Showroom Favorite"
        },
    ];

    const handleAddToCart = (item) => {
        cartDispatch({
            type: "ADD_ITEM",
            id: item.id,
            name: item.name,
            price: item.price,
            image: item.image,
            mrp: item.mrp,
            quantity: 1,
        });

        setAddedIds((prev) => ({ ...prev, [item.id]: true }));
        setTimeout(() => {
            setAddedIds((prev) => ({ ...prev, [item.id]: false }));
        }, 1800);

        if (showNotification) {
            showNotification(`${item.name} added to cart!`, 'success');
        }
    };

    return (
        <section className="accessories-section" id="mobile-accessories">
            <div className="section-header-block">
                <div className="section-title-wrap">
                    <span className="section-eyebrow">
                        <Sparkles size={14} className="sparkle-icon" />
                        PREMIUM SMART GEAR
                    </span>
                    <h2 className="section-title">
                        Mobile Accessories & Smart Audio
                    </h2>
                    <p className="section-desc">
                        Original chargers, MagSafe protection, smart audio, and wireless gear engineered for your smartphone.
                    </p>
                </div>

                <button 
                    type="button" 
                    className="view-all-cta-btn"
                    onClick={() => navigate('/mobile products')}
                >
                    All Accessories →
                </button>
            </div>

            <div className="accessories-cards-grid">
                {accessories.map((item) => {
                    const isAdded = addedIds[item.id];
                    const IconComponent = item.icon;

                    return (
                        <div key={item.id} className="accessory-modern-card">
                            <div className="accessory-image-box">
                                <span className="accessory-tag-badge">{item.tag}</span>
                                <img src={item.image} alt={item.name} loading="lazy" />
                            </div>

                            <div className="accessory-info-box">
                                <div className="accessory-category-row">
                                    <span className="cat-label">
                                        <IconComponent size={12} /> {item.category}
                                    </span>
                                    <div className="rating-pill">
                                        <Star size={12} className="star-fill" />
                                        <span>{item.rating}</span>
                                        <small>({item.reviewsCount})</small>
                                    </div>
                                </div>

                                <h3 className="accessory-name">{item.name}</h3>
                                <p className="accessory-desc">{item.description}</p>

                                <div className="accessory-price-row">
                                    <div className="price-wrap">
                                        <span className="price-val">Rs. {item.price.toLocaleString('en-IN')}</span>
                                        <span className="mrp-val">Rs. {item.mrp.toLocaleString('en-IN')}</span>
                                    </div>

                                    <button
                                        type="button"
                                        className={`btn-acc-cart ${isAdded ? 'added' : ''}`}
                                        onClick={() => handleAddToCart(item)}
                                        aria-label={`Add ${item.name} to cart`}
                                    >
                                        {isAdded ? (
                                            <>
                                                <Check size={14} /> Added
                                            </>
                                        ) : (
                                            <>
                                                <ShoppingCart size={14} /> Add
                                            </>
                                        )}
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
