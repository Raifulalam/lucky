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
                <input
                    type="text"
                    name="name"
                    value={editedProduct.name || ''}
                    onChange={handleChange}
                    placeholder='Name of product'
                />
                <input
                    type="text"
                    name="description"
                    value={editedProduct.description || ''}
                    onChange={handleChange}
                    placeholder='description of product'

                />
                <input
                    type="text"
                    name="brand"
                    value={editedProduct.brand || ''}
                    onChange={handleChange}
                    placeholder='Brand Name'
                />
                <input
                    type="number"
                    name="price"
                    value={editedProduct.price || ''}
                    onChange={handleChange}
                    placeholder='Price of product'
                />
                <input
                    type="number"
                    name="mrp"
                    value={editedProduct.mrp || ''}
                    onChange={handleChange}
                    placeholder='MRP of product'
                />
                <input
                    type="text"
                    name="image"
                    value={editedProduct.image || ''}
                    onChange={handleChange}
                    placeholder='Image URL of product'
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
