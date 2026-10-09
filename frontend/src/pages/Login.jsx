
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { getDashboardPath } from "../auth";
import "./Login.css";

function Login() {

    const navigate = useNavigate();
    

    const [email, setEmail] =
        useState("");

    const [password, setPassword] =
        useState("");

    const [showPassword, setShowPassword] =
        useState(false);

    const [error, setError] =
        useState("");

    

        

    const handleLogin = async (e) => {

        e.preventDefault();

        setError("");

        const normalizedEmail =
            email.trim().toLowerCase();

        try {

            const response =
                await fetch(
                    "http://localhost:5000/api/login",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({
                            email: normalizedEmail,
                            password: password
                        })
                    }
                );

            const data =
                await response.json();

            if (!response.ok) {

                setError(
                    data.message ||
                    "Login failed."
                );

                return;
            }

            // --------------------------------
            // First login
            // --------------------------------

            if (data.firstLogin) {

                navigate(
                    "/change-password",
                    {
                        state: {
                            email:
                                normalizedEmail
                        }
                    }
                );

                return;
            }

            // --------------------------------
            // Normal login
            // --------------------------------

            localStorage.setItem(
                "user",
                JSON.stringify(data.user)
            );

            localStorage.setItem(
                "token",
                data.token
            );

            navigate(
                getDashboardPath(
                    data.user.role
                ),
                {
                    replace: true
                }
            );

        } catch (error) {

            console.error(
                "Login error:",
                error
            );

            setError(
                "Cannot connect to backend."
            );
        }
    };

    return (

        <div className="login-page">

            <header className="header">

                <div className="logo">
                    Campusphere
                </div>

                <nav className="nav-links">

                    <Link to="/">
                        Home
                    </Link>

                    <Link to="/events">
                        Events
                    </Link>

                    <Link
                        to="/login"
                        className="register-btn"
                    >
                        Login
                    </Link>

                </nav>

            </header>

            <main className="login-section">

                <div className="login-box">

                    <p className="login-label">
                        WELCOME BACK
                    </p>

                    <h1>
                        Login to{" "}
                        <span>
                            Campusphere
                        </span>
                    </h1>

                    <p className="login-description">
                        Login to discover events,
                        manage your schedule,
                        and stay connected
                        with your campus.
                    </p>

                    {error && (
                        <p className="error-message">
                            {error}
                        </p>
                    )}

                    <form
                        className="login-form"
                        onSubmit={handleLogin}
                    >

                        <div className="form-group">

                            <label>
                                Email Address
                            </label>

                            <input
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) =>
                                    setEmail(
                                        e.target.value
                                    )
                                }
                                required
                            />

                        </div>

                        <div className="form-group">

                            <label>
                                Password
                            </label>

                            <div className="password-input-wrap">

                                <input
                                    type={
                                        showPassword
                                            ? "text"
                                            : "password"
                                    }
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(
                                            e.target.value
                                        )
                                    }
                                    autoComplete="current-password"
                                    required
                                />

                                <button
                                    type="button"
                                    className="password-visibility-btn"
                                    onClick={() =>
                                        setShowPassword(
                                            (visible) =>
                                                !visible
                                        )
                                    }
                                >
                                    {showPassword
                                        ? "Hide"
                                        : "Show"}
                                </button>

                            </div>

                        </div>

                        <div className="login-options">

                            <label className="remember">

                                <input
                                    type="checkbox"
                                />

                                Remember me

                            </label>

                            <a href="#">
                                Forgot Password?
                            </a>

                        </div>

                        <button
                            type="submit"
                            className="login-btn"
                        >
                            Login
                        </button>

                    </form>

                </div>

            </main>

        </div>
    );
}

export default Login;