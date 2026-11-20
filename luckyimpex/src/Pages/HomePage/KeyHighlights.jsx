import React from "react";
import { Award, ShieldCheck, Truck, HeadphonesIcon, Zap, MapPin, Users, Clock } from "lucide-react";
import "./KeyHighlights.css";

const KeyHighlights = () => {
    const highlights = [
        {
            icon: <Award size={32} />,
            title: "Authorized Dealer",
            description: "Official authorized dealer for LG, Samsung, Whirlpool, Haier, CG, Bajaj, and Yasuda with genuine products",
            color: "#667eea",
        },
        {
            icon: <ShieldCheck size={32} />,
            title: "100% Genuine Products",
            description: "All products come with official manufacturer warranty. No counterfeit or refurbished items",
            color: "#10b981",
        },
        {
            icon: <Truck size={32} />,
            title: "Free Installation",
            description: "Professional installation service for ACs, refrigerators, washing machines and other appliances",
            color: "#f59e0b",
        },
        {
            icon: <HeadphonesIcon size={32} />,
            title: "24/7 Support",
            description: "Dedicated customer support team available for warranty claims and service requests",
            color: "#ef4444",
        },
    ];

    const stats = [
        { icon: <Users size={24} />, value: "15,000+", label: "Happy Customers" },
        { icon: <Award size={24} />, value: "8+", label: "Brand Partners" },
        { icon: <Truck size={24} />, value: "5,000+", label: "Products Delivered" },
        { icon: <Clock size={24} />, value: "15+", label: "Years Experience" },
    ];

    const serviceAreas = [
        "Birgunj City",
        "Parsa District",
        "Madhesh Province",
        "Across Nepal",
    ];

    return (
        <section className="key-highlights-section" aria-label="Key highlights and features">
            <div className="key-highlights-inner">
                {/* Main Header */}
                <div className="highlights-header">
                    <span className="section-badge">Why Lucky Impex?</span>
                    <h2 className="highlights-title">Your Trusted Electronics Partner Since 2009</h2>
                    <p className="highlights-description">
                        Lucky Impex has been serving customers in Birgunj and across Madhesh Province with genuine
                        electronics and home appliances for over 15 years. We are committed to providing quality products,
                        professional service, and excellent customer support.
                    </p>
                </div>

                {/* Key Features Grid */}
                <div className="highlights-grid">
                    {highlights.map((item, idx) => (
                        <div key={idx} className="highlight-card" style={{ borderTopColor: item.color }}>
                            <div className="highlight-icon" style={{ color: item.color }}>
                                {item.icon}
                            </div>
                            <h3 className="highlight-title">{item.title}</h3>
                            <p className="highlight-description">{item.description}</p>
                        </div>
                    ))}
                </div>

                {/* Stats Row */}
                <div className="stats-row">
                    {stats.map((stat, idx) => (
                        <div key={idx} className="stat-item">
                            <div className="stat-icon">{stat.icon}</div>
                            <div className="stat-content">
                                <div className="stat-value">{stat.value}</div>
                                <div className="stat-label">{stat.label}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Service Areas */}
                <div className="service-areas-box">
                    <div className="areas-header">
                        <MapPin size={24} />
                        <h3>We Serve Across</h3>
                    </div>
                    <div className="areas-list">
                        {serviceAreas.map((area, idx) => (
                            <span key={idx} className="area-tag">
                                {area}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Additional Information */}
                <div className="info-cards">
                    <div className="info-card primary">
                        <div className="info-card-icon">
                            <Zap size={28} />
                        </div>
                        <div className="info-card-content">
                            <h4>0% Interest EMI Available</h4>
                            <p>Get your dream appliances with easy EMI options. No interest charges with just 40% down payment.</p>
                        </div>
                    </div>
                    <div className="info-card secondary">
                        <div className="info-card-icon">
                            <Award size={28} />
                        </div>
                        <div className="info-card-content">
                            <h4>Official Brand Warranty</h4>
                            <p>All products come with manufacturer warranty. We handle all warranty claims and service requests.</p>
                        </div>
                    </div>
                </div>

                {/* Location Information */}
                <div className="location-info">
                    <div className="location-details">
                        <h3>Visit Our Showroom</h3>
                        <p className="location-address">
                            <strong>Ghantaghar Link Road, Birgunj</strong><br />
                            Parsa District, Madhesh Province, Nepal - 44300
                        </p>
                        <div className="location-contact">
                            <div className="contact-item">
                                <strong>Phone:</strong> 051-531789
                            </div>
                            <div className="contact-item">
                                <strong>WhatsApp:</strong> +977 9802594022
                            </div>
                            <div className="contact-item">
                                <strong>Email:</strong> luckyimpex4u@gmail.com
                            </div>
                        </div>
                    </div>
                    <div className="location-hours">
                        <h3>Store Hours</h3>
                        <div className="hours-list">
                            <div className="hours-item">
                                <span className="days">Monday - Friday & Sunday</span>
                                <span className="time">10:00 AM - 8:00 PM</span>
                            </div>
                            <div className="hours-item">
                                <span className="days">Saturday</span>
                                <span className="time">10:00 AM - 3:00 PM</span>
                            </div>
                        </div>
                        <p className="hours-note">Walk-ins welcome! Test products before purchase.</p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default KeyHighlights;
