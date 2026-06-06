import React, { useEffect, useRef } from "react";
import { X, ShoppingCart, Truck, ShieldCheck, BadgePercent, PackageCheck } from "lucide-react";
import "./ProductQuickViewModal.css";

const formatCurrency = (value) => `Rs ${Number(value || 0).toFixed(0)}`;

const ProductQuickViewModal = ({ isOpen, product, onClose, onAddToCart }) => {
    const modalRef = useRef(null);

    // Escape key listener to close modal
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "Escape") onClose();
        };
        if (isOpen) {
            window.addEventListener("keydown", handleKeyDown);
            document.body.style.overflow = "hidden"; // Prevent background scrolling
        }
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            document.body.style.overflow = "";
        };
    }, [isOpen, onClose]);

    // Close modal when clicking outside content box
    const handleOverlayClick = (e) => {
        if (modalRef.current && !modalRef.current.contains(e.target)) {
            onClose();
        }
    };

    if (!isOpen || !product) return null;

    const imageUrl = product.image ? `${product.image}` : "/lucky-logo.png";
    const isOutOfStock = Number(product.stock) <= 0;
    
    // Calculate savings
    const mrp = Number(product.mrp);
    const price = Number(product.price);
    const savings = mrp > price ? {
        amount: mrp - price,
        percentage: Math.round(((mrp - price) / mrp) * 100)
    } : null;

    return (
        <div className="quick-view-overlay" onClick={handleOverlayClick} role="dialog" aria-modal="true" aria-labelledby="quick-view-title">
            <div className="quick-view-modal" ref={modalRef}>
                <button className="quick-view-close" onClick={onClose} aria-label="Close modal">
                    <X size={20} />
                </button>

                <div className="quick-view-grid">
                    {/* Left: Product Image Section */}
                    <div className="quick-view-image-section">
                        <div className="quick-view-image-frame">
                            <img src={imageUrl} alt={product.name || "Product image"} className="quick-view-image" onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = "/lucky-logo.png";
                            }} />
                            {savings && (
                                <span className="quick-view-savings-tag">
                                    Save {formatCurrency(savings.amount)}
                                </span>
                            )}
                        </div>
                        <div className="quick-view-badge-row">
                            <div className="qv-badge-item"><Truck size={14} /> Local delivery</div>
                            <div className="qv-badge-item"><ShieldCheck size={14} /> Store backed</div>
                            <div className="qv-badge-item"><PackageCheck size={14} /> Stock ready</div>
                        </div>
                    </div>

                    {/* Right: Product Details Section */}
                    <div className="quick-view-info-section">
                        <div className="quick-view-meta">
                            <span className="quick-view-brand">{product.brand || "Lucky Impex"}</span>
                            <span className="quick-view-category">{product.category || "General"}</span>
                        </div>
                        
                        <h2 id="quick-view-title" className="quick-view-title">{product.name}</h2>
                        
                        <div className="quick-view-status">
                            <span className={`stock-status-dot ${isOutOfStock ? "out" : "in"}`} />
                            <span className="stock-status-text">
                                {isOutOfStock ? "Out of Stock" : `In stock${product.stock ? ` (${product.stock})` : ""}`}
                            </span>
                        </div>

                        <div className="quick-view-pricing">
                            <div className="quick-view-price">{formatCurrency(product.price)}</div>
                            <div className="quick-view-mrp">MRP {formatCurrency(product.mrp)}</div>
                            {savings && (
                                <span className="quick-view-discount">
                                    <BadgePercent size={14} /> {savings.percentage}% Off
                                </span>
                            )}
                        </div>

                        <div className="quick-view-specs">
                            <h3>Product Specifications</h3>
                            <div className="quick-view-spec-grid">
                                <div className="quick-view-spec-card">
                                    <span>Model</span>
                                    <strong>{product.model || "N/A"}</strong>
                                </div>
                                <div className="quick-view-spec-card">
                                    <span>Capacity / Size</span>
                                    <strong>{product.capacity || "N/A"}</strong>
                                </div>
                            </div>
                        </div>

                        <div className="quick-view-desc">
                            <h3>Description Overview</h3>
                            <p>{product.description || "Product overview available from Lucky Impex."}</p>
                        </div>

                        <div className="quick-view-actions">
                            <button className="quick-view-add-btn" onClick={() => { onAddToCart(product); onClose(); }} disabled={isOutOfStock}>
                                <ShoppingCart size={18} />
                                {isOutOfStock ? "Unavailable" : "Add to Cart"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductQuickViewModal;
