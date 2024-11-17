import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Signup.css'; // Import the CSS for styling

function SignupComponent() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [location, setLocation] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false); // New loading state
    const navigate = useNavigate();

    const handleEmailChange = (event) => {
        setEmail(event.target.value);
    };
    const handleNameChange = (event) => {
        setName(event.target.value);
    };
    const handlePasswordChange = (event) => {
        setPassword(event.target.value);
    };
    const handleLocationChange = (event) => {
        setLocation(event.target.value);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true); // Set loading to true

        try {
            const response = await fetch("http://localhost:3000/api/createUser", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, email, password, location })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Password must be at least 8 characters!');
            }

            setSuccess('User created successfully!');
            // Optionally, redirect to login page after a successful signup
            setTimeout(() => {
                navigate('/login');
            }, 2000); // Redirect after 2 seconds

            // Optionally, reset form fields
            setEmail('');
            setPassword('');
            setName('');
            setLocation('');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false); // Reset loading state
        }
    };

    const handleLogin = () => {
        navigate('/login');
    };

    return (
        <div className="login-container">
            <div className="sidebar">
                <h2>Already have an account?</h2>
                <p>Let's get you started!</p>
                <button className="get-started-button" onClick={handleLogin}>Log in</button>
            </div>
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
                    </div>
                </form>
                {error && <p className="error-message">{error}</p>}
                {success && <p className="success-message">{success}</p>}
            </div>
        </div>
    );
}

export default SignupComponent;
