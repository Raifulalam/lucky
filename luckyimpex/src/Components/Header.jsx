import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import luckyLogo from '../Images/lucky-logo.png';
import cart from '../Images/shopping-cart.png';
import './Header.css';
import Modal from './Modal'; // Import the Modal component
import LoginComponent from '../Pages/LoginPage/LoginPage';
import SignupComponent from '../Pages/SignUp/Signup';


const Header = () => {
    const [isModalVisible, setModalVisible] = useState(false);
    const [modalType, setModalType] = useState('');
    const [loggedIn, setLoggedIn] = useState(!!localStorage.getItem('authToken'));

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const navigate = useNavigate();

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    // Handle navigation actions
    const handleProfile = () => {
        navigate('/profile');
    };

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userRole');
        setLoggedIn(false);

        navigate('/');
    };

    const handleCart = () => {
        navigate('/cart');
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


                    <div className="contact-details">
                        <Link to="/contact">Contact Us</Link>
                    </div>

                    {loggedIn ? (
                        <div className="middle">
                            <div className="services">
                                <Link to="/service">Services</Link>
                            </div>
                            <button onClick={handleCart} className="dropbtn">
                                <img src={cart} alt="Cart" />
                            </button>

                            <button onClick={handleProfile} className="dropbtn">
                                <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" className="bi bi-person-circle" viewBox="0 0 16 16">
                                    <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0" />
                                    <path fillRule="evenodd" d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8m8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1" />
                                </svg>
                            </button>


                        </div>
                    ) : (
                        <div className="right">
                            <div className='right'>
                                <button className="dropbtn" onClick={() => openModal('login')}>Login</button>
                            </div>



                            <div className="right"><button className="dropbtn" onClick={() => openModal('signup')}>Sign Up</button></div>
                        </div>

                    )}
                </div>
            </nav>

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

            {/* Modal component */}
            <Modal show={isModalVisible} onClose={closeModal}>
                {modalType === 'login' && (

                    <LoginComponent />

                )}
                {modalType === 'signup' && (
                    <SignupComponent />
                )}

            </Modal>
        </div>
    );
};

export default Header;
