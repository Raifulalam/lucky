import React from "react";
import { Link } from "react-router-dom";
import { FaFacebook, FaInstagram, FaLinkedin, FaTwitter } from "react-icons/fa";
import { Mail, MapPin, Phone } from "lucide-react";
import "./Footer.css";

const Footer = () => {
    const year = new Date().getFullYear();

    return (
        <footer className="footer">
            <div className="footer-inner">
                <div className="footer-brand">
                    <span className="footer-kicker">Lucky Impex</span>
                    <h3>Electronics and appliance shopping with store-backed support.</h3>
                    <p>
                        Browse products, compare categories, explore branch locations, and contact
                        the Lucky Impex team for guidance before and after purchase.
                    </p>
                    <div className="footer-social">
                        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                            <FaFacebook />
                        </a>
                        <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                            <FaTwitter />
                        </a>
                        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                            <FaInstagram />
                        </a>
                        <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                            <FaLinkedin />
                        </a>
                    </div>
                </div>

                <div className="footer-links-column">
                    <h4>Shop</h4>
                    <Link to="/products">Products</Link>
                    <Link to="/phones">Phones</Link>
                    <Link to="/emi">EMI</Link>
                    <Link to="/exchange">Exchange</Link>
                </div>

                <div className="footer-links-column">
                    <h4>Company</h4>
                    <Link to="/about">About</Link>
                    <Link to="/store">Stores</Link>
                    <Link to="/service">Service</Link>
                    <Link to="/contact">Contact</Link>
                </div>

                <div className="footer-contact">
                    <h4>Contact</h4>
                    <div className="footer-contact-item">
                        <Phone size={16} />
                        <span>051531789</span>
                    </div>
                    <div className="footer-contact-item">
                        <Mail size={16} />
                        <span>luckyimpex4u@gmail.com</span>
                    </div>
                    <div className="footer-contact-item">
                        <MapPin size={16} />
                        <span>Ghantaghar Link Road, Birgunj, Nepal</span>
                    </div>
                </div>
            </div>

            <div className="footer-bottom">
                <span>&copy; {year} Lucky Impex. All rights reserved.</span>
                <span>Built for modern electronics and appliance retail.</span>
            </div>
        </footer>
    );
};

export default Footer;
