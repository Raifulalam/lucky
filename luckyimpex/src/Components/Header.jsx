import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { UserContext } from "./UserContext";
import luckyLogo from "../Images/lucky-logo.png";
import "./Header.css";

/* =======================
   CATEGORY LIST
======================= */
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

/* =======================
   ROLE BASED MENUS
======================= */
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

const Header = () => {
    const { user } = useContext(UserContext);
    const navigate = useNavigate();

    const [menuOpen, setMenuOpen] = useState(false);
    const [catOpen, setCatOpen] = useState(false);
    const [showSubHeader, setShowSubHeader] = useState(false);

    /* =======================
       ROLE CHECKS
    ======================= */
    const isAdmin = user?.role === "admin";
    const isUser = user && !isAdmin;
    const isGuest = !user;

    const roleMenu = isAdmin
        ? MENU.admin
        : isUser
            ? MENU.user
            : MENU.guest;

    /* =======================
       CART SAFE HANDLING
    ======================= */
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const cartQty = cart.length;

    /* =======================
       LOGOUT
    ======================= */
    const logout = () => {
        localStorage.removeItem("authToken");
        navigate("/");
        window.location.reload();
    };

    return (
        <div
            className="header-wrapper"
            onMouseEnter={() => setShowSubHeader(true)}
            onMouseLeave={() => setShowSubHeader(false)}
        >
            <Helmet>
                <title>Lucky Impex – Home Appliances Store</title>
                <meta
                    name="description"
                    content="Buy AC, TV, Refrigerator & Home Appliances in Nepal"
                />
            </Helmet>

            {/* =======================
         MAIN HEADER
      ======================= */}
            <header className="header">
                {/* LEFT */}
                <div className="header-left">
                    <Link to="/" className="logo">
                        <img src={luckyLogo} alt="Lucky Impex" />
                        <span>Lucky Impex</span>
                    </Link>
                </div>

                {/* RIGHT */}
                <div className="header-right">
                    {/* CENTER */}
                    <div className="header-center">
                        {/* CATEGORIES */}
                        <div
                            className="category-box"
                            onMouseEnter={() => setCatOpen(true)}
                            onMouseLeave={() => setCatOpen(false)}
                        >
                            <button className="category-btn">Categories ▾</button>

                            {catOpen && (
                                <div className="category-dropdown">
                                    {categories.map((cat) => (
                                        <div
                                            key={cat}
                                            className="category-item"
                                            onClick={() => navigate(`/products/${cat}`)}
                                        >
                                            {cat.replace(/([A-Z])/g, " $1")}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ROLE BASED DESKTOP MENU */}
                    {roleMenu.map((item) => (
                        <Link key={item.to} to={item.to}>
                            {item.label}
                        </Link>
                    ))}

                    {/* CART (ALL USERS) */}
                    {!isAdmin && (
                        <Link to="/cart" className="cart">
                            🛒 <span className="cart-badge">{cartQty}</span>
                        </Link>
                    )}

                    {/* USER DROPDOWN */}
                    {user ? (
                        <div className="user-menu">
                            <span>{user?.name?.split(" ")[0]}</span>
                            <div className="user-dropdown">
                                {isUser && <Link to="/profile">Profile</Link>}
                                {isAdmin && <Link to="/dashboard">Dashboard</Link>}
                                <button onClick={logout}>Logout</button>
                            </div>
                        </div>
                    ) : (
                        <Link to="/login" className="login-btn">
                            Login
                        </Link>
                    )}

                    {/* HAMBURGER */}
                    <div className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
                        ☰
                    </div>
                </div>
            </header>

            {/* =======================
         SUB HEADER
      ======================= */}
            <div className={`sub-header ${showSubHeader ? "show" : ""}`}>
                <Link to="/store">About</Link>
                <Link to="/emi">EMI</Link>
                <Link to="/exchange">Exchange</Link>
                <Link to="/store">Stores</Link>
                <Link to="/contact">Contact</Link>
            </div>

            {/* =======================
         MOBILE MENU
      ======================= */}
            <div className={`mobile-menu ${menuOpen ? "open" : ""}`}>
                {roleMenu.map((item) => (
                    <Link
                        key={item.to}
                        to={item.to}
                        onClick={() => setMenuOpen(false)}
                    >
                        {item.label}
                    </Link>
                ))}

                {!isAdmin && (
                    <Link to="/cart" onClick={() => setMenuOpen(false)}>
                        Cart
                    </Link>
                )}

                <Link to="/emi" onClick={() => setMenuOpen(false)}>EMI</Link>
                <Link to="/exchange" onClick={() => setMenuOpen(false)}>Exchange</Link>
                <Link to="/store" onClick={() => setMenuOpen(false)}>Stores</Link>
                <Link to="/contact" onClick={() => setMenuOpen(false)}>Contact</Link>

                {user ? (
                    <button onClick={logout}>Logout</button>
                ) : (
                    <Link to="/login" onClick={() => setMenuOpen(false)}>
                        Login
                    </Link>
                )}
            </div>
        </div>
    );
};

export default Header;
