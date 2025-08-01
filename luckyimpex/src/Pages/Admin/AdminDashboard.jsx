import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './AdminDashboard.css';
import Modal from '../../Components/Modal';

const AdminDashboard = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [userIdToDelete, setUserIdToDelete] = useState(null);
    const [userToEdit, setUserToEdit] = useState(null);

    // Fetch users from the server
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await fetch('https://lucky-back.onrender.com/api/users');
                const data = await response.json();
                setUsers(data); // Set fetched users in state
            } catch (error) {
                console.error('Error fetching users:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    // Function to handle user deletion
    const handleDeleteUser = async () => {
        try {
            const response = await fetch(`https://lucky-back.onrender.com/api/users/${userIdToDelete}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Deleted user:', data.user);

                // Remove the user from the state after successful deletion
                setUsers(prevUsers => prevUsers.filter(user => user._id !== userIdToDelete));
                setIsDeleteModalOpen(false);  // Close the delete modal
            } else {
                console.error('Error deleting user');
            }
        } catch (error) {
            console.error('Error deleting user:', error);
        }
    };

    // Open the delete confirmation modal
    const openDeleteModal = (userId) => {
        setUserIdToDelete(userId);
        setIsDeleteModalOpen(true);
    };

    // Close the delete modal
    const closeDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setUserIdToDelete(null); // Clear the user ID for deletion
    };

    // Open the edit modal and prefill the user data
    const openEditModal = (user) => {
        setUserToEdit({ ...user });
        setIsEditModalOpen(true);
    };

    // Close the edit modal
    const closeEditModal = () => {
        setIsEditModalOpen(false);
        setUserToEdit(null);
    };

    const handleUpdateUser = async (updatedUser) => {
        try {
            const response = await fetch(`https://lucky-back.onrender.com/api/users/${updatedUser._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedUser),
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Updated user:', data);

                // Update the user in the local state
                setUsers(prevUsers => prevUsers.map(user => (user._id === updatedUser._id ? data : user)));
                setIsEditModalOpen(false); // Close the edit modal
            } else {
                const errorData = await response.json();
                console.error('Failed to update user:', errorData.message);
            }
        } catch (error) {
            console.error('Error updating user:', error);
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <>
            <title>Admin Dashboard</title> {/* Add the page title */}

            <div className="admin-dashboard">


                <section className="section">
                    <h3>Manage Users</h3>
                    <h4>Total Users:{users.length}</h4>
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>User Id</th>
                                <th>Created At</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user._id}>
                                    <td>{user.name}</td>
                                    <td>{user.email}</td>
                                    <td>{user.role}</td>
                                    <td>{user._id}</td>
                                    <td>{new Date(user.created_at).toLocaleDateString()}</td>
                                    <td>
                                        <button type="button" onClick={() => openEditModal(user)}>Edit</button>
                                        <button type="button" onClick={() => openDeleteModal(user._id)}>Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                </section>

                {/* Delete Confirmation Modal */}
                <Modal show={isDeleteModalOpen} onClose={closeDeleteModal}>
                    <h3>Are you sure you want to delete this user?</h3>
                    <button type="button" onClick={handleDeleteUser}>Yes, Delete</button>
                    <button type="button" onClick={closeDeleteModal}>Cancel</button>
                </Modal>

                {/* Edit User Modal */}
                {isEditModalOpen && userToEdit && (
                    <Modal show={isEditModalOpen} onClose={closeEditModal}>
                        <h3>Edit User</h3>
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleUpdateUser(userToEdit);
                            }}
                        >
                            <div className="form-group">
                                <label htmlFor="name">Name</label>
                                <input
                                    type="text"
                                    id="name"
                                    value={userToEdit.name}
                                    onChange={(e) => setUserToEdit({ ...userToEdit, name: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="email">Email</label>
                                <input
                                    type="email"
                                    id="email"
                                    value={userToEdit.email}
                                    onChange={(e) => setUserToEdit({ ...userToEdit, email: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="role">Role</label>
                                <input
                                    type="text"
                                    id="role"
                                    value={userToEdit.role}
                                    onChange={(e) => setUserToEdit({ ...userToEdit, role: e.target.value })}
                                />
                            </div>
                            <button type="submit">Save Changes</button>
                        </form>
                        <button type="button" onClick={closeEditModal}>Cancel</button>
                    </Modal>
                )}
            </div>
        </>
    );
};

export default AdminDashboard;
