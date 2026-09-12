import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaFacebook, FaInstagram, FaYoutube, FaWhatsapp } from "react-icons/fa";
import {
    ChevronDown,
    CreditCard,
    Headphones,
    Mail,
    MapPin,
    Phone,
    ShieldCheck,
    Truck
} from "lucide-react";
import { SITE_CONFIG } from "../seo/siteConfig";
import "./Footer.css";

const Footer = () => {
    const year = new Date().getFullYear();

    // Accordion state for mobile devices
    const [openSection, setOpenSection] = useState({
        categories: false,
        customerService: false,
        b2bTerms: false,
    });

    const toggleSection = (section) => {
        setOpenSection((prev) => ({
            ...prev,
            [section]: !prev[section],
        }));
    };

    return (
        <footer className="footer-hybrid">
            {/* Top Footer Callout Bar */}
            <div className="footer-top-callout">
                <div className="footer-top-inner">
                    <div className="callout-item">
                        <ShieldCheck size={20} className="text-amber" />
                        <div>
                            <strong>Authorized Dealer Guarantee</strong>
                            <span>100% Genuine brand products with official Nepal warranty</span>
                        </div>
                    </div>
                    <div className="callout-item">
                        <Truck size={20} className="text-amber" />
                        <div>
                            <strong>Birgunj & Nationwide Dispatch</strong>
                            <span>Reliable express shipping and freight transport</span>
                        </div>
                    </div>
                    <div className="callout-item">
                        <Headphones size={20} className="text-amber" />
                        <div>
                            <strong>Dedicated Customer & B2B Desk</strong>
                            <span>Direct technical and order support before and after buying</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Footer Links & Information */}
            <div className="footer-main-inner">
                {/* Brand & Contact Column */}
                <div className="footer-brand-col">
                    <div className="footer-logo-row">
                        <span className="brand-logo-text">luckyimpex<span className="accent">4u</span></span>
                        <span className="brand-sub-badge">Birgunj Showroom</span>
                    </div>
                    <p className="footer-bio">
                        Nepal's trusted destination for consumer electronics and wholesale home appliances distribution. Authorized multi-brand showroom on Ghantaghar Link Road, Birgunj.
                    </p>

                    <div className="footer-contact-details">
                        <div className="contact-line">
                            <MapPin size={16} className="contact-icon" />
                            <span>Ghantaghar Link Road, Birgunj, Parsa, Nepal</span>
                        </div>
                        <div className="contact-line">
                            <Phone size={16} className="contact-icon" />
                            <a href="tel:051531789">051-531789</a>
                            <span>·</span>
                            <a href="tel:+9779807286786">+977 9807286786</a>
                        </div>
                        <div className="contact-line">
                            <FaWhatsapp size={16} className="contact-icon text-green" />
                            <a
                                href="https://wa.me/9779809278236"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                WhatsApp: +977 9809278236
                            </a>
                        </div>
                        <div className="contact-line">
                            <Mail size={16} className="contact-icon" />
                            <a href="mailto:luckyimpex4u@gmail.com">luckyimpex4u@gmail.com</a>
                        </div>
                    </div>

                    <div className="footer-social-links">
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

                {/* Column 2: Categories (Accordion on mobile) */}
                <div className={`footer-accordion-col ${openSection.categories ? "open" : ""}`}>
                    <button
                        type="button"
                        className="accordion-trigger"
                        onClick={() => toggleSection("categories")}
                    >
                        <h4>Product Categories</h4>
                        <ChevronDown size={16} className="chevron" />
                    </button>
                    <div className="accordion-content">
                        <Link to="/products/AirConditioners">Air Conditioners (Inverter & Split)</Link>
                        <Link to="/products/Refrigerators">Refrigerators (Single & Double)</Link>
                        <Link to="/products/WashingMachines">Washing Machines (Front & Top)</Link>
                        <Link to="/products/LEDTelevisions">Smart LED TVs (4K & Google TV)</Link>
                        <Link to="/products/KitchenAppliances">Kitchen & Small Appliances</Link>
                        <Link to="/products/HomeAppliances">Air Coolers & Home Appliances</Link>
                        <Link to="/products">All Electronics Catalog</Link>
                    </div>
                </div>

                {/* Column 3: Customer Service (Accordion on mobile) */}
                <div className={`footer-accordion-col ${openSection.customerService ? "open" : ""}`}>
                    <button
                        type="button"
                        className="accordion-trigger"
                        onClick={() => toggleSection("customerService")}
                    >
                        <h4>Customer Care</h4>
                        <ChevronDown size={16} className="chevron" />
                    </button>
                    <div className="accordion-content">
                        <Link to="/store">Birgunj Showroom Hub</Link>
                        <Link to="/emi">0% EMI & Installment Plans</Link>
                        <Link to="/exchange">Old Appliance Exchange</Link>
                        <Link to="/service">Brand Warranty & Repair Service</Link>
                        <Link to="/contact">Help Desk & Complaints</Link>
                        <Link to="/review">Customer Reviews & Ratings</Link>
                    </div>
                </div>

                {/* Column 4: B2B Terms & Dealer Portal (Accordion on mobile) */}
                <div className={`footer-accordion-col ${openSection.b2bTerms ? "open" : ""}`}>
                    <button
                        type="button"
                        className="accordion-trigger"
                        onClick={() => toggleSection("b2bTerms")}
                    >
                        <h4>B2B Wholesale & Dealers</h4>
                        <ChevronDown size={16} className="chevron" />
                    </button>
                    <div className="accordion-content">
                        <a href="#wholesale-rfq">Request Bulk Wholesale Quote</a>
                        <Link to="/contact">Become an Authorized Dealer</Link>
                        <Link to="/contact">Container & Pallet Logistics</Link>
                        <Link to="/contact">Official VAT Invoicing Policy</Link>
                        <Link to="/store">Madhesh Province Distribution Hub</Link>
                        <a href="tel:+9779807286786">Speak with B2B Sales Manager</a>
                    </div>
                </div>
            </div>

            {/* Payment Icons & Security Row */}
            <div className="footer-payment-strip">
                <div className="payment-strip-inner">
                    <div className="payment-text-group">
                        <CreditCard size={18} />
                        <span>Accepted Payment & Financing Methods:</span>
                    </div>

                    <div className="payment-badges-row">
                        <div className="payment-pill pill-esewa" title="eSewa Digital Wallet">
                            <span className="pay-tag green">eSewa</span>
                        </div>
                        <div className="payment-pill pill-khalti" title="Khalti Digital Wallet">
                            <span className="pay-tag purple">Khalti</span>
                        </div>
                        <div className="payment-pill" title="VISA Accepted">
                            <span className="pay-tag blue">VISA</span>
                        </div>
                        <div className="payment-pill" title="Mastercard Accepted">
                            <span className="pay-tag red">Mastercard</span>
                        </div>
                        <div className="payment-pill" title="Fonepay QR">
                            <span className="pay-tag dark">Fonepay</span>
                        </div>
                        <div className="payment-pill" title="Cash on Delivery Available">
                            <span className="pay-tag gray">Cash on Delivery</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Copyright */}
            <div className="footer-bottom-bar">
                <div className="bottom-bar-inner">
                    <span>&copy; {year} luckyimpex4u (Lucky Impex). All rights reserved.</span>
                    <span className="bottom-tagline">
                        Authorized Electronics Dealer & Wholesaler in Birgunj, Nepal.
                    </span>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
