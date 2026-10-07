import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  getCampusRole,
  getDashboardPath,
  getStoredUser,
} from "../auth";
import "./Login.css";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const user = getStoredUser();

    if (user) {
      navigate(getDashboardPath(user.role), { replace: true });
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const normalizedEmail = email.trim().toLowerCase();
    const emailRole = getCampusRole(normalizedEmail);

    if (!emailRole) {
      setError(
        "Use a valid faculty or student email ending in @campus.edu.in."
      );
      setLoading(false);
      return;
    }

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

      if (response.ok) {
        if (!data.user) {
          setError("Login successful, but user information was not received.");
          setLoading(false);
          return;
        }

        if (data.user.role !== emailRole) {
          setError(
            "This email does not match the account role in the university directory."
          );
          setLoading(false);
          return;
        }

        console.log("Logged in user:", data.user);

        localStorage.setItem("user", JSON.stringify(data.user));

        if (data.token) {
          localStorage.setItem("token", data.token);
        }

        navigate(getDashboardPath(emailRole), {
          replace: true,
        });
      } else {
        setError(data.message || "Login failed.");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("Cannot connect to backend.");
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

          <p className="login-label">
            WELCOME BACK
          </p>

          <h1>
            Login to <span>Campusphere</span>
          </h1>

          <p className="login-description">
            Login to discover events, manage your schedule,
            and stay connected with your campus.
          </p>

          {/* Error */}
          {error && (
            <p className="error-message">
              {error}
            </p>
          )}

          {/* Login Form */}
          <form
            className="login-form"
            onSubmit={handleLogin}
          >

            {/* Email */}
            <div className="form-group">
              <label htmlFor="email">
                Email Address
              </label>

              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* Password */}
            <div className="form-group">
              <label htmlFor="password">
                Password
              </label>

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
                  onClick={() =>
                    setShowPassword((visible) => !visible)
                  }
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                  aria-pressed={showPassword}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {/* Options */}
            <div className="login-options">

              <label className="remember">
                <input type="checkbox" />
                Remember me
              </label>

              <a href="#forgot-password">
                Forgot Password?
              </a>

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
    </div>
  );
}

export default Login;