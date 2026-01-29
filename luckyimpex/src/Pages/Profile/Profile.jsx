import React, { useContext, useState, useEffect } from 'react';
import { UserContext } from '../../Components/UserContext';
import ProfileForm from "./ProfileForm";
import './Profile.css';
import Header from "../../Components/Header";
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
//mport OrderPage from '../Customer/OrderPage';

const Profile = () => {
    const { user, error, loading } = useContext(UserContext); // Use 'user' from context
    const [isEditing, setIsEditing] = useState(false);    // Manage the edit form state
    const [userDataState, setUserDataState] = useState(user);  // Store user data in state
    const navigate = useNavigate();
    const [isdotOpen, setIsdotOpen] = useState(false)

    // Set user data when the context user data changes
    useEffect(() => {
        setUserDataState(user);
    }, [user]);

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <img className="spinner-gif" src="spinner.gif" alt="loading products..." />

            </div>
        );
    }
    // const handleReviewClick = (orderId) => {
    //     navigate(`/review/${orderId}`); // Navigate to Review page with order ID
    // };
    // if (error) {
    //     return <div>Error: {error}</div>; // Show error message if fetch fails
    // }

    // if (!user) {
    //     return <div>No user data found. Please log in.</div>; // Handle case where user data is unavailable
    // }

    const handleEditClick = () => {
        setIsEditing(true);
    };
    const handleDotClick = () => {
        setIsdotOpen(!isdotOpen)
    }

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        navigate('/'); // Redirect to home after logout
    };

    const isAdmin = user.role === 'admin'; // Check if the user is an admin

    return (
        <>
            <Helmet>
                <title>Your Profile - Lucky Impex</title>
                <meta name="description" content="Manage your account and view your orders at Lucky Impex." />
            </Helmet>
            <Header />
            <div className="profile-container">
                <h2>Hey! {user.name.split(" ")[0]} 🙋‍♂️</h2>
                <span className='three-dot'>
                    {/* Three dots button */}
                    <button onClick={handleDotClick} aria-label="More options">
                        &#x22EE; {/* Unicode for three dots */}
                    </button>


                    {isdotOpen && (
                        <div className="menu">
                            <button onClick={handleEditClick}>Edit Profile</button>


                            {isAdmin && (
                                <>
                                    <button onClick={() => navigate('/admindashboard')}>Go to Admin Dashboard</button>
                                    <button onClick={() => navigate('/products')}>Add Product</button>
                                    <button onClick={() => navigate('/orders')}>Manage Orders</button>
                                    <button onClick={() => navigate('/admindashboard')}>Manage Users</button>
                                    <button onClick={() => navigate('/manage-promotions')}>Manage Promotions</button>

                                </>
                            )}

                            <button onClick={handleLogout} className="logout">Logout</button>

                        </div>
                    )}
                </span>

                {!isEditing ? (
                    <div className="profile-info">
                        <img src={user.avatar || "default-avatar.png"} alt={user.name} />
                        <div className="info-self">
                            <p><strong>Username:</strong> {user.name}</p>
                            <p><strong>Email:</strong> {user.email}</p>
                            <p><strong>UserId:</strong> {user.id}</p>
                            <p><strong>Role:</strong> {user.role}</p>
                            <p><strong>Created At:</strong> {user.created}</p>
                            <button onClick={() => navigate('/orderpage')}>My Orders</button>
                        </div>
                    </div>
                ) : (
                    <ProfileForm
                        userData={userDataState} // Pass user data to ProfileForm
                        setUserData={setUserDataState} // Update user data state if needed
                        setIsEditing={setIsEditing}
                    />
                )}

                {/* Render Admin Dashboard link if user is admin */}



            </div>
        </>
    );
};

export default Profile;
