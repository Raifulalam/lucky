import React, { useState, useContext, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import luckyLogo from '../Images/lucky-logo.png';
import './Header.css';
import { UserContext } from './UserContext';
import { Helmet } from 'react-helmet';

const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isShopHovered, setIsShopHovered] = useState(false);  // State to control dropdown visibility
    const { user } = useContext(UserContext);
    const navigate = useNavigate();

    const isAdmin = user?.role === 'admin';
    const isLoggedIn = !!user;

    const toggleMenu = useCallback(() => {
        setIsMenuOpen((prevState) => !prevState);
    }, []);

    const handleNavigation = useCallback((path) => {
        navigate(path);
    }, [navigate]);

    const handleLogout = useCallback(() => {
        localStorage.removeItem('authToken');
        navigate('/');
        window.location.reload();
    }, [navigate]);
    const categories = [
        { name: 'Products' },
        { name: 'AirConditioners' },
        { name: 'Refrigerators' },
        { name: 'WashingMachines' },
        { name: 'LEDTelevisions' },
        { name: 'KitchenAppliances' },
        { name: 'Chimney' },
        { name: 'HomeAppliances' },
        { name: 'HomeTheater' },
        { name: 'AirCooler' },
        { name: 'ChestFreezer' },

    ];
    const handleCategoryChange = (event) => {
        handleNavigation(`/products/${event.target.value}`)
    }

    // Define the buttons for logged-in users and admins
    const adminButtons = (
        <>
            <button onClick={() => handleNavigation('/dashboard')} className="dropbtn">Dashboard <p>&#10148;</p></button>
            <button onClick={() => handleNavigation('/phones')} className='dropbtn'>Smart Phones <p>&#10148;</p></button>
            <button onClick={() => handleNavigation('/admindashboard')} className="dropbtn">Users <p>&#10148;</p></button>
            <button onClick={() => handleNavigation('/orders')} className="dropbtn">Order <p>&#10148;</p></button>
            <button onClick={() => handleNavigation('/complaints')} className="dropbtn">Complaints <p>&#10148;</p></button>
            <button onClick={() => handleNavigation('/feedback')} className="dropbtn">Feedback <p>&#10148;</p></button>
            <button onClick={() => handleNavigation('/profile')} className="dropbtn">Profile <p>&#10148;</p></button>
            <button onClick={handleLogout} className="dropbtn">Logout <p>&#10148;</p></button>
        </>
    );

    const userButtons = (
        <>
            <button
                onMouseEnter={() => setIsShopHovered(true)}
                onMouseLeave={() => setIsShopHovered(false)}
                className="dropbtn"
            >
                Categories <p>&#10148;</p>
                {isShopHovered && (
                    <select className="dropdown-select">
                        {categories.map(category =>
                            <option key={category.name} value={category.name}>{category.name}</option>
                        )}

                    </select>
                )}
            </button>
            <button onClick={() => handleNavigation('/products')} className='dropbtn'>All Prodcuts <p>&#10148;</p></button>
            <button onClick={() => handleNavigation('/phones')} className='dropbtn'>Smart Phones <p>&#10148;</p></button>
            <button onClick={() => handleNavigation('/cart')} className="dropbtn">Cart <p>&#10148;</p></button>
            <button onClick={() => handleNavigation('/service')} className="dropbtn">Service <p>&#10148;</p></button>
            <button onClick={() => handleNavigation('/contact')} className="dropbtn">Visit Us <p>&#10148;</p></button>
            <button onClick={() => handleNavigation('/profile')} className="dropbtn">Profile <p>&#10148;</p></button>
            <button onClick={() => handleNavigation('/emi')} className="dropbtn">EMI <p>&#10148;</p></button>
            <button onClick={() => handleNavigation('/store')} className="dropbtn">EMI <p>&#10148;</p></button>
            <button onClick={() => handleNavigation('/exchange')} className="dropbtn">Exchange ⇆ <p>&#10148;</p></button>
            <button onClick={handleLogout} className="dropbtn">Logout <p>&#10148;</p></button>
        </>
    );

    const guestButtons = (
        <>
            <button
                onMouseEnter={() => setIsShopHovered(true)}
                onMouseLeave={() => setIsShopHovered(false)}
                className="dropbtn"
            >
                Categories <p>&#11167;</p>
                {isShopHovered && (
                    <select className="dropdown-select" onChange={handleCategoryChange}>
                        {categories.map(category =>
                            <option key={category.name} value={category.name} >{category.name}</option>
                        )}
                    </select>
                )}
            </button>
            <button onClick={() => handleNavigation('/products')} className='dropbtn'>All Prodcuts <p>&#10148;</p></button>
            <button onClick={() => handleNavigation('/phones')} className='dropbtn'>Smart Phones <p>&#10148;</p></button>
            <button onClick={() => handleNavigation('/store')} className="dropbtn">Our Stores <p>&#10148;</p></button>
            <button onClick={() => handleNavigation('/cart')} className="dropbtn">Cart <p>&#10148;</p></button>
            <button onClick={() => handleNavigation('/contact')} className="dropbtn">Contact Us<p>&#10148;</p></button>
            <button onClick={() => handleNavigation('/login')} className="dropbtn">Login <p>&#10148;</p></button>

        </>
    );

    return (
        <div className="header">
            {/* Add Helmet for dynamic title and meta tags */}
            <Helmet>
                <title>{isLoggedIn ? (isAdmin ? 'Lucky Impex' : 'Welcome - Lucky Impex') : 'Lucky Impex'}</title>
                <meta name="description" content={isLoggedIn ? (isAdmin ? ' Manage Users and Orders' : 'Your Profile - Lucky Impex') : 'Lucky Impex - Your Trusted Online Store'} />
            </Helmet>

            <div className="left">
                <Link to="/" className="header-link">
                    <img className="lucky-logo" src={luckyLogo} alt="Lucky Impex Logo" />
                </Link>
                <p className="lucky-name">Lucky Impex</p>
            </div>

            <nav className={`nav ${isMenuOpen ? 'open' : ''}`} id="nav-element" aria-hidden={!isMenuOpen}>
                <div className="middle">
                    {isLoggedIn ? (isAdmin ? adminButtons : userButtons) : guestButtons}
                </div>
            </nav>

            <div className="hamburger" onClick={toggleMenu} aria-expanded={isMenuOpen ? 'true' : 'false'} aria-controls="nav-element" aria-label="Toggle navigation">
                <span className={`bar ${isMenuOpen ? 'open' : ''}`}></span>
                <span className={`bar ${isMenuOpen ? 'open' : ''}`}></span>
                <span className={`bar ${isMenuOpen ? 'open' : ''}`}></span>
            </div>
        </div>
    );
};

export default Header;
