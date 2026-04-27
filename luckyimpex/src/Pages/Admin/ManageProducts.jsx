import React, { useState, useEffect } from "react";
import './ManageProducts.css'; // You can add your own CSS styling
import Modal from '../../Components/Modal'; // Assuming you have a modal component for confirmation
import { authRequest, getData } from "../../api/api";

const ManageProducts = () => {
    const [products, setProducts] = useState([]);
    const [newProduct, setNewProduct] = useState({ name: '', price: '', description: '', image: '' });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false); // Modal for adding new product
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false); // Modal for confirming product deletion
    const [selectedProduct, setSelectedProduct] = useState(null); // Product to be edited or deleted

    // Fetch products from API
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const data = await getData("/products/products?page=1&limit=100");
                setProducts(data.products || []);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    // Handle input changes for new product
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewProduct((prev) => ({ ...prev, [name]: value }));
    };

    // Add a new product to the API
    const handleAddProduct = async (e) => {
        e.preventDefault();
        try {
            const addedProduct = await authRequest("/products/products", {
                method: "POST",
                body: newProduct,
            });
            setProducts((prevProducts) => [...prevProducts, addedProduct]);
            setNewProduct({ name: '', price: '', description: '', image: '' }); // Clear form after adding
            setIsAddModalOpen(false); // Close modal
        } catch (err) {
            setError(err.message);
        }
    };

    // Handle product deletion
    const handleDeleteProduct = (productId) => {
        setSelectedProduct(products.find((product) => product._id === productId));
        setIsDeleteModalOpen(true);
    };

    // Confirm product deletion
    const confirmDelete = async () => {
        try {
            await authRequest(`/products/products/${selectedProduct._id}`, {
                method: "DELETE",
            });
            setProducts((prevProducts) => prevProducts.filter((product) => product._id !== selectedProduct._id));
            setIsDeleteModalOpen(false); // Close modal
        } catch (err) {
            setError(err.message);
        }
    };

    // Handle product editing
    const handleEditProduct = async (productId) => {
        const updatedProduct = { price: prompt('Enter new price') };

        try {
            if (!updatedProduct.price) {
                return;
            }

            const updatedData = await authRequest(`/products/products/${productId}`, {
                method: "PUT",
                body: updatedProduct,
            });
            setProducts((prevProducts) =>
                prevProducts.map((product) =>
                    product._id === productId ? { ...product, ...updatedData } : product
                )
            );
        } catch (err) {
            setError(err.message);
        }
    };

    if (loading) {
        return <div>Loading products...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div className="manage-products">
            <h1>Manage Products</h1>

            {/* Add New Product Form */}
            <button onClick={() => setIsAddModalOpen(true)}>Add New Product</button>

            <form onSubmit={handleAddProduct}>
                {isAddModalOpen && (
                    <Modal show={isAddModalOpen} onClose={() => setIsAddModalOpen(false)}>
                        <h2>Add New Product</h2>
                        <input
                            type="text"
                            name="name"
                            placeholder="Product Name"
                            value={newProduct.name}
                            onChange={handleInputChange}
                            required
                        />
                        <input
                            type="number"
                            name="price"
                            placeholder="Product Price"
                            value={newProduct.price}
                            onChange={handleInputChange}
                            required
                        />
                        <textarea
                            name="description"
                            placeholder="Product Description"
                            value={newProduct.description}
                            onChange={handleInputChange}
                            required
                        />
                        <input
                            type="text"
                            name="image"
                            placeholder="Product Image URL"
                            value={newProduct.image}
                            onChange={handleInputChange}
                        />
                        <button type="submit">Add Product</button>
                    </Modal>
                )}
            </form>

            {/* List of Products */}
            <h2>Product List</h2>
            <div className="product-list">
                {products.length > 0 ? (
                    products.map((product) => (
                        <div key={product._id} className="product-item">
                            <h3>{product.name}</h3>
                            <p>{product.description}</p>
                            <p>Price: ${product.price}</p>
                            <div className="actions">
                                <button onClick={() => handleEditProduct(product._id)}>Edit</button>
                                <button onClick={() => handleDeleteProduct(product._id)}>Delete</button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div>No products available</div>
                )}
            </div>

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
                            confirmDelete();
                            setIsDeleteModalOpen(false);
                        }}
                    >
                        Confirm Delete
                    </button>
                </div>
            </Modal>
        </div>
    );
};

export default ManageProducts;
