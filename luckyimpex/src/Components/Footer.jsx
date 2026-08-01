import React from "react";
import { Link } from "react-router-dom";
import { FaFacebook, FaInstagram, FaYoutube } from "react-icons/fa";
import { Mail, MapPin, Phone } from "lucide-react";
import { SITE_CONFIG } from "../seo/siteConfig";
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
                        <a href={SITE_CONFIG.socialLinks[0]} target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                            <FaFacebook />
                        </a>
                        <a href={SITE_CONFIG.socialLinks[1]} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                            <FaInstagram />
                        </a>
                        <a href={SITE_CONFIG.socialLinks[2]} target="_blank" rel="noopener noreferrer" aria-label="YouTube">
                            <FaYoutube />
                        </a>
                    </div>
                </div>

                <div className="footer-links-column">
                    <h4>Shop</h4>
                    <Link to="/products">Products</Link>
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
                        <a href={`tel:${SITE_CONFIG.phone}`}>{SITE_CONFIG.phone}</a>
                    </div>
                    <div className="footer-contact-item">
                        <Mail size={16} />
                        <a href={`mailto:${SITE_CONFIG.supportEmail}`}>{SITE_CONFIG.supportEmail}</a>
                    </div>
                    <div className="footer-contact-item">
                        <MapPin size={16} />
                        <span>{SITE_CONFIG.address.streetAddress}, {SITE_CONFIG.address.addressLocality}, Nepal</span>
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
