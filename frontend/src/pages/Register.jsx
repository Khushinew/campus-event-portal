import { useState } from "react";
import { Link } from "react-router-dom";
import "./Register.css";

function Register() {
    const [role, setRole] = useState("");

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


                <div className="register-form">

                    <h2>Register</h2>

                    <p className="form-subtitle">
                        Create your CampusConnect account
                    </p>

                    <input
                        type="text"
                        placeholder="Full Name"
                    />

                    <input
                        type="email"
                        placeholder="University Email"
                    />

                    <input
                        type="password"
                        placeholder="Create Password"
                    />

                    <input
                        type="password"
                        placeholder="Confirm Password"
                    />

                    <h3>Select Account Type</h3>

                    <div className="role-buttons">

                        <button
                            className={role === "student" ? "selected" : ""}
                            onClick={() => setRole("student")}
                        >
                            🎓 Student
                        </button>

                        <button
                            className={role === "faculty" ? "selected" : ""}
                            onClick={() => setRole("faculty")}
                        >
                            👨‍🏫 Faculty
                        </button>

                    </div>

                    {role === "student" && (
                        <div className="extra-details">

                            <select>
                                <option>Select Department</option>
                                <option>Computer Engineering</option>
                                <option>Information Technology</option>
                                <option>Artificial Intelligence</option>
                                <option>Electronics</option>
                            </select>

                            <select>
                                <option>Select Semester</option>
                                <option>1</option>
                                <option>2</option>
                                <option>3</option>
                                <option>4</option>
                                <option>5</option>
                                <option>6</option>
                                <option>7</option>
                                <option>8</option>
                            </select>

                        </div>
                    )}

                    {role === "faculty" && (
                        <div className="extra-details">

                            <select>
                                <option>Select Department</option>
                                <option>Computer Engineering</option>
                                <option>Information Technology</option>
                                <option>Science</option>
                            </select>

                            <input
                                type="text"
                                placeholder="Faculty ID"
                            />

                            <select>
                                <option>Select Designation</option>
                                <option>Professor</option>
                                <option>Associate Professor</option>
                                <option>Assistant Professor</option>
                                <option>HOD</option>
                            </select>

                        </div>
                    )}

                    <button className="register-button">
                        Create Account
                    </button>

                    <p className="login-text">
                        Already have an account?{" "}
                        <Link to="/login">Login</Link>
                    </p>

                    <Link to="/" className="home-link">
                        ← Back to Home
                    </Link>

                </div>

            </div>

        </div>
    );
}

export default Register;