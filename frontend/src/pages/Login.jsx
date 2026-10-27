
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import { getDashboardPath, saveAuthSession } from "../auth";
import "./Login.css";
import Footer from "../components/Footer";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [resetStep, setResetStep] = useState("email");
  const [resetEmail, setResetEmail] = useState("");
  const [resetQuestion, setResetQuestion] = useState("");
  const [resetAnswer, setResetAnswer] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetError, setResetError] = useState("");
  const [resetSuccess, setResetSuccess] = useState("");
  const [resetLoading, setResetLoading] = useState(false);

  const openPasswordReset = () => {
    setResetEmail(email.trim().toLowerCase());
    setResetStep("email");
    setResetQuestion("");
    setResetAnswer("");
    setResetToken("");
    setNewPassword("");
    setConfirmPassword("");
    setResetError("");
    setResetSuccess("");
    setResetOpen(true);
  };

  const closePasswordReset = () => {
    if (resetLoading) return;
    setResetOpen(false);
  };

  const handleResetEmail = async (event) => {
    event.preventDefault();
    setResetError("");
    setResetLoading(true);
    const normalizedEmail = resetEmail.trim().toLowerCase();

    try {
      const response = await fetch(
        "http://localhost:5000/api/password-reset/security-question",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: normalizedEmail }),
        }
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to find your security question.");
      }

      setResetEmail(normalizedEmail);
      setResetQuestion(data.question);
      setResetStep("answer");
    } catch (requestError) {
      console.error("Password reset question lookup error:", requestError);
      setResetError(
        requestError.message || "Could not load your security question."
      );
    } finally {
      setResetLoading(false);
    }
  };

  const handleResetAnswer = async (event) => {
    event.preventDefault();
    setResetError("");
    setResetLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/password-reset/verify-answer",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: resetEmail,
            answer: resetAnswer,
          }),
        }
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "The answer could not be verified.");
      }

      setResetToken(data.resetToken);
      setResetAnswer("");
      setResetStep("password");
    } catch (requestError) {
      console.error("Password reset answer verification error:", requestError);
      setResetError(
        requestError.message || "Could not verify your security answer."
      );
    } finally {
      setResetLoading(false);
    }
  };

  const handleResetPassword = async (event) => {
    event.preventDefault();
    setResetError("");

    if (newPassword.length < 8) {
      setResetError("Your new password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setResetError("New password and confirmation do not match.");
      return;
    }

    setResetLoading(true);
    try {
      const response = await fetch(
        "http://localhost:5000/api/password-reset/complete",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: resetEmail,
            resetToken,
            newPassword,
          }),
        }
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to update your password.");
      }

      setResetSuccess(data.message || "Your password has been updated.");
      setNewPassword("");
      setConfirmPassword("");
    } catch (requestError) {
      console.error("Password reset completion error:", requestError);
      setResetError(
        requestError.message || "Could not update your password."
      );
    } finally {
      setResetLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    const normalizedEmail = email.trim().toLowerCase();

    try {
      const response = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: normalizedEmail,
          password: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Login failed. Please try again.");
        return;
      }

      // Save the user's information and token before redirecting.
      if (!data.token) {
        setError("Login succeeded, but no authentication token was received.");
        return;
      }

      saveAuthSession(data.user, data.token);

      // Redirect first-time users to change their password.
      if (data.firstLogin || data.user.mustChangePassword) {
        navigate("/change-password", { replace: true });
        return;
      }

      // Redirect other users to their dashboard.
      navigate(getDashboardPath(data.user.role), {
        replace: true,
      });
    } catch (err) {
      console.error("Login error:", err);
      setError(
        "Cannot connect to the server. Please make sure the backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <header className="header">
        <div className="logo">Campusphere</div>

        <nav className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/events">Events</Link>
          <Link to="/login" className="register-btn">
            Login
          </Link>
        </nav>
      </header>

      <main className="login-section">
        <div className="login-box">
          <p className="login-label">WELCOME BACK</p>

          <h1>
            Login to <span>Campusphere</span>
          </h1>

          <p className="login-description">
            Login to discover events, manage your schedule, and stay connected
            with your campus.
          </p>

          {error && <p className="error-message">{error}</p>}

          <form className="login-form" onSubmit={handleLogin}>
            <div className="form-group">
              <label htmlFor="email">Email Address</label>

              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="username"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>

              <div className="password-input-wrap">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />

                <button
                  type="button"
                  className="password-visibility-btn"
                  onClick={() => setShowPassword((visible) => !visible)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="login-btn"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <div className="forgot-password-option">
            <button type="button" onClick={openPasswordReset}>
              Forgot Password?
            </button>
          </div>
        </div>
      </main>

      {resetOpen &&
        createPortal(
          <div
            className="password-reset-overlay"
            role="presentation"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) closePasswordReset();
            }}
          >
            <section
              className="password-reset-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="password-reset-title"
            >
              <button
                type="button"
                className="password-reset-close"
                onClick={closePasswordReset}
                aria-label="Close password reset"
                disabled={resetLoading}
              >
                ×
              </button>

              {resetSuccess ? (
                <div className="password-reset-result">
                  <p className="password-reset-eyebrow">PASSWORD UPDATED</p>
                  <h2 id="password-reset-title">You’re all set</h2>
                  <p role="status">{resetSuccess}</p>
                  <button
                    type="button"
                    className="password-reset-submit"
                    onClick={() => {
                      setResetOpen(false);
                      setPassword("");
                    }}
                  >
                    Return to Login
                  </button>
                </div>
              ) : (
                <>
                  <p className="password-reset-eyebrow">ACCOUNT RECOVERY</p>
                  <h2 id="password-reset-title">
                    {resetStep === "email"
                      ? "Find your account"
                      : resetStep === "answer"
                        ? "Verify your answer"
                        : "Choose a new password"}
                  </h2>

                  {resetError && (
                    <p className="password-reset-error" role="alert">
                      {resetError}
                    </p>
                  )}

                  {resetStep === "email" && (
                    <form onSubmit={handleResetEmail}>
                      <p className="password-reset-description">
                        Enter the email address saved with your personal
                        security question.
                      </p>
                      <label htmlFor="reset-email">Email address</label>
                      <input
                        id="reset-email"
                        type="email"
                        autoComplete="email"
                        value={resetEmail}
                        onChange={(event) => setResetEmail(event.target.value)}
                        required
                      />
                      <button
                        type="submit"
                        className="password-reset-submit"
                        disabled={resetLoading}
                      >
                        {resetLoading ? "Looking up..." : "Continue"}
                      </button>
                    </form>
                  )}

                  {resetStep === "answer" && (
                    <form onSubmit={handleResetAnswer}>
                      <p className="password-reset-description">
                        {resetEmail}
                      </p>
                      <label htmlFor="reset-answer">{resetQuestion}</label>
                      <input
                        id="reset-answer"
                        type="text"
                        autoComplete="off"
                        value={resetAnswer}
                        onChange={(event) => setResetAnswer(event.target.value)}
                        required
                      />
                      <button
                        type="submit"
                        className="password-reset-submit"
                        disabled={resetLoading}
                      >
                        {resetLoading ? "Verifying..." : "Verify Answer"}
                      </button>
                    </form>
                  )}

                  {resetStep === "password" && (
                    <form onSubmit={handleResetPassword}>
                      <p className="password-reset-description">
                        Create a new password with at least 8 characters.
                      </p>
                      <label htmlFor="reset-new-password">New password</label>
                      <input
                        id="reset-new-password"
                        type="password"
                        autoComplete="new-password"
                        minLength={8}
                        maxLength={128}
                        value={newPassword}
                        onChange={(event) =>
                          setNewPassword(event.target.value)
                        }
                        required
                      />
                      <label htmlFor="reset-confirm-password">
                        Confirm new password
                      </label>
                      <input
                        id="reset-confirm-password"
                        type="password"
                        autoComplete="new-password"
                        minLength={8}
                        maxLength={128}
                        value={confirmPassword}
                        onChange={(event) =>
                          setConfirmPassword(event.target.value)
                        }
                        required
                      />
                      <button
                        type="submit"
                        className="password-reset-submit"
                        disabled={resetLoading}
                      >
                        {resetLoading ? "Updating..." : "Update Password"}
                      </button>
                    </form>
                  )}
                </>
              )}
            </section>
          </div>,
          document.body
        )}

      <Footer />
    </div>
  );
}

export default Login;
