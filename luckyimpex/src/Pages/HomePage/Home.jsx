import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
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
        <div>
            <Helmet>
                <title>Home - Lucky Impex</title>
                <meta name="description" content="Your one-stop shop for electronics and home appliances." />
                <meta name="keywords" content="electronics, appliances, AC, refrigerator, washing machine, TV, kitchen appliances" />
                <link rel="canonical" href="https://luckyimpex.netlify.app" />
            </Helmet>

            <Header />

            <HeroSlider />
            <Categories />
            <PromoBanner isNewYear={isNewYear} />
            <BrandsCarousel />
            <WhyChooseUs />
            <CustomerSupport />
            <a
                href="https://wa.me/9779809278236?text=Hello%20Lucky%20Impex,%20I%20want%20more%20information."
                className="floating-whatsapp"
                target="_blank"
                rel="noopener noreferrer"
            >
                <img src="/whatsapp.png" alt="whatsaap" />
            </a>

            <Footer />
        </div>
    );
};

export default Home;
