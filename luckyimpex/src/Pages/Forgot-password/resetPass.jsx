import React, { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Header from "../../Components/Header";
import Footer from "../../Components/Footer";
import PageSeo from "../../Components/PageSeo";
import { postData } from "../../api/api";
import "../Info/InfoPages.css";

const STRONG = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
const inputStyle = { display: "block", width: "100%", margin: "8px 0 14px", padding: "11px 12px", borderRadius: 10, border: "1px solid #c4cfda", fontSize: "1rem" };

function ResetPassword() {
    const { token } = useParams();
    const navigate = useNavigate();
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState(null);
    const [done, setDone] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!STRONG.test(password)) {
            setStatus({ type: "error", text: "Use at least 8 characters with an uppercase letter, a lowercase letter, a number and one of @$!%*?&." });
            return;
        }
        if (password !== confirm) {
            setStatus({ type: "error", text: "The two passwords do not match." });
            return;
        }
        setLoading(true);
        setStatus(null);
        try {
            const data = await postData("/users/reset-password", { token, password });
            setStatus({ type: "success", text: data?.message || "Your password has been updated." });
            setDone(true);
            setTimeout(() => navigate("/login"), 2500);
        } catch (error) {
            setStatus({ type: "error", text: error?.message || "This reset link is invalid or has expired." });
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <PageSeo title="Reset Password | Lucky Impex" description="Choose a new password for your Lucky Impex account." canonicalPath="/reset-password" noIndex />
            <Header />
            <main className="info-page">
                <div className="info-page__inner">
                    <h1>Choose a new password</h1>
                    <form className="info-card" onSubmit={handleSubmit} noValidate>
                        <label htmlFor="new-password"><strong>New password</strong></label>
                        <input id="new-password" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} style={inputStyle} disabled={done} />
                        <label htmlFor="confirm-password"><strong>Confirm new password</strong></label>
                        <input id="confirm-password" type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} style={inputStyle} disabled={done} />
                        <button type="submit" className="info-btn" disabled={loading || done} style={{ border: 0, cursor: "pointer" }}>
                            {loading ? "Saving…" : "Update password"}
                        </button>
                        {status && (
                            <p role={status.type === "error" ? "alert" : "status"} style={{ marginTop: 14, color: status.type === "error" ? "#b3261e" : "#1b6e3c" }}>
                                {status.text}
                            </p>
                        )}
                    </form>
                    <p>
                        <Link to="/forgot-password">Request a new link</Link> · <Link to="/login">Back to login</Link>
                    </p>
                </div>
            </main>
            <Footer />
        </>
    );
}

export default ResetPassword;
