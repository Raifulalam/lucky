import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const [users, setUsers] = useState([]);
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetching users, products, and orders from the server (mocked here)
    useEffect(() => {
        const fetchAdminData = async () => {
            try {
                // Mock data fetch
                setUsers([
                    { id: 1, name: 'John Doe', email: 'john@example.com' },
                    { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
                ]);

                setProducts([
                    { id: 1, name: 'Samsung TV', price: '$500' },
                    { id: 2, name: 'LG Refrigerator', price: '$800' }
                ]);

                setOrders([
                    { id: 1, product: 'Samsung TV', status: 'Pending' },
                    { id: 2, product: 'LG Refrigerator', status: 'Shipped' }
                ]);
            } catch (error) {
                console.error('Error fetching admin data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchAdminData();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="admin-dashboard">
            <h2>Admin Dashboard</h2>

            <div className="section">
                <h3>Manage Users</h3>
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user.id}>
                                <td>{user.name}</td>
                                <td>{user.email}</td>
                                <td>
                                    <button>Edit</button>
                                    <button>Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <Link to="/manage-users" className="link">View All Users</Link>
            </div>

            <div className="section">
                <h3>Manage Products</h3>
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Product</th>
                            <th>Price</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map(product => (
                            <tr key={product.id}>
                                <td>{product.name}</td>
                                <td>{product.price}</td>
                                <td>
                                    <button>Edit</button>
                                    <button>Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <Link to="/manage-products" className="link">View All Products</Link>
            </div>

            <div className="section">
                <h3>Manage Orders</h3>
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Product</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map(order => (
                            <tr key={order.id}>
                                <td>{order.product}</td>
                                <td>{order.status}</td>
                                <td>
                                    <button>Update Status</button>
                                    <button>Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <Link to="/manage-orders" className="link">View All Orders</Link>
            </div>
        </div>
    );
};

export default AdminDashboard;
