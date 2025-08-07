import React, { useState, useEffect, useMemo, useContext } from 'react';
import './products.css';
import Header from '../../Components/Header';
import { useCartDispatch } from '../../Components/CreateReducer';
import { useNavigate, useParams } from 'react-router-dom';
import luckyImage from '../../Images/lucky.png';
import backimg from '../../Images/backimg.jpg';
import back01 from '../../Images/back01.png';
import back02 from '../../Images/back04.jpg';
import back03 from '../../Images/back03.jpg';
import { UserContext } from '../../Components/UserContext';
import EditProductModal from './EditProductModal';
import Modal from '../../Components/Modal';
import { useProductContext } from '../../Components/ProductContext';
import { useRef } from 'react';
const getImageSrc = (src, fallbackSrc) => {
    return src ? `${src}` : fallbackSrc;
};

const Products = () => {
    const { category } = useParams();
    const { products, setProducts } = useProductContext();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [searchTerm, setSearchTerm] = useState();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false); // Modal for adding products
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [newProduct, setNewProduct] = useState({
        name: '',
        price: '',
        description: '',
        image: ''
    });
    const productRefs = useRef({});
    const Navigate = useNavigate();
    const { user } = useContext(UserContext);
    const userRole = user?.role || 'user';

    const placeholderImage = '/path/to/placeholder-image.jpg'; // Placeholder image


    useEffect(() => {
        if (!sessionStorage.getItem("reloadedOnce")) {
            sessionStorage.setItem("reloadedOnce", "true");
            window.location.reload();
        }
    }, []);

    useEffect(() => {
        // Fetch only if products are not already fetched OR category has changed
        if (!Array.isArray(products) || products.length === 0) {
            fetchProducts();
        } else {
            setLoading(false);
        }
    }, [products, category]);



    useEffect(() => {
        fetchProducts();
    }, [category]);

    const fetchProducts = async () => {
        setLoading(true);
        setError(null);

        try {
            let url = 'https://lucky-back.onrender.com/api/products';
            if (category) url += `?category=${category}`;

            const response = await fetch(url, {
                headers: {
                    "Cache-Control": "no-cache",
                }
            });
            if (!response.ok) throw new Error('Failed to fetch products');

            const data = await response.json();

            setProducts(data); // always update products

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };


    const filteredProducts = useMemo(() => {
        return Array.isArray(products)
            ? products.filter((item) => {
                const itemName = (item.name || '') + (item.model || '') + (item.brand || '');
                const lowercasedSearchTerm = (searchTerm || '').toLowerCase();
                return itemName.toLowerCase().includes(lowercasedSearchTerm);
            })
            : [];

    }, [products, searchTerm]);



    // Image slider logic
    const images = [backimg, back01, back02, back03, luckyImage];
    const nextSlide = () => setCurrentSlide((prevSlide) => (prevSlide + 1) % images.length);

    useEffect(() => {
        const intervalId = setInterval(nextSlide, 4000);
        return () => clearInterval(intervalId);
    }, []);

    const dispatch = useCartDispatch();

    // Handle product editing
    const handleEdit = (product) => {
        setSelectedProduct(product);
        setIsModalOpen(true);
    };

    // Save edited product
    const handleSave = async (updatedProduct) => {
        const response = await fetch(`https://lucky-back.onrender.com/api/products/${updatedProduct._id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedProduct),
        });

        if (response.ok) {
            setProducts((prev) => prev.map((prod) => (prod._id === updatedProduct._id ? updatedProduct : prod)));
        } else {
            alert('Failed to update product');
        }
    };

    // Handle product deletion
    const handleDelete = (productId) => {
        setIsDeleteModalOpen(true);
        setSelectedProduct(products.find((product) => product._id === productId));
    };

    // Confirm product deletion
    const confirmDelete = async (productId) => {
        try {
            const response = await fetch(`https://lucky-back.onrender.com/api/products/${productId}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
            });

            if (response.ok) {
                setProducts((prev) => prev.filter((prod) => prod._id !== productId));
                dispatch({ type: 'DELETE_PRODUCT', payload: productId });
            } else {
                alert('Failed to delete product');
            }
        } catch (error) {
            console.error(error);
        }
    };

    // Add product to cart
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

    // Navigate to product details page
    const handleDetails = (productId) => {
        sessionStorage.setItem("scrollPos", window.scrollY);
        sessionStorage.setItem("clickedProductId", productId);
        Navigate(`/productdetails/${productId}`);
    };

    useEffect(() => {
        const productId = sessionStorage.getItem("clickedProductId");

        if (productId && productRefs.current[productId]) {
            productRefs.current[productId].scrollIntoView({
                behavior: "smooth",
                block: "center",
            });
            sessionStorage.removeItem("clickedProductId");
            sessionStorage.removeItem("scrollPos");
        } else {
            const scrollPos = sessionStorage.getItem("scrollPos");
            if (scrollPos) {
                window.scrollTo(0, parseInt(scrollPos));
                sessionStorage.removeItem("scrollPos");
            }
        }
    }, [products]); // <- Wait for products to be loaded


    // Debounced search handler
    const handleSearchChange = ((e) => {
        setSearchTerm(e.target.value);
    }); // Debounce search by 500ms

    // Handle new product input change
    const handleNewProductChange = (e) => {
        const { name, value } = e.target;
        setNewProduct((prev) => ({ ...prev, [name]: value }));
    };

    const handleAddNewProduct = async (e) => {
        e.preventDefault();

        // Destructure new product data
        const { name, mrp, bestBuyPrice, category, model, description, image, keywords, brand, capacity, stock } = newProduct;

        // Validate that all fields are filled
        if (!name || !mrp || !bestBuyPrice || !category || !model || !description || !image || !keywords) {
            alert('Please fill all fields');
            return;
        }

        // Prepare the product data to send to the backend
        const productData = {
            name,
            mrp,
            price: bestBuyPrice,
            category,
            model,
            description,
            image,
            keywords: keywords.split(',').map(keyword => keyword.trim()),
            brand,
            capacity,
            stock,
        };

        try {
            // Send the data to the backend
            const response = await fetch('https://lucky-back.onrender.com/api/products', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(productData), // Send data in JSON format
            });

            if (response.ok) {
                // If successful, add the new product to the state and reset the form
                const addedProduct = await response.json();
                setProducts((prev) => [...prev, addedProduct]);  // Update state with the newly added product
                setNewProduct({
                    name: '',
                    mrp: '',
                    bestBuyPrice: '',
                    category: '',
                    model: '',
                    description: '',
                    image: '',
                    keywords: '',
                    brand: '',
                    capacity: '',
                    stock: '',
                });
                setIsAddModalOpen(false); // Close the modal
            } else {
                alert('Failed to add product');
            }
        } catch (err) {
            alert('Error: ' + err.message);
        }
    };

    // Loading state
    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>

            </div>
        );
    }

    // Error state
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
                        onChange={handleSearchChange}
                        className="search-bar"
                    />

                    <img src={images[currentSlide]} alt={`Slide ${currentSlide + 1}`} className="slider-image" />
                </div>
            </div>

            {/* Add Product Button for Admin */}
            {userRole === 'admin' && (
                <div className="add-product-button-container">
                    <button onClick={() => setIsAddModalOpen(true)} className="button-primary">
                        Add New Product
                    </button>
                </div>
            )}

            <div className="product-grid">
                {filteredProducts.length > 0 ? (
                    filteredProducts.map((product) => (
                        <div key={product._id}
                            ref={(el) => (productRefs.current[product._id] = el)}
                            className="product-container">

                            <div className="product-image-container" onClick={() => handleDetails(product._id)}>

                                <img
                                    className="product-image"
                                    src={getImageSrc(product.image, placeholderImage)}
                                    alt="image not found"
                                />
                            </div>

                            <div className="product-name" onClick={() => handleDetails(product._id)}>
                                {product.name}
                            </div>
                            <p className='stock'>Availability: <span className={`stock-status ${product.stock === 0 ? 'out-of-stock' : 'in-stock'}`}></span>{product.stock === 0 ? 'Out of stock' : 'In stock'}</p>
                            <div className="product-size">Size: {product.capacity}

                            </div>
                            <div className="product-model">Model: {product.model}</div>
                            <div className="product-mrp">MRP: {product.mrp ? product.mrp.toFixed(0) : 'N/A'}</div>
                            <div className="product-discount">
                                <p>Save: {product.mrp && product.price ? (product.mrp - product.price).toFixed(0) : 'N/A'}</p>
                            </div>
                            <div className="product-price">
                                <p>Best Buy: {product.price ? product.price.toFixed(0) : 'N/A'}</p>
                            </div>





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

            {/* Modal for adding a new product */}
            <Modal show={isAddModalOpen} onClose={() => setIsAddModalOpen(false)}>
                <h2>Add New Product</h2>
                <form onSubmit={handleAddNewProduct}>
                    <input
                        type="text"
                        name="name"
                        value={newProduct.name}
                        onChange={handleNewProductChange}
                        placeholder="Product Name"
                        required
                    />
                    <input
                        type="text"
                        name="category"
                        value={newProduct.category}
                        onChange={handleNewProductChange}
                        placeholder="Category"
                        required
                    />
                    <input
                        type="number"
                        name="mrp"
                        value={newProduct.mrp}
                        onChange={handleNewProductChange}
                        placeholder="MRP"
                        required
                    />
                    <input
                        type="number"
                        name="bestBuyPrice"
                        value={newProduct.bestBuyPrice}
                        onChange={handleNewProductChange}
                        placeholder="Best Buy Price"
                        required
                    />
                    <input
                        type="text"
                        name="model"
                        value={newProduct.model}
                        onChange={handleNewProductChange}
                        placeholder="Model"
                        required
                    />
                    <textarea
                        name="description"
                        value={newProduct.description}
                        onChange={handleNewProductChange}
                        placeholder="Description"
                        required
                    ></textarea>
                    <input
                        type="text"
                        name="image"
                        value={newProduct.image}
                        onChange={handleNewProductChange}
                        placeholder="Image URL"
                        required
                    />
                    <input
                        type="text"
                        name="keywords"
                        value={newProduct.keywords}
                        onChange={handleNewProductChange}
                        placeholder="Keywords (comma separated)"
                        required
                    />
                    <input
                        type="text"
                        name="brand"
                        value={newProduct.brand}
                        onChange={handleNewProductChange}
                        placeholder="Brand"
                    />
                    <input
                        type="text"
                        name="capacity"
                        value={newProduct.capacity}
                        onChange={handleNewProductChange}
                        placeholder="Capacity"
                    />
                    <input
                        type="number"
                        name="stock"
                        value={newProduct.stock}
                        onChange={handleNewProductChange}
                        placeholder="Stock"
                    />

                    <button type="submit" className="button-primary">
                        Add Product
                    </button>
                </form>
            </Modal>

            {/* Modal for editing products */}
            <EditProductModal
                product={selectedProduct}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
            />

            {/* Delete Confirmation Modal */}
            <Modal show={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)}>
                <h3>Are you sure you want to delete this product?</h3>
                <div className="modal-actions">
                    <button onClick={() => confirmDelete(selectedProduct?._id)} className="button-primary">
                        Yes, Delete
                    </button>
                    <button onClick={() => setIsDeleteModalOpen(false)} className="button-secondary">
                        Cancel
                    </button>
                </div>
            </Modal>
        </>
    );
};

export default Products;
