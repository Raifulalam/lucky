import React from "react";
import { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import Header from "../../Components/Header";
import Footer from "../../Components/Footer";
import { useNavigate } from "react-router-dom";


// Reusable Product Category Component (Simplified)
const ProductCategory = React.memo(({ category }) => {
    const { name, description, icon } = category;
    const navigate = useNavigate();

    const handleCategoryVisitor = () => {
        navigate(`/products/${category.name}`); // Corrected string interpolation
    };

    return (
        <div className="category-item">
            <div className="category-content">
                <h3>{name}</h3>
                <p>{description}</p>
                <button className="category-button" aria-label={`Explore ${name}`} onClick={handleCategoryVisitor}>Explore</button>
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
        // Define the async function inside useEffect
        const fetchCategories = async () => {
            try {
                const response = await fetch('https://lucky-back.onrender.com/api/productCategories');
                // Check if the response is OK before parsing it
                if (!response.ok) {
                    throw new Error('Failed to fetch categories');
                }
                const data = await response.json();
                setCategories(data);  // Assuming data is an array of categories
                setLoading(false);
            } catch (err) {
                setError('Failed to fetch categories');
                setLoading(false);
            }
        };

        fetchCategories();

    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    const handleContact = () => {
        navigate('/contact')
    }
    const handleShop = () => {
        navigate('/products')
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
                    <div className="promo-banner">
                        <p>Get the best deals on top brands!</p>
                        <p>🔥 Flash Sale: 20% OFF on all electronics! Don't miss out!</p>
                        <button className="promo-button" aria-label="Shop Now" onClick={handleShop}>Shop Now</button>
                    </div>
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
                    {categories.map((category, index) => (
                        <ProductCategory key={index} category={category} />
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
                <button className="contact-button" aria-label="Contact Us" onClick={handleContact}>Contact Us</button>
            </section>

            <Footer />
        </div>
    );
};

export default Home;
