import React, { useState, useEffect, useContext, useRef, useCallback } from "react";

import Header from "../../../Components/Header";
import { useCartDispatch } from "../../../Components/CreateReducer";
import { useNavigate, useParams } from "react-router-dom";
import luckyImage from "../../../Images/lucky.png";
import backimg from "../../../Images/backimg.jpg";
import back01 from "../../../Images/back01.png";
import back02 from "../../../Images/back04.jpg";
import back03 from "../../../Images/back03.jpg";
import { UserContext } from "../../../Components/UserContext";
import EditProductModal from "../../Products/EditProductModal";
import Modal from "../../../Components/Modal";

const getImageSrc = (src, fallbackSrc) => {
    return src ? `${src}` : fallbackSrc;
};

const Products = () => {
    const { category } = useParams();
    const [products, setProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [newProduct, setNewProduct] = useState({
        name: "",
        mrp: "",
        bestBuyPrice: "",
        category: "",
        model: "",
        description: "",
        image: "",
        keywords: "",
        brand: "",
        capacity: "",
        stock: "",
    });

    const productRefs = useRef({});
    const Navigate = useNavigate();
    const { user } = useContext(UserContext);
    const userRole = user?.role || "user";

    const placeholderImage = "/path/to/placeholder-image.jpg";

    // slider
    const [currentSlide, setCurrentSlide] = useState(0);
    const images = [backimg, back01, back02, back03, luckyImage];
    useEffect(() => {
        const intervalId = setInterval(
            () => setCurrentSlide((prev) => (prev + 1) % images.length),
            4000
        );
        return () => clearInterval(intervalId);
    }, [currentSlide, images.length]);

    const dispatch = useCartDispatch();

    // ✅ Fetch products from backend with pagination + search + category
    const fetchProducts = useCallback(
        async (reset = false) => {
            if (loading) return;
            setLoading(true);
            setError(null);

            try {
                let url = `https://lucky-back.onrender.com/api/products?page=${page}&limit=20`;
                if (category) url += `&category=${category}`;
                if (searchTerm) url += `&search=${searchTerm}`;

                const response = await fetch(url);
                if (!response.ok) throw new Error("Failed to fetch products");

                const data = await response.json();

                if (reset) {
                    setProducts(data.products);
                } else {
                    setProducts((prev) => [...prev, ...data.products]);
                }
                setPages(data.pages);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }, [category, loading, page, searchTerm]
    )


    // Initial load + when category/search changes
    useEffect(() => {
        setPage(1);
        fetchProducts(true);
        // eslint-disable-next-line
    }, [category, searchTerm]);

    // Load more when page changes
    useEffect(() => {
        if (page > 1) fetchProducts();
        // eslint-disable-next-line
    }, [page]);

    // Handle edit
    const handleEdit = (product) => {
        setSelectedProduct(product);
        setIsModalOpen(true);
    };

    const handleSave = async (updatedProduct) => {
        const res = await fetch(
            `https://lucky-back.onrender.com/api/products/${updatedProduct._id}`,
            {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updatedProduct),
            }
        );
        if (res.ok) {
            setProducts((prev) =>
                prev.map((p) => (p._id === updatedProduct._id ? updatedProduct : p))
            );
        }
    };

    // Delete
    const handleDelete = (productId) => {
        setIsDeleteModalOpen(true);
        setSelectedProduct(products.find((p) => p._id === productId));
    };

    const confirmDelete = async (productId) => {
        const res = await fetch(
            `https://lucky-back.onrender.com/api/products/${productId}`,
            { method: "DELETE" }
        );
        if (res.ok) {
            setProducts((prev) => prev.filter((p) => p._id !== productId));
            dispatch({ type: "DELETE_PRODUCT", payload: productId });
        }
    };

    // Cart
    const handleAddToCart = (product) => {
        dispatch({
            type: "ADD_ITEM",
            id: product._id,
            image: product.image,
            name: product.name,
            mrp: product.mrp,
            price: product.price,
        });
    };

    // Details
    const handleDetails = (productId) => {
        Navigate(`/productdetails/${productId}`);
    };

    // Add new product
    const handleNewProductChange = (e) => {
        const { name, value } = e.target;
        setNewProduct((prev) => ({ ...prev, [name]: value }));
    };

    const handleAddNewProduct = async (e) => {
        e.preventDefault();
        const productData = {
            ...newProduct,
            price: newProduct.bestBuyPrice,
            keywords: newProduct.keywords
                ? newProduct.keywords.split(",").map((k) => k.trim())
                : [],
        };
        const res = await fetch("https://lucky-back.onrender.com/api/products", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(productData),
        });
        if (res.ok) {
            const added = await res.json();
            setProducts((prev) => [added, ...prev]);
            setIsAddModalOpen(false);
            setNewProduct({
                name: "",
                mrp: "",
                bestBuyPrice: "",
                category: "",
                model: "",
                description: "",
                image: "",
                keywords: "",
                brand: "",
                capacity: "",
                stock: "",
            });
        }
    };

    if (loading && products.length === 0) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-container">
                <div>Error: {error}</div>
                <button onClick={() => fetchProducts(true)}>Retry</button>
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
                    <img
                        src={images[currentSlide]}
                        alt={`Slide ${currentSlide + 1}`}
                        className="slider-image"
                    />
                </div>
            </div>

            {/* Add Product (Admin only) */}
            {userRole === "admin" && (
                <div className="add-product-button-container">
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="button-primary"
                    >
                        Add New Product
                    </button>
                </div>
            )}

            {/* Product List */}
            <div className="product-grid">
                {products.length > 0 ? (
                    products.map((product) => (
                        <div
                            key={product._id}
                            ref={(el) => (productRefs.current[product._id] = el)}
                            className="product-container"
                        >
                            <div
                                className="product-image-container"
                                onClick={() => handleDetails(product._id)}
                            >
                                <img
                                    className="product-image"
                                    src={getImageSrc(product.image, placeholderImage)}
                                    alt="Not found"
                                />
                            </div>

                            <div
                                className="product-name"
                                onClick={() => handleDetails(product._id)}
                            >
                                {product.name}
                            </div>
                            <p className="stock">

                                <span
                                    className={`stock-status ${product.stock === 0 ? "out-of-stock" : "in-stock"
                                        }`}
                                ></span>
                                {product.stock === 0 ? "Out of stock" : "In stock"}
                            </p>
                            <div className="product-size">Size: {product.capacity}</div>
                            <div className="product-model">Model: {product.model}</div>
                            <div className="product-mrp">
                                MRP:Rs {product.mrp ? product.mrp.toFixed(0) : "N/A"}
                            </div>
                            <div className="product-discount">
                                <p>
                                    Save Upto:{""}Rs
                                    {product.mrp && product.price
                                        ? (product.mrp - product.price).toFixed(0)
                                        : "N/A"}
                                </p>
                            </div>
                            <div className="product-price">
                                <p>
                                    Best Buy: {product.price ? product.price.toFixed(0) : "N/A"}
                                </p>
                            </div>

                            {userRole === "admin" ? (
                                <div className="product-actions">
                                    <button
                                        className="edit-btn"
                                        onClick={() => handleEdit(product)}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        className="delete-btn"
                                        onClick={() => handleDelete(product._id)}
                                    >
                                        Delete
                                    </button>
                                </div>
                            ) : (
                                <button
                                    className="add-to-cart-button button-primary"
                                    onClick={() => handleAddToCart(product)}
                                >
                                    Add to Cart
                                </button>
                            )}
                        </div>
                    ))
                ) : (
                    <div className="no-products-found">No products found.</div>
                )}
            </div>

            {/* Load More */}
            {page < pages && (
                <div className="load-more-container">
                    <button
                        className="button-primary"
                        disabled={loading}
                        onClick={() => setPage((prev) => prev + 1)}
                    >
                        {loading ? "Loading..." : "Load More"}
                    </button>
                </div>
            )}

            {/* Add Product Modal */}
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

            {/* Edit Product Modal */}
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
                    <button
                        onClick={() => confirmDelete(selectedProduct?._id)}
                        className="button-primary"
                    >
                        Yes, Delete
                    </button>
                    <button
                        onClick={() => setIsDeleteModalOpen(false)}
                        className="button-secondary"
                    >
                        Cancel
                    </button>
                </div>
            </Modal>
        </>
    );
};

export default Products;
