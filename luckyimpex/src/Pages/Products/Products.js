import React, { useState, useEffect, useMemo, useContext } from 'react';
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
import { UserContext } from '../../Components/UserContext';
import EditProductModal from './EditProductModal'; // Import the modal

const Products = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false); // State to handle modal visibility
    const [selectedProduct, setSelectedProduct] = useState(null); // Selected product for editing
    const Navigate = useNavigate();
    const { user } = useContext(UserContext);
    const userRole = user?.role || 'user';

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await fetch('https://lucky-back-2.onrender.com/api/products', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch data');
                }

                const data = await response.json();
                setProducts(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    const filteredProducts = useMemo(() =>
        products.filter(item =>
            item.name && item.name.toLowerCase().includes(searchTerm.toLowerCase())
        ), [products, searchTerm]);

    const images = [
        backimg,
        back01,
        back02,
        back03,
        luckyImage,
    ];

    const nextSlide = () => {
        setCurrentSlide((prevSlide) => (prevSlide + 1) % images.length);
    };

    useEffect(() => {
        const intervalId = setInterval(nextSlide, 8000);
        return () => clearInterval(intervalId);
    }, []);

    const dispatch = useCartDispatch();

    const handleEdit = (product) => {
        setSelectedProduct(product);
        setIsModalOpen(true); // Open the modal for editing
    };

    const handleSave = async (updatedProduct) => {
        // Call API to save the updated product
        const response = await fetch(`https://lucky-back-2.onrender.com/api/products/${updatedProduct._id}`, {
            method: 'PUT',  // Assuming PUT is used to update the product
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedProduct),
        });

        if (response.ok) {
            setProducts((prev) =>
                prev.map((prod) =>
                    prod._id === updatedProduct._id ? updatedProduct : prod
                )
            );
        } else {
            alert('Failed to update product');
        }
    };

    const handleDelete = (productId) => {
        // Handle delete functionality
        console.log('Deleting product', productId);
    };

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

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                Loading products...
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-container">
                <div>Error: {error}</div>
                <button onClick={() => setLoading(true)}>Retry</button>
            </div>
        );
    }

    const handleDetails = (productId) => {
        Navigate(`/productdetails/${productId}`);
    };

    return (
        <>
            <Header />
            <div className="home-main">
                <div className="image">
                    <input
                        type="text"
                        placeholder="Search for items..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-bar"
                    />
                    <img src={images[currentSlide]} alt={`Slide ${currentSlide + 1}`} className="slider-image" />
                </div>
            </div>

            <div className="product-grid">
                {filteredProducts.length > 0 ? (
                    filteredProducts.map((product) => (
                        <div key={product._id} className="product-container">
                            <div className="product-image-container" onClick={() => handleDetails(product._id)}>
                                <img className="product-image" src={product.image} alt={product.name} />
                            </div>

                            <div className='product-name limit-text-to-2-lines' onClick={() => handleDetails(product._id)}>
                                {product.name}
                            </div>

                            <div className="product-mrp">MRP: {product.mrp}</div>
                            <div className="product-discount">Discount: {product.mrp - product.price}</div>
                            <div className="product-price">Best Buy: {product.price}</div>

                            {
                                userRole === 'admin' ? (
                                    <div className="product-actions">
                                        <button className="edit-btn" onClick={() => handleEdit(product)}>Edit</button>
                                        <button className="delete-btn" onClick={() => handleDelete(product._id)}>Delete</button>
                                    </div>
                                ) : (
                                    <button className="add-to-cart-button button-primary" onClick={() => handleAddToCart(product)}>
                                        Add to Cart
                                    </button>
                                )
                            }
                        </div>
                    ))
                ) : (
                    <div className="no-products-found">No products found for your search.</div>
                )}
            </div>

            {/* Modal for editing */}
            <EditProductModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                product={selectedProduct}
                onSave={handleSave}
            />
        </>
    );
};

export default Products;
