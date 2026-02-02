import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css';
import Header from '../../Components/Header';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { useNotification } from '../../Components/NotificationContext'; // Import notification context

function LoginComponent() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { addNotification } = useNotification(); // Get addNotification function from the context

    const handleEmailChange = (event) => {
        setEmail(event.target.value);
    };

    const handlePasswordChange = (event) => {
        setPassword(event.target.value);
    };

    const handlePasswordVisibilityToggle = () => {
        setShowPassword((prevState) => !prevState);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch("https://lucky-1-6ma5.onrender.com/api/users/login", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',

                },

                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                setLoading(false);
                addNotification({
                    title: 'Error!',
                    message: data.message || 'Something went wrong!',
                    type: 'error', // Notification type 'error'
                    container: 'top-right',
                    dismiss: { duration: 5000 },
                });
                throw new Error(data.message || 'Something went wrong!');
            }

            if (data.success) {
                localStorage.setItem("authToken", data.authToken);
                setLoading(false);

                // Show success notification
                addNotification({
                    title: 'Success!',
                    message: 'Login successful. Redirecting...',
                    type: 'success', // Notification type 'success'
                    container: 'top-right',
                    dismiss: { duration: 5000 },
                });

                // Redirect after login succe
                navigate('/', { state: { email } });


            }
        } catch (err) {
            setError(err.message);
            setLoading(false);

            // Show error notification if exception occurs
            addNotification({
                title: 'Error!',
                message: err.message || 'An unexpected error occurred.',
                type: 'error', // Notification type 'error'
                container: 'top-right',
                dismiss: { duration: 5000 },
            });
        }
    };

    return (
        <div>
            <Helmet>
                <title>Login - Lucky Impex</title>
                <meta name="description" content="Log in to your Lucky Impex account." />
            </Helmet>
            <Header />
            <div className="container-signup">
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

                            <button className='forgot-password'>Forgot password</button>
                        </div>

                        {error && (
                            <div className="error-message" aria-live="assertive">
                                {error}
                            </div>
                        )}

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
