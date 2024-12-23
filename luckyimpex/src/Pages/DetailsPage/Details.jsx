import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';  // Import Helmet
import './Details.css';

const ProductDetails = () => {
    const { id } = useParams(); // Get the product ID from URL
    const [productData, setProduct] = useState(null); // Renamed product to productData
    const [error, setError] = useState(null); // State to hold error message
    const [loading, setLoading] = useState(true); // Loading state
    const [addedToCart, setAddedToCart] = useState(false); // State to handle cart addition

    useEffect(() => {
        const fetchProductDetails = async () => {
            try {
                const response = await fetch(`https://lucky-back-2.onrender.com/api/productsDetails/${id}`);
                if (!response.ok) {
                    if (response.status === 404) {
                        throw new Error('Product not found');
                    }
                    throw new Error('Failed to fetch product details');
                }
                const data = await response.json();
                setProduct(data);  // Update the product state with fetched data
                setLoading(false); // Finished loading product details
            } catch (err) {
                setError(err.message); // Set error message in case of failure
                setLoading(false); // Finished loading with error
                console.error('Error fetching product details:', err);
            }
        };

        fetchProductDetails();
    }, [id]);

    const handleAddToCart = () => {
        setAddedToCart(true);
        setTimeout(() => setAddedToCart(false), 2000); // Reset after 2 seconds
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <img className="spinner-gif" src="/spinner.gif" alt="loading products..." />

            </div>
        );
    }

    if (error) {
        return <div className="error">{error}</div>; // Display error message if product is not found or any other error occurs
    }

    // Construct the full image path from the relative path
    const imageUrl = productData?.image ? `${productData.image}` : 'https://via.placeholder.com/150';

    return (
        <div className="product-detail-container">
            <Helmet>
                <title>{productData.name} - Lucky Impex</title>
                <meta name="description" content={`Buy ${productData.name} from Lucky Impex.`} />
            </Helmet>
            <div className="product-details-content">
                <div className="product-image-container">
                    <img
                        className="detailsProduct-image"
                        src={imageUrl}
                        alt={productData?.name || 'Product Image'}
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://via.placeholder.com/150';
                        }}
                    />
                </div>

                <div className="detailsProduct-info-container">
                    <h3>{productData.name}</h3>
                    <p className="product-price">Price: ₹{productData.price}</p>
                    <p className="product-category">Category: {productData.category}</p>
                    <p className="product-brand">Brand: {productData.brand}</p>
                    <p className="product-warranty">Warranty: {productData.warranty || 'N/A'}</p>
                    <p className="product-capacity">Capacity: {productData.capacity || 'N/A'}</p>
                    <p className="product-description">Description: {productData.description}</p>
                    <p className="product-mrp">MRP: ₹{productData.mrp}</p>
                    <p className="product-discount-price">Discount Price: ₹{productData.mrp - productData.price}</p>


                    {/* <div className="product-action-buttons">
                        <button
                            className="btn-add-to-cart"
                            onClick={handleAddToCart}
                            disabled={addedToCart}
                        >
                            {addedToCart ? 'Added to Cart' : 'Add to Cart'}
                        </button>
                    </div> */}
                </div>
            </div>
        </div>
    );
};

export default ProductDetails;
