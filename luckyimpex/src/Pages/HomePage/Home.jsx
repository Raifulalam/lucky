// import React, { useEffect, useState } from "react";
import Header from "../../Components/Header";
import Footer from "../../Components/Footer";
import PageSeo from "../../Components/PageSeo";
import MobileActionBar from "../../Components/MobileActionBar";
import { WholesaleProvider } from "../../Components/WholesaleContext";
import { SITE_CONFIG } from "../../seo/siteConfig";

import HeroSlider from "./HeroSlider";
import TrustBadgesStrip from "./TrustBadgesStrip";
import CategoryGrid from "./CategoryGrid";
import ProductListingSection from "./ProductListingSection";
import WholesaleRFQBanner from "./WholesaleRFQBanner";
import ShowroomHub from "./ShowroomHub";
import BrandsCarousel from "./BrandsCarousel";
import WhyChooseUs from "./WhyChooseUs";

// import PromoModal from "./PromoModal";

import "./Home.css";

const HomeContent = () => {
    // const [showPromo, setShowPromo] = useState(false);

    // useEffect(() => {
    //     // Show promo modal once per session
    //     const alreadyShown = sessionStorage.getItem("promoShown");
    //     if (!alreadyShown) {
    //         const timer = setTimeout(() => {
    //             setShowPromo(true);
    //             sessionStorage.setItem("promoShown", "true");
    //         }, 3500);
    //         return () => clearTimeout(timer);
    //     }
    // }, []);

    return (
        <div className="home-page">
            {/* SEO Metadata */}
            <PageSeo
                title="Lucky Impex | Birgunj Home Appliances | CG, LG, Haier"
                description="Shop genuine electronics & home appliances at Lucky Impex, Birgunj. Official retailer & wholesale distributor in Nepal with warranty, EMI & store pickup."
                canonicalPath="/"
                localBusiness
                faq={SITE_CONFIG.faqs}
            />

            {/* Promotional Ad Modal */}
            {/* <PromoModal
                open={showPromo}
                onClose={() => setShowPromo(false)}
            /> */}

            {/* 1. TOP UTILITY & MAIN STICKY NAVIGATION */}
            <Header />

            <main className="home-main">
                {/* 2. DYNAMIC DUAL-TRACK HERO SECTION */}
                <HeroSlider />

                {/* 3. TRUST BADGES STRIP */}
                <TrustBadgesStrip />

                {/* 4. VISUAL CATEGORY GRID (2x4) */}
                <CategoryGrid />

                {/* 5. HYBRID PRODUCT LISTING CARDS (Dynamic Retail / Wholesale Pricing) */}
                <ProductListingSection />

                {/* 6. INTERACTIVE B2B / WHOLESALE RFQ BANNER */}
                <WholesaleRFQBanner />

                {/* 7. BIRGUNJ SHOWROOM & LOCATION HUB */}
                <ShowroomHub />

                {/* PARTNER BRANDS CAROUSEL */}
                <section className="home-brands-shell">
                    <div className="home-brands-inner">
                        <div className="brands-title-row">
                            <span className="section-pill">Authorized Brand Partners</span>
                            <h3>Official Brand Dealerships & Certified Distribution</h3>
                        </div>
                        <BrandsCarousel />
                    </div>
                </section>

                {/* STORE VALUE PILLARS & SUPPORT */}
                <WhyChooseUs />

                {/* CONTACT INFORMATION */}
                <section className="home-contact-shell">
                    <div className="home-contact-inner">
                        <div className="contact-header-copy">
                            <span className="section-pill">Visit Our Store</span>
                            <h2>Contact Lucky Impex</h2>
                        </div>
                        <div className="contact-info-grid">
                            <div className="contact-info-item">
                                <h3>Store Address</h3>
                                <p>{SITE_CONFIG.address.streetAddress}, {SITE_CONFIG.address.addressLocality}, {SITE_CONFIG.address.addressRegion}, Nepal</p>
                                <p>Postal Code: {SITE_CONFIG.address.postalCode}</p>
                            </div>
                            <div className="contact-info-item">
                                <h3>Phone & WhatsApp</h3>
                                <p>Phone: {SITE_CONFIG.phone}</p>
                                <p>WhatsApp: {SITE_CONFIG.whatsappDisplay}</p>
                            </div>
                            <div className="contact-info-item">
                                <h3>Store Hours</h3>
                                <p>Monday - Friday & Sunday: 10:00 AM - 8:00 PM</p>
                                <p>Saturday: 10:00 AM - 3:00 PM</p>
                            </div>
                            <div className="contact-info-item">
                                <h3>Email</h3>
                                <p>{SITE_CONFIG.supportEmail}</p>
                            </div>
                        </div>
                    </div>
                </section>


                {/* FREQUENTLY ASKED QUESTIONS */}
                <section className="home-faq-shell">
                    <div className="home-faq-inner">
                        <div className="faq-header-copy">
                            <span className="section-pill">Customer & Dealer FAQ</span>
                            <h2>Frequently Asked Questions</h2>
                            <p>
                                Everything you need to know about purchasing, EMI, wholesale pricing, and showroom visits in Birgunj.
                            </p>
                        </div>
                        <div className="home-faq-list">
                            {SITE_CONFIG.faqs.map((item) => (
                                <details key={item.question} className="home-faq-item">
                                    <summary>{item.question}</summary>
                                    <p>{item.answer}</p>
                                </details>
                            ))}
                            <details className="home-faq-item">
                                <summary>How does wholesale / B2B pricing work at Lucky Impex?</summary>
                                <p>
                                    Wholesale rates are quoted per order. Send the quick quote request on this page, visit our <a href="/wholesale">wholesale page</a>, or message us on WhatsApp at +977 9802594022 with the models and quantities you need.
                                </p>
                            </details>
                            <details className="home-faq-item">
                                <summary>Can I test and inspect products in person before purchasing?</summary>
                                <p>
                                    Yes, absolutely! Our primary showroom is located on <strong>Ghantaghar Link Road, Birgunj</strong>, open Sunday through Friday from 10:00 AM to 8:00 PM (Saturday till 3:00 PM). Live demos, immediate billing, and same-day takeaway are readily available.
                                </p>
                            </details>
                        </div>
                    </div>
                </section>
            </main>

            {/* 8. FOOTER & FIXED MOBILE ACTION BAR */}
            <Footer />
            <MobileActionBar />
        </div>
    );
};

const Home = () => {
    return (
        <WholesaleProvider>
            <HomeContent />
        </WholesaleProvider>
    );
};

export default Home;
