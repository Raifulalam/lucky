import React, { useState, useEffect, useMemo } from 'react';
import './products.css';
import Header from '../../Components/Header';
import { useCartDispatch, useCartState } from '../../Components/CreateReducer';
import { useNavigate } from 'react-router-dom';
import '../../App.css';
import luckyImage from '../../Images/lucky.png';
import backimg from '../../Images/backimg.jpg';
import back01 from '../../Images/back01.png';
import back02 from '../../Images/back04.jpg';
import back03 from '../../Images/back03.jpg';

const Products = () => {
    const [products, setProducts] = useState([]); // Store products data
    const [loading, setLoading] = useState(true); // Track loading state
    const [error, setError] = useState(null); // Store any error message
    const [currentSlide, setCurrentSlide] = useState(0);
    const [searchTerm, setSearchTerm] = useState(''); // Search term state
    const Navigate = useNavigate();

    // Fetch products data on component mount
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await fetch('http://localhost:3000/api/products', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch data');
                }

                const data = await response.json();
                setProducts(data); // Store fetched products in state
            } catch (err) {
                setError(err.message); // Set error message in case of failure
            } finally {
                setLoading(false); // Set loading to false after data is fetched
            }
        };

        fetchProducts(); // Call the fetchProducts function when component mounts
    }, []); // Empty dependency array ensures this effect runs once on mount

    // Filter products based on search term (memoized to optimize performance)
    const filteredProducts = useMemo(() =>
        products.filter(item =>
            item.name && item.name.toLowerCase().includes(searchTerm.toLowerCase())
        ), [products, searchTerm]);

    // Images for the slider
    const images = [
        backimg,
        back01,
        back02,
        back03,
        luckyImage,
    ];

    // Slide functions
    const nextSlide = () => {
        setCurrentSlide((prevSlide) => (prevSlide + 1) % images.length);
    };

    const prevSlide = () => {
        setCurrentSlide((prevSlide) => (prevSlide - 1 + images.length) % images.length);
    };

    // Automatic slide change every 8 seconds
    useEffect(() => {
        const intervalId = setInterval(nextSlide, 8000);
        return () => clearInterval(intervalId); // Cleanup on unmount
    }, []);

    // Handle adding a product to the cart
    const dispatch = useCartDispatch();
    const cartState = useCartState();

    const handleAddToCart = async (product) => {
        await dispatch({
            type: "ADD_ITEM",
            id: product._id,
            image: product.image,
            name: product.name,
            mrp: product.mrp,
            price: product.price,
        });
    };

    // If the app is loading, show a loading message
    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div> {/* Add a CSS spinner */}
                Loading products...
            </div>
        );
    }

    // If there's an error, display the error message
    if (error) {
        return (
            <div className="error-container">
                <div>Error: {error}</div>
                <button onClick={() => setLoading(true)}>Retry</button>
            </div>
        );
    }

    const handleDetails = (productId) => {
        // Navigate to the product details page with the product ID
        Navigate(`/productdetails/${productId}`);
    };

    return (
        <>
            <Header />
            <div className="home-main">
                <div className="image">
                    {/* Search Bar */}
                    <input
                        type="text"
                        placeholder="Search for items..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-bar"
                    />

                    {/* Image Slider */}
                    <button onClick={prevSlide} className="slider-button1" aria-label="Previous slide">◀</button>
                    <img src={images[currentSlide]} alt={`Slide ${currentSlide + 1}`} className="slider-image" />
                    <button onClick={nextSlide} className="slider-button" aria-label="Next slide">▶</button>
                </div>
            </div>

            {/* Products Grid */}
            <div className="product-grid">
                {filteredProducts.length > 0 ? (
                    filteredProducts.map((product) => (
                        <div key={product._id} className="product-container">
                            <div className="product-image-container">
                                <img className="product-image" src={product.image} alt={product.name} />
                            </div>

                            <div className="product-name limit-text-to-2-lines" onClick={() => handleDetails(product._id)}>
                                {product.name}
                            </div>

                            <div className="product-rating-container">
                                <img className="product-rating-stars" src={product.starsUrl} alt="Rating" />
                                <div className="product-rating-count link-primary">
                                    {product.rating ? `${product.rating.count} reviews` : 'No reviews yet'}
                                </div>
                            </div>

                            <div className="product-mrp">MRP: {product.mrp}</div>
                            <div className="product-discount">Discount: {product.mrp - product.price}</div>
                            <div className="product-price">Best Buy: {product.price}</div>

                            <button
                                className="add-to-cart-button button-primary"
                                onClick={() => handleAddToCart(product)}
                            >
                                Add to Cart
                            </button>
                        </div>
                    ))
                ) : (
                    <div className="no-products-found">No products found for your search.</div>
                )}
            </div>
        </>
    );
};

export default Products;
