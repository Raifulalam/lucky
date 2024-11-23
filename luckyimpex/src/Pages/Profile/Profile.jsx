import React, { useContext, useState } from 'react';
import { UserContext } from '../../Components/UserContext';
import ProfileForm from "./ProfileForm";
import './Profile.css';
import Header from "../../Components/Header";
import { useNavigate } from 'react-router-dom';

const Profile = () => {
    const [userDataState, setUserDataState] = useState(null);  // Initialize state to store user data
    const [isEditing, setIsEditing] = useState(false);    // Manage the edit form state
    const navigate = useNavigate();
    const { user, error, loading } = useContext(UserContext); // Use 'user' from context

    // Fetch user data when the component mounts
    if (loading) {
        return <div>Loading...</div>; // Show loading message while data is being fetched
    }

    if (error) {
        return <div>Error: {error}</div>; // Show error message if fetch fails
    }

    if (!user) {
        return <div>No user data found. Please log in.</div>; // Handle case where user data is unavailable
    }

    const handleEditClick = () => {
        setIsEditing(true);
    };

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userRole'); // Clear role on logout
        navigate('/login'); // Navigate to login page after logout
    };

    return (
        <>
            <Header />
            <div className="profile-container">
                <h2>Hey! {user.name.split(" ")[0]} 🙋‍♂️</h2>

                {!isEditing ? (
                    <div className="profile-info">
                        <img src={user.avatar || "default-avatar.png"} alt={user.name} />
                        <button onClick={handleEditClick}>Edit Profile</button>
                        <div className="info-self">
                            <p><strong>Username:</strong> {user.name}</p>
                            <p><strong>Email:</strong> {user.email}</p>
                            <p><strong>UserId:</strong> {user.id}</p>
                            <p><strong>Role:</strong> {user.role}</p>
                            <p><strong>Created At:</strong> {user.created}</p>
                            {/* You can add more details here, like cart, orders, etc. */}
                            <p>Cart</p>
                            <p>Your Orders</p>
                            <p>Location</p>
                        </div>
                    </div>
                ) : (
                    <ProfileForm
                        userData={user} // Pass user data to ProfileForm
                        setUserData={setUserDataState} // Update user data state if needed
                        setIsEditing={setIsEditing} // Close editing state
                    />
                )}
                <button onClick={handleLogout} className='logout'>Logout</button>
            </div>
        </>
    );
};

export default Profile;
