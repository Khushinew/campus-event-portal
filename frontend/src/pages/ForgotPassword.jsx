
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./ForgotPassword.css";

function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail.endsWith("@campus.edu.in")) {
      setError("Please enter a valid university email address.");
      return;
    }

    setLoading(true);

    // Frontend demo only: no email is sent yet.
    setTimeout(() => {
      setLoading(false);
      navigate("/verify-otp", {
        state: { email: normalizedEmail },
      });
    }, 500);
  };

  return (
    <div className="forgot-password-page">
      <div className="forgot-password-box">
        <p className="forgot-label">NO WORRIES</p>
        <h1>Forgot Password?</h1>
        <p className="forgot-description">
          Enter your registered university email address.
          We'll guide you through resetting your password.
        </p>

        {error && <p className="forgot-error">{error}</p>}
        {message && <p className="forgot-success">{message}</p>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="recoveryEmail">Email Address</label>
            <input
              id="recoveryEmail"
              type="email"
              placeholder="Enter your registered email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>

          <button type="submit" disabled={loading}>
            {loading ? "Please wait..." : "Continue →"}
          </button>
        </form>

        <p className="forgot-back">
          Remember your password? <Link to="/login">Back to Login</Link>
        </p>
      </div>
    </div>
  );
}

export default ForgotPassword;