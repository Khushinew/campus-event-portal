
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getDashboardPath } from "../auth";
import "./Login.css";
import Footer from "../components/Footer";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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

      // Redirect users who need to change their password on first login.
      if (data.firstLogin) {
        navigate("/change-password", {
          state: {
            email: normalizedEmail,
          },
        });
        return;
      }

      // Save the logged-in user's information.
      localStorage.setItem("user", JSON.stringify(data.user));

      if (data.token) {
        localStorage.setItem("token", data.token);
      }

      // Redirect to the correct dashboard based on the user's role.
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
      {/* Header */}
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

      {/* Login Section */}
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

          {/* Error Message */}
          {error && <p className="error-message">{error}</p>}

          {/* Login Form */}
          <form className="login-form" onSubmit={handleLogin}>
            {/* Email */}
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

            {/* Password */}
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

            {/* Login Options */}
            <div className="login-options">
              <label className="remember">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                Remember me
              </label>

              <Link to="/forgot-password">Forgot Password?</Link>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              className="login-btn"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default Login;
