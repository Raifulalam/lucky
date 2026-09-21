import React, { useState, useEffect } from "react";
import { Warehouse, Plus, Edit, Trash2, MapPin, Phone, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { authRequest } from "../../api/api";
import "./WarehouseManagement.css";

const WarehouseManagement = () => {
    const [warehouses, setWarehouses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingWarehouse, setEditingWarehouse] = useState(null);

    const [formData, setFormData] = useState({
        name: "",
        code: "",
        address: "",
        manager: "",
        phone: "",
        isActive: true
    });

    useEffect(() => {
        fetchWarehouses();
    }, []);

    const fetchWarehouses = async () => {
        setLoading(true);
        try {
            const data = await authRequest("/inventory/warehouses");
            setWarehouses(data.data || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (editingWarehouse) {
                await authRequest(`/inventory/warehouses/${editingWarehouse._id}`, {
                    method: "PUT",
                    body: formData
                });
                alert("Warehouse updated successfully!");
            } else {
                await authRequest("/inventory/warehouses", {
                    method: "POST",
                    body: formData
                });
                alert("Warehouse created successfully!");
            }

            setIsModalOpen(false);
            setEditingWarehouse(null);
            setFormData({
                name: "",
                code: "",
                address: "",
                manager: "",
                phone: "",
                isActive: true
            });
            fetchWarehouses();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (warehouse) => {
        setEditingWarehouse(warehouse);
        setFormData({
            name: warehouse.name,
            code: warehouse.code,
            address: warehouse.address || "",
            manager: warehouse.manager || "",
            phone: warehouse.phone || "",
            isActive: warehouse.isActive
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (warehouseId) => {
        if (!window.confirm("Are you sure you want to delete this warehouse?")) return;

        try {
            await authRequest(`/inventory/warehouses/${warehouseId}`, {
                method: "DELETE"
            });
            alert("Warehouse deleted successfully!");
            fetchWarehouses();
        } catch (err) {
            alert("Error: " + err.message);
        }
    };

    const openModal = () => {
        setEditingWarehouse(null);
        setFormData({
            name: "",
            code: "",
            address: "",
            manager: "",
            phone: "",
            isActive: true
        });
        setIsModalOpen(true);
    };

    if (loading) {
        return (
            <div className="warehouse-management">
                <div className="loading-state">Loading warehouses...</div>
            </div>
        );
    }

    return (
        <div className="warehouse-management">
            <div className="page-header">
                <div className="header-left">
                    <h1>Warehouse Management</h1>
                    <p className="subtitle">Manage your inventory locations</p>
                </div>
                <button className="btn btn-primary" onClick={openModal}>
                    <Plus size={18} />
                    Add Warehouse
                </button>
            </div>

            <div className="warehouses-grid">
                {warehouses.length === 0 ? (
                    <div className="empty-state">
                        <Warehouse size={48} />
                        <p>No warehouses found</p>
                    </div>
                ) : (
                    warehouses.map(warehouse => (
                        <motion.div
                            key={warehouse._id}
                            className="warehouse-card"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <div className="warehouse-header">
                                <div className="warehouse-name">
                                    <Warehouse size={24} />
                                    <h3>{warehouse.name}</h3>
                                </div>
                                <span className={`status-badge ${warehouse.isActive ? "active" : "inactive"}`}>
                                    {warehouse.isActive ? "Active" : "Inactive"}
                                </span>
                            </div>
                            <div className="warehouse-details">
                                <div className="detail-item">
                                    <span className="detail-label">Code:</span>
                                    <span className="detail-value">{warehouse.code}</span>
                                </div>
                                {warehouse.address && (
                                    <div className="detail-item">
                                        <MapPin size={14} />
                                        <span>{warehouse.address}</span>
                                    </div>
                                )}
                                {warehouse.manager && (
                                    <div className="detail-item">
                                        <User size={14} />
                                        <span>{warehouse.manager}</span>
                                    </div>
                                )}
                                {warehouse.phone && (
                                    <div className="detail-item">
                                        <Phone size={14} />
                                        <span>{warehouse.phone}</span>
                                    </div>
                                )}
                            </div>
                            <div className="warehouse-actions">
                                <button
                                    className="btn btn-sm btn-secondary"
                                    onClick={() => handleEdit(warehouse)}
                                >
                                    <Edit size={14} />
                                    Edit
                                </button>
                                <button
                                    className="btn btn-sm btn-danger"
                                    onClick={() => handleDelete(warehouse._id)}
                                >
                                    <Trash2 size={14} />
                                    Delete
                                </button>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>

            <AnimatePresence>
                {isModalOpen && (
                    <motion.div
                        className="modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsModalOpen(false)}
                    >
                        <motion.div
                            className="modal-content"
                            initial={{ scale: 0.95, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="modal-header">
                                <h2>{editingWarehouse ? "Edit Warehouse" : "Add Warehouse"}</h2>
                                <button className="modal-close" onClick={() => setIsModalOpen(false)}>×</button>
                            </div>
                            <form onSubmit={handleSubmit} className="warehouse-form">
                                <div className="form-group">
                                    <label>Name *</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="Warehouse name"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Code *</label>
                                    <input
                                        type="text"
                                        name="code"
                                        value={formData.code}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="e.g., MS, WH, GH"
                                        style={{ textTransform: "uppercase" }}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Address</label>
                                    <input
                                        type="text"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleInputChange}
                                        placeholder="Full address"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Manager</label>
                                    <input
                                        type="text"
                                        name="manager"
                                        value={formData.manager}
                                        onChange={handleInputChange}
                                        placeholder="Manager name"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Phone</label>
                                    <input
                                        type="text"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        placeholder="Contact number"
                                    />
                                </div>
                                <div className="form-group checkbox-group">
                                    <label>
                                        <input
                                            type="checkbox"
                                            name="isActive"
                                            checked={formData.isActive}
                                            onChange={handleInputChange}
                                        />
                                        <span>Active</span>
                                    </label>
                                </div>
                                {error && <div className="error-message">{error}</div>}
                                <div className="form-actions">
                                    <button type="submit" className="btn btn-primary" disabled={loading}>
                                        {loading ? "Saving..." : editingWarehouse ? "Update" : "Create"}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default WarehouseManagement;
