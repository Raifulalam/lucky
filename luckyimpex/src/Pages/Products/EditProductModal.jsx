import React, { useState, useEffect } from 'react';
import './Modal.css'; // Make sure you have a CSS file for styling

const EditProductModal = ({ isOpen, onClose, product, onSave }) => {
    const [editedProduct, setEditedProduct] = useState({});

    useEffect(() => {
        if (product) {
            setEditedProduct({ ...product });
        }
    }, [product]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEditedProduct((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSave = () => {
        onSave(editedProduct);
        onClose();  // Close modal after save
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>Edit Product</h2>
                <label>Product Name:</label>
                <input
                    type="text"
                    name="name"
                    value={editedProduct.name || ''}
                    onChange={handleChange}
                />
                <label>Price:</label>
                <input
                    type="number"
                    name="price"
                    value={editedProduct.price || ''}
                    onChange={handleChange}
                />
                <label>MRP:</label>
                <input
                    type="number"
                    name="mrp"
                    value={editedProduct.mrp || ''}
                    onChange={handleChange}
                />
                <label>Image URL:</label>
                <input
                    type="text"
                    name="image"
                    value={editedProduct.image || ''}
                    onChange={handleChange}
                />
                <div className="modal-buttons">
                    <button onClick={onClose}>Cancel</button>
                    <button onClick={handleSave}>Save</button>
                </div>
            </div>
        </div>
    );
};

export default EditProductModal;
