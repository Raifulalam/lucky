import React, { useState, useEffect } from "react";
import { Search, RefreshCw,  Package } from "lucide-react";
import { authRequest } from "../../api/api";
import "./MovementLedger.css";

const MovementLedger = () => {
    const [movements, setMovements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [filters, setFilters] = useState({
        productId: "",
        movementType: "",
        page: 1
    });

    const [searchTerm, setSearchTerm] = useState("");

 useEffect(() => {
    const fetchMovements = async () => {
        setLoading(true);

        try {
            const params = new URLSearchParams();

            if (filters.productId) {
                params.append("productId", filters.productId);
            }

            if (filters.movementType) {
                params.append("movementType", filters.movementType);
            }

            params.append("page", filters.page);
            params.append("limit", 50);

            const data = await authRequest(
                `/inventory/movements?${params.toString()}`
            );

            setMovements(data.data || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    fetchMovements();
}, [filters]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const getMovementTypeBadge = (type) => {
        const colors = {
            PURCHASE: "green",
            SALE: "red",
            SALE_RETURN: "blue",
            PURCHASE_RETURN: "orange",
            TRANSFER_OUT: "purple",
            TRANSFER_IN: "green",
            ADJUSTMENT_IN: "blue",
            ADJUSTMENT_OUT: "red",
            DAMAGE: "red",
            OPENING_STOCK: "gray"
        };
        return colors[type] || "gray";
    };

    const filteredMovements = movements.filter(m =>
        m.movementId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (m.productId?.name && m.productId.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (loading) {
        return (
            <div className="movement-ledger">
                <div className="loading-state">
                    <RefreshCw className="spinner" size={40} />
                    <p>Loading movements...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="movement-ledger">
            <div className="page-header">
                <div className="header-left">
                    <h1>Inventory Movement Ledger</h1>
                    <p className="subtitle">Complete audit trail of all stock movements</p>
                </div>
            </div>

            <div className="filters-bar">
                <div className="search-box">
                    <Search size={18} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search movements..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="filter-group">
                    <select
                        name="movementType"
                        value={filters.movementType}
                        onChange={handleFilterChange}
                    >
                        <option value="">All Types</option>
                        <option value="PURCHASE">Purchase</option>
                        <option value="SALE">Sale</option>
                        <option value="SALE_RETURN">Sale Return</option>
                        <option value="PURCHASE_RETURN">Purchase Return</option>
                        <option value="TRANSFER_OUT">Transfer Out</option>
                        <option value="TRANSFER_IN">Transfer In</option>
                        <option value="ADJUSTMENT_IN">Adjustment In</option>
                        <option value="ADJUSTMENT_OUT">Adjustment Out</option>
                        <option value="DAMAGE">Damage</option>
                        <option value="OPENING_STOCK">Opening Stock</option>
                    </select>
                </div>
            </div>

            <div className="table-container">
                <table className="movement-table">
                    <thead>
                        <tr>
                            <th>Movement ID</th>
                            <th>Date</th>
                            <th>Product</th>
                            <th>Type</th>
                            <th>Quantity</th>
                            <th>Previous</th>
                            <th>New</th>
                            <th>Location</th>
                            <th>User</th>
                            <th>Reason</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredMovements.length > 0 ? (
                            filteredMovements.map(movement => (
                                <tr key={movement._id}>
                                    <td className="movement-id">{movement.movementId}</td>
                                    <td>
                                        {new Date(movement.createdAt).toLocaleString()}
                                    </td>
                                    <td>{movement.productId?.name || "-"}</td>
                                    <td>
                                        <span className={`type-badge type-${getMovementTypeBadge(movement.movementType)}`}>
                                            {movement.movementType}
                                        </span>
                                    </td>
                                    <td className={`quantity ${movement.quantity > 0 ? "positive" : "negative"}`}>
                                        {movement.quantity > 0 ? "+" : ""}{movement.quantity}
                                    </td>
                                    <td>{movement.previousStock}</td>
                                    <td>{movement.newStock}</td>
                                    <td>{movement.locationId?.name || "-"}</td>
                                    <td>{movement.userId?.name || "-"}</td>
                                    <td>{movement.reason || "-"}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="10" className="no-data">
                                    <Package size={48} />
                                    <p>No movements found</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {error && <div className="error-message">{error}</div>}
        </div>
    );
};

export default MovementLedger;
