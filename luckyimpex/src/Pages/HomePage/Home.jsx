import React, { useEffect, useState } from "react";
import { BadgePercent, Headphones,  ShieldCheck } from "lucide-react";

import Header from "../../Components/Header";
import Footer from "../../Components/Footer";
import PageSeo from "../../Components/PageSeo";

import PromoModal from "./PromoModal";
import HeroSlider from "./HeroSlider";
import Categories from "./Categories";
import PromoBanner from "./PromoBanner";
import BrandsCarousel from "./BrandsCarousel";
import WhyChooseUs from "./WhyChooseUs";
import CustomerSupport from "./CustomerSupport";
import { SITE_CONFIG } from "../../seo/siteConfig";

import "./Home.css";

const Home = () => {
    const [isNewYear, setIsNewYear] = useState(false);
    const [showPromo, setShowPromo] = useState(false);

    useEffect(() => {
        const today = new Date();

        if (today.getMonth() === 0 && today.getDate() === 1) {
            setIsNewYear(true);
        }

        // ✅ CHECK IF ALREADY SHOWN IN THIS SESSION
        const alreadyShown = sessionStorage.getItem("promoShown");

        if (!alreadyShown) {
            const timer = setTimeout(() => {
                setShowPromo(true);
                sessionStorage.setItem("promoShown", "true"); // mark as shown
            }, 3000);

            return () => clearTimeout(timer);
        }
    }, []);

    return (
        <div className="home-page">

            {/* SEO */}
            <PageSeo
                title="Electronics & Home Appliances Store in Birgunj"
                description="Shop electronics and home appliances from Lucky Impex with trusted local support, clear product discovery, and fast browsing."
                canonicalPath="/"
                localBusiness
                faq={SITE_CONFIG.faqs}
            />

            {/* 🔥 PROMO MODAL (ADS POPUP) */}
            <PromoModal
                open={showPromo}
                onClose={() => setShowPromo(false)}
            />

            {/* HEADER */}
            <Header />

            {/* MAIN CONTENT */}
            <main className="home-main">

                <HeroSlider />

                {/* TRUST STRIP */}
                <section className="home-proof-strip">
                    <div className="home-proof-item">
                       
                        <div className="home-proof-item-content">
                             <ShieldCheck size={22} />
                            <strong>Authorized multi-brand dealer</strong>

                        </div>
                                                    <span>Trusted electronics and appliance partners.</span>
                    </div>

                    <div className="home-proof-item">
                       
                        <div className="home-proof-item-content">
                             <BadgePercent size={22} />
                            <strong>Offers that stay practical</strong>
                           
                        </div>
                         <span>EMI, exchange deals, and seasonal promotions.</span>
                    </div>

                    <div className="home-proof-item">
                       
                        <div className="home-proof-item-content">

                            <strong>Physical store presence</strong>
                           
                        </div>
                         <span>Reach branches, support, and local guidance easily.</span>
                    </div>

                    <div className="home-proof-item">
                        
                        <div className="home-proof-item-content">
                            <Headphones size={22} />
                            <strong>Real customer assistance</strong>
                           
                        </div>
                         <span>Product help before and after purchase.</span>
                    </div>
                </section>

                {/* COMPONENTS */}
                <Categories />
                <PromoBanner isNewYear={isNewYear} />
                <BrandsCarousel />

                {/* EDITORIAL SECTION */}
               <section className="home-editorial">
    <div className="home-editorial-copy">
        <span className="section-kicker">Store Experience</span>

        <h2>Built for a better appliance shopping experience</h2>

        <p>
            Lucky Impex is positioned like a modern retail storefront: category-led
            discovery, dependable brand access, practical financing routes, and
            customer support that stays visible across the buying journey.
        </p>
    </div>

    <div className="home-editorial-grid">
        <article className="editorial-card">
            <div className="editorial-head">
                <span className="editorial-index">01</span>
                <h3>Category-first shopping</h3>
            </div>

            <p>
                ACs, refrigerators, washing machines, TVs, and kitchen products are
                surfaced clearly for faster decisions.
            </p>
        </article>

        <article className="editorial-card">
            <div className="editorial-head">
                <span className="editorial-index">02</span>
                <h3>Brand trust with local support</h3>
            </div>

            <p>
                Recognized appliance brands are backed by a visible physical business
                presence and customer contact path.
            </p>
        </article>

        <article className="editorial-card">
            <div className="editorial-head">
                <span className="editorial-index">03</span>
                <h3>Conversion-focused offers</h3>
            </div>

            <p>
                EMI and exchange journeys are not hidden. They are placed where customers
                expect them during product discovery.
            </p>
        </article>
    </div>
</section>

                <WhyChooseUs />
                <CustomerSupport />

                <section className="home-faq">
                    <div className="home-editorial-copy">
                        <span className="section-kicker">Frequently Asked Questions</span>
                        <h2>Common shopping questions answered.</h2>
                        <p>
                            These answers help new customers understand delivery, store visits, support, and browsing options.
                        </p>
                    </div>
                    <div className="home-faq-list">
                        {SITE_CONFIG.faqs.map((item) => (
                            <details key={item.question} className="home-faq-item">
                                <summary>{item.question}</summary>
                                <p>{item.answer}</p>
                            </details>
                        ))}
                    </div>
                </section>
            </main>

            {/* WhatsApp Floating Button */}
            <a
                href="https://wa.me/9779809278236?text=Hello%20Lucky%20Impex,%20I%20want%20more%20information."
                className="floating-whatsapp"
                target="_blank"
                rel="noopener noreferrer"
            >
                <img src="/whatsapp.png" alt="WhatsApp" />
            </a>

            {/* FOOTER */}
            <Footer />
        </div>
    );
};

export default Home;
