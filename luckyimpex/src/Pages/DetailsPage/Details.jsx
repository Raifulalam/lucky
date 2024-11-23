import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import './Details.css';

const ProductDetails = () => {
    const { id } = useParams(); // Get the product ID from URL
    const [product, setProduct] = useState(null);
    const [error, setError] = useState(null); // State to hold error message
    const [loading, setLoading] = useState(true); // Loading state

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
                setProduct(data);
                setLoading(false); // Finished loading product details
            } catch (err) {
                setError(err.message); // Set error message in case of failure
                setLoading(false); // Finished loading with error
                console.error('Error fetching product details:', err);
            }
        };

        fetchProductDetails();
    }, [id]);

    if (loading) {
        return <div className="loading">Loading product details...</div>; // Show loading state
    }

    if (error) {
        return <div className="error">{error}</div>; // Display error message if product is not found or any other error occurs
    }

    // Construct the full image path from the relative path
    const imageUrl = product?.image ? `/${product.image}` : 'https://via.placeholder.com/150';

    return (
        <div className="product-detail-container">

            <div className="product-details-content">

                <div className="product-image-containers">
                    <img
                        className="product-images"
                        src={imageUrl}
                        alt={product?.name || 'Product Image'}
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://via.placeholder.com/150';
                        }}
                    />
                </div>


                <div className="product-info-container">

                    <h3>{product.name}</h3>
                    <p className="product-price">Price: ₹{product.price}</p>
                    <p className="product-category">Category: {product.category}</p>
                    <p className="product-brand">Brand: {product.brand}</p>
                    <p className="product-description">Description: {product.details}</p>
                    <p className="product-mrp">MRP: ₹{product.mrp}</p>
                    <p className="product-discount">Discount: {((product.mrp - product.price) / product.mrp) * 100}%</p>
                    <p className="product-discount-price">Discount Price: ₹{product.mrp - product.price}</p>
                    <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Dolorum magni corrupti perferendis saepe eos qui pariatur repellat dolor id repellendus reprehenderit corporis eum aspernatur tempore, dicta laudantium laboriosam vel porro eligendi, maiores harum! Minima delectus rem quibusdam. Dolorum consectetur, fugiat optio dignissimos error expedita, quam minima odit sapiente sint eligendi ipsa velit molestiae odio suscipit nisi quasi quisquam id dolore! Atque voluptas ratione hic similique, aliquid enim, distinctio possimus ex veritatis reiciendis dolorem a debitis aut quaerat repudiandae vitae eos dolores cumque quod minima. Perspiciatis consequatur culpa voluptate obcaecati quisquam, doloremque beatae alias eveniet tenetur sunt nulla praesentium. Consequatur officiis autem sunt odit magni tempore ipsam delectus repudiandae! Minima, tempore! Magnam aliquid in, possimus laborum eligendi quia enim numquam sit!</p>
                    <p>
                        <button>
                            Add to Cart
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ProductDetails;
