import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { BadgePercent, Headphones, MapPin, ShieldCheck } from "lucide-react";
import Header from "../../Components/Header";
import Footer from "../../Components/Footer";

import HeroSlider from "./HeroSlider";
import Categories from "./Categories";
import PromoBanner from "./PromoBanner";
import BrandsCarousel from "./BrandsCarousel";
import WhyChooseUs from "./WhyChooseUs";
import CustomerSupport from "./CustomerSupport";
import "./Home.css"

const Home = () => {
    const [isNewYear, setIsNewYear] = useState(false);

    useEffect(() => {
        const today = new Date();
        if (today.getMonth() === 0 && today.getDate() === 1) {
            setIsNewYear(true);
        }
    }, []);

    return (
        <div className="home-page">
            <Helmet>
                <title>Home - Lucky Impex</title>
                <meta name="description" content="Your one-stop shop for electronics and home appliances." />
                <meta name="keywords" content="electronics, appliances, AC, refrigerator, washing machine, TV, kitchen appliances" />
                <link rel="canonical" href="https://luckyimpex.netlify.app" />
            </Helmet>

            <Header />
            <main className="home-main">
                <HeroSlider />

                <section className="home-proof-strip">
                    <div className="home-proof-item">
                        <ShieldCheck size={22} />
                        <div>
                            <strong>Authorized multi-brand dealer</strong>
                            <span>Trusted electronics and appliance partners.</span>
                        </div>
                    </div>
                    <div className="home-proof-item">
                        <BadgePercent size={22} />
                        <div>
                            <strong>Offers that stay practical</strong>
                            <span>EMI, exchange deals, and seasonal promotions.</span>
                        </div>
                    </div>
                    <div className="home-proof-item">
                        <MapPin size={22} />
                        <div>
                            <strong>Physical store presence</strong>
                            <span>Reach branches, support, and local guidance easily.</span>
                        </div>
                    </div>
                    <div className="home-proof-item">
                        <Headphones size={22} />
                        <div>
                            <strong>Real customer assistance</strong>
                            <span>Product help before and after purchase.</span>
                        </div>
                    </div>
                </section>

                <Categories />
                <PromoBanner isNewYear={isNewYear} />
                <BrandsCarousel />

                <section className="home-editorial">
                    <div className="home-editorial-copy">
                        <span className="section-kicker">Store Experience</span>
                        <h2>Built for customers buying real appliances, not just browsing banners.</h2>
                        <p>
                            Lucky Impex is positioned like a modern retail storefront: category-led
                            discovery, dependable brand access, practical financing routes, and
                            customer support that stays visible across the buying journey.
                        </p>
                    </div>
                    <div className="home-editorial-grid">
                        <article className="editorial-card">
                            <span className="editorial-index">01</span>
                            <h3>Category-first shopping</h3>
                            <p>ACs, refrigerators, washing machines, TVs, and kitchen products are surfaced clearly for faster decisions.</p>
                        </article>
                        <article className="editorial-card">
                            <span className="editorial-index">02</span>
                            <h3>Brand trust with local support</h3>
                            <p>Recognized appliance brands are backed by a visible physical business presence and customer contact path.</p>
                        </article>
                        <article className="editorial-card">
                            <span className="editorial-index">03</span>
                            <h3>Conversion-focused offers</h3>
                            <p>EMI and exchange journeys are not hidden. They are placed where customers expect them during product discovery.</p>
                        </article>
                    </div>
                </section>

                <WhyChooseUs />
                <CustomerSupport />
            </main>
            <a
                href="https://wa.me/9779809278236?text=Hello%20Lucky%20Impex,%20I%20want%20more%20information."
                className="floating-whatsapp"
                target="_blank"
                rel="noopener noreferrer"
            >
                <img src="/whatsapp.png" alt="WhatsApp" />
            </a>

            <Footer />
        </div>
    );
};

export default Home;
