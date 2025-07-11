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
import { debounce } from 'lodash';


// Utility function for handling image errors
const getImageSrc = (src, fallbackSrc) => {
    return src ? `${src}` : fallbackSrc;
};

const BrandSearch = () => {
    const { brand } = useParams();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
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

    const Navigate = useNavigate();
    const { user } = useContext(UserContext);
    const userRole = user?.role || 'user';

    const placeholderImage = '/path/to/placeholder-image.jpg'; // Placeholder image

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            setError(null);

            try {
                // Construct the URL by directly embedding the brand in the path
                let url = `https://lucky-back.onrender.com/api/products/${brand}`;

                console.log("Fetching URL:", url);  // Log the URL to debug

                const response = await fetch(url, { method: 'GET', headers: { 'Content-Type': 'application/json' } });

                if (!response.ok) {
                    throw new Error('Failed to fetch products');
                }

                const data = await response.json();
                setProducts(data);

            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        // Only fetch when brand changes
        if (brand) {
            fetchProducts();
        }
    }, [brand]);  // Dependency on brand







    const filteredProducts = useMemo(() => {
        return products.filter((item) => {
            // Safely concatenate the fields, fallback to empty string if undefined or null
            const itemName = (item.name || '') + (item.model || '') + (item.brand || '');

            const lowercasedSearchTerm = (searchTerm || '').toLowerCase();

            return itemName.toLowerCase().includes(lowercasedSearchTerm);
        });
    }, [products, searchTerm]);
    // Image slider logic
    const images = [backimg, back01, back02, back03, luckyImage];
    const nextSlide = () => setCurrentSlide((prevSlide) => (prevSlide + 1) % images.length);

    useEffect(() => {
        const intervalId = setInterval(nextSlide, 8000);
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
        Navigate(`/productdetails/${productId}`);
    };

    // Debounced search handler
    const handleSearchChange = debounce((e) => {
        setSearchTerm(e.target.value);
    }, 500); // Debounce search by 500ms

    // Handle new product input change
    const handleNewProductChange = (e) => {
        const { name, value } = e.target;
        setNewProduct((prev) => ({ ...prev, [name]: value }));
    };


    const handleAddNewProduct = async (e) => {
        e.preventDefault();

        // Destructure new product data
        const { name, mrp, bestBuyPrice, category, model, description, image, keywords, brand, capacity } = newProduct;

        // Validate that all fields are filled
        if (!name || !mrp || !bestBuyPrice || !category || !model || !description || !image || !keywords) {
            alert('Please fill all fields');
            return;
        }

        // Prepare the product data to send to the backend
        const productData = {
            name,
            mrp,
            price: bestBuyPrice,   // Renaming 'bestBuyPrice' to 'price' for backend compatibility
            category,
            model,
            description,
            image,
            keywords: keywords.split(',').map(keyword => keyword.trim()),
            brand,
            capacity,

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
                    capacity: ''
                }); // Reset the form
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
                        <div key={product._id} className="product-container">


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

                            <div className='product-model'>Size: {product.capacity}</div>
                            <div className="product-mrp">MRP: {product.mrp}</div>
                            <div className="product-discount">Save: {(product.mrp - product.price).toFixed(0)}</div>
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
                        name="brand"
                        value={newProduct.brand}
                        onChange={handleNewProductChange}
                        placeholder="Brand Name"
                        required
                    />
                    <input
                        type="text"
                        name="capacity"
                        value={newProduct.capacity}
                        onChange={handleNewProductChange}
                        placeholder="Capacity or Size"
                        required
                    />
                    <input
                        type="text"
                        name="model"
                        value={newProduct.model}
                        onChange={handleNewProductChange}
                        placeholder="Modal Number"
                        required
                    />
                    <textarea
                        name="description"
                        value={newProduct.description}
                        onChange={handleNewProductChange}
                        placeholder="Description"
                        required
                    />
                    <input
                        type="url"
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
                        placeholder="Keywords (separated by commas)"
                        required
                    />
                    <button type="submit">Add Product</button>
                </form>
            </Modal>



            {/* Edit Product Modal */}
            <EditProductModal
                product={selectedProduct}
                onSave={handleSave}
                onClose={() => setIsModalOpen(false)}
                isOpen={isModalOpen}
            />

            {/* Delete Confirmation Modal */}
            <Modal show={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)}>
                <h3>Are you sure you want to delete this product?</h3>
                <div className="modal-actions">
                    <button
                        onClick={() => {
                            confirmDelete(selectedProduct?._id);
                            setIsDeleteModalOpen(false);
                        }}
                    >
                        Yes
                    </button>

                    {/* No button to cancel deletion */}
                    <button onClick={() => setIsDeleteModalOpen(false)}>No</button>
                </div>
            </Modal>

        </>
    );
};

export default BrandSearch;
