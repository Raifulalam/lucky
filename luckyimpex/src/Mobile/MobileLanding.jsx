import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Header from '../Components/Header';
import Footer from '../Components/Footer';
import PageSeo from '../Components/PageSeo';
import Featured from './Featured';
import Accessories from './Accessories';
import { 
    MoveRight, 
    ShieldCheck, 
    CreditCard, 
    RefreshCw, 
    Truck, 
    Zap, 
    Smartphone, 
    Cpu, 
    Camera, 
    BatteryCharging, 
    Award, 
    CheckCircle2, 
    PhoneCall, 
    Store,
    ArrowRight
} from 'lucide-react';
import './mobile.css';

export default function MobileLanding() {
    const navigate = useNavigate();

    const brands = [
        {
            name: "Apple",
            tagline: "iPhone 16 Pro · A18 Pro",
            badge: "Top Flagship",
            logo: "https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg",
            link: "/mobile products?brand=Apple",
            accent: "from-slate-900 to-slate-700"
        },
        {
            name: "Samsung",
            tagline: "Galaxy S25 Ultra · AI Phone",
            badge: "Best Seller",
            logo: "https://upload.wikimedia.org/wikipedia/commons/2/24/Samsung_Logo.svg",
            link: "/mobile products?brand=Samsung",
            accent: "from-blue-900 to-indigo-800"
        },
        {
            name: "OnePlus",
            tagline: "OnePlus 13 · 100W Fast",
            badge: "Speed King",
            logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/OnePlus_logo.svg/320px-OnePlus_logo.svg.png",
            link: "/mobile products?brand=OnePlus",
            accent: "from-red-900 to-rose-800"
        },
        {
            name: "Xiaomi",
            tagline: "15 Ultra · Leica Camera",
            badge: "Pro Optics",
            logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ae/Xiaomi_logo_%282021-%29.svg/320px-Xiaomi_logo_%282021-%29.svg.png",
            link: "/mobile products?brand=Xiaomi",
            accent: "from-orange-900 to-amber-800"
        },
        {
            name: "Vivo",
            tagline: "V-Series · ZEISS Portrait",
            badge: "Studio Camera",
            logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/Vivo_mobile_logo.png/320px-Vivo_mobile_logo.png",
            link: "/mobile products?brand=Vivo",
            accent: "from-sky-900 to-blue-800"
        },
        {
            name: "Realme",
            tagline: "GT Series · Gaming Edge",
            badge: "Value Power",
            logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Realme_logo.svg/320px-Realme_logo.svg.png",
            link: "/mobile products?brand=Realme",
            accent: "from-yellow-900 to-amber-700"
        }
    ];

    const budgetTiers = [
        {
            title: "Flagship Elite",
            range: "Above Rs. 90,000",
            desc: "Maximum camera zoom, titanium chassis, 120Hz LTPO displays and Snapdragon 8 Elite / Apple A18 Pro silicon.",
            models: ["iPhone 16 Pro Max", "Samsung S25 Ultra", "Xiaomi 15 Ultra"],
            cta: "View Flagships",
            link: "/mobile products?sort=high"
        },
        {
            title: "Performance & Pro",
            range: "Rs. 40,000 – Rs. 90,000",
            desc: "The sweet spot of flagship-killer speeds, 100W hyper-charging, Sony optical sensors, and 5G dual SIM connectivity.",
            models: ["OnePlus 13", "Galaxy A55 5G", "Xiaomi 14T Pro"],
            cta: "View Mid-Range",
            link: "/mobile products"
        },
        {
            title: "Value & Everyday 5G",
            range: "Under Rs. 40,000",
            desc: "Unbeatable daily battery endurance, smooth 90Hz/120Hz AMOLED screens, crisp cameras and reliable warranty coverage.",
            models: ["Redmi Note 13", "Vivo Y200", "Realme 12 5G"],
            cta: "View Budget Phones",
            link: "/mobile products?sort=low"
        }
    ];

    return (
        <div className="mobile-page-root">
            {/* SEO Metadata */}
            <PageSeo
                title="Smartphones & Mobile Phones Birgunj Nepal"
                description="Official Apple iPhone, Samsung Galaxy, OnePlus, Xiaomi & Vivo 5G smartphones at Lucky Impex Birgunj. 0% EMI financing, exchange bonus, MDMS verified & warranty."
                canonicalPath="/mobiles"
                localBusiness
                breadcrumbs={[
                    { label: "Home", to: "/" },
                    { label: "Mobiles" },
                ]}
            />

            {/* Main Header */}
            <Header />

            <main className="mobile-page-main">
                {/* 1. LUXURY FLAGSHIP HERO SECTION */}
                <section className="mobile-hero-luxury">
                    <div className="hero-glow-blob blob-purple"></div>
                    <div className="hero-glow-blob blob-blue"></div>
                    <div className="hero-glow-blob blob-amber"></div>

                    <div className="hero-inner-container">
                        <div className="hero-text-column">
                            <div className="hero-badge-pill">
                                <Zap size={14} className="badge-icon-accent" />
                                <span>OFFICIAL 2025/2026 SMARTPHONE SHOWROOM</span>
                            </div>

                            <h1 className="hero-main-heading">
                                Next-Gen Smartphones.
                                <span className="hero-gradient-text">Genuine Nepal Warranty.</span>
                            </h1>

                            <p className="hero-subtext">
                                Experience ultra-fast 5G, pro-grade camera optics, and all-day endurance. 
                                Official MDMS registered smartphones with 0% EMI financing and showroom pickup 
                                at Ghantaghar Link Road, Birgunj.
                            </p>

                            <div className="hero-action-group">
                                <button
                                    type="button"
                                    className="btn-hero-primary"
                                    onClick={() => navigate('/mobile products')}
                                >
                                    <span>Explore All Mobiles</span>
                                    <MoveRight size={18} />
                                </button>
                                <button
                                    type="button"
                                    className="btn-hero-secondary"
                                    onClick={() => navigate('/emi')}
                                >
                                    <CreditCard size={17} />
                                    <span>0% EMI Plans</span>
                                </button>
                                <button
                                    type="button"
                                    className="btn-hero-outline"
                                    onClick={() => navigate('/exchange')}
                                >
                                    <RefreshCw size={17} />
                                    <span>Trade-In Exchange</span>
                                </button>
                            </div>

                            {/* Trust KPI Strip */}
                            <div className="hero-kpi-strip">
                                <div className="kpi-item">
                                    <ShieldCheck size={18} className="kpi-icon text-amber" />
                                    <div>
                                        <strong>MDMS Certified</strong>
                                        <span>100% Legal & Approved</span>
                                    </div>
                                </div>
                                <div className="kpi-item">
                                    <Award size={18} className="kpi-icon text-emerald" />
                                    <div>
                                        <strong>1-Year Warranty</strong>
                                        <span>Official Brand Bill</span>
                                    </div>
                                </div>
                                <div className="kpi-item">
                                    <Truck size={18} className="kpi-icon text-blue" />
                                    <div>
                                        <strong>Express Delivery</strong>
                                        <span>Birgunj & Nationwide</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Hero Right Visual Spotlight Display */}
                        <div className="hero-visual-column">
                            <div className="spotlight-card-wrapper">
                                <div className="spotlight-card">
                                    <div className="spotlight-badge">FLAGSHIP OF THE YEAR</div>
                                    <img
                                        src="https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800&auto=format&fit=crop&q=80"
                                        alt="Samsung Galaxy S25 Ultra"
                                        className="spotlight-phone-img"
                                    />
                                    <div className="spotlight-info">
                                        <div className="spotlight-title-row">
                                            <h3>Galaxy S25 Ultra</h3>
                                            <span className="price-tag">Rs. 1,59,999</span>
                                        </div>
                                        <p>Snapdragon 8 Elite · 200MP Camera · Titanium Frame</p>
                                    </div>
                                </div>

                                {/* Floating Specs Chips */}
                                <div className="floating-chip chip-1">
                                    <Cpu size={14} className="chip-icon" />
                                    <span>Snapdragon 8 Elite</span>
                                </div>
                                <div className="floating-chip chip-2">
                                    <Camera size={14} className="chip-icon" />
                                    <span>200MP Quad Optics</span>
                                </div>
                                <div className="floating-chip chip-3">
                                    <BatteryCharging size={14} className="chip-icon" />
                                    <span>5000mAh · 45W Fast</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 2. SHOP BY BRAND HUB */}
                <section className="mobile-brands-section">
                    <div className="brands-container">
                        <div className="section-header-block">
                            <div className="section-title-wrap">
                                <span className="section-eyebrow">
                                    <Smartphone size={14} /> AUTHORIZED DEALERSHIPS
                                </span>
                                <h2 className="section-title">Shop by Smartphone Brand</h2>
                                <p className="section-desc">
                                    Official authorized partner showrooms with manufacturer warranty and original VAT invoices.
                                </p>
                            </div>
                        </div>

                        <div className="brands-showcase-grid">
                            {brands.map((b) => (
                                <Link
                                    key={b.name}
                                    to={b.link}
                                    className="brand-card-modern"
                                >
                                    <div className="brand-card-top">
                                        <span className="brand-name-text">{b.name}</span>
                                        <span className="brand-badge-pill">{b.badge}</span>
                                    </div>
                                    <p className="brand-tagline-text">{b.tagline}</p>
                                    <div className="brand-card-bottom">
                                        <span className="explore-text">Explore {b.name}</span>
                                        <ArrowRight size={15} className="arrow-icon" />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>

                {/* 3. FEATURED FLAGSHIPS & 5G BEST SELLERS */}
                <Featured />

                {/* 4. BROWSE BY BUDGET SEGMENT */}
                <section className="mobile-budget-section">
                    <div className="budget-container">
                        <div className="section-header-block text-center">
                            <span className="section-eyebrow">
                                <CreditCard size={14} /> CURATED PRICE BRACKETS
                            </span>
                            <h2 className="section-title">Find a Phone for Every Budget</h2>
                            <p className="section-desc">
                                From premium titanium flagships to daily value powerhouses with 5G connectivity.
                            </p>
                        </div>

                        <div className="budget-cards-grid">
                            {budgetTiers.map((tier, idx) => (
                                <div key={tier.title} className={`budget-tier-card tier-${idx + 1}`}>
                                    <div className="tier-header">
                                        <span className="tier-range-pill">{tier.range}</span>
                                        <h3 className="tier-title">{tier.title}</h3>
                                        <p className="tier-desc">{tier.desc}</p>
                                    </div>

                                    <div className="tier-models-list">
                                        <span className="models-label">Popular in this tier:</span>
                                        {tier.models.map((m) => (
                                            <div key={m} className="model-check-item">
                                                <CheckCircle2 size={14} className="check-icon" />
                                                <span>{m}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <Link to={tier.link} className="btn-tier-cta">
                                        <span>{tier.cta}</span>
                                        <ArrowRight size={15} />
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* 5. 0% EMI & SMARTPHONE EXCHANGE DUO PROMO BANNER */}
                <section className="mobile-promo-duo-section">
                    <div className="promo-duo-container">
                        {/* Promo 1: 0% EMI */}
                        <div className="promo-duo-card card-emi">
                            <div className="promo-badge-tag">0% INTEREST EMI</div>
                            <h3>Own Your Dream Phone with Zero Extra Interest</h3>
                            <p>
                                Pay in convenient 6, 9, or 12-month installments via NIC Asia, Nabil, 
                                Global IME, Siddhartha, and top commercial credit cards.
                            </p>
                            <ul className="promo-perks-list">
                                <li>No hidden documentation fee</li>
                                <li>Instant in-store processing</li>
                                <li>Applies to all flagships over Rs. 30,000</li>
                            </ul>
                            <Link to="/emi" className="promo-btn emi-btn">
                                <span>Calculate EMI Plans</span>
                                <ArrowRight size={16} />
                            </Link>
                        </div>

                        {/* Promo 2: Exchange */}
                        <div className="promo-duo-card card-exchange">
                            <div className="promo-badge-tag">EXCHANGE & UPGRADE</div>
                            <h3>Trade-In Your Old Phone for Instant Credit</h3>
                            <p>
                                Bring your working Android phone or iPhone to Lucky Impex Birgunj. 
                                Get instant fair valuation and upgrade to the latest flagship today.
                            </p>
                            <ul className="promo-perks-list">
                                <li>Instant on-the-spot evaluation</li>
                                <li>Free data transfer to your new device</li>
                                <li>Additional exchange bonus up to Rs. 5,000</li>
                            </ul>
                            <Link to="/exchange" className="promo-btn exchange-btn">
                                <span>Exchange Your Phone</span>
                                <ArrowRight size={16} />
                            </Link>
                        </div>
                    </div>
                </section>

                {/* 6. MOBILE ACCESSORIES & SMART AUDIO */}
                <Accessories />

                {/* 7. SHOWROOM MDMS & TRUST GUARANTEE STRIP */}
                <section className="mobile-trust-strip-section">
                    <div className="trust-strip-container">
                        <div className="trust-header-row">
                            <div className="trust-main-copy">
                                <span className="trust-eyebrow">
                                    <Store size={15} /> GHANTAGHAR LINK ROAD, BIRGUNJ
                                </span>
                                <h2>Why Buy Your Smartphone at Lucky Impex?</h2>
                                <p>
                                    Nepal's trusted multi-brand showroom ensuring official MDMS compliance, 
                                    genuine manufacturer accessories, and post-purchase customer care.
                                </p>
                            </div>
                            <div className="trust-cta-wrap">
                                <a
                                    href="https://wa.me/9779802594022?text=Hello%20Lucky%20Impex,%20I%20have%20an%20inquiry%20about%20mobile%20phones."
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn-whatsapp-desk"
                                >
                                    <span>Chat with Mobile Desk</span>
                                    <PhoneCall size={16} />
                                </a>
                            </div>
                        </div>

                        <div className="trust-points-grid">
                            <div className="trust-point-card">
                                <div className="point-icon-box">
                                    <ShieldCheck size={22} className="text-emerald" />
                                </div>
                                <h4>100% MDMS Registered</h4>
                                <p>No risk of network disconnection by NTA. All devices are legally imported with customs paid.</p>
                            </div>

                            <div className="trust-point-card">
                                <div className="point-icon-box">
                                    <Award size={22} className="text-amber" />
                                </div>
                                <h4>1-Year Official Warranty</h4>
                                <p>National brand service center support across Nepal with legitimate VAT invoices.</p>
                            </div>

                            <div className="trust-point-card">
                                <div className="point-icon-box">
                                    <Zap size={22} className="text-blue" />
                                </div>
                                <h4>Free In-Store Setup</h4>
                                <p>Our technicians help you transfer WhatsApp, contacts, and photos from your old device for free.</p>
                            </div>

                            <div className="trust-point-card">
                                <div className="point-icon-box">
                                    <Store size={22} className="text-purple" />
                                </div>
                                <h4>Showroom Inspection</h4>
                                <p>Hold and test the phone in person before purchasing at our Birgunj showroom.</p>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <Footer />
        </div>
    );
}
