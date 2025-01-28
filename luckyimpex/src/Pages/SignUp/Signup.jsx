import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Signup.css';
import Header from '../../Components/Header';
import { Helmet } from 'react-helmet';
import { useNotification } from '../../Components/NotificationContext';

function SignupComponent() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [location, setLocation] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { addNotification } = useNotification();

    const handleEmailChange = (event) => setEmail(event.target.value);
    const handleNameChange = (event) => setName(event.target.value);
    const handlePasswordChange = (event) => setPassword(event.target.value);
    const handleLocationChange = (event) => setLocation(event.target.value);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true); // Set loading to true

        try {
            const response = await fetch("https://lucky-back-2.onrender.com/api/createUser", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, email, password, location })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Invalid password or Email');
            }

            setSuccess("You have successfully signed up! Redirecting to login page...");

            // Trigger notification for success
            addNotification({
                title: 'Success!',
                message: 'You have successfully signed up! Redirecting to login page...',
                type: 'success',
                container: 'top-right',
                animationIn: ['animate__animated', 'animate__fadeIn'],
                animationOut: ['animate__animated', 'animate__fadeOut'],
                dismiss: {
                    duration: 5000,
                    onScreen: true,
                },
            });

            // Redirect after 2 seconds
            setTimeout(() => {
                navigate('/login');
            }, 3000); // Redirect after 3 seconds

            // Optionally, reset form fields
            setEmail('');
            setPassword('');
            setName('');
            setLocation('');
        } catch (err) {
            setError(err.message || 'An error occurred');
        } finally {
            setLoading(false); // Reset loading state
        }
    };

    return (
        <div>
            <Helmet>
                <title>Sign Up</title>
                <meta name="description" content="Sign up for an account" />
            </Helmet>
            <Header />
            <div className="container">
                <div className="login-form">
                    <h2>Sign Up</h2>
                    <p>Please enter your details.</p>

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="name">Full Name</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={name}
                                onChange={handleNameChange}
                                required
                                placeholder="Enter your full name"
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="email">Email</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={email}
                                onChange={handleEmailChange}
                                required
                                placeholder="Enter your email"
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={password}
                                onChange={handlePasswordChange}
                                required
                                placeholder="Enter your password"
                            />
                        </div>
                        <div className="form-group">
                            <button type="submit" className="submit-button" disabled={loading}>
                                {loading ? 'Registering...' : 'Register'}
                            </button>

                            <a href="/login" className="forgot-password">Already have an account?</a>
                        </div>
                        {error && <div className="error-message">{error}</div>} {/* Show error message */}
                        {success && <div className="success-message">{success}</div>} {/* Show success message */}
                    </form>
                </div>
            </div>
        </div>
    );
}

export default SignupComponent;
