import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Percent, Zap, Truck } from "lucide-react";
import "./PromotionalBanner.css";

const PromotionalBanner = ({ banner }) => {
    return (
        <article className="promo-banner-card">
            <div className="promo-banner-inner">
                {/* Banner Image Side */}
                <div className="promo-image-side">
                    <img
                        src={banner.image}
                        alt={banner.title}
                        className="promo-banner-img"
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "/lucky-logo.png";
                        }}
                    />
                    {banner.badge && (
                        <span className="promo-badge">{banner.badge}</span>
                    )}
                </div>

                {/* Banner Content Side */}
                <div className="promo-content-side">
                    <div className="promo-header">
                        {banner.category && (
                            <span className="promo-category">{banner.category}</span>
                        )}
                        <h3 className="promo-title">{banner.title}</h3>
                        <p className="promo-description">{banner.description}</p>
                    </div>

                    {/* Offer Highlights */}
                    {banner.offers && banner.offers.length > 0 && (
                        <div className="promo-offers-list">
                            {banner.offers.map((offer, idx) => (
                                <div key={idx} className="promo-offer-item">
                                    <span className="offer-icon">
                                        {offer.icon === "percent" && <Percent size={14} />}
                                        {offer.icon === "zap" && <Zap size={14} />}
                                        {offer.icon === "truck" && <Truck size={14} />}
                                    </span>
                                    <span className="offer-text">{offer.text}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* CTA Button */}
                    <div className="promo-cta">
                        {banner.ctaLink ? (
                            <Link to={banner.ctaLink} className="promo-btn">
                                <span>{banner.ctaText || "Shop Now"}</span>
                                <ArrowRight size={16} />
                            </Link>
                        ) : (
                            <button
                                type="button"
                                className="promo-btn"
                                onClick={banner.onClick}
                            >
                                <span>{banner.ctaText || "Shop Now"}</span>
                                <ArrowRight size={16} />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </article>
    );
};

export default PromotionalBanner;
