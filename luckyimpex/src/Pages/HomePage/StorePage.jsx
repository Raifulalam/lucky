import React, { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet";
import { Award, Clock3, Headphones, MapPinned, MoveRight, Phone, ShieldCheck, Store, Trophy } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Header from "../../Components/Header";
import Footer from "../../Components/Footer";
import MapComponent from "../../Components/Leaflet";
import { ContactComponent } from "../Contact/Contact";
import "./StoreComponent.css";

const StoreComponent = () => {
    const navigate = useNavigate();

    const branches = useMemo(
        () => [
            {
                id: "birgunj-link-road",
                name: "Lucky Impex Birgunj",
                label: "Main Flagship Store",
                location: [27.0138387, 84.8803044],
                contact: {
                    phone: "+977-9807286786",
                    tel: "051531789",
                    email: "luckyimpex4u@gmail.com",
                },
                address: "Link Road Ghantaghar, Birgunj, Nepal",
                hours: "Sun–Fri: 10:00 AM – 8:00 PM, Sat: 10:00 AM – 3:00 PM",
                description:
                    "Our primary showroom with a broad range of electronics, home appliances, and in-store product assistance.",
                highlights: [
                    "Appliance and electronics product discovery",
                    "Flagship store guidance and support",
                    "Assistance for exchange and purchase queries",
                ],
                images: ["lucky1.jpg", "guest6.jpg", "lucky2.jpg", "lucky3.jpg"],
            },
            {
                id: "birgunj-maisthan",
                name: "Lucky Impex Maisthan",
                label: "City Access Store",
                location: [27.01211, 84.8770902],
                contact: {
                    phone: "+977-9807216321",
                    email: "luckyimpexmainroad@gmail.com",
                },
                address: "Main Road Maisthan, Birgunj, Nepal",
                hours: "Sun–Fri: 10:00 AM – 8:00 PM, Sat: 10:00 AM – 3:00 PM",
                description:
                    "A centrally placed branch offering dependable access to key appliance categories with customer-facing support.",
                highlights: [
                    "Convenient city location",
                    "Core appliance category availability",
                    "Fast customer communication",
                ],
                images: ["lucky3.jpg", "lucky4.jpg"],
            },
            {
                id: "simra",
                name: "Lucky Impex Simra",
                label: "Regional Store",
                location: [27.161434, 84.975124],
                contact: {
                    phone: "+977-9810818276",
                    email: "luckyimpexsimra@gmail.com",
                },
                address: "Simra Main Road, in front of Surya Nepal Udhyog, Nepal",
                hours: "Sun–Fri: 10:00 AM – 8:00 PM, Sat: 10:00 AM – 3:00 PM",
                description:
                    "Serving Simra customers with access to trusted products, assistance, and store-led after-sales communication.",
                highlights: [
                    "Regional customer support presence",
                    "Reliable electronics and appliance access",
                    "Store-backed purchase guidance",
                ],
                images: ["guest5.jpg", "lucky5.jpg"],
            },
        ],
        []
    );

    const awards = useMemo(
        () => [
            { name: "Samsung Consistent Performer", year: "FY 2023/24", image: "samsung-award.jpg" },
            { name: "Samsung Rising Star", year: "FY 2023/24", image: "samsung-award2.jpg" },
            { name: "Samsung Dealership Certificate", year: "2024–2026", image: "samsung-delarship.jpg" },
            { name: "LG Dealership Certificate", year: "2023–2026", image: "lg-delarship.jpg" },
            { name: "Haier Authorized Dealer", year: "2024–2025", image: "haier-delarship.jpg" },
        ],
        []
    );

    const trustPoints = [
        {
            icon: <Store size={22} />,
            title: "Physical retail presence",
            text: "Customers can visit branches, evaluate products, and speak to store teams directly.",
        },
        {
            icon: <ShieldCheck size={22} />,
            title: "Recognized brand relationships",
            text: "The business showcases active dealer and award credentials across major appliance brands.",
        },
        {
            icon: <Headphones size={22} />,
            title: "Human support path",
            text: "Sales, service, and buying questions are routed through visible contact points and store support.",
        },
    ];

    const [activeBranchIndex, setActiveBranchIndex] = useState(0);
    const [currentSlide, setCurrentSlide] = useState(0);

    const activeBranch = branches[activeBranchIndex];

    useEffect(() => {
        setCurrentSlide(0);
    }, [activeBranchIndex]);

    useEffect(() => {
        if (!activeBranch?.images?.length) return undefined;

        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % activeBranch.images.length);
        }, 3500);

        return () => clearInterval(timer);
    }, [activeBranch]);

    return (
        <div className="store-page">
            <Helmet>
                <title>About & Stores | Lucky Impex</title>
                <meta
                    name="description"
                    content="Learn about Lucky Impex, explore branch locations, and connect with our store team for electronics and appliance shopping support."
                />
                <meta
                    name="keywords"
                    content="Lucky Impex stores, Lucky Impex about, Birgunj electronics store, appliance showroom Nepal"
                />
                <link rel="canonical" href="https://luckyimpex.netlify.app/store" />
            </Helmet>

            <Header />

            <main className="store-main">
                <section className="store-hero">
                    <div className="store-hero-copy">
                        <span className="store-kicker">About Lucky Impex</span>
                        <h1>A store-led electronics business built around trust, visibility, and practical buying support.</h1>
                        <p>
                            Lucky Impex combines physical showroom presence, recognized brand
                            relationships, and customer-facing support so shoppers can move from
                            product interest to confident purchase without guesswork.
                        </p>
                        <div className="store-hero-actions">
                            <button className="store-btn-primary" onClick={() => navigate("/products")}>
                                Explore Products <MoveRight size={18} />
                            </button>
                            <button className="store-btn-secondary" onClick={() => navigate("/contact")}>
                                Contact Team
                            </button>
                        </div>
                    </div>

                    <div className="store-hero-panel">
                        <div className="hero-panel-stat">
                            <strong>{branches.length}</strong>
                            <span>active branch locations</span>
                        </div>
                        <div className="hero-panel-stat">
                            <strong>{awards.length}</strong>
                            <span>brand credentials and awards shown</span>
                        </div>
                        <div className="hero-panel-stat">
                            <strong>Store-backed</strong>
                            <span>guidance for products, offers, and support queries</span>
                        </div>
                    </div>
                </section>

                <section className="store-trust-strip">
                    {trustPoints.map((item) => (
                        <article key={item.title} className="trust-card">
                            {item.icon}
                            <div>
                                <h3>{item.title}</h3>
                                <p>{item.text}</p>
                            </div>
                        </article>
                    ))}
                </section>

                <section className="store-story">
                    <div className="store-section-heading">
                        <span className="store-kicker">Store Presence</span>
                        <h2>Why this page matters</h2>
                        <p>
                            A professional retail site needs more than a products grid. Customers
                            also look for proof that the business is reachable, established, and
                            capable of helping them after the purchase.
                        </p>
                    </div>
                    <div className="story-grid">
                        <article className="story-card">
                            <Clock3 size={24} />
                            <h3>Visible operating hours</h3>
                            <p>Customers can see when branches are open before deciding how to reach out or visit.</p>
                        </article>
                        <article className="story-card">
                            <MapPinned size={24} />
                            <h3>Branch-by-branch clarity</h3>
                            <p>Each store location is presented with address, contact details, and map support instead of generic text.</p>
                        </article>
                        <article className="story-card">
                            <Award size={24} />
                            <h3>Commercial credibility</h3>
                            <p>Brand awards and dealership credentials reinforce business legitimacy and partner trust.</p>
                        </article>
                    </div>
                </section>

                <section className="branch-section">
                    <div className="store-section-heading">
                        <span className="store-kicker">Our Stores</span>
                        <h2>Explore branch locations</h2>
                        <p>Select a branch to view its photos, address, contact details, and map location.</p>
                    </div>

                    <div className="branch-tabs">
                        {branches.map((branch, index) => (
                            <button
                                key={branch.id}
                                type="button"
                                className={`branch-tab ${activeBranchIndex === index ? "active" : ""}`}
                                onClick={() => setActiveBranchIndex(index)}
                            >
                                <span>{branch.label}</span>
                                <strong>{branch.name}</strong>
                            </button>
                        ))}
                    </div>

                    <div className="branch-detail-card">
                        <div className="branch-visual">
                            <img
                                src={`/${activeBranch.images[currentSlide]}`}
                                alt={activeBranch.name}
                                className="branch-hero-image"
                            />
                            <div className="branch-slide-dots">
                                {activeBranch.images.map((image, index) => (
                                    <button
                                        key={image}
                                        type="button"
                                        className={`branch-slide-dot ${index === currentSlide ? "active" : ""}`}
                                        onClick={() => setCurrentSlide(index)}
                                        aria-label={`View branch image ${index + 1}`}
                                    />
                                ))}
                            </div>
                        </div>

                        <div className="branch-content">
                            <div className="branch-content-header">
                                <span className="branch-label">{activeBranch.label}</span>
                                <h3>{activeBranch.name}</h3>
                                <p>{activeBranch.description}</p>
                            </div>

                            <div className="branch-meta-grid">
                                <div className="branch-meta-item">
                                    <MapPinned size={18} />
                                    <div>
                                        <strong>Address</strong>
                                        <span>{activeBranch.address}</span>
                                    </div>
                                </div>
                                <div className="branch-meta-item">
                                    <Phone size={18} />
                                    <div>
                                        <strong>Contact</strong>
                                        <span>
                                            {activeBranch.contact.phone}
                                            {activeBranch.contact.tel ? ` · ${activeBranch.contact.tel}` : ""}
                                            {activeBranch.contact.email ? ` · ${activeBranch.contact.email}` : ""}
                                        </span>
                                    </div>
                                </div>
                                <div className="branch-meta-item">
                                    <Clock3 size={18} />
                                    <div>
                                        <strong>Opening hours</strong>
                                        <span>{activeBranch.hours}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="branch-highlights">
                                {activeBranch.highlights.map((item) => (
                                    <span key={item} className="highlight-pill">{item}</span>
                                ))}
                            </div>

                            <div className="branch-map-shell">
                                <MapComponent position={activeBranch.location} />
                            </div>
                        </div>
                    </div>
                </section>

                <section className="awards-section">
                    <div className="store-section-heading">
                        <span className="store-kicker">Recognition</span>
                        <h2>Brand awards and dealer credentials</h2>
                        <p>
                            These recognitions help customers understand the business relationships
                            and trust signals behind the Lucky Impex storefront.
                        </p>
                    </div>

                    <div className="awards-grid">
                        {awards.map((award) => (
                            <article key={`${award.name}-${award.year}`} className="award-panel">
                                <div className="award-icon-wrap">
                                    <img src={`/${award.image}`} alt={award.name} />
                                </div>
                                <div className="award-copy">
                                    <span className="award-year"><Trophy size={15} /> {award.year}</span>
                                    <h3>{award.name}</h3>
                                </div>
                            </article>
                        ))}
                    </div>
                </section>

                <section className="store-contact-shell">
                    <ContactComponent embedded />
                </section>
            </main>

            <Footer />
        </div>
    );
};

export default StoreComponent;
