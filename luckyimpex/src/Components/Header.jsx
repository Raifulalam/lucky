import React, { useContext, useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Bell, Building2, Menu, Search, ShoppingBag, ShoppingCart, User, X } from "lucide-react";
import { UserContext } from "./UserContext";
import { useNotification } from "./NotificationContext";
import { useCartState } from "./CreateReducer";
import { useWholesale } from "./WholesaleContext";
import luckyLogo from "../Images/lucky-logo.png";
import CartDrawer from "./CartDrawer";
import "./Header.css";

const PHONE_DISPLAY = "051-531789";
const PHONE_HREF = "tel:+977051531789";
const WHATSAPP_HREF = "https://wa.me/9779802594022?text=Hello%20Lucky%20Impex%2C%20I%20would%20like%20to%20enquire%20about%20a%20product.";

const NAV_LINKS = [
    { label: "Products", to: "/products" },
    { label: "Mobiles", to: "/mobiles" },
    { label: "Showroom", to: "/store" },
    { label: "Service", to: "/service" },
    { label: "Contact", to: "/contact" },
];

const CATEGORIES = [
    "AirConditioners",
    "Refrigerators",
    "WashingMachines",
    "LEDTelevisions",
    "KitchenAppliances",
    "HomeAppliances",
    "AirCooler",
    "ChestFreezer",
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
    const [cartOpen, setCartOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const isAdmin = user?.role === "admin";
    const cart = useCartState() || EMPTY_CART;
    const cartQty = useMemo(() => cart.reduce((total, item) => total + (item.quantity || 1), 0), [cart]);

    // Close the menu whenever the page changes.
    useEffect(() => {
        setMenuOpen(false);
    }, [location.pathname]);

    // Lock page scroll only while the mobile menu is open, so it never adds a second scrollbar.
    useEffect(() => {
        if (!menuOpen) return undefined;
        const previous = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = previous;
        };
    }, [menuOpen]);

    const handleSearchSubmit = (event) => {
        event.preventDefault();
        const query = searchQuery.trim();
        if (query) {
            navigate(`/products?search=${encodeURIComponent(query)}`);
            setMenuOpen(false);
        }
    };

    const handleCartClick = (event) => {
        if (location.pathname !== "/cart") {
            event.preventDefault();
            setCartOpen(true);
        }
    };

    const handleLogout = () => {
        logout();
        setMenuOpen(false);
        navigate("/");
    };

    const searchForm = (
        <form className="sh-search" onSubmit={handleSearchSubmit} role="search">
            <Search size={16} aria-hidden="true" />
            <input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search products, brands or models"
                aria-label="Search products"
            />
            <button type="submit">Search</button>
        </form>
    );

    return (
        <>
            <div className="sh-topbar">
                <div className="sh-topbar__inner">
                    <span>Birgunj, Nepal · Open 10am – 8pm</span>
                    <span>
                        <a href={PHONE_HREF}>Call {PHONE_DISPLAY}</a>
                        {" · "}
                        <a href={WHATSAPP_HREF} target="_blank" rel="noopener noreferrer">WhatsApp</a>
                    </span>
                </div>
            </div>

            <header className="site-header">
                <div className="sh-row">
                    <Link to="/" className="sh-logo" aria-label="Lucky Impex home">
                        <img src={luckyLogo} alt="" width="36" height="36" />
                        <span>Lucky Impex</span>
                    </Link>

                    <nav className="sh-nav" aria-label="Main navigation">
                        {NAV_LINKS.map((link) => (
                            <Link key={link.to} to={link.to} className={location.pathname === link.to ? "is-active" : ""}>
                                {link.label}
                            </Link>
                        ))}
                    </nav>

                    <div className="sh-search-desktop">{searchForm}</div>

                    <div className="sh-actions">
                        {/* The retail/wholesale switch only has an effect on the homepage, where its provider lives. */}
                        {location.pathname === "/" && (
                        <button
                            type="button"
                            className={`sh-mode ${isWholesale ? "is-wholesale" : ""}`}
                            onClick={toggleMode}
                            aria-pressed={isWholesale}
                            title="Switch between retail and wholesale view"
                        >
                            {isWholesale ? <Building2 size={15} /> : <ShoppingBag size={15} />}
                            <span>{isWholesale ? "Wholesale" : "Retail"}</span>
                        </button>
                        )}

                        {user && (
                            <button
                                type="button"
                                className={`sh-icon ${panelOpen ? "is-active" : ""}`}
                                onClick={() => setPanelOpen((prev) => !prev)}
                                aria-label="Notifications"
                            >
                                <Bell size={19} />
                                {unreadNotificationCount > 0 && (
                                    <span className="sh-badge">{unreadNotificationCount > 99 ? "99+" : unreadNotificationCount}</span>
                                )}
                            </button>
                        )}

                        {!isAdmin && (
                            <Link to="/cart" className="sh-icon" aria-label={`Cart, ${cartQty} items`} onClick={handleCartClick}>
                                <ShoppingCart size={19} />
                                {cartQty > 0 && <span className="sh-badge">{cartQty}</span>}
                            </Link>
                        )}

                        {user ? (
                            <Link to={isAdmin ? "/admin" : "/profile"} className="sh-icon sh-account" aria-label={isAdmin ? "Admin dashboard" : "My profile"}>
                                <User size={19} />
                            </Link>
                        ) : (
                            <Link to="/login" className="sh-signin">Sign in</Link>
                        )}

                        <button
                            type="button"
                            className="sh-icon sh-burger"
                            onClick={() => setMenuOpen((prev) => !prev)}
                            aria-label={menuOpen ? "Close menu" : "Open menu"}
                            aria-expanded={menuOpen}
                        >
                            {menuOpen ? <X size={22} /> : <Menu size={22} />}
                        </button>
                    </div>
                </div>

                <div className="sh-search-mobile">{searchForm}</div>
            </header>

            {menuOpen && (
                <div className="sh-menu-layer">
                    <button type="button" className="sh-backdrop" aria-label="Close menu" onClick={() => setMenuOpen(false)} />
                    <aside className="sh-menu" aria-label="Menu">
                        <nav>
                            {NAV_LINKS.map((link) => (
                                <Link key={link.to} to={link.to}>{link.label}</Link>
                            ))}
                            <Link to="/wholesale">Wholesale</Link>
                        </nav>
                        <p className="sh-menu__title">Categories</p>
                        <nav>
                            {CATEGORIES.map((category) => (
                                <Link key={category} to={`/products/${category}`}>{formatCategory(category)}</Link>
                            ))}
                        </nav>
                        <div className="sh-menu__contact">
                            <a href={PHONE_HREF}>Call {PHONE_DISPLAY}</a>
                            <a href={WHATSAPP_HREF} target="_blank" rel="noopener noreferrer">WhatsApp us</a>
                            {user ? (
                                <button type="button" onClick={handleLogout}>Log out</button>
                            ) : (
                                <Link to="/login">Sign in / Register</Link>
                            )}
                        </div>
                    </aside>
                </div>
            )}

            <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
        </>
    );
};

export default Header;
