import React, { useState } from "react";
import {
    Clock,
    Compass,
    ExternalLink,
    MapPin,
    Navigation,
    Phone,
    ShieldCheck,
    Store,
    Users
} from "lucide-react";
import MapComponent from "../../Components/Leaflet";
import "./ShowroomHub.css";

const BIRGUNJ_POSITION = [27.0138387, 84.8803044]; // Link Road Ghantaghar Birgunj

const SHOWROOM_IMAGES = [
    { src: "/lucky1.jpg", alt: "Lucky Impex Main Showroom Front" },
    { src: "/guest6.jpg", alt: "Birgunj electronics showroom interior" },
    { src: "/lucky2.jpg", alt: "Appliance display aisles" },
    { src: "/lucky3.jpg", alt: "TV & Home theater wall" },
];

const ShowroomHub = () => {
    const [activeImageIndex, setActiveImageIndex] = useState(0);

    // Google Maps Navigation Deep Link
    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${BIRGUNJ_POSITION[0]},${BIRGUNJ_POSITION[1]}`;

    return (
        <section className="showroom-hub-section" id="showroom" aria-label="Birgunj Showroom Hub">
            <div className="showroom-hub-inner">
                {/* Header */}
                <div className="showroom-header">
                    <span className="showroom-pill">
                        <Store size={14} /> Birgunj Flagship Experience Center
                    </span>
                    <h2 className="showroom-title">Explore Our Birgunj Showroom & Distribution Hub</h2>
                    <p className="showroom-desc">
                        Visit our multi-story showroom in the heart of Birgunj. See appliances live in action, consult with technical specialists, and take home certified products on the same day.
                    </p>
                </div>

                {/* Main 2-Column Hub Grid */}
                <div className="showroom-grid">
                    {/* Column 1: Showroom Gallery & Details */}
                    <div className="showroom-card-visual">
                        {/* Main Gallery Frame */}
                        <div className="gallery-main-frame">
                            <img
                                src={SHOWROOM_IMAGES[activeImageIndex].src}
                                alt={SHOWROOM_IMAGES[activeImageIndex].alt}
                                className="gallery-main-img"
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?auto=format&fit=crop&w=800&q=80";
                                }}
                            />
                            <div className="showroom-status-pill">
                                <span className="live-dot" />
                                <strong>Showroom Open Now</strong>
                                <span>(10:00 AM – 8:00 PM)</span>
                            </div>
                        </div>

                        {/* Thumbnails */}
                        <div className="gallery-thumbs-row">
                            {SHOWROOM_IMAGES.map((img, idx) => (
                                <button
                                    key={idx}
                                    type="button"
                                    className={`gallery-thumb-btn ${idx === activeImageIndex ? "active" : ""}`}
                                    onClick={() => setActiveImageIndex(idx)}
                                    aria-label={`View photo ${idx + 1}`}
                                >
                                    <img
                                        src={img.src}
                                        alt={img.alt}
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = "/guest1.jpg";
                                        }}
                                    />
                                </button>
                            ))}
                        </div>

                        {/* Quick Highlights Strip */}
                        <div className="showroom-features-row">
                            <div className="feature-pill">
                                <ShieldCheck size={14} className="feature-icon" />
                                <span>Live Demo Counter</span>
                            </div>
                            <div className="feature-pill">
                                <Compass size={14} className="feature-icon" />
                                <span>On-Site EMI Desk</span>
                            </div>
                            <div className="feature-pill">
                                <Users size={14} className="feature-icon" />
                                <span>B2B Wholesale Office</span>
                            </div>
                        </div>
                    </div>

                    {/* Column 2: Map & Action Hub */}
                    <div className="showroom-info-card">
                        <div className="info-card-top">
                            <div className="store-identity">
                                <h3 className="store-title">Lucky Impex Flagship Showroom</h3>
                                <p className="store-subtitle">Authorized Multi-Brand Retailer & Importer</p>
                            </div>

                            {/* Address Block */}
                            <div className="store-meta-list">
                                <div className="meta-item">
                                    <MapPin size={18} className="meta-icon text-amber" />
                                    <div>
                                        <strong>Showroom Address:</strong>
                                        <p>Ghantaghar Link Road, Birgunj, Parsa, Nepal</p>
                                    </div>
                                </div>

                                <div className="meta-item">
                                    <Clock size={18} className="meta-icon text-amber" />
                                    <div>
                                        <strong>Operating Hours:</strong>
                                        <p>Sunday – Friday: 10:00 AM – 8:00 PM</p>
                                        <p className="saturday-hours">Saturday: 10:00 AM – 3:00 PM</p>
                                    </div>
                                </div>

                                <div className="meta-item">
                                    <Phone size={18} className="meta-icon text-amber" />
                                    <div>
                                        <strong>Direct Store Phones:</strong>
                                        <p>+977 051-531789 · +977 9807286786</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Interactive Leaflet Map Preview */}
                        <div className="showroom-map-wrapper">
                            <MapComponent position={BIRGUNJ_POSITION} />
                        </div>

                        {/* Primary Quick Action Buttons */}
                        <div className="showroom-action-buttons">
                            <a
                                href={googleMapsUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="action-btn-directions"
                            >
                                <Navigation size={17} />
                                <span>Get Directions (Google Maps)</span>
                                <ExternalLink size={14} />
                            </a>

                            <a href="tel:051531789" className="action-btn-call">
                                <Phone size={17} />
                                <span>Call Store Directly</span>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ShowroomHub;
