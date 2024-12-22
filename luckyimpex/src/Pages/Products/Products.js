import React, { useState, useEffect, useMemo, useContext } from 'react';
import './products.css';
import Header from '../../Components/Header';
import { useCartDispatch } from '../../Components/CreateReducer';
import { useNavigate, useParams } from 'react-router-dom';
import '../../App.css';
import luckyImage from '../../Images/lucky.png';
import backimg from '../../Images/backimg.jpg';
import back01 from '../../Images/back01.png';
import back02 from '../../Images/back04.jpg';
import back03 from '../../Images/back03.jpg';
import { UserContext } from '../../Components/UserContext';
import EditProductModal from './EditProductModal';
import Modal from '../../Components/Modal';


const Products = () => {
    const { category } = useParams();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);

    const Navigate = useNavigate();
    const { user } = useContext(UserContext);
    const userRole = user?.role || 'user';


    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true); // Start loading
            setError(null); // Reset previous error

            try {
                let url = 'https://lucky-back-2.onrender.com/api/products';
                if (category) {
                    // If category is provided, include it in the URL
                    url += `?category=${category}`;
                }

                const response = await fetch(url, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch data');
                }

                const data = await response.json();
                setProducts(data); // Set products from the API response
                console.log(data);
            } catch (err) {
                setError(err.message); // Handle errors
            } finally {
                setLoading(false); // Stop loading
            }
        };

        fetchProducts();
    }, [category]);

    const filteredProducts = useMemo(() => {
        return products.filter((item) => {
            const matchesSearchTerm = item.name.toLowerCase().includes(searchTerm.toLowerCase());




            return matchesSearchTerm;
        });
    }, [products, searchTerm]);

    const images = [backimg, back01, back02, back03, luckyImage];

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
        setIsModalOpen(true);
    };

    const handleSave = async (updatedProduct) => {
        const response = await fetch(`https://lucky-back-2.onrender.com/api/products/${updatedProduct._id}`, {
            method: 'PUT',
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
        setIsDeleteModalOpen(true);
        setSelectedProduct(products.find(product => product._id === productId));
    };

    const confirmDelete = async (productId) => {
        try {
            const response = await fetch(`https://lucky-back-2.onrender.com/api/products/${productId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                setProducts((prev) =>
                    prev.filter((prod) => prod._id !== productId)
                );
                dispatch({ type: 'DELETE_PRODUCT', payload: productId });
            } else {
                alert('Failed to delete product');
            }
        } catch (error) {
            console.error(error);
        }
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

    const handleDetails = (productId) => {
        Navigate(`/productdetails/${productId}`);
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <img className="spinner-gif" src="spinner.gif" alt="loading products..." />

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
                                <img className="product-image" src={`/${product.image}`} alt={product.name} />

                            </div>

                            <div className='product-name' onClick={() => handleDetails(product._id)}>
                                {product.name}
                            </div>

                            <div className="product-mrp">MRP: {product.mrp}</div>
                            <div className="product-discount">Discount: {product.mrp - product.price}</div>
                            <div className="product-price">Best Buy: {product.price}</div>

                            {userRole === 'admin' ? (
                                <div className="product-actions">
                                    <button className="edit-btn" onClick={() => handleEdit(product)}>Edit</button>
                                    <button className="delete-btn" onClick={() => handleDelete(product._id)}>Delete</button>
                                </div>
                            ) : (
                                <button className="add-to-cart-button button-primary" onClick={() => handleAddToCart(product)}>
                                    Add to Cart
                                </button>
                            )}
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

            {/* Delete Confirmation Modal */}
            <Modal show={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)}>
                <h2>Are you sure you want to delete this product?</h2>
                <div className="modal-actions">
                    <button className="cancel-btn" onClick={() => setIsDeleteModalOpen(false)}>
                        Cancel
                    </button>
                    <button
                        className="delete-btn"
                        onClick={() => {
                            confirmDelete(selectedProduct._id);
                            setIsDeleteModalOpen(false);
                        }}
                    >
                        Confirm Delete
                    </button>
                </div>
            </Modal>
        </>
    );
};

export default Products;
