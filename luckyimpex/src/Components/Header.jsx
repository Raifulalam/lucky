import React, { useContext, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
    Bell,
    ChevronDown,
    CreditCard,
    Grid,
    Heart,
    LayoutDashboard,
    MapPin,
    Menu,
    Phone,
    RefreshCw,
    Search,
    ShoppingBag,
    ShoppingCart,
    Smartphone,
    Star,
    Store,
    User,
    Wrench,
    X,
    Building2,
} from "lucide-react";
import { UserContext } from "./UserContext";
import { useNotification } from "./NotificationContext";
import { useCartState } from "./CreateReducer";
import { useWholesale } from "./WholesaleContext";
import luckyLogo from "../Images/lucky-logo.png";
import CartDrawer from "./CartDrawer";
import "./Header.css";

const categories = [
    "AirConditioners",
    "Refrigerators",
    "WashingMachines",
    "LEDTelevisions",
    "KitchenAppliances",
    "HomeAppliances",
    "AirCooler",
    "ChestFreezer",
];

const MENU = {
    guest: [
        { label: "Mobiles", to: "/mobiles" },
        { label: "All Products", to: "/products" },
        { label: "0% EMI", to: "/emi" },
        { label: "Exchange Offer", to: "/exchange" },
        { label: "Showroom Hub", to: "/store" },
        { label: "Service & Warranty", to: "/service" },
        { label: "Customer Reviews", to: "/review" },
        { label: "Contact Us", to: "/contact" },
    ],
    user: [
        { label: "Mobiles", to: "/mobiles" },
        { label: "All Products", to: "/products" },
        { label: "0% EMI", to: "/emi" },
        { label: "Exchange", to: "/exchange" },
        { label: "Service", to: "/service" },
        { label: "Profile", to: "/profile" },
    ],
    admin: [
        { label: "Mobiles", to: "/mobiles" },
        { label: "All Products", to: "/products" },
        { label: "Dashboard", to: "/admin" },
        { label: "Profile", to: "/profile" },
    ],
};

const quickLinks = [
    { label: "Mobile Phones", to: "/mobiles" },
    { label: "Showroom Hub", to: "/store" },
    { label: "0% EMI Plans", to: "/emi" },
    { label: "Exchange Offer", to: "/exchange" },
    { label: "Service & Warranty", to: "/service" },
    { label: "Customer Reviews", to: "/review" },
    { label: "Contact Us", to: "/contact" },
];

const EMPTY_CART = [];

const formatCategory = (value) => value.replace(/([A-Z])/g, " $1").trim();

const Header = () => {
    const { user, logout } = useContext(UserContext);
    const { isWholesale, toggleMode } = useWholesale();
    const navigate = useNavigate();
    const location = useLocation();

    const [menuOpen, setMenuOpen] = useState(false);
    const [cartOpen, setCartOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const isAdmin = user?.role === "admin";
    const isUser = user && !isAdmin;

    const cart = useCartState() || EMPTY_CART;
    const cartQty = useMemo(() => cart.reduce((total, item) => total + (item.quantity || 1), 0), [cart]);
    const closeMobileMenu = () => setMenuOpen(false);

    const handleLogout = () => {
        logout();
        navigate("/");
    };

    const handleCartClick = (e) => {
        if (location.pathname !== "/cart") {
            e.preventDefault();
            setCartOpen(true);
        }
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    return (
        <div className="header-shell">
            {/* TOP UTILITY MINI BAR */}
            <div className="header-top-mini-bar">
                <div className="mini-bar-inner">
                    <div className="mini-bar-left">
                        <span className="location-badge">
                            <MapPin size={13} className="mini-icon text-amber" />
                            <strong>Birgunj, Nepal</strong>
                        </span>
                        <span className="divider-slash">|</span>
                        <a href="tel:051531789" className="mini-contact-link">
                            <Phone size={13} /> 051-531789
                        </a>
                    </div>

                    <div className="mini-bar-right">
                        <a
                            href="https://wa.me/9779802594022?text=Hello%20Lucky%20Impex,%20I%20have%20an%20inquiry."
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mini-whatsapp-link"
                        >
                            <span className="wa-icon-bullet">💬</span> WhatsApp
                        </a>
                    </div>
                </div>
            </div>

            {/* MAIN STICKY HEADER */}
            <header className="header">
                <div className="header-inner">
                    {/* Brand Logo */}
                    <div className="header-left">
                        <Link to="/" className="logo" onClick={closeMobileMenu}>
                            <img src={luckyLogo} alt="Lucky Impex" />
                            <div className="logo-copy">
                                <strong className="brand-name">Lucky Impex</strong>
                            </div>
                        </Link>
                    </div>

                    {/* SEARCH BAR */}
                    <form className="header-search-form" onSubmit={handleSearchSubmit}>
                        <div className="search-input-wrapper">
                            <Search size={17} className="search-icon" />
                            <input
                                type="text"
                                placeholder={isWholesale ? "Search bulk lots, appliances, dealer models..." : "Search ACs, TVs, Refrigerators, Washers..."}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="search-input"
                                aria-label="Search electronics and appliances"
                            />
                            {searchQuery && (
                                <button
                                    type="button"
                                    className="clear-search-btn"
                                    onClick={() => setSearchQuery("")}
                                    aria-label="Clear search"
                                >
                                    <X size={14} />
                                </button>
                            )}
                            <button type="submit" className="search-submit-btn" aria-label="Submit search">
                                <Search size={15} />
                            </button>
                        </div>
                    </form>

                    {/* NAVIGATION LINKS & ACTIONS */}
                    <div className="header-actions">
                        <Link to="/products" className="nav-link">Products</Link>
                        <Link to="/mobiles" className="nav-link">Mobiles</Link>
                        <Link to="/emi" className="nav-link">EMI</Link>
                        <Link to="/store" className="nav-link">Store</Link>

                        {/* Search */}
                        <form className="header-search-form" onSubmit={handleSearchSubmit}>
                            <div className="search-input-wrapper">
                                <Search size={16} className="search-icon" />
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="search-input"
                                />
                            </div>
                        </form>

                        {/* Cart Button */}
                        {!isAdmin && (
                            <Link
                                to="/cart"
                                className="action-cart-btn"
                                aria-label="View cart"
                                onClick={handleCartClick}
                            >
                                <ShoppingCart size={20} />
                                <span className="cart-badge">{cartQty}</span>
                            </Link>
                        )}

                        {/* User Account / Login */}
                        {user ? (
                            <div className="user-menu">
                                <button type="button" className="user-trigger">
                                    {isAdmin ? <LayoutDashboard size={18} /> : <User size={18} />}
                                    <ChevronDown size={14} />
                                </button>
                                <div className="user-dropdown">
                                    {isUser && <Link to="/profile">Profile</Link>}
                                    {isAdmin && <Link to="/admin">Dashboard</Link>}
                                    <button type="button" onClick={handleLogout}>
                                        Logout
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <Link to="/login" className="login-btn">
                                Sign In
                            </Link>
                        )}

                        {/* Mobile Hamburger Toggle */}
                        <button
                            type="button"
                            className="hamburger-btn"
                            onClick={() => setMenuOpen((prev) => !prev)}
                            aria-label={menuOpen ? "Close menu" : "Open menu"}
                        >
                            {menuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </header>

            {/* MOBILE NAVIGATION DRAWER */}
            <div
                className={`mobile-menu-backdrop ${menuOpen ? "open" : ""}`}
                onClick={closeMobileMenu}
            />
            <aside className={`mobile-menu ${menuOpen ? "open" : ""}`} aria-label="Mobile navigation">
                <div className="mobile-menu-header">
                    <strong>Lucky Impex</strong>
                    <button
                        type="button"
                        onClick={closeMobileMenu}
                        aria-label="Close menu"
                        className="mobile-close-btn"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Mobile Search */}
                <form className="mobile-search-form" onSubmit={(e) => { handleSearchSubmit(e); closeMobileMenu(); }}>
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <button type="submit"><Search size={16} /></button>
                </form>

                {/* Mobile Navigation Links */}
                <div className="mobile-nav-links">
                    <Link to="/" onClick={closeMobileMenu}>Home</Link>
                    <Link to="/products" onClick={closeMobileMenu}>Products</Link>
                    <Link to="/mobiles" onClick={closeMobileMenu}>Mobiles</Link>
                    <Link to="/emi" onClick={closeMobileMenu}>EMI</Link>
                    <Link to="/store" onClick={closeMobileMenu}>Store</Link>
                    {!isAdmin && (
                        <Link
                            to="/cart"
                            onClick={(e) => {
                                closeMobileMenu();
                                handleCartClick(e);
                            }}
                        >
                            Cart ({cartQty})
                        </Link>
                    )}
                </div>

                <div className="mobile-menu-footer">
                    {user ? (
                        <button type="button" className="mobile-auth-btn" onClick={handleLogout}>
                            Sign Out
                        </button>
                    ) : (
                        <Link to="/login" className="mobile-auth-btn" onClick={closeMobileMenu}>
                            Sign In
                        </Link>
                    )}
                </div>
            </aside>

            {/* Cart Drawer */}
            <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
        </div>
    );
};

export default Header;
