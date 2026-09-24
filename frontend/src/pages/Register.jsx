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

    const handleRegister = async (e) => {

        e.preventDefault();

        // Check password
        if (password !== confirmPassword) {
            alert("Passwords do not match!");
            return;
        }

        // Check role
        if (!role) {
            alert("Please select Student or Faculty");
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
                        email: email,
                        password: password,
                        role: role
                    })
                }
            );

            const data = await response.json();

            if (response.ok) {

                alert("Account created successfully!");

                // Go to login page
                navigate("/login");

            } else {

                alert(data.message);

            }

        } catch (error) {

            console.error("Registration error:", error);

            alert("Cannot connect to backend.");

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


                    <h3>Select Account Type</h3>


                    <div className="role-buttons">

                        <button
                            type="button"
                            className={
                                role === "student"
                                    ? "selected"
                                    : ""
                            }
                            onClick={() => setRole("student")}
                        >
                            🎓 Student
                        </button>


                        <button
                            type="button"
                            className={
                                role === "faculty"
                                    ? "selected"
                                    : ""
                            }
                            onClick={() => setRole("faculty")}
                        >
                            👨‍🏫 Faculty
                        </button>

                    </div>


                    {role === "student" && (

                        <div className="extra-details">

                            <select>
                                <option>
                                    Select Department
                                </option>

                                <option>
                                    Computer Engineering
                                </option>

                                <option>
                                    Information Technology
                                </option>

                                <option>
                                    Artificial Intelligence
                                </option>

                                <option>
                                    Electronics
                                </option>

                            </select>


                            <select>

                                <option>
                                    Select Semester
                                </option>

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

                                <option>
                                    Select Department
                                </option>

                                <option>
                                    Computer Engineering
                                </option>

                                <option>
                                    Information Technology
                                </option>

                                <option>
                                    Science
                                </option>

                            </select>


                            <input
                                type="text"
                                placeholder="Faculty ID"
                            />


                            <select>

                                <option>
                                    Select Designation
                                </option>

                                <option>
                                    Professor
                                </option>

                                <option>
                                    Associate Professor
                                </option>

                                <option>
                                    Assistant Professor
                                </option>

                                <option>
                                    HOD
                                </option>

                            </select>

                        </div>

                    )}


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