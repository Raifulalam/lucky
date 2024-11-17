import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css'; // Import the CSS for styling
import Header from '../../Components/Header';

function LoginComponent() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false); // Loading state

    const handleEmailChange = (event) => {
        setEmail(event.target.value);
    };

    const handlePasswordChange = (event) => {
        setPassword(event.target.value);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);
        // Set loading to true

        try {
            const response = await fetch("http://localhost:3000/api/loginUser", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (!response.ok) {
                setLoading(false)
                throw new Error(data.message || 'Something went wrong!');


            }
            if (data.success) {

                localStorage.setItem("authToken", data.authToken)
                console.log(localStorage.getItem("authToken"))
                setSuccess('Login Successful');
                setLoading(false);

                setTimeout(() => {
                    navigate('/', { state: { email } });
                    window.location.reload()// Redirect after 2 seconds
                }, 2000);
            }






            // Optionally, reset form fields
            //     setEmail('');
            //     setPassword('');
        } catch (err) {
            setError(err.message);
        }
        finally {
            setLoading(false);
            // Reset loading state
        }
    };

    const handleSignup = () => {
        navigate('/signup');
    };

    return (
        <div>
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
                        <div className="remember-me">
                            <input type="checkbox" id="remember-me" name="remember-me" />
                            <label htmlFor="remember-me">Remember me for 14 days</label>
                        </div>
                        <div className="form-group">
                            <button type="submit" className="submit-button" disabled={loading}>
                                {loading ? 'Signing in...' : 'Sign in'}
                            </button>
                            {/* <a href="#" className="forgot-password">Forgot password?</a> */}
                        </div>
                        {error && <p className="error-message" aria-live="assertive">{error}</p>}
                        {success && <p className="success-message" aria-live="polite">{success}</p>}
                    </form>

                </div>
                <div className="sidebar">
                    <h2>Craving Something?</h2>
                    <p>Let's get you started!</p>
                    <button className="get-started-button" onClick={handleSignup}>Get Started</button>
                </div>
            </div>
        </div>

    );
}

export default LoginComponent;
