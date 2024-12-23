import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css';
import Header from '../../Components/Header';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';

function LoginComponent() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleEmailChange = (event) => {
        setEmail(event.target.value);
    };

    const handlePasswordChange = (event) => {
        setPassword(event.target.value);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const handlePasswordVisibilityToggle = () => {
        setShowPassword((prevState) => !prevState);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            const response = await fetch("https://lucky-back-2.onrender.com/api/loginUser", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                setIsModalOpen(true);
                setLoading(false);
                throw new Error(data.message || 'Something went wrong!');
            }

            if (data.success) {
                localStorage.setItem("authToken", data.authToken);
                setSuccess('Login Successful');
                setLoading(false);
                setIsModalOpen(true);

                // Redirect after login success
                navigate('/', { state: { email } });
                window.location.reload();
            }
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    return (
        <div>
            <Helmet>
                <title>Login - Lucky Impex</title>
                <meta name="description" content="Log in to your Lucky Impex account." />
            </Helmet>
            <Header />
            <div className="login-container">
                <div className="login-form">
                    <h2>Log in</h2>
                    <p>Welcome back! Please enter your details.</p>

                    <form onSubmit={handleSubmit}>
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
                                aria-label="Enter your email address"
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
                                    placeholder="Enter your password"
                                    aria-label="Enter your password"
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

                        <div className="form-group-submit">
                            <button type="submit" className="submit-button" disabled={loading}>
                                {loading ? 'Signing in...' : 'Sign in'}
                            </button>
                            <a href="#" className="forgot-password">Forgot password?</a>
                        </div>

                        {error && (
                            <div className="error-message" aria-live="assertive">
                                {error}
                            </div>
                        )}
                        {success && (
                            <div className="success-message" aria-live="assertive">
                                {success}
                            </div>
                        )}

                        <div className="form-group-register">
                            <h5>Don't have an account? <Link to="/signup">Register</Link></h5>
                        </div>
                    </form>
                </div>
            </div>

            {/* Modal for Success/Failure */}
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>{success || error}</h3>
                        <button onClick={handleCloseModal}>Close</button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default LoginComponent;
