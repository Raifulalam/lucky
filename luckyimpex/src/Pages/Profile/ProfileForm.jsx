import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';  // Use useNavigate instead of useHistory
import { authRequest } from "../../api/api";

const ProfileForm = ({ userData, setUserData, setIsEditing }) => {
    const [formData, setFormData] = useState({
        name: userData.name || userData.username || '',
        email: userData.email || '',
    });

    const navigate = useNavigate();  // Initialize useNavigate

    useEffect(() => {
        // Prepopulate form data if userData is available
        setFormData({
            name: userData.name || userData.username || '',
            email: userData.email || '',
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

        try {
            const data = await authRequest('/users/me', {
                method: 'PUT',
                body: {
                    name: formData.name,
                },
            });
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
                <label>Name:</label>
                <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                />
            </div>
            <div className="form-group">
                <label>Email:</label>
                <input
                    type="email"
                    name="email"
                    value={formData.email}
                    readOnly
                />
            </div>
            <button type="submit">Save Changes</button>
        </form>
    );
};

export default ProfileForm;
