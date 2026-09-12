import React, { useContext, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
    Bell,
    ChevronDown,
    Heart,
    LayoutDashboard,
    MapPin,
    Menu,
    Phone,
    Search,
    ShoppingCart,
    Store,
    User,
    X,
    Building2,
    ShoppingBag
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
    guest: [{ label: "Products", to: "/products" }],
    user: [
        { label: "Products", to: "/products" },
        { label: "Service", to: "/service" },
        { label: "Profile", to: "/profile" },
    ],
    admin: [
        { label: "Products", to: "/products" },
        { label: "Dashboard", to: "/admin" },
        { label: "Profile", to: "/profile" },
    ],
};

const quickLinks = [
    { label: "Stores", to: "/store" },
    { label: "EMI", to: "/emi" },
    { label: "Exchange", to: "/exchange" },
    { label: "Contact", to: "/contact" },
];

const EMPTY_CART = [];

const formatCategory = (value) => value.replace(/([A-Z])/g, " $1").trim();

const Header = () => {
    const { user, logout } = useContext(UserContext);
    const { unreadNotificationCount, panelOpen, setPanelOpen } = useNotification();
    const { isWholesale, toggleMode } = useWholesale();
    const navigate = useNavigate();
    const location = useLocation();

    const [menuOpen, setMenuOpen] = useState(false);
    const [catOpen, setCatOpen] = useState(false);
    const [cartOpen, setCartOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [wishlistCount] = useState(2); // Initial wishlist demo indicator

    const isAdmin = user?.role === "admin";
    const isUser = user && !isAdmin;

    const roleMenu = useMemo(
        () => (isAdmin ? MENU.admin : isUser ? MENU.user : MENU.guest),
        [isAdmin, isUser]
    );

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

    const toggleNotifications = () => {
        setPanelOpen((prev) => !prev);
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
                            <strong>Birgunj Showroom</strong>
                            <span className="status-dot"></span>
                            <span className="status-text">Open 10am - 8pm</span>
                        </span>
                        <span className="divider-slash">/</span>
                        <a href="tel:051531789" className="mini-contact-link">
                            <Phone size={13} /> 051-531789
                        </a>
                        <span className="divider-slash">/</span>
                        <a
                            href="https://wa.me/9779809278236?text=Hello%20Lucky%20Impex,%20I%20have%20an%20inquiry."
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mini-whatsapp-link"
                        >
                            <span className="wa-icon-bullet">💬</span> WhatsApp Support
                        </a>
                    </div>

                    <div className="mini-bar-right">
                        <span className="dealer-badge">
                            Authorized Dealer & Wholesaler in Nepal
                        </span>


                    </div>
                </div>
            </div>

            {/* MAIN STICKY HEADER */}
            <header className="header">
                <div className="header-inner">
                    {/* Brand Logo */}
                    <div className="header-left">
                        <Link to="/" className="logo" onClick={closeMobileMenu}>
                            <img src={luckyLogo} alt="luckyimpex logo" />
                            <div className="logo-copy">
                                <div className="logo-title-row">
                                    <strong className="brand-name">Lucky Impex</strong>

                                </div>
                                <span className="tagline">Dream comes true </span>
                            </div>
                        </Link>
                    </div>

                    {/* DYNAMIC HEADER MODE SWITCHER (RETAIL / WHOLESALE PILL) */}
                    <div className="mode-switcher-container">
                        <div
                            className={`mode-pill-toggle ${isWholesale ? "is-wholesale" : "is-retail"}`}
                            onClick={toggleMode}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && toggleMode()}
                            aria-label={`Current mode is ${isWholesale ? "Wholesale" : "Retail"}. Click to toggle.`}
                        >
                            <div className="mode-pill-thumb" />
                            <div className={`mode-option retail-option ${!isWholesale ? "active" : ""}`}>
                                <ShoppingBag size={14} />
                                <span>Retail</span>
                            </div>
                            <div className={`mode-option wholesale-option ${isWholesale ? "active" : ""}`}>
                                <Building2 size={14} />
                                <span>Wholesale</span>
                            </div>
                        </div>
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
                        {/* Quick category menu */}
                        <div
                            className={`category-box ${catOpen ? "open" : ""}`}
                            onMouseEnter={() => setCatOpen(true)}
                            onMouseLeave={() => setCatOpen(false)}
                        >
                            <button
                                type="button"
                                className="category-btn"
                                onClick={() => setCatOpen((prev) => !prev)}
                                aria-expanded={catOpen}
                            >
                                <span>Categories</span>
                                <ChevronDown size={15} />
                            </button>

                            <div className="category-dropdown">
                                {categories.map((cat) => (
                                    <button
                                        key={cat}
                                        type="button"
                                        className="category-item"
                                        onClick={() => {
                                            setCatOpen(false);
                                            navigate(`/products/${cat}`);
                                        }}
                                    >
                                        {formatCategory(cat)}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Wishlist Icon with count */}
                        <Link to="/products" className="action-icon-btn" title="Wishlist" aria-label="Wishlist">
                            <Heart size={20} />
                            {wishlistCount > 0 && (
                                <span className="icon-badge badge-wishlist">{wishlistCount}</span>
                            )}
                        </Link>

                        {/* Notification Bell */}
                        <button
                            type="button"
                            className={`action-icon-btn ${panelOpen ? "active" : ""}`}
                            onClick={toggleNotifications}
                            aria-label="Notifications"
                        >
                            <Bell size={20} />
                            {unreadNotificationCount > 0 && (
                                <span className="icon-badge badge-notification">
                                    {unreadNotificationCount > 99 ? "99+" : unreadNotificationCount}
                                </span>
                            )}
                        </button>

                        {/* Cart Button */}
                        {!isAdmin && (
                            <Link
                                to="/cart"
                                className="action-cart-btn"
                                aria-label="View cart"
                                onClick={handleCartClick}
                            >
                                <ShoppingCart size={20} />
                                <span className="cart-text">Cart</span>
                                <span className="cart-badge">{cartQty}</span>
                            </Link>
                        )}

                        {/* User Account / Login */}
                        {user ? (
                            <div className="user-menu">
                                <button type="button" className="user-trigger">
                                    {isAdmin ? <LayoutDashboard size={18} /> : <User size={18} />}
                                    <span className="user-label">{isAdmin ? "Admin" : "Account"}</span>
                                    <ChevronDown size={14} />
                                </button>
                                <div className="user-dropdown">
                                    {isUser && <Link to="/profile">My Profile & Orders</Link>}
                                    {isAdmin && <Link to="/admin">Admin Dashboard</Link>}
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
                    <div className="mobile-brand-info">
                        <strong>luckyimpex4u</strong>
                        <span>Authorized Birgunj Dealer & Wholesaler</span>
                    </div>
                    <button
                        type="button"
                        onClick={closeMobileMenu}
                        aria-label="Close menu"
                        className="mobile-close-btn"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Mobile Mode Switcher */}
                <div className="mobile-mode-box">
                    <div className="mobile-mode-label">Pricing & Catalog Mode:</div>
                    <div
                        className={`mode-pill-toggle ${isWholesale ? "is-wholesale" : "is-retail"}`}
                        onClick={toggleMode}
                    >
                        <div className="mode-pill-thumb" />
                        <div className={`mode-option retail-option ${!isWholesale ? "active" : ""}`}>
                            <ShoppingBag size={14} />
                            <span>Retail Mode</span>
                        </div>
                        <div className={`mode-option wholesale-option ${isWholesale ? "active" : ""}`}>
                            <Building2 size={14} />
                            <span>Wholesale B2B</span>
                        </div>
                    </div>
                    <span className="mode-caption">
                        {isWholesale
                            ? "Displaying tiered bulk prices & dealer discounts"
                            : "Displaying individual consumer prices & EMI deals"}
                    </span>
                </div>

                {/* Mobile Search */}
                <form className="mobile-search-form" onSubmit={(e) => { handleSearchSubmit(e); closeMobileMenu(); }}>
                    <input
                        type="text"
                        placeholder="Search products, brands, models..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <button type="submit"><Search size={16} /></button>
                </form>

                {/* Mobile Menu Sections */}
                <div className="mobile-menu-section">
                    <span className="mobile-menu-label">Main Navigation</span>
                    <Link to="/" onClick={closeMobileMenu}>Home</Link>
                    <Link to="/products" onClick={closeMobileMenu}>All Products</Link>
                    {roleMenu.map((item) => (
                        <Link key={item.to} to={item.to} onClick={closeMobileMenu}>
                            {item.label}
                        </Link>
                    ))}
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

                <div className="mobile-menu-section">
                    <span className="mobile-menu-label">Store Services</span>
                    {quickLinks.map((item) => (
                        <Link key={item.to} to={item.to} onClick={closeMobileMenu}>
                            {item.label}
                        </Link>
                    ))}
                </div>

                <div className="mobile-menu-section">
                    <span className="mobile-menu-label">Categories</span>
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            type="button"
                            className="mobile-category-link"
                            onClick={() => {
                                closeMobileMenu();
                                navigate(`/products/${cat}`);
                            }}
                        >
                            {formatCategory(cat)}
                        </button>
                    ))}
                </div>

                <div className="mobile-menu-footer">
                    <div className="mobile-store-contact">
                        <MapPin size={16} className="text-amber" />
                        <span>Link Road Ghantaghar, Birgunj</span>
                    </div>
                    <div className="mobile-store-contact">
                        <Phone size={16} />
                        <span>+977 051-531789 / 9807286786</span>
                    </div>

                    {user ? (
                        <button type="button" className="mobile-auth-btn" onClick={handleLogout}>
                            Sign Out
                        </button>
                    ) : (
                        <Link to="/login" className="mobile-auth-btn" onClick={closeMobileMenu}>
                            Sign In / Register
                        </Link>
                    )}
                    <Link to="/store" className="mobile-store-link" onClick={closeMobileMenu}>
                        <Store size={16} /> Birgunj Showroom Hub
                    </Link>
                </div>
            </aside>

            {/* Cart Drawer */}
            <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
        </div>
    );
};

export default Header;
