import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './LoginPage.css';
import Header from '../../Components/Header';
import { useNotification } from '../../Components/NotificationContext';
import {
    BASE_URL,
    getCookieConsent,
    setAuthToken,
} from '../../api/api';
import PageSeo from '../../Components/PageSeo';
import { useUser } from '../../Components/UserContext';

function LoginComponent() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    // Forgot password states
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [forgotEmail, setForgotEmail] = useState('');
    const [forgotLoading, setForgotLoading] = useState(false);

    const navigate = useNavigate();

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { addNotification } = useNotification();
    const { refreshUser } = useUser();

    /* =========================
       LOGIN
    ========================= */

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
            const response = await fetch(`${BASE_URL}/users/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    password,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                addNotification({
                    title: 'Error!',
                    message:
                        data.message || 'Something went wrong!',
                    type: 'error',
                    container: 'top-right',
                    dismiss: { duration: 5000 },
                });

                throw new Error(
                    data.message || 'Something went wrong!'
                );
            }

            if (data.success) {
                setAuthToken(data.authToken);

                await fetch(`${BASE_URL}/users/session`, {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        token: data.authToken,
                        rememberSession:
                            getCookieConsent() === 'accepted',
                    }),
                }).catch(() => null);

                await refreshUser(data.authToken);

                addNotification({
                    title: 'Success!',
                    message:
                        'Login successful. Redirecting...',
                    type: 'success',
                    container: 'top-right',
                    dismiss: { duration: 5000 },
                });

                navigate('/');
            }
        } catch (err) {
            setError(err.message);

            addNotification({
                title: 'Error!',
                message:
                    err.message ||
                    'An unexpected error occurred.',
                type: 'error',
                container: 'top-right',
                dismiss: { duration: 5000 },
            });
        } finally {
            setLoading(false);
        }
    };

    /* =========================
       FORGOT PASSWORD
    ========================= */

    const handleForgotPassword = async (event) => {
        event.preventDefault();

        const emailToSend = forgotEmail.trim();

        if (!emailToSend) {
            addNotification({
                title: 'Error!',
                message: 'Please enter your email address.',
                type: 'error',
                container: 'top-right',
                dismiss: { duration: 5000 },
            });

            return;
        }

        setForgotLoading(true);

        try {
            const response = await fetch(
                `${BASE_URL}/users/forgot-password`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        email: emailToSend,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                        'Unable to send password reset email.'
                );
            }

            addNotification({
                title: 'Email Sent!',
                message:
                    data.message ||
                    'If the email is registered, a password reset link has been sent.',
                type: 'success',
                container: 'top-right',
                dismiss: { duration: 5000 },
            });

            // Close modal
            setShowForgotPassword(false);

            // Clear email
            setForgotEmail('');
        } catch (err) {
            addNotification({
                title: 'Error!',
                message:
                    err.message ||
                    'Unable to send password reset email.',
                type: 'error',
                container: 'top-right',
                dismiss: { duration: 5000 },
            });
        } finally {
            setForgotLoading(false);
        }
    };

    /* =========================
       OPEN FORGOT PASSWORD
    ========================= */

    const openForgotPassword = () => {
        // Automatically use login email if already entered
        setForgotEmail(email);

        setShowForgotPassword(true);
    };

    /* =========================
       CLOSE FORGOT PASSWORD
    ========================= */

    const closeForgotPassword = () => {
        if (forgotLoading) return;

        setShowForgotPassword(false);
    };

    return (
        <div>
            <PageSeo
                title="Login"
                description="Log in to your Lucky Impex account."
                canonicalPath="/login"
                noIndex
            />

            <Header />

            <section className="auth-page">
                <div className="auth-shell">

                    {/* =========================
                        LEFT SIDE
                    ========================= */}

                    <div className="auth-aside">

                        <div className="auth-brand-badge">
                            Lucky Impex
                        </div>

                        <h1>
                            Welcome back to your shopping
                            account.
                        </h1>

                        <p>
                            Sign in to track orders, save your
                            cart, and continue browsing
                            appliances and electronics without
                            losing your progress.
                        </p>

                        <div className="auth-feature-list">

                            <div className="auth-feature-item">
                                <strong>
                                    Fast checkout
                                </strong>

                                <span>
                                    Keep your profile and shopping
                                    flow ready across visits.
                                </span>
                            </div>

                            <div className="auth-feature-item">
                                <strong>
                                    Order visibility
                                </strong>

                                <span>
                                    See your purchases and account
                                    activity in one place.
                                </span>
                            </div>

                            <div className="auth-feature-item">
                                <strong>
                                    Secure access
                                </strong>

                                <span>
                                    Your account session stays
                                    protected with token-based
                                    login.
                                </span>
                            </div>

                        </div>
                    </div>

                    {/* =========================
                        LOGIN CARD
                    ========================= */}

                    <div className="auth-card">

                        <div className="auth-card-header">

                            <span className="auth-kicker">
                                Account Login
                            </span>

                            <h2>
                                Sign in
                            </h2>

                            <p>
                                Use your registered email and
                                password to continue.
                            </p>

                        </div>

                        <form
                            onSubmit={handleSubmit}
                            className="auth-form"
                        >

                            {/* EMAIL */}

                            <div className="form-group">

                                <label htmlFor="email">
                                    Email address
                                </label>

                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={email}
                                    onChange={handleEmailChange}
                                    required
                                    placeholder="Example@gmail.com"
                                    aria-label="Enter your email address"
                                />

                            </div>

                            {/* PASSWORD */}

                            <div className="form-group">

                                <div className="password-row">

                                    <label htmlFor="password">
                                        Password
                                    </label>

                                    <button
                                        type="button"
                                        className="text-link-btn"
                                        onClick={
                                            openForgotPassword
                                        }
                                    >
                                        Forgot password?
                                    </button>

                                </div>

                                <div className="password-container">

                                    <input
                                        type={
                                            showPassword
                                                ? 'text'
                                                : 'password'
                                        }
                                        id="password"
                                        name="password"
                                        value={password}
                                        onChange={
                                            handlePasswordChange
                                        }
                                        required
                                        placeholder="Enter your password"
                                        aria-label="Enter your password"
                                    />

                                    <button
                                        type="button"
                                        className="toggle-password"
                                        onClick={
                                            handlePasswordVisibilityToggle
                                        }
                                        aria-label={
                                            showPassword
                                                ? 'Hide password'
                                                : 'Show password'
                                        }
                                    >
                                        {showPassword
                                            ? 'Hide'
                                            : 'Show'}
                                    </button>

                                </div>

                            </div>

                            {/* ERROR */}

                            {error && (
                                <div
                                    className="error-message"
                                    aria-live="assertive"
                                >
                                    {error}
                                </div>
                            )}

                            {/* LOGIN BUTTON */}

                            <div className="form-group-submit">

                                <button
                                    type="submit"
                                    className="submit-button"
                                    disabled={loading}
                                >
                                    {loading
                                        ? 'Signing in...'
                                        : 'Sign in'}
                                </button>

                            </div>

                            {/* FOOTER */}

                            <div className="auth-footer">

                                <span>
                                    Do not have an account?
                                </span>

                                <Link to="/signup">
                                    Create one
                                </Link>

                            </div>

                        </form>

                    </div>

                </div>
            </section>

            {/* =================================================
                FORGOT PASSWORD MODAL
            ================================================= */}

            {showForgotPassword && (
                <div
                    className="forgot-password-overlay"
                    onMouseDown={(event) => {
                        if (
                            event.target ===
                            event.currentTarget
                        ) {
                            closeForgotPassword();
                        }
                    }}
                >

                    <div
                        className="forgot-password-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="forgot-password-title"
                    >

                        {/* CLOSE */}

                        <button
                            type="button"
                            className="forgot-password-close"
                            onClick={closeForgotPassword}
                            disabled={forgotLoading}
                            aria-label="Close forgot password"
                        >
                            ×
                        </button>

                        {/* HEADER */}

                        <div className="auth-card-header">

                            <span className="auth-kicker">
                                Password Recovery
                            </span>

                            <h2 id="forgot-password-title">
                                Forgot Password?
                            </h2>

                            <p>
                                Enter your registered email
                                address and we'll send you a
                                password reset link.
                            </p>

                        </div>

                        {/* FORM */}

                        <form
                            onSubmit={handleForgotPassword}
                            className="auth-form"
                        >

                            <div className="form-group">

                                <label htmlFor="forgot-email">
                                    Email address
                                </label>

                                <input
                                    type="email"
                                    id="forgot-email"
                                    name="forgot-email"
                                    value={forgotEmail}
                                    onChange={(event) =>
                                        setForgotEmail(
                                            event.target.value
                                        )
                                    }
                                    required
                                    autoFocus
                                    placeholder="Example@gmail.com"
                                    disabled={forgotLoading}
                                />

                            </div>

                            <div className="form-group-submit">

                                <button
                                    type="submit"
                                    className="submit-button"
                                    disabled={forgotLoading}
                                >
                                    {forgotLoading
                                        ? 'Sending...'
                                        : 'Send Reset Link'}
                                </button>

                            </div>

                            <div className="forgot-password-back">

                                <button
                                    type="button"
                                    onClick={closeForgotPassword}
                                    disabled={forgotLoading}
                                >
                                    Back to login
                                </button>

                            </div>

                        </form>

                    </div>

                </div>
            )}
        </div>
    );
}

export default LoginComponent;