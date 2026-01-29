import React, { useState, useEffect, useMemo, useContext } from 'react';
import './products.css';
import Header from '../../Components/Header';
import { useCartDispatch } from '../../Components/CreateReducer';
import { useNavigate, useParams } from 'react-router-dom';
import luckyImage from '../../Images/mobiles/download (1).jpg';
import backimg from '../../Images/mobiles/download.jpg';
import back01 from '../../Images/mobiles/HONOR 20 PROMO _ WONDER.jpg';
import back02 from '../../Images/mobiles/Samsung Galaxy A24.jpg';
import back03 from '../../Images/mobiles/Samsung Galaxy S12.jpg';
import back04 from '../../Images/mobiles/Samsung Leak Reveals.jpg';
import { UserContext } from '../../Components/UserContext';
import EditMobileModal from './EditMobile';
import Modal from '../../Components/Modal';
import { useNotification } from '../../Components/NotificationContext';

const getImageSrc = (src, fallbackSrc) => {
    return src ? `${src}` : fallbackSrc;
};

const PhoneShop = () => {
    const { category } = useParams();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [setCurrentSlide] = useState(0);
    const [searchTerm, setSearchTerm] = useState();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false); // Modal for adding products
    const [selectedProduct, setSelectedProduct] = useState(null);
    const { addNotification } = useNotification();
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

    // Function to fetch products from API
    useEffect(() => {
        setLoading(true);
        setError(null);
        fetchProducts();
    }, [category]);

    const fetchProducts = async () => {
        setLoading(true);
        setError(null);

        try {
            let url = 'https://lucky-back.onrender.com/api/mobile';

            if (category) {
                url += `?category=${category}`;
            }

            const response = await fetch(url, { method: 'GET', headers: { 'Content-Type': 'application/json' } });

            if (!response.ok) throw new Error('Failed to fetch products');
            const data = await response.json();
            setProducts(data); // Set products to state
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const filteredProducts = useMemo(() => {
        return products.filter((item) => {
            // Safely concatenate the fields, fallback to empty string if undefined or null
            const itemName = (item.name || '') + (item.model || '') + (item.brand || '');

            const lowercasedSearchTerm = (searchTerm || '').toLowerCase();

            return itemName.toLowerCase().includes(lowercasedSearchTerm);
        });
    }, [products, searchTerm]);

    // Image slider logic
    const images = [backimg, back01, back02, back03, luckyImage, back04];
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
        const response = await fetch(`https://lucky-back.onrender.com/api/mobile/${updatedProduct._id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedProduct),
        });

        if (response.ok) {
            setProducts((prev) => prev.map((prod) => (prod._id === updatedProduct._id ? updatedProduct : prod)));
            addNotification({
                title: 'Success!',
                message: 'Product updated successfully',
                type: 'success', // Notification type 'success'
                container: 'top-right',
                dismiss: { duration: 5000 },
            });
        } else {
            addNotification({
                title: 'Success!',
                message: 'Something went wrong updating your product list ',
                type: 'error', // Notification type 'success'
                container: 'top-right',
                dismiss: { duration: 5000 },
            });
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
            const response = await fetch(`https://lucky-back.onrender.com/api/mobile/${productId}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
            });

            if (response.ok) {

                setProducts((prev) => prev.filter((prod) => prod._id !== productId));

                dispatch({ type: 'DELETE_PRODUCT', payload: productId });
                setIsDeleteModalOpen(false)
                addNotification({
                    title: 'Success!',
                    message: 'Product deleted successfully',
                    type: 'success', // Notification type 'success'
                    container: 'top-right',
                    dismiss: { duration: 5000 },
                });
            } else {
                addNotification({
                    title: 'Success!',
                    message: 'Failed to delete',
                    type: 'error', // Notification type 'success'
                    container: 'top-right',
                    dismiss: { duration: 5000 },
                });
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
        addNotification({
            title: 'Success!',
            message: 'Item added successfully to Cart',
            type: 'success', // Notification type 'success'
            container: 'top-right',
            dismiss: { duration: 5000 },
        });
    };

    // Navigate to product details page
    const handleDetails = (productId) => {
        Navigate(`/phonedetails/${productId}`);
        window.history.pushState(null, null, window.location.href);
    };

    useEffect(() => {
        const preventBackNavigation = () => {
            window.history.pushState(null, null, window.location.href);
        };

        // Add the onpopstate listener
        window.onpopstate = preventBackNavigation;

        // Cleanup when the component unmounts
        return () => {
            window.onpopstate = null;
        };
    }, []);

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
        const { name, price, category, model, description, image, brand, color, ram, storage, battery, camera, processor, display, operatingSystem, releaseDate, charging, stock } = newProduct;

        // Validate that all fields are filled
        if (!name || !category || !model || !description || !image) {
            alert('Please fill all fields');
            return;
        }

        // Prepare the product data to send to the backend
        const productData = {


            name,
            price,
            brand,
            model,
            color,
            ram,
            storage,
            battery,
            camera,
            processor,
            display,
            operatingSystem,
            releaseDate,
            category,
            description,
            image,
            charging,
            stock,
        };

        try {
            // Send the data to the backend
            const response = await fetch('https://lucky-back.onrender.com/api/mobile', {
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
                    price: '',
                    brand: '',
                    model: '',
                    color: '',
                    ram: '',
                    storage: '',
                    battery: '',
                    camera: '',
                    processor: '',
                    display: '',
                    operatingSystem: '',
                    releaseDate: '',
                    category: '',
                    description: '',
                    image: '',
                    charging: '',
                    stock: '',
                }); // Reset the form
                setIsAddModalOpen(false); // Close the modal
                addNotification({
                    title: 'Success!',
                    message: 'Added a new product',
                    type: 'success', // Notification type 'success'
                    container: 'top-right',
                    dismiss: { duration: 5000 },
                });
            } else {
                addNotification({
                    title: 'Success!',
                    message: 'Something went wrong with the product creation process ',
                    type: 'error', // Notification type 'success'
                    container: 'top-right',
                    dismiss: { duration: 5000 },
                });
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
            <div className="image-move">
                <input
                    type="text"
                    placeholder="Search for items..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="search-bar"
                />
                <div className="image-wrapper">

                    <img src={luckyImage} alt="imagebackground" />
                    <img src={backimg} alt="image03 background" />
                    <img src={back01} alt="image04background" />
                    <img src={back02} alt="image02 background" />
                    <img src={back03} alt="image01 background" />
                    <img src={back04} alt="image01 background" />

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
                                    alt="image-not-found"
                                />
                            </div>

                            <div className="product-name" onClick={() => handleDetails(product._id)}>
                                {product.brand} {product.name}
                            </div>
                            <p className='stock'>Availability: <span className={`stock-status ${product.stock === 0 ? 'out-of-stock' : 'in-stock'}`}></span>{product.stock === 0 ? 'Out of Stock' : 'In stock'}</p>
                            <div className="product-model">Display: {product.display}</div>
                            <div className="product-model">Model: {product.model}</div>
                            <div className="product-price">   <p>MRP: {product.price}</p></div>


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
                        name="price"
                        value={newProduct.price}
                        onChange={handleNewProductChange}
                        placeholder="Price"
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
                        name="model"
                        value={newProduct.model}
                        onChange={handleNewProductChange}
                        placeholder="Model"
                        required
                    />
                    <input
                        type="text"
                        name="color"
                        value={newProduct.color}
                        onChange={handleNewProductChange}
                        placeholder="Color"
                    />
                    <input
                        type="number"
                        name="ram"
                        value={newProduct.ram}
                        onChange={handleNewProductChange}
                        placeholder="RAM (GB)"
                        required
                    />
                    <input
                        type="number"
                        name="storage"
                        value={newProduct.storage}
                        onChange={handleNewProductChange}
                        placeholder="Storage (GB)"
                        required
                    />
                    <input
                        type="text"
                        name="battery"
                        value={newProduct.battery}
                        onChange={handleNewProductChange}
                        placeholder="Battery"
                    />
                    <input
                        type="text"
                        name="camera"
                        value={newProduct.camera}
                        onChange={handleNewProductChange}
                        placeholder="Camera (MP)"
                    />
                    <input
                        type="text"
                        name="processor"
                        value={newProduct.processor}
                        onChange={handleNewProductChange}
                        placeholder="Processor"
                    />
                    <input
                        type="text"
                        name="display"
                        value={newProduct.display}
                        onChange={handleNewProductChange}
                        placeholder="Display"
                    />
                    <input
                        type="text"
                        name="operatingSystem"
                        value={newProduct.operatingSystem}
                        onChange={handleNewProductChange}
                        placeholder="Operating System"
                    />
                    <input
                        type="text"
                        name="releaseDate"
                        value={newProduct.releaseDate}
                        onChange={handleNewProductChange}
                        placeholder="Release Date"
                    />
                    <textarea
                        name="description"
                        value={newProduct.description}
                        onChange={handleNewProductChange}
                        placeholder="Description"
                    />
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
                        name="charging"
                        value={newProduct.charging}
                        onChange={handleNewProductChange}
                        placeholder="Charging"
                    />
                    <input
                        type="number"
                        name="stock"
                        value={newProduct.stock}
                        onChange={handleNewProductChange}
                        placeholder="Stock Quantity"
                    />


                    <button type="submit" className="button-primary">
                        Add Product
                    </button>
                </form>
            </Modal>

            {/* Modal for editing products */}
            <EditMobileModal
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

export default PhoneShop;
