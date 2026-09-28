import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Register.css";


function Register() {
   

    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [role, setRole] = useState("");
    const [error, setError] = useState("");

    const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
        setError("Passwords do not match.");
        return;
    }

    try {
        const response = await fetch(
            "http://localhost:5000/api/register",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    name: name,
                    email: email.trim().toLowerCase(),
                    password: password
                })
            }
        );

        const data = await response.json();

        if (response.ok) {
            navigate("/login");
        } else {
            setError(data.message || "Registration failed.");
        }
    } catch (error) {
        console.error("Registration error:", error);
        setError("Cannot connect to backend.");
    }
};
            
        

    return (
        <div className="register-page">

            <div className="register-container">

                <div className="register-left">

                    <h1>CampusConnect</h1>

                    <h2>Create Your Account</h2>

                    <p>
                        Join your campus community and stay connected
                        with events, workshops, hackathons and more.
                    </p>

                    <div className="register-info">

                        <p>✓ Discover campus events</p>

                        <p>✓ Register for events easily</p>

                        <p>✓ Manage your campus activities</p>

                    </div>

                </div>


                <form
                    className="register-form"
                    onSubmit={handleRegister}
                >
                    {error && (
        <p className="error-message" role="alert">
            {error}
        </p>
    )}
                

                    <h2>Register</h2>

                    <p className="form-subtitle">
                        Create your CampusConnect account
                    </p>


                    {/* Name */}
                    <input
                        type="text"
                        placeholder="Full Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />


                    {/* Email */}
                    <input
                        type="email"
                        placeholder="University Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />


                    {/* Password */}
                    <input
                        type="password"
                        placeholder="Create Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />


                    {/* Confirm Password */}
                    <input
                        type="password"
                        placeholder="Confirm Password"
                        value={confirmPassword}
                        onChange={(e) =>
                            setConfirmPassword(e.target.value)
                        }
                        required
                    />


                    
                    <button
                        type="submit"
                        className="register-button"
                    >
                        Create Account
                    </button>


                    <p className="login-text">

                        Already have an account?{" "}

                        <Link to="/login">
                            Login
                        </Link>

                    </p>


                    <Link
                        to="/"
                        className="home-link"
                    >
                        ← Back to Home
                    </Link>

                </form>

            </div>

        </div>
    );
}

export default Register;