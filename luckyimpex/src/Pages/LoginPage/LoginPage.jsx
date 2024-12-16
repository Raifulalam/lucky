import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css';
import Header from '../../Components/Header';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';

function LoginComponent() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false); // Loading state
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleEmailChange = (event) => {
        setEmail(event.target.value);
    };

    const handlePasswordChange = (event) => {
        setPassword(event.target.value);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    }

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true); // Set loading to true when submitting

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

                // Redirect after 2 seconds
                setTimeout(() => {
                    navigate('/', { state: { email } });
                    window.location.reload();
                }, 2000);
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

                        <div className="form-group-submit">
                            <button type="submit" className="submit-button" disabled={loading}>
                                {loading ? 'Signing in...' : 'Sign in'}
                            </button>
                            <a href="#" className="forgot-password">Forgot password?</a>
                        </div>

                        {error && <div className="error-message">{error}</div>} {/* Show error message */}
                        {success && <div className="success-message">{success}</div>} {/* Show success message */}

                        <div className="form-group-register">
                            <h5>Don't have an account? <Link to="/signup">Register</Link></h5>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default LoginComponent;
