import React, { useEffect, useState } from "react";
import "./Modal.css";

const getProductImage = (product) => product?.images?.[0] || product?.image || "";

const EditProductModal = ({ isOpen, onClose, product, onSave }) => {
    const [editedProduct, setEditedProduct] = useState({});
    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState("");

    useEffect(() => {
        if (product) {
            setEditedProduct({ ...product });
            setSelectedImage(null);
            setImagePreview(getProductImage(product));
        }
    }, [product]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEditedProduct((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files?.[0] || null;
        setSelectedImage(file);
        setImagePreview(file ? URL.createObjectURL(file) : getProductImage(product));
    };

    const handleSave = () => {
        const formData = new FormData();
        formData.append("name", editedProduct.name || "");
        formData.append("category", editedProduct.category || "");
        formData.append("description", editedProduct.description || "");
        formData.append("brand", editedProduct.brand || "");
        formData.append("model", editedProduct.model || "");
        formData.append("price", editedProduct.price || "");
        formData.append("mrp", editedProduct.mrp || "");
        formData.append("stock", editedProduct.stock || "");
        if (selectedImage) {
            formData.append("image", selectedImage);
        } else if (getProductImage(editedProduct)) {
            formData.append("images", getProductImage(editedProduct));
        }

        onSave({ _id: editedProduct._id, payload: formData });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>Edit Product</h2>

                <input
                    type="text"
                    name="name"
                    value={editedProduct.name || ""}
                    onChange={handleChange}
                    placeholder="Name of product"
                />
                <input
                    type="text"
                    name="category"
                    value={editedProduct.category || ""}
                    onChange={handleChange}
                    placeholder="Category of product"
                />
                <input
                    type="text"
                    name="description"
                    value={editedProduct.description || ""}
                    onChange={handleChange}
                    placeholder="Description of product"
                />
                <input
                    type="text"
                    name="brand"
                    value={editedProduct.brand || ""}
                    onChange={handleChange}
                    placeholder="Brand Name"
                />
                <input
                    type="text"
                    name="model"
                    value={editedProduct.model || ""}
                    onChange={handleChange}
                    placeholder="Model"
                    required
                />
                <input
                    type="number"
                    name="price"
                    value={editedProduct.price || ""}
                    onChange={handleChange}
                    placeholder="Price of product"
                />
                <input
                    type="number"
                    name="mrp"
                    value={editedProduct.mrp || ""}
                    onChange={handleChange}
                    placeholder="MRP of product"
                />

                <div className="image-upload-preview">
                    {imagePreview ? <img src={imagePreview} alt="Product preview" /> : <span>No image</span>}
                </div>
                <input
                    type="file"
                    name="image"
                    accept="image/*"
                    onChange={handleImageChange}
                />

                <input
                    type="number"
                    name="stock"
                    value={editedProduct.stock || ""}
                    onChange={handleChange}
                    placeholder="Stock"
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
