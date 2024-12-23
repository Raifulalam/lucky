import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import Header from "../../Components/Header";
import Footer from "../../Components/Footer";
import { useNavigate } from "react-router-dom";

// Refactor navigation handling into a utility function
const navigateTo = (navigate, path) => {
    navigate(path);
};

// Reusable Product Category Component (Memoized)
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
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        // Fetch Categories with error handling
        const fetchCategories = async () => {
            try {
                const response = await fetch('https://lucky-back-2.onrender.com/api/productCategories');
                if (!response.ok) {
                    throw new Error('Failed to fetch categories');
                }
                const data = await response.json();
                setCategories(data);
                setLoading(false);
            } catch (err) {
                setError('Failed to fetch categories. Please try again.');
                setLoading(false);
            }
        };

        fetchCategories();
    }, []);

    const handleContact = () => navigateTo(navigate, '/contact');
    const handleShop = () => navigateTo(navigate, '/products');

    if (loading) {
        return (
            <div className="loading-spinner">
                <div className="spinner"></div>
                <p>Loading categories...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-message">
                <p>{error}</p>
                <button onClick={() => window.location.reload()}>Retry</button>
            </div>
        );
    }

    return (
        <div>
            <Helmet>
                <title>Home - Lucky Impex</title>
                <meta name="description" content="Your one-stop shop for amazing products!" />
            </Helmet>

            <Header />

            {/* Hero Section */}
            <section className="hero-section">


                <div className="promo-banner">
                    <h1>Welcome to Lucky Impex</h1>
                    <div className="promo-banner-details">
                        <p>Get the best deals on top brands!</p>
                        <p>🔥 Flash Sale: 20% OFF on all electronics! Don't miss out!</p>
                        <button className="promo-button" onClick={handleShop}>Shop Now</button>
                    </div>
                </div>
                <div className="brands">

                    <span>We deal in a wide range of brands like LG, CG, WHIRLPOOL, SAMSUNG, HAIER, VIDEOCON , HYUNDAI and more.... </span>


                </div>
            </section>




            {/* About Us Section */}
            <section className="about-us">
                <h2>About Lucky Impex</h2>
                <p>
                    At Lucky Impex, we are committed to providing our customers with top-quality products that bring convenience, comfort, and innovation to their homes and businesses. Whether you're upgrading your living room, kitchen, or office, we offer a diverse selection of electronics and home appliances that meet your needs and exceed your expectations.
                </p>
                <p>
                    With years of experience in the industry, we strive to deliver exceptional customer service and value, offering both affordable and premium products. Explore our wide variety of categories, and discover why Lucky Impex is the best place to find your next home or tech upgrade.
                </p>
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

            {/* Product Categories Section */}
            <div className="app-container">
                <h1>Our Products</h1>
                <div className="category-list">
                    {categories.map((category) => (
                        <ProductCategory key={category.name} category={category} />
                    ))}
                </div>
            </div>

            {/* Testimonials Section */}
            <section className="testimonials">
                <h2>What Our Customers Say</h2>
                <div className="testimonial-list">
                    <div className="testimonial">
                        <p>"Great products, fast delivery, and excellent customer service. Highly recommend!"</p>
                        <h4>- John Doe</h4>
                    </div>
                    <div className="testimonial">
                        <p>"I've bought multiple appliances from Lucky Impex, and each one exceeded my expectations."</p>
                        <h4>- Jane Smith</h4>
                    </div>
                </div>
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
