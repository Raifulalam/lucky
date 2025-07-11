import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';  // Use useNavigate instead of useHistory

const ProfileForm = ({ userData, setUserData, setIsEditing }) => {
    const [formData, setFormData] = useState({
        username: userData.username || '',
        email: userData.email || '',
        password: '', // Leave password empty for the user to enter a new one
    });

    const navigate = useNavigate();  // Initialize useNavigate

    useEffect(() => {
        // Prepopulate form data if userData is available
        setFormData({
            username: userData.username || '',
            email: userData.email || '',
            password: '',  // Password will be handled separately
        });
    }, [userData]);

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

        // If password is empty, we don't want to update the password field
        if (!updatedData.password) {
            delete updatedData.password;
        }

        try {
            const response = await fetch('https://lucky-back.onrender.com/api/userData', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`, // Ensure you're passing the JWT token
                },
                body: JSON.stringify(updatedData),
            });

            if (!response.ok) {
                throw new Error('Failed to update profile');
            }

            const data = await response.json();
            setUserData(data);  // Update the user data in the parent component
            setIsEditing(false);  // Switch back to the view mode

            // Optionally, navigate or show success message
            alert('Profile updated successfully!');
            navigate('/profile');  // Navigate to the profile page after update
        } catch (err) {
            console.error('Error:', err.message);
            alert('Failed to update profile. Please try again.');
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
