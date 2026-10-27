import React, { useState } from "react";
import { Link } from "react-router-dom";
import Header from "../../Components/Header";
import Footer from "../../Components/Footer";
import PageSeo from "../../Components/PageSeo";
import { postData } from "../../api/api";
import "../Info/InfoPages.css";

const WHATSAPP = "https://wa.me/9779802594022?text=Hello%20Lucky%20Impex%2C%20I%20need%20help%20resetting%20my%20password.";

function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState(null); // { type: "success" | "error", text }

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!email.trim()) {
            setStatus({ type: "error", text: "Please enter your email address." });
            return;
        }
        setLoading(true);
        setStatus(null);
        try {
            const data = await postData("/users/forgot-password", { email: email.trim() });
            setStatus({ type: "success", text: data?.message || "If an account exists for that email, a reset link has been sent." });
        } catch (error) {
            setStatus({ type: "error", text: error?.message || "Unable to send the reset link. Please try again." });
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <PageSeo title="Forgot Password | Lucky Impex" description="Reset your Lucky Impex account password." canonicalPath="/forgot-password" noIndex />
            <Header />
            <main className="info-page">
                <div className="info-page__inner">
                    <h1>Forgot your password?</h1>
                    <p className="info-page__lead">
                        Enter the email you registered with. We will send a reset link by email, and by WhatsApp if a phone number is saved on your account.
                    </p>
                    <form className="info-card" onSubmit={handleSubmit} noValidate>
                        <label htmlFor="forgot-email"><strong>Email address</strong></label>
                        <input
                            id="forgot-email"
                            type="email"
                            autoComplete="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            style={{ display: "block", width: "100%", margin: "8px 0 14px", padding: "11px 12px", borderRadius: 10, border: "1px solid #c4cfda", fontSize: "1rem" }}
                        />
                        <button type="submit" className="info-btn" disabled={loading} style={{ border: 0, cursor: "pointer" }}>
                            {loading ? "Sending…" : "Send reset link"}
                        </button>
                        {status && (
                            <p role={status.type === "error" ? "alert" : "status"} style={{ marginTop: 14, color: status.type === "error" ? "#b3261e" : "#1b6e3c" }}>
                                {status.text}
                            </p>
                        )}
                    </form>
                    <p className="info-note">
                        Not receiving anything? <a href={WHATSAPP} target="_blank" rel="noopener noreferrer">Message us on WhatsApp</a> or call 051-531789.
                    </p>
                    <p><Link to="/login">← Back to login</Link></p>
                </div>
            </main>
            <Footer />
        </>
    );
}

export default ForgotPassword;
