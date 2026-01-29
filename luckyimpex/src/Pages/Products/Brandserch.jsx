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
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
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

    const placeholderImage = '/path/to/placeholder-image.jpg';

    // ✅ Fetch products
    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            setError(null);

            try {
                let url = `https://lucky-back.onrender.com/api/products/brand/${brand}`;
                console.log("Fetching URL:", url);

                const response = await fetch(url, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' }
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch products');
                }

                const data = await response.json();
                console.log("API response:", data);

                if (Array.isArray(data.products)) {
                    setProducts(data.products);
                } else {
                    setProducts([]);
                }

            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (brand) {
            fetchProducts();
        }
    }, [brand]);

    // ✅ Search filter
    const filteredProducts = useMemo(() => {
        return products.filter((item) => {
            const itemName = (item.name || '') + (item.model || '') + (item.brand || '');
            const lowercasedSearchTerm = (searchTerm || '').toLowerCase();
            return itemName.toLowerCase().includes(lowercasedSearchTerm);
        });
    }, [products, searchTerm]);

    // ✅ Image slider
    const images = [backimg, back01, back02, back03, luckyImage];
    const nextSlide = () => setCurrentSlide((prevSlide) => (prevSlide + 1) % images.length);

    useEffect(() => {
        const intervalId = setInterval(nextSlide, 8000);
        return () => clearInterval(intervalId);
    });

    const dispatch = useCartDispatch();

    // ✅ Handle product edit
    const handleEdit = (product) => {
        setSelectedProduct(product);
        setIsModalOpen(true);
    };

    // ✅ Save edited product (Update)
    const handleSave = async (updatedProduct) => {
        try {
            const response = await fetch(
                `https://lucky-back.onrender.com/api/products/${updatedProduct._id}`,
                {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updatedProduct),
                }
            );

            if (!response.ok) {
                alert('Failed to update product');
                return;
            }

            const data = await response.json();
            console.log("Updated product response:", data);

            setProducts((prev) =>
                prev.map((prod) =>
                    prod._id === updatedProduct._id ? (data.product || updatedProduct) : prod
                )
            );

        } catch (error) {
            console.error(error);
            alert("Error updating product");
        }
    };

    // ✅ Handle delete (open modal)
    const handleDelete = (productId) => {
        setIsDeleteModalOpen(true);
        setSelectedProduct(products.find((product) => product._id === productId));
    };

    // ✅ Confirm delete
    const confirmDelete = async (productId) => {
        try {
            const response = await fetch(
                `https://lucky-back.onrender.com/api/products/${productId}`,
                {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                }
            );

            if (!response.ok) {
                alert('Failed to delete product');
                return;
            }

            const data = await response.json();
            console.log("Delete response:", data);

            setProducts((prev) => prev.filter((prod) => prod._id !== productId));
            dispatch({ type: 'DELETE_PRODUCT', payload: productId });

        } catch (error) {
            console.error(error);
            alert("Error deleting product");
        }
    };

    // ✅ Add to cart
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

    // ✅ Navigate to details
    const handleDetails = (productId) => {
        Navigate(`/productdetails/${productId}`);
    };

    // ✅ Debounced search
    const handleSearchChange = debounce((e) => {
        setSearchTerm(e.target.value);
    }, 500);

    // ✅ Handle new product form change
    const handleNewProductChange = (e) => {
        const { name, value } = e.target;
        setNewProduct((prev) => ({ ...prev, [name]: value }));
    };

    // ✅ Add new product
    const handleAddNewProduct = async (e) => {
        e.preventDefault();

        const { name, mrp, bestBuyPrice, category, model, description, image, keywords, brand, capacity } = newProduct;

        if (!name || !mrp || !bestBuyPrice || !category || !model || !description || !image || !keywords) {
            alert('Please fill all fields');
            return;
        }

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
        };

        try {
            const response = await fetch('https://lucky-back.onrender.com/api/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(productData),
            });

            if (!response.ok) {
                alert('Failed to add product');
                return;
            }

            const data = await response.json();
            console.log("Add product response:", data);

            if (data.product) {
                setProducts((prev) => [...prev, data.product]);
            } else {
                setProducts((prev) => [...prev, data]);
            }

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
            });

            setIsAddModalOpen(false);

        } catch (err) {
            alert('Error: ' + err.message);
        }
    };

    // ✅ Loading
    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
            </div>
        );
    }

    // ✅ Error
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
                                    alt="imagenotfound"
                                />
                            </div>

                            <div className="product-name" onClick={() => handleDetails(product._id)}>
                                {product.name}
                            </div>
                            <p className='stock'>
                                Availability: <span className={`stock-status ${product.stock === 0 ? 'out-of-stock' : 'in-stock'}`}></span>
                                {product.stock === 0 ? 'Out of stock' : 'In stock'}
                            </p>

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

            {/* Add Product Modal */}
            <Modal show={isAddModalOpen} onClose={() => setIsAddModalOpen(false)}>
                <h2>Add New Product</h2>
                <form onSubmit={handleAddNewProduct}>
                    <input type="text" name="name" value={newProduct.name} onChange={handleNewProductChange} placeholder="Product Name" required />
                    <input type="text" name="category" value={newProduct.category} onChange={handleNewProductChange} placeholder="Category" required />
                    <input type="number" name="mrp" value={newProduct.mrp} onChange={handleNewProductChange} placeholder="MRP" required />
                    <input type="number" name="bestBuyPrice" value={newProduct.bestBuyPrice} onChange={handleNewProductChange} placeholder="Best Buy Price" required />
                    <input type="text" name="brand" value={newProduct.brand} onChange={handleNewProductChange} placeholder="Brand Name" required />
                    <input type="text" name="capacity" value={newProduct.capacity} onChange={handleNewProductChange} placeholder="Capacity or Size" required />
                    <input type="text" name="model" value={newProduct.model} onChange={handleNewProductChange} placeholder="Model Number" required />
                    <textarea name="description" value={newProduct.description} onChange={handleNewProductChange} placeholder="Description" required />
                    <input type="url" name="image" value={newProduct.image} onChange={handleNewProductChange} placeholder="Image URL" required />
                    <input type="text" name="keywords" value={newProduct.keywords} onChange={handleNewProductChange} placeholder="Keywords (comma separated)" required />
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
                    <button onClick={() => setIsDeleteModalOpen(false)}>No</button>
                </div>
            </Modal>
        </>
    );
};

export default BrandSearch;
