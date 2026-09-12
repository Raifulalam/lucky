import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { FaWhatsapp } from "react-icons/fa";
import { Phone, ShoppingCart, Store } from "lucide-react";
import { useCartState } from "./CreateReducer";
import "./MobileActionBar.css";

const EMPTY_CART = [];

const MobileActionBar = () => {

    const cart = useCartState() || EMPTY_CART;
    const cartQty = useMemo(
        () => cart.reduce((total, item) => total + (item.quantity || 1), 0),
        [cart]
    );

    return (
        <aside className="mobile-action-bar" aria-label="Mobile quick actions">
            <div className="mobile-action-bar-inner">
                {/* 1. Call Store */}
                <a href="tel:051531789" className="bar-action-item" aria-label="Call Store">
                    <div className="bar-icon-wrap">
                        <Phone size={19} />
                    </div>
                    <span className="bar-label">Call</span>
                </a>

                {/* 2. WhatsApp Direct */}
                <a
                    href="https://wa.me/9779809278236?text=Hello%20Lucky%20Impex,%20I%20have%20an%20inquiry%20regarding%20electronics%20and%20appliances."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bar-action-item bar-whatsapp"
                    aria-label="WhatsApp Support"
                >
                    <div className="bar-icon-wrap">
                        <FaWhatsapp size={20} />
                    </div>
                    <span className="bar-label">WhatsApp</span>
                </a>

                {/* 3. Cart with Badge */}
                <Link to="/cart" className="bar-action-item bar-cart" aria-label="View Shopping Cart">
                    <div className="bar-icon-wrap">
                        <ShoppingCart size={19} />
                        {cartQty > 0 && <span className="bar-cart-badge">{cartQty}</span>}
                    </div>
                    <span className="bar-label">Cart</span>
                </Link>

                {/* 4. Showroom Hub */}
                <Link to="/store" className="bar-action-item" aria-label="Birgunj Showroom Hub">
                    <div className="bar-icon-wrap">
                        <Store size={19} />
                    </div>
                    <span className="bar-label">Showroom</span>
                </Link>
            </div>
        </aside>
    );
};

export default MobileActionBar;
