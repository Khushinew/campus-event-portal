import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { getCampusRole, getDashboardPath, getStoredUser } from "../auth";
import "./Login.css";

function Login() {

    const navigate = useNavigate();
    const location = useLocation();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        const user = getStoredUser();
        if (user) navigate(getDashboardPath(user.role), { replace: true });
    }, [navigate]);

    const handleLogin = async (e) => {
        setError("");
        e.preventDefault();

        const normalizedEmail = email.trim().toLowerCase();
        const emailRole = getCampusRole(normalizedEmail);

        if (!emailRole) {
            setError("Use your GSFC University student or faculty email address.");
            return;
        }

        try {

            const response = await fetch("http://localhost:5000/api/login", {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                    
                },

                body: JSON.stringify({
                    email: normalizedEmail,
                    password: password
                })
            });

            const data = await response.json();

            if (response.ok) {
                if (data.user?.role !== emailRole) {
                    setError("This email does not match the account role in the university directory.");
                    return;
                }

                console.log("Logged in user:", data.user);

                // Save user information
                localStorage.setItem("user", JSON.stringify(data.user));
                localStorage.setItem("token", data.token);

                const returnLocation = location.state?.from;
                const isPendingStudentRegistration =
                    emailRole === "student" &&
                    returnLocation?.pathname === "/student/register-event";

                navigate(
                    isPendingStudentRegistration
                        ? returnLocation.pathname
                        : getDashboardPath(emailRole),
                    {
                        replace: true,
                        state: isPendingStudentRegistration ? returnLocation.state : undefined,
                    }
                );

            } else {

                setError(data.message || "Login failed");

            }

        } catch (error) {

            console.error("Login error:", error);

            setError("Cannot connect to backend.");

        }
    };

    return (
        <div className="login-page">

            {/* Header */}
            <header className="header">

                <div className="logo">
                    Campusphere
                </div>

                <nav className="nav-links">

                    <Link to="/">Home</Link>

                    <Link to="/events">
                        Events
                    </Link>

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


                    {/* Login Form */}
                    {error && <p className="error-message">{error}</p>}
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
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />

                        </div>


                        <div className="form-group">

                            <label>
                                Password
                            </label>

                            <input
                                type="password"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />

                        </div>


                        <div className="login-options">

                            <label className="remember">

                                <input type="checkbox" />

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