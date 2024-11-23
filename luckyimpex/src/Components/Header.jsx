import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import luckyLogo from '../Images/lucky-logo.png';
import cart from '../Images/shopping-cart.png';
import './Header.css';
import { UserContext } from './UserContext';

const Header = () => {
    const [loggedIn, setLoggedIn] = useState(!!localStorage.getItem('authToken'));
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // Use context to get user, loading, and error
    const { user, loading, error } = useContext(UserContext);

    // Set role based on user context data
    const userRole = user?.role || 'user'; // Default to 'user' if user is null or undefined

    // Toggle mobile menu
    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    // Handle navigation to profile page
    const handleProfile = () => {
        navigate('/profile');
    };

    // Handle logout
    const handleLogout = () => {
        localStorage.removeItem('authToken');
        setLoggedIn(false);
        navigate('/');
    };

    // Handle navigation to login page
    const handleLogin = () => {
        navigate('/login');
    };

    // Handle navigation to signup page
    const handleSignup = () => {
        navigate('/signup');
    };

    // Handle navigation to cart page
    const handleCart = () => {
        navigate('/cart');
    };

    // Handle navigation to admin dashboard
    const handleAdminDashboard = () => {
        if (userRole === 'admin') {
            navigate('/admindashboard'); // Only for admin users
        } else {
            alert('You do not have admin privileges.');
        }
    };

    // Set loggedIn from localStorage on initial load
    useEffect(() => {
        const token = localStorage.getItem("authToken");
        setLoggedIn(!!token); // Update loggedIn state
    }, []);

    // If user data is still loading or an error occurred, show a loading message or error
    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div className="header">
            <div className="left">
                {/* Link to navigate to the home page */}
                <Link to="/" className="header-link">
                    <img className="lucky-logo" src={luckyLogo} alt="Lucky Impex Logo" />
                </Link>
                <p className="lucky-name">Lucky Impex</p>
            </div>
            <nav className={`nav ${isMenuOpen ? 'open' : ''}`} id="nav-element">
                <div className="middle">
                    <div className="products">
                        <button className="dropbtn">Products</button>
                        <div className="dropdown-content">
                            <Link to="/products">SAMSUNG</Link>
                            <Link to="/products">HAIER</Link>
                            <Link to="/products">LG</Link>
                            <Link to="/products">WHIRLPOOL</Link>
                            <Link to="/products">CG</Link>
                        </div>
                    </div>

                    <div className="services">
                        <Link to="/service">Services</Link>
                    </div>
                    <div className="contact-details">
                        <Link to="/contact">Contact Us</Link>
                    </div>

                    {loggedIn ? (
                        <div className="right">
                            <button onClick={handleCart} className="dropbtn">
                                <img src={cart} alt="Cart" />
                            </button>
                            <button onClick={handleProfile} className="dropbtn">
                                <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" className="bi bi-person-circle" viewBox="0 0 16 16">
                                    <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0" />
                                    <path fillRule="evenodd" d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8m8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1" />
                                </svg>
                            </button>
                            {userRole === 'admin' && (
                                <button onClick={handleAdminDashboard} className="dropbtn">Admin Dashboard</button>
                            )}
                            <button onClick={handleLogout} className="dropbtn">Logout</button>
                        </div>
                    ) : (
                        <div className="right">
                            <button className="dropbtn" onClick={handleLogin}>Login</button>
                            <button className="dropbtn" onClick={handleSignup}>Sign Up</button>
                        </div>
                    )}
                </div>
            </nav>

            {/* Hamburger Menu for mobile view */}
            <div
                className="hamburger"
                onClick={toggleMenu}
                aria-expanded={isMenuOpen}
                aria-label="Toggle navigation"
            >
                <span className={`bar ${isMenuOpen ? 'open' : ''}`}></span>
                <span className={`bar ${isMenuOpen ? 'open' : ''}`}></span>
                <span className={`bar ${isMenuOpen ? 'open' : ''}`}></span>
            </div>
        </div>
    );
};

export default Header;
