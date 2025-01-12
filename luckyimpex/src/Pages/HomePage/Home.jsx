import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import Header from "../../Components/Header";
import Footer from "../../Components/Footer";
import { useNavigate } from "react-router-dom";
import NewYear from "../../Components/Newyear";
import { Link } from "react-router-dom";

import luckyImage from '../../Images/lucky.png';
import backimg from '../../Images/backimg.jpg';
import back01 from '../../Images/back01.png';
import back02 from '../../Images/back04.jpg';
import back03 from '../../Images/back03.jpg';

const navigateTo = (navigate, path) => {
    navigate(path);
};

const ProductCategory = React.memo(({ category }) => {
    const { name, description, icon } = category;
    const navigate = useNavigate();

    const handleCategoryVisit = () => {
        navigateTo(navigate, `/products/${category.name}`);
    };

    return (
        <div className="category-item">
            <div className="category-content">
                {icon && <img src={icon} alt={`${name} icon`} className="category-icon" />}
                <h3>{name}</h3>
                <p>{description}</p>
                <button
                    className="category-button"
                    aria-label={`Explore ${name}`}
                    onClick={handleCategoryVisit}
                >
                    Explore
                </button>
            </div>
        </div>
    );
});

const Home = () => {
    const navigate = useNavigate();
    const [isNewYear, setIsNewYear] = useState(false);
    const [currentSlide, setCurrentSlide] = useState(0);


    const images = [backimg, back01, back02, back03, luckyImage];
    const nextSlide = () => setCurrentSlide((prevSlide) => (prevSlide + 1) % images.length);

    useEffect(() => {
        const intervalId = setInterval(nextSlide, 4000);
        return () => clearInterval(intervalId);
    }, []);

    // Check if today is New Year's Day (January 1st)
    useEffect(() => {
        const today = new Date();
        const month = today.getMonth(); // January is month 0
        const day = today.getDate();

        if (month === 0 && day === 1) {
            setIsNewYear(true); // Set state to true if it's January 1st
        } else {
            setIsNewYear(false); // Otherwise, set it to false
        }
    }, []);

    const categories = [
        { name: 'AirConditioners', description: 'Keep your space cool and comfortable with our energy-efficient air conditioners from trusted brands.' },
        { name: 'Refrigerators', description: 'High-performance refrigerators designed to preserve your food fresh for longer, with sleek designs.' },
        { name: 'WashingMachines', description: 'Efficient and durable washing machines to make laundry easier and faster, with modern features.' },
        { name: 'LEDTelevisions', description: 'Experience stunning visuals and immersive sound with our range of high-quality LED televisions.' },
        { name: 'KitchenAppliances', description: 'Innovative and practical kitchen gadgets to help you prepare delicious meals with ease.' },
        { name: 'Chimney', description: 'Kitchen Chimney makes your daily life easy, comfortable, and promotes healthy living. Choose your desired chimney today.' },
        { name: 'HomeAppliances', description: 'A wide variety of home appliances that bring convenience and efficiency to your daily life.' },
        { name: 'HomeTheater', description: 'A wide variety of home appliances that bring convenience and efficiency to your daily life.' },
        { name: 'AirCooler', description: 'Find a variety of air coolers from different brands, types and capacities and make your life easy.' },
        { name: 'ChestFreezer', description: 'Keep your food safe, healthy, and make your day better.' }
    ];

    const handleBrandSearch = (brand) => {
        navigateTo(navigate, `/products/brand/${brand}`);
    };

    const handleContact = () => navigateTo(navigate, '/contact');
    const handleShop = () => navigateTo(navigate, '/products');

    return (
        <div>
            <Helmet>
                <title>Home - Lucky Impex</title>
                <meta name="description" content="Your one-stop shop for amazing products!" />
            </Helmet>

            <Header />
            <div className="home-main">
                <div className="image">

                    <img src={images[currentSlide]} alt={`Slide ${currentSlide + 1}`} className="slider-image" />
                </div>

            </div>


            {/* Product Categories Section */}
            <div className="card-container">
                <h1>Our Products</h1>
                <div className="category-list">
                    {categories.map((category) => (
                        <ProductCategory key={category.name} category={category} />
                    ))}
                </div>
            </div>


            <section className="hero-section">
                {isNewYear ? (
                    <NewYear /> // Render the NewYear component if it's New Year's Day
                ) : (
                    <>
                        <div className="promo-banner">
                            <h1>Our Exciting Offers!</h1>
                            <div className="promo-banner-details">
                                <p>Get the best deals on top brands!</p>
                                <p>🔥 Flash Sale: 20% OFF on all electronics! Don't miss out!</p>
                                <button className="promo-button" onClick={handleShop}>Shop Now</button>
                            </div>
                            <div className="offers">

                                <div className="offers-list">
                                    <Link to="/emi" className="offer">EMI Available</Link>
                                    <Link to="/exchange" className="offer">Exchange Available</Link>

                                </div>

                            </div>
                        </div>

                        <div className="brands">
                            <span> We offer a wide range of top-quality products from trusted brands like LG, Samsung, Whirlpool, Haier, CG, Videocon, Skyworth, Hyundai, Symphony, Bajaj and Maharaja.</span>
                        </div>
                    </>
                )}
            </section>
            {/* Testimonials Section */}
            <section className="testimonials">
                <h2>Our Top Deal Brands</h2>
                <div className="brand-list">
                    <ul className="brand-list-items">
                        <button className="brand-logo" onClick={() => handleBrandSearch("LG")}><img src="/lg.png" alt="LG" /></button>
                        <button className="brand-logo" onClick={() => handleBrandSearch("Samsung")}><img src="/samsung.png" alt="samsung" /></button>
                        <button className="brand-logo" onClick={() => handleBrandSearch("Whirlpool")}><img src="/whirlpool.png" alt="Whirlpool" /></button>
                        <button className="brand-logo" onClick={() => handleBrandSearch("Haier")}><img src="/haier.svg" alt="haier" /></button>
                        <button className="brand-logo" onClick={() => handleBrandSearch("CG")}><img src="/cg.svg" alt="cg" /></button>
                        <button className="brand-logo" onClick={() => handleBrandSearch("Videocon")}><img src="/videocon.png" alt="videocon" /></button>
                        <button className="brand-logo" onClick={() => handleBrandSearch("Skyworth")}><img src="/skyworth.png" alt="skyworth" /></button>
                        <button className="brand-logo" onClick={() => handleBrandSearch("Symphony")}><img src="/symphony.png" alt="symphony" /></button>
                        <button className="brand-logo" onClick={() => handleBrandSearch("Bajaj")}><img src="/bajaj.png" alt="bajaj" /></button>
                    </ul>
                </div>
            </section>
            {/* Why Choose Us Section */}
            <section className="why-choose-us">
                <h2>Why Choose Lucky Impex?</h2>
                <ul>
                    <li><strong>Wide Selection:</strong> Choose from a wide range of electronics and home appliances, handpicked for their quality and value.</li>
                    <li><strong>Fast Shipping:</strong> Get your orders delivered quickly and securely with our fast shipping options.</li>
                    <li><strong>Customer Satisfaction:</strong> Enjoy excellent customer service with easy returns, support, and warranties on many products.</li>
                    <li><strong>Exclusive Offers:</strong> Take advantage of special promotions, discounts, and flash sales that are available only to our customers.</li>
                </ul>
            </section>

            {/* Customer Support Section */}
            <section className="customer-support">
                <h2>Need Help?</h2>
                <p>Our customer service team is available to assist you with any questions, issues, or inquiries you may have. Whether you need help with a product, shipping details, or returns, we’re here for you!</p>
                <button className="contact-button" onClick={handleContact}>Contact Us</button>
            </section>

            <Footer />
        </div>
    );
};

export default Home;
