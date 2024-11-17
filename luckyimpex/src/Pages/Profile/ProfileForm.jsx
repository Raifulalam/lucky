import React, { useState, useEffect } from "react";

const ProfileForm = ({ userData, setUserData, setIsEditing }) => {
    const [formData, setFormData] = useState({
        username: userData.username,
        email: userData.email,
        password: "",  // Password field, which will be handled by the user
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const updatedData = { ...formData };
        // If password is empty, do not update the password field
        if (!updatedData.password) {
            delete updatedData.password;
        }

        try {
            const response = await fetch('http://localhost:3000/api/updateUser', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                },
                body: JSON.stringify(updatedData),
            });

            if (!response.ok) {
                throw new Error('Failed to update profile');
            }

            const data = await response.json();
            setUserData(data);  // Update the user data in the parent component
            setIsEditing(false);  // Switch back to the view mode
        } catch (err) {
            console.error('Error:', err.message);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="form-group">
                <label>Username:</label>
                <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                />
            </div>
            <div className="form-group">
                <label>Email:</label>
                <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                />
            </div>
            <div className="form-group">
                <label>Password:</label>
                <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Leave blank to keep the same password"
                />
            </div>
            <button type="submit">Save Changes</button>
        </form>
    );
};

export default ProfileForm;
