import React, { useEffect } from "react";
import "./PromoModal.css";

const PromoModal = ({ open, onClose }) => {
    useEffect(() => {
        if (open) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "auto";
        }

        return () => {
            document.body.style.overflow = "auto";
        };
    }, [open]);

    if (!open) return null;

    return (
        <div className="promo-overlay" onClick={onClose}>
            <div className="promo-modal" onClick={(e) => e.stopPropagation()}>
                <button className="close-btn" onClick={onClose}>✕</button>

                <h2>🔥 Special Offer</h2>
                <p>Upgrade today and get exclusive seasonal discounts + EMI options.</p>

                <button className="cta-btn" onClick={() => window.location.href = "/products"}>
                    Shop Now
                </button>
            </div>
        </div>
    );
};

export default PromoModal;