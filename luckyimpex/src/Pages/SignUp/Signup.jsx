import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Signup.css';
import Header from '../../Components/Header';
import { Helmet } from 'react-helmet';
import { useNotification } from '../../Components/NotificationContext';

function SignupComponent() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [location, setLocation] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { addNotification } = useNotification();

    const handleEmailChange = (event) => setEmail(event.target.value);
    const handleNameChange = (event) => setName(event.target.value);
    const handlePasswordChange = (event) => setPassword(event.target.value);
    const handleLocationChange = (event) => setLocation(event.target.value);
    const handlePasswordVisibilityToggle = () => setShowPassword((prev) => !prev);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true); // Set loading to true

        try {
            const response = await fetch("https://lucky-1-6ma5.onrender.com/api/users/register", {
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
            <section className="auth-page auth-page-register">
                <div className="auth-shell">
                    <div className="auth-aside auth-aside-register">
                        <div className="auth-brand-badge">Lucky Impex</div>
                        <h1>Create your customer account in a few steps.</h1>
                        <p>
                            Register once to save your details, access future orders, and shop
                            products faster across the Lucky Impex store.
                        </p>
                        <div className="auth-feature-list">
                            <div className="auth-feature-item">
                                <strong>Single account access</strong>
                                <span>Keep your cart, account details, and order activity together.</span>
                            </div>
                            <div className="auth-feature-item">
                                <strong>Easy reorders</strong>
                                <span>Come back anytime and continue shopping without starting over.</span>
                            </div>
                            <div className="auth-feature-item">
                                <strong>Clean onboarding</strong>
                                <span>Only the details needed to create your customer profile.</span>
                            </div>
                        </div>
                    </div>

                    <div className="auth-card">
                        <div className="auth-card-header">
                            <span className="auth-kicker">New Account</span>
                            <h2>Register</h2>
                            <p>Fill in your basic details to start shopping and managing orders.</p>
                        </div>

                        <form onSubmit={handleSubmit} className="auth-form">
                            <div className="form-group">
                                <label htmlFor="name">Full name</label>
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
                                <label htmlFor="email">Email address</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={email}
                                    onChange={handleEmailChange}
                                    required
                                    placeholder="name@example.com"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="location">Location</label>
                                <input
                                    type="text"
                                    id="location"
                                    name="location"
                                    value={location}
                                    onChange={handleLocationChange}
                                    placeholder="City or area"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="password">Password</label>
                                <div className="password-container">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        id="password"
                                        name="password"
                                        value={password}
                                        onChange={handlePasswordChange}
                                        required
                                        placeholder="Create a secure password"
                                    />
                                    <button
                                        type="button"
                                        className="toggle-password"
                                        onClick={handlePasswordVisibilityToggle}
                                        aria-label={showPassword ? "Hide password" : "Show password"}
                                    >
                                        {showPassword ? "Hide" : "Show"}
                                    </button>
                                </div>
                            </div>

                            {error && <div className="error-message">{error}</div>}
                            {success && <div className="success-message">{success}</div>}

                            <div className="form-group">
                                <button type="submit" className="submit-button" disabled={loading}>
                                    {loading ? 'Registering...' : 'Create account'}
                                </button>
                            </div>

                            <div className="auth-footer">
                                <span>Already have an account?</span>
                                <Link to="/login">Sign in</Link>
                            </div>
                        </form>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default SignupComponent;
