import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Login.css";

function Login() {

    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = async (e) => {
        e.preventDefault();

        try {

            const response = await fetch("http://localhost:5000/api/login", {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    email: email,
                    password: password
                })
            });

            const data = await response.json();

            if (response.ok) {

                alert("Login successful!");

                console.log("Logged in user:", data.user);

                // Save user information
                localStorage.setItem("user", JSON.stringify(data.user));

                // Go to home page
                navigate("/");

            } else {

                alert(data.message);

            }

        } catch (error) {

            console.error("Login error:", error);

            alert("Cannot connect to backend.");

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

                    <Link to="/calendar">
                        Calendar
                    </Link>

                    <Link to="/login">
                        Login
                    </Link>

                    <Link to="/register" className="register-btn">
                        Register
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


                    {/* Register Link */}
                    <p className="register-text">

                        Don't have an account?

                        <Link to="/register">
                            {" "}Create an Account
                        </Link>

                    </p>

                </div>

            </main>

        </div>
    );
}

export default Login;