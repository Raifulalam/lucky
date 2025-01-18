import React, { useState, useEffect } from 'react';
import './Modal.css'; // Make sure you have a CSS file for styling

const EditMobileModal = ({ isOpen, onClose, product, onSave }) => {
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
                    placeholder="Product Name"
                />
                <input
                    type="text"
                    name="category"
                    value={editedProduct.category || ''}
                    onChange={handleChange}
                    placeholder="Category"
                />
                <input
                    type="text"
                    name="description"
                    value={editedProduct.description || ''}
                    onChange={handleChange}
                    placeholder="Description"
                />
                <input
                    type="text"
                    name="brand"
                    value={editedProduct.brand || ''}
                    onChange={handleChange}
                    placeholder="Brand"
                />
                <input
                    type="text"
                    name="model"
                    value={editedProduct.model || ''}
                    onChange={handleChange}
                    placeholder="Model"
                    required
                />
                <input
                    type="number"
                    name="price"
                    value={editedProduct.price || ''}
                    onChange={handleChange}
                    placeholder="Price"
                />

                <input
                    type="text"
                    name="image"
                    value={editedProduct.image || ''}
                    onChange={handleChange}
                    placeholder="Image URL"
                />
                <input
                    type="number"
                    name="ram"
                    value={editedProduct.ram || ''}
                    onChange={handleChange}
                    placeholder="RAM (GB)"
                />
                <input
                    type="number"
                    name="storage"
                    value={editedProduct.storage || ''}
                    onChange={handleChange}
                    placeholder="Storage (GB)"
                />
                <input
                    type="text"
                    name="battery"
                    value={editedProduct.battery || ''}
                    onChange={handleChange}
                    placeholder="Battery"
                />
                <input
                    type="text"
                    name="camera"
                    value={editedProduct.camera || ''}
                    onChange={handleChange}
                    placeholder="Camera (MP)"
                />
                <input
                    type="text"
                    name="processor"
                    value={editedProduct.processor || ''}
                    onChange={handleChange}
                    placeholder="Processor"
                />
                <input
                    type="text"
                    name="display"
                    value={editedProduct.display || ''}
                    onChange={handleChange}
                    placeholder="Display"
                />
                <input
                    type="text"
                    name="operatingSystem"
                    value={editedProduct.operatingSystem || ''}
                    onChange={handleChange}
                    placeholder="Operating System"
                />
                <input
                    type="text"
                    name="releaseDate"
                    value={editedProduct.releaseDate || ''}
                    onChange={handleChange}
                    placeholder="Release Date"
                />
                <input
                    type="text"
                    name="charging"
                    value={editedProduct.charging || ''}
                    onChange={handleChange}
                    placeholder="Charging"
                />

                <div className="modal-buttons">
                    <button onClick={onClose}>Cancel</button>
                    <button onClick={handleSave}>Save</button>
                </div>
            </div>
        </div>
    );
};

export default EditMobileModal;
