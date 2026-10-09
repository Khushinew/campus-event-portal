
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./ResetPassword.css";

function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!email) {
      setError("Please start the password reset process again.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    // Frontend demo only: the password is not saved or changed.
    setSuccess(true);

    setTimeout(() => {
      navigate("/login", { replace: true });
    }, 1800);
  };

  return (
    <div className="reset-password-page">
      <div className="reset-password-box">
        <p className="reset-label">ALMOST THERE</p>

        <h1>Create New Password</h1>

        <p className="reset-description">
          Choose a new password for your Campusphere account.
        </p>

        {email && <p className="reset-email">{email}</p>}

        {error && <p className="reset-error">{error}</p>}

{success && (
  <p className="reset-success">
    Your password has been reset successfully! Redirecting you to login...
  </p>
)}

        <form onSubmit={handleSubmit}>
          <div className="reset-form-group">
            <label htmlFor="newPassword">New Password</label>

            <input
              id="newPassword"
              type={showPassword ? "text" : "password"}
              placeholder="Enter new password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              required
              minLength={8}
            />
          </div>

          <div className="reset-form-group">
            <label htmlFor="confirmPassword">Confirm New Password</label>

            <input
              id="confirmPassword"
              type={showPassword ? "text" : "password"}
              placeholder="Re-enter new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              required
              minLength={8}
            />
          </div>

          <label className="reset-show-password">
            <input
              type="checkbox"
              checked={showPassword}
              onChange={(e) => setShowPassword(e.target.checked)}
            />
            Show passwords
          </label>

          <button type="submit" disabled={success}>
            {success ? "Password Reset ✓" : "Reset Password →"}
          </button>
        </form>

        <p className="reset-back">
          Remember your password? <Link to="/login">Back to Login</Link>
        </p>
      </div>
    </div>
  );
}

export default ResetPassword;