import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserContext } from "./UserContext";
import { Helmet } from "react-helmet";
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

const Header = () => {
    const { user } = useContext(UserContext);
    const navigate = useNavigate();

    const [menuOpen, setMenuOpen] = useState(false);
    const [catOpen, setCatOpen] = useState(false);
    const [showSubHeader, setShowSubHeader] = useState(false);


    const isAdmin = user?.role === "admin";
    console.log(user);

    const logout = () => {
        localStorage.removeItem("authToken");
        navigate("/");
        window.location.reload();
    };
    const cartQty = JSON.parse(localStorage.getItem('cart')).length;
    return (
        <div
            className="header-wrapper"
            onMouseEnter={() => setShowSubHeader(true)}
            onMouseLeave={() => setShowSubHeader(false)}
        >
            <header className="header">
                <Helmet>
                    <title>Lucky Impex – Home Appliances Store</title>
                    <meta
                        name="description"
                        content="Buy AC, TV, Refrigerator & Home Appliances in Nepal"
                    />
                </Helmet>

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
                        {/* Categories */}
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
                    <Link to="/products">Products</Link>
                    <Link to="/phones">Phones</Link>
                    <Link to="/service">Service</Link>

                    <Link to="/cart" className="cart">
                        🛒 <span className="cart-badge">{cartQty}</span>
                    </Link>

                    {user ? (
                        <div className="user-menu">
                            <span>Hey {user?.name?.split(" ")[0]}</span>
                            <div className="user-dropdown">
                                {!isAdmin && <Link to="/profile">Profile</Link>}
                                {isAdmin && <Link to="/dashboard">Dashboard</Link>}
                                <button onClick={logout}>Logout</button>
                            </div>
                        </div>
                    ) : (
                        <Link to="/login" className="login-btn">
                            Login
                        </Link>
                    )}

                    <div className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
                        ☰
                    </div>
                </div>
            </header>

            {/* 🔹 SUB HEADER */}
            <div className={`sub-header ${showSubHeader ? "show" : ""}`}>
                <Link to="/store">About</Link>
                <Link to="/emi">EMI</Link>
                <Link to="/exchange">Exchange</Link>
                <Link to="/store">Stores</Link>
                <Link to="/contact">Contact</Link>
            </div>


            {/* menu items */}

            {/* MOBILE MENU */}
            <div className={`mobile-menu ${menuOpen ? "open" : ""}`}>
                <Link to="/products" onClick={() => setMenuOpen(false)}>Products</Link>
                <Link to="/phones" onClick={() => setMenuOpen(false)}>Phones</Link>
                <Link to="/cart" onClick={() => setMenuOpen(false)}>Cart</Link>
                <Link to="/emi" onClick={() => setMenuOpen(false)}>EMI</Link>
                <Link to="/exchange" onClick={() => setMenuOpen(false)}>Exchange</Link>
                <Link to="/store" onClick={() => setMenuOpen(false)}>Stores</Link>
                <Link to="/contact" onClick={() => setMenuOpen(false)}>Contact</Link>

                {user ? (
                    <button onClick={logout}>Logout</button>
                ) : (
                    <Link to="/login">Login</Link>
                )}
            </div>


        </div>
    );
};

export default Header;
