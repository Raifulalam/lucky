import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import luckyLogo from '../Images/lucky-logo.png';
import cart from '../Images/shopping-cart.png';


const Header = () => {
    const [loggedIn, setLoggedIn] = useState(!!localStorage.getItem('authToken'))
    const navigate = useNavigate();


    const handleProfile = () => {

        navigate('/profile')

    }
    const handleLogout = () => {
        localStorage.removeItem('authToken');
        navigate('/login');
    };
    // Handlers for login and signup
    const handleLogin = () => {
        navigate('/login');
    };
    const handleSignup = () => {
        navigate('/signup');
    };
    const handleCart = () => {
        navigate('/cart');
    }
    useEffect(() => {
        const token = localStorage.getItem("authToken");
        setLoggedIn(!!token);
    }, []);
    return (
        <div className="header">
            <div className="left">
                {/* Link to navigate to the home page */}
                <Link to="/" className="header-link">
                    <img className="lucky-logo" src={luckyLogo} alt="Lucky Impex Logo" />
                </Link>
                <p className="lucky-name">Lucky Impex</p>
            </div>
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
            </div>
            {loggedIn && (
                <div className='right'>
                    <button onClick={handleLogout} className='dropbtn'>Logout</button>
                    <button onClick={handleCart} className='dropbtn'><img src={cart} alt='Cart'></img></button>
                    <button onClick={handleProfile} className='dropbtn'><svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" className="bi bi-person-circle" viewBox="0 0 16 16">
                        <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0" />
                        <path fillRule="evenodd" d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8m8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1" />
                    </svg></button>

                </div>
            )}
            {!loggedIn && (
                <div className="right">
                    {/* Buttons for login and signup */}
                    <button className="dropbtn" onClick={handleLogin}>Login</button>
                    <button className="dropbtn" onClick={handleSignup}>Sign Up</button>
                </div>
            )}


        </div>
    );
};

export default Header;
