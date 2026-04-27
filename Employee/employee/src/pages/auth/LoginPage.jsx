import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../lib/api";

export default function LoginPage() {
  const { user, login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [setup, setSetup] = useState({ name: "", email: "", password: "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (user) {
    return <Navigate to="/" replace />;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      await login(form.email, form.password);
    } catch (submitError) {
      setError(submitError.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleAdminSetup(event) {
    event.preventDefault();
    setMessage("");
    setError("");

    try {
      const { data } = await api.post("/auth/setup-admin", setup);
      setMessage(`${data.employee.name} is ready. You can now sign in with the admin account.`);
      setSetup({ name: "", email: "", password: "" });
    } catch (setupError) {
      setError(setupError.response?.data?.message || "Admin setup failed.");
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-panel">
        <div>
          <p className="eyebrow">Professional HR workspace</p>
          <h1>Manage employees, payroll, attendance, and leave in one system.</h1>
          <p className="page-description">
            Sign in as an Admin, Manager, or Employee. First-time deployments can bootstrap the admin account from the card on the right.
          </p>
          {error ? <p className="form-error">{error}</p> : null}
          {message ? <p className="form-success">{message}</p> : null}
        </div>

        <form className="form-card" onSubmit={handleSubmit}>
          <h3>Sign in</h3>
          <label>
            Work email
            <input
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
              type="email"
              placeholder="admin@company.com"
              required
            />
          </label>
          <label>
            Password
            <input
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
              type="password"
              placeholder="Enter your password"
              required
            />
          </label>
          <button className="primary-button" disabled={loading} type="submit">
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>
      </div>

      <form className="form-card auth-side-card" onSubmit={handleAdminSetup}>
        <h3>Initial admin setup</h3>
        <label>
          Full name
          <input
            value={setup.name}
            onChange={(event) => setSetup({ ...setup, name: event.target.value })}
            placeholder="HR Director"
            required
          />
        </label>
        <label>
          Admin email
          <input
            value={setup.email}
            onChange={(event) => setSetup({ ...setup, email: event.target.value })}
            type="email"
            placeholder="hr@company.com"
            required
          />
        </label>
        <label>
          Password
          <input
            value={setup.password}
            onChange={(event) => setSetup({ ...setup, password: event.target.value })}
            type="password"
            placeholder="Minimum 8 characters"
            required
          />
        </label>
        <button className="secondary-button" type="submit">
          Create admin
        </button>
      </form>
    </div>
  );
}
