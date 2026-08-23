import React, { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

import Header from "../../Components/Header";
import { BASE_URL } from "../../api/api";
import { useNotification } from "../../Components/NotificationContext";

function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const { showNotification } = useNotification();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email.trim()) {
            showNotification("Please enter your email address", "error");
            return;
        }

        try {
            setLoading(true);

            const response = await axios.post(
                `${BASE_URL}/auth/forgot-password`,
                { email }
            );

            showNotification(
                response.data.message || "Password reset link sent to your email",
                "success"
            );
        } catch (error) {
            showNotification(
                error.response?.data?.message ||
                    "Unable to send password reset link",
                "error"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Header />

            <div className="auth-container">
                <div className="auth-card">
                    <div className="auth-header">
                        <h1>Forgot Password?</h1>
                        <p>
                            Enter your registered email address and we'll
                            send you a password reset link.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Email Address</label>

                            <input
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="auth-btn"
                            disabled={loading}
                        >
                            {loading
                                ? "Sending..."
                                : "Send Reset Link"}
                        </button>
                    </form>

                    <div className="auth-footer">
                        <Link to="/login">
                            ← Back to Login
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}

export default ForgotPassword;