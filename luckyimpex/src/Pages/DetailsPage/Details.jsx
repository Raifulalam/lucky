import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const ProductDetails = () => {
    const { id } = useParams(); // Get the product ID from URL
    const [product, setProduct] = useState(null);
    const [error, setError] = useState(null); // State to hold error message

    useEffect(() => {
        const fetchProductDetails = async () => {
            try {
                const response = await fetch(`http://localhost:3000/api/productsDetails/${id}`);
                if (!response.ok) {
                    if (response.status === 404) {
                        throw new Error('Product not found');
                    }
                    throw new Error('Failed to fetch product details');
                }
                const data = await response.json();
                setProduct(data);
            } catch (err) {
                setError(err.message); // Set error message in case of failure
                console.error('Error fetching product details:', err);
            }
        };

        fetchProductDetails();
    }, [id]);

    if (error) {
        return <div>{error}</div>; // Display error message if product is not found or any other error occurs
    }

    if (!product) {
        return <div>Loading product details...</div>; // Loading state while the product is being fetched
    }

    return (
        <div>


            <h1>
                Coming Soon
            </h1>
        </div>
    );
};

export default ProductDetails; // Default export
