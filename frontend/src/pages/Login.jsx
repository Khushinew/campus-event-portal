import { Link } from "react-router-dom";
import "./Login.css";

function Login() {
    return (
        <div className="login-page">

            {/* Header */}
            <header className="header">
                <div className="logo">
                    Campusphere
                </div>

                <nav className="nav-links">
                    <Link to="/">Home</Link>
                    <Link to="/events">Events</Link>
                    <Link to="/calendar">Calendar</Link>
                    <Link to="/login">Login</Link>
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
                    <form className="login-form">

                        <div className="form-group">
                            <label>Email Address</label>

                            <input
                                type="email"
                                placeholder="Enter your email"
                                required
                            />
                        </div>


                        <div className="form-group">
                            <label>Password</label>

                            <input
                                type="password"
                                placeholder="Enter your password"
                                required
                            />
                        </div>


                        <div className="login-options">
                            <label className="remember">
                                <input type="checkbox" />
                                Remember me
                            </label>

                            <a href="#">Forgot Password?</a>
                        </div>


                        <button type="submit" className="login-btn">
                            Login
                        </button>

                    </form>


                    {/* Register Link */}
                    <p className="register-text">
                        Don't have an account?
                        <Link to="/register"> Create an Account</Link>
                    </p>

                </div>

            </main>

        </div>
    );
}

export default Login;