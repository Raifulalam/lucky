import React from "react";
import { Award, ShieldCheck, MapPin, CheckCircle2, Building2 } from "lucide-react";
import "./AuthorizedDealerCertification.css";

const AuthorizedDealerCertification = () => {
    const partners = [
        {
            name: "CG Digital",
            type: "Official Partner",
            description: "Authorized CG Digital dealer for electronics & home appliances",
        },
        {
            name: "CG Electronic",
            type: "Certified Dealer",
            description: "Official CG Electronic distributor in Madhesh Province",
        },
        {
            name: "Samsung Plaza",
            type: "Samsung Authorized",
            description: "Samsung Plaza certified showroom partner",
        },
        {
            name: "Whirlpool Neoteric",
            type: "Authorized Dealer",
            description: "Whirlpool Neoteric certified appliance dealer",
        },
        {
            name: "LG",
            type: "Authorized Dealer",
            description: "Official LG electronics & home appliances dealer",
        },
        {
            name: "Haier",
            type: "Authorized Dealer",
            description: "Haier certified appliances dealer",
        },
        {
            name: "Bajaj",
            type: "Authorized Dealer",
            description: "Bajaj electronics & appliances dealer",
        },
        {
            name: "Yasuda",
            type: "Authorized Dealer",
            description: "Yasuda home appliances dealer",
        },
    ];

    const locations = [
        "Birgunj",
        "Parsa District",
        "Madhesh Province",
    ];

    const certifications = [
        { icon: <Award size={20} />, text: "100% Genuine Products" },
        { icon: <ShieldCheck size={20} />, text: "Official Brand Warranty" },
        { icon: <CheckCircle2 size={20} />, text: "Authorized Dealer" },
        { icon: <Building2 size={20} />, text: "Certified Showroom" },
    ];

    return (
        <section className="dealer-certification-section" aria-label="Authorized Dealer Certifications">
            <div className="dealer-certification-inner">
                {/* Header */}
                <div className="cert-header">
                    <div className="cert-badge">
                        <Award size={24} />
                        <span>Authorized Dealer</span>
                    </div>
                    <h2 className="cert-title">
                        Official Authorized Dealer in Birgunj, Parsa & Madhesh Province
                    </h2>
                    <p className="cert-description">
                        Lucky Impex is proud to be an authorized dealer for top electronics brands.
                        We guarantee 100% genuine products with official manufacturer warranty.
                    </p>
                </div>

                {/* Location Coverage */}
                <div className="location-coverage">
                    <div className="location-icon">
                        <MapPin size={28} />
                    </div>
                    <div className="location-text">
                        <h3>Serving Across</h3>
                        <div className="location-list">
                            {locations.map((location, idx) => (
                                <span key={idx} className="location-item">
                                    {location}
                                    {idx < locations.length - 1 && <span className="separator">·</span>}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Brand Partners */}
                <div className="brand-partners-grid eight-items">
                    {partners.map((partner, idx) => (
                        <div key={idx} className="partner-card">
                            <div className="partner-icon">
                                <CheckCircle2 size={24} />
                            </div>
                            <div className="partner-info">
                                <h4 className="partner-name">{partner.name}</h4>
                                <span className="partner-type">{partner.type}</span>
                                <p className="partner-desc">{partner.description}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Trust Certifications */}
                <div className="trust-certifications">
                    {certifications.map((cert, idx) => (
                        <div key={idx} className="trust-item">
                            <span className="trust-icon">{cert.icon}</span>
                            <span className="trust-text">{cert.text}</span>
                        </div>
                    ))}
                </div>

                {/* SEO Text */}
                <div className="seo-content">
                    <p className="seo-text">
                        <strong>Authorized Dealer Certification:</strong> Lucky Impex operates as an officially
                        authorized dealer for CG Digital, CG Electronic, Samsung Plaza, and Whirlpool Neoteric.
                        Our showroom in Birgunj is certified to sell genuine electronics and home appliances
                        with full manufacturer warranty. We serve customers across Parsa District and Madhesh
                        Province with authentic products and professional service.
                    </p>
                </div>
            </div>
        </section>
    );
};

export default AuthorizedDealerCertification;
