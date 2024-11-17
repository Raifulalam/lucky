import React, { useState, useEffect } from "react";
import ProfileForm from "./ProfileForm";
import './Profile.css';
import Header from "../../Components/Header";
import { Link, useNavigate } from 'react-router-dom';
const Profile = ({ setUserData }) => {
    const [userData, setUserDataState] = useState(null);  // Initialize state to store user data
    const [isEditing, setIsEditing] = useState(false);    // Manage the edit form state
    const [loading, setLoading] = useState(true);          // Manage the loading state
    const [error, setError] = useState(null);              // Manage the error state
    const navigate = useNavigate();
    // Fetch user data when the component mounts
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await fetch('http://localhost:3000/api/userData', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,  // Use JWT from local storage
                    }
                });
                if (!response.ok) {
                    throw new Error('Failed to fetch user data');
                }
                const data = await response.json();
                setUserDataState(data); // Update state with fetched data
            } catch (err) {
                setError(err.message); // Set error message if the fetch fails
            } finally {
                setLoading(false); // Set loading to false when data is fetched or error occurs
            }
        };

        fetchUserData(); // Call the fetch function when the component mounts
    }, []);

    const handleEditClick = () => {
        setIsEditing(true);
    };
    const handleLogout = () => {
        localStorage.removeItem('authToken');
        navigate('/login');
    };
    if (loading) {
        return <div>Loading...</div>; // Show loading message while data is being fetched
    }

    if (error) {
        return <div>Error: {error}</div>; // Show error message if fetch fails
    }

    return (
        <>
            <Header />

            <div className="profile-container">
                <h2>Hey! {userData.name.split()}🙋‍♂️</h2>
                {!isEditing ? (
                    <div className="profile-info">

                        <img src={userData.avtar} alt={userData.name} ></img>
                        <button onClick={handleEditClick}>Edit Profile</button>
                        <p><strong>Username:</strong> {userData.name}</p>
                        <p><strong>Email:</strong> {userData.email}</p>
                        <p><strong>UserId:</strong> {userData.id}</p>
                        <p><strong>Role:</strong> {userData.role}</p>
                        <p><strong>Created At:</strong> {userData.created}</p>

                    </div>
                ) : (
                    <ProfileForm
                        userData={userData}
                        setUserData={setUserData}
                        setIsEditing={setIsEditing}
                    />
                )}
            </div>
            <button onClick={handleLogout} className='dropbtn'>Logout</button>
        </>
    );
};

export default Profile;
