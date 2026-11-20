import React from "react";
import { MapPin, Phone, Mail, Clock, Award, ShieldCheck, Truck, HeadphonesIcon } from "lucide-react";
import "./StoreInformation.css";

const StoreInformation = () => {
    const services = [
        {
            icon: <Award size={28} />,
            title: "Authorized Dealer",
            description: "Official authorized dealer for LG, Samsung, Whirlpool, Haier, CG, Bajaj, Yasuda with genuine products and manufacturer warranty.",
        },
        {
            icon: <ShieldCheck size={28} />,
            title: "100% Genuine Products",
            description: "All products are 100% genuine with official brand warranty. No counterfeit or refurbished items.",
        },
        {
            icon: <Truck size={28} />,
            title: "Free Installation",
            description: "Professional installation service for ACs, refrigerators, washing machines and other appliances at no extra cost.",
        },
        {
            icon: <HeadphonesIcon size={28} />,
            title: "After-Sales Support",
            description: "Dedicated customer support team available to help with warranty claims, service requests, and product inquiries.",
        },
    ];

    const whyChooseUs = [
        "Trusted electronics showroom in Birgunj since 2009",
        "Authorized dealer for 8+ major brands",
        "Competitive pricing with genuine warranty",
        "Professional installation & after-sales service",
        "0% interest EMI options available",
        "Same-day delivery for in-stock items",
        "Transparent pricing with no hidden charges",
        "Experienced technical support team",
    ];

    return (
        <section className="store-information-section" aria-label="Store information and services">
            <div className="store-information-inner">
                {/* Header */}
                <div className="info-header">
                    <span className="section-pill">About Lucky Impex</span>
                    <h2>Your Trusted Electronics Partner in Birgunj</h2>
                    <p className="info-description">
                        Lucky Impex has been serving customers in Birgunj, Parsa District, and Madhesh Province
                        with genuine electronics and home appliances since 2009. We are proud to be an authorized
                        dealer for leading brands including LG, Samsung, Whirlpool, Haier, CG, Bajaj, and Yasuda.
                    </p>
                </div>

                {/* Services Grid */}
                <div className="services-grid">
                    {services.map((service, idx) => (
                        <div key={idx} className="service-card">
                            <div className="service-icon">{service.icon}</div>
                            <h3 className="service-title">{service.title}</h3>
                            <p className="service-description">{service.description}</p>
                        </div>
                    ))}
                </div>

                {/* Why Choose Us */}
                <div className="why-choose-section">
                    <h3 className="why-title">Why Choose Lucky Impex?</h3>
                    <div className="why-list">
                        {whyChooseUs.map((item, idx) => (
                            <div key={idx} className="why-item">
                                <div className="why-check">✓</div>
                                <span>{item}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Store Contact Info */}
                <div className="store-contact-box">
                    <div className="contact-row">
                        <div className="contact-icon">
                            <MapPin size={24} />
                        </div>
                        <div className="contact-details">
                            <h4>Store Location</h4>
                            <p>Ghantaghar Link Road, Birgunj, Parsa District, Madhesh Province, Nepal - 44300</p>
                        </div>
                    </div>

                    <div className="contact-row">
                        <div className="contact-icon">
                            <Phone size={24} />
                        </div>
                        <div className="contact-details">
                            <h4>Phone & WhatsApp</h4>
                            <p>Phone: 051-531789 | WhatsApp: +977 9802594022</p>
                        </div>
                    </div>

                    <div className="contact-row">
                        <div className="contact-icon">
                            <Mail size={24} />
                        </div>
                        <div className="contact-details">
                            <h4>Email</h4>
                            <p>luckyimpex4u@gmail.com</p>
                        </div>
                    </div>

                    <div className="contact-row">
                        <div className="contact-icon">
                            <Clock size={24} />
                        </div>
                        <div className="contact-details">
                            <h4>Store Hours</h4>
                            <p>Monday - Friday & Sunday: 10:00 AM - 8:00 PM | Saturday: 10:00 AM - 3:00 PM</p>
                        </div>
                    </div>
                </div>

                {/* SEO Content */}
                <div className="seo-content-box">
                    <h3>Complete Home Appliance Solutions</h3>
                    <p className="seo-text">
                        At Lucky Impex, we offer a comprehensive range of home appliances and electronics to meet
                        all your needs. Our product lineup includes air conditioners (split AC, window AC, inverter AC),
                        refrigerators (single door, double door, side-by-side, deep freezers, chest freezers, showcase refrigerators),
                        washing machines (front load, top load, fully automatic, semi automatic), air coolers, fans (ceiling fans,
                        table fans, pedestal fans), kitchen appliances (chimneys, air fryers, microwave ovens, electric ovens,
                        mixer grinders, juicers, food processors), water purifiers, air purifiers, vacuum cleaners, home theater
                        systems, DJ sound systems, LED TVs, smart TVs, and much more.
                    </p>
                    <p className="seo-text">
                        We serve customers across Birgunj, Parsa District, and the entire Madhesh Province with
                        professional delivery and installation services. Our team of experienced technicians ensures
                        proper installation and provides ongoing after-sales support. With competitive pricing, genuine
                        products, and excellent customer service, Lucky Impex is your one-stop destination for all
                        electronics and home appliance needs in Nepal.
                    </p>
                </div>
            </div>
        </section>
    );
};

export default StoreInformation;
