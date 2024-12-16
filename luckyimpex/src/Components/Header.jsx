import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import luckyLogo from '../Images/lucky-logo.png';
import cart from '../Images/shopping-cart.png';
import './Header.css';
import { UserContext } from './UserContext';

const Header = () => {
    const [isModalVisible, setModalVisible] = useState(false);
    const [modalType, setModalType] = useState('');
    const { user } = useContext(UserContext);
    const navigate = useNavigate();

    const isAdmin = user?.role === 'admin';
    const isLoggedIn = !!user;

    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    // Handle navigation actions
    const handleProfile = () => {
        navigate('/profile');
    };
    const handleService = () => {
        navigate('/service');
    };
    const handleVisitUs = () => {
        navigate('/contact');
    };
    const handleOrder = () => {
        navigate('/orders');
    };
    const handleCart = () => {
        navigate('/cart');
    };
    const handleAdminDashboard = () => {
        navigate('/admindashboard');
    };
    const handleComplaints = () => {
        navigate('/complaints');
    }
    const handleFeedback = () => {
        navigate('/feedback');
    }
    const handleLogin = () => {
        navigate('/login');
    };

    const handleSignup = () => {
        navigate('/signup');
    };
    const handleLogout = () => {
        localStorage.removeItem('authToken');
        navigate('/login');
    };

    // Modal functions
    const openModal = (type) => {
        setModalType(type);
        setModalVisible(true);
    };

    const closeModal = () => {
        setModalVisible(false);
        setModalType('');
    };

    return (
        <div className="header">
            <div className="left">
                <Link to="/" className="header-link">
                    <img className="lucky-logo" src={luckyLogo} alt="Lucky Impex Logo" />
                </Link>
                <p className="lucky-name">Lucky Impex</p>
            </div>

            <nav className={`nav ${isMenuOpen ? 'open' : ''}`} id="nav-element" aria-hidden={!isMenuOpen}>
                <div className="middle">

                    <button className="dropbtn">Products</button>
                    <div className="dropdown-content">
                        <Link to="/products">SAMSUNG</Link>
                        <Link to="/products">HAIER</Link>
                        <Link to="/products">LG</Link>
                        <Link to="/products">WHIRLPOOL</Link>
                        <Link to="/products">CG</Link>

                    </div>


                    <button onClick={handleVisitUs} className="dropbtn">Visit Us</button>

                    {isLoggedIn ? (
                        // If logged in, check if the user is an admin or not
                        isAdmin ? (
                            <>
                                <button onClick={handleProfile} className='dropbtn'>
                                    Profile
                                </button>
                                <button onClick={handleAdminDashboard} className='dropbtn'>Dashboard</button>
                                <button onClick={handleLogout} className='dropbtn'>Logout</button>
                                <button onClick={handleOrder} className='dropbtn' >
                                    Order
                                </button>
                                <button onClick={handleComplaints} className='dropbtn'>Complaints</button>
                                <button onClick={handleFeedback} className='dropbtn'> Feedback</button>

                            </>
                        ) : (
                            <>
                                <div className="right">
                                    <button onClick={handleService} className="dropbtn">Service</button>
                                </div>
                                <button onClick={handleCart} className="dropbtn">
                                    <img src={cart} alt="Cart" />
                                </button>

                                <button onClick={handleProfile} >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" className="bi bi-person-circle" viewBox="0 0 16 16">
                                        <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0" />
                                        <path fillRule="evenodd" d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8m8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1" />
                                    </svg>
                                </button>
                                <button onClick={handleLogout}>Logout</button>
                            </>
                        )
                    ) : (
                        // If not logged in, show login and signup options
                        <>
                            <div className="right">
                                <button className="dropbtn" onClick={handleLogin}>Login</button>
                            </div>
                            <div className="right">
                                <button className="dropbtn" onClick={handleSignup}>Sign Up</button>
                            </div>
                        </>
                    )}
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
