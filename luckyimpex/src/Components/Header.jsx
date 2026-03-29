import React, { useContext, useMemo, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { ChevronDown, Headphones, LayoutDashboard, Menu, Phone, ShoppingCart, Store, User, X } from "lucide-react";
import { UserContext } from "./UserContext";
import luckyLogo from "../Images/lucky-logo.png";
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
        { label: "Products", to: "/products" },
        { label: "Phones", to: "/phones" },
    ],
    user: [
        { label: "Products", to: "/products" },
        { label: "Phones", to: "/phones" },
        { label: "Service", to: "/service" },
        { label: "Profile", to: "/profile" },
    ],
    admin: [
        { label: "Products", to: "/products" },
        { label: "Phones", to: "/phones" },
        { label: "Dashboard", to: "/dashboard" },
        { label: "Profile", to: "/profile" },
    ],
};

const quickLinks = [
    { label: "About", to: "/about" },
    { label: "Stores", to: "/store" },
    { label: "EMI", to: "/emi" },
    { label: "Exchange", to: "/exchange" },
    { label: "Contact", to: "/contact" },
];

const formatCategory = (value) => value.replace(/([A-Z])/g, " $1").trim();

const Header = () => {
    const { user } = useContext(UserContext);
    const navigate = useNavigate();

    const [menuOpen, setMenuOpen] = useState(false);
    const [catOpen, setCatOpen] = useState(false);

    const isAdmin = user?.role === "admin";
    const isUser = user && !isAdmin;

    const roleMenu = useMemo(
        () => (isAdmin ? MENU.admin : isUser ? MENU.user : MENU.guest),
        [isAdmin, isUser]
    );

    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const cartQty = cart.length;

    const logout = () => {
        localStorage.removeItem("authToken");
        navigate("/");
        window.location.reload();
    };

    const closeMobileMenu = () => setMenuOpen(false);

    return (
        <div className="header-shell">
            <Helmet>
                <title>Lucky Impex – Home Appliances Store</title>
                <meta
                    name="description"
                    content="Buy AC, TV, Refrigerator and home appliances from Lucky Impex."
                />
            </Helmet>

            <div className="header-topbar">
                <div className="header-topbar-inner">
                    <div className="topbar-left">
                        <span><Phone size={14} /> 051531789</span>
                        <span><Headphones size={14} /> Customer guidance for appliances and electronics</span>
                    </div>
                    <div className="topbar-right">
                        {quickLinks.map((item) => (
                            <Link key={item.to} to={item.to}>
                                {item.label}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            <header className="header">
                <div className="header-inner">
                    <div className="header-left">
                        <Link to="/" className="logo" onClick={closeMobileMenu}>
                            <img src={luckyLogo} alt="Lucky Impex" />
                            <div className="logo-copy">
                                <strong>Lucky Impex</strong>
                                <span>Electronics & Appliances</span>
                            </div>
                        </Link>
                    </div>

                    <nav className="header-nav" aria-label="Primary navigation">
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
                                Categories <ChevronDown size={16} />
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

                        {roleMenu.map((item) => (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
                            >
                                {item.label}
                            </NavLink>
                        ))}
                    </nav>

                    <div className="header-actions">
                        {!isAdmin && (
                            <Link to="/cart" className="cart-link" aria-label="View cart">
                                <ShoppingCart size={20} />
                                <span>Cart</span>
                                <span className="cart-badge">{cartQty}</span>
                            </Link>
                        )}

                        {user ? (
                            <div className="user-menu">
                                <button type="button" className="user-trigger">
                                    {isAdmin ? <LayoutDashboard size={18} /> : <User size={18} />}
                                    <span>{isAdmin ? "Admin" : "Account"}</span>
                                    <ChevronDown size={16} />
                                </button>
                                <div className="user-dropdown">
                                    {isUser && <Link to="/profile">Profile</Link>}
                                    {isAdmin && <Link to="/dashboard">Dashboard</Link>}
                                    <button type="button" onClick={logout}>Logout</button>
                                </div>
                            </div>
                        ) : (
                            <Link to="/login" className="login-btn">
                                Login
                            </Link>
                        )}

                        <button
                            type="button"
                            className="hamburger"
                            onClick={() => setMenuOpen((prev) => !prev)}
                            aria-label={menuOpen ? "Close menu" : "Open menu"}
                        >
                            {menuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </header>

            <div className={`mobile-menu-backdrop ${menuOpen ? "open" : ""}`} onClick={closeMobileMenu} />
            <aside className={`mobile-menu ${menuOpen ? "open" : ""}`} aria-label="Mobile navigation">
                <div className="mobile-menu-header">
                    <div>
                        <strong>Lucky Impex</strong>
                        <span>Browse products, support, and store pages</span>
                    </div>
                    <button type="button" onClick={closeMobileMenu} aria-label="Close menu">
                        <X size={22} />
                    </button>
                </div>

                <div className="mobile-menu-section">
                    <span className="mobile-menu-label">Shop</span>
                    {roleMenu.map((item) => (
                        <Link key={item.to} to={item.to} onClick={closeMobileMenu}>
                            {item.label}
                        </Link>
                    ))}
                    {!isAdmin && (
                        <Link to="/cart" onClick={closeMobileMenu}>
                            Cart
                        </Link>
                    )}
                </div>

                <div className="mobile-menu-section">
                    <span className="mobile-menu-label">Explore</span>
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
                    {user ? (
                        <button type="button" className="mobile-auth-btn" onClick={logout}>
                            Logout
                        </button>
                    ) : (
                        <Link to="/login" className="mobile-auth-btn" onClick={closeMobileMenu}>
                            Login
                        </Link>
                    )}
                    <Link to="/store" className="mobile-store-link" onClick={closeMobileMenu}>
                        <Store size={16} /> Visit Stores Page
                    </Link>
                </div>
            </aside>
        </div>
    );
};

export default Header;
