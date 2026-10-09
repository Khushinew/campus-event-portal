import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./ChangePassword.css";

function ChangePassword() {

    const navigate = useNavigate();
    const location = useLocation();

    const email =
        location.state?.email || "";

    const [password, setPassword] =
        useState("");

    const [confirmPassword, setConfirmPassword] =
        useState("");

    const [error, setError] =
        useState("");

    const [message, setMessage] =
        useState("");

    const handleSubmit = async (e) => {

        e.preventDefault();

        setError("");
        setMessage("");

        if (!password || !confirmPassword) {

            setError(
                "Please fill both password fields."
            );

            return;
        }

        if (password.length < 8) {

            setError(
                "Password must be at least 8 characters long."
            );

            return;
        }

        if (password !== confirmPassword) {

            setError(
                "Passwords do not match."
            );

            return;
        }

        try {

            const response =
                await fetch(
                    "http://localhost:5000/api/change-password",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({
                            email: email,
                            newPassword: password
                        })
                    }
                );

            const data =
                await response.json();

            if (!response.ok) {

                setError(
                    data.message ||
                    "Failed to change password."
                );

                return;
            }

            setMessage(
                "Password changed successfully. Please login again."
            );

            setTimeout(() => {

                navigate("/login", {
                    replace: true
                });

            }, 1500);

        } catch (error) {

            console.error(
                "Change password error:",
                error
            );

            setError(
                "Cannot connect to backend."
            );
        }
    };

    return (

        <div className="change-password-page">

            <div className="change-password-box">

                <h1>Create your password</h1>

                <p>
                    This is your first login.
                    Please create a new password
                    for your Campusphere account.
                </p>

                {error && (
                    <p className="error-message">
                        {error}
                    </p>
                )}

                {message && (
                    <p className="success-message">
                        {message}
                    </p>
                )}

                <form
                    onSubmit={handleSubmit}
                >

                    <div className="form-group">

                        <label>
                            New Password
                        </label>

                        <input
                            type="password"
                            value={password}
                            onChange={(e) =>
                                setPassword(
                                    e.target.value
                                )
                            }
                            required
                        />

                    </div>

                    <div className="form-group">

                        <label>
                            Confirm Password
                        </label>

                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) =>
                                setConfirmPassword(
                                    e.target.value
                                )
                            }
                            required
                        />

                    </div>

                    <button
                        type="submit"
                    >
                        Set Password
                    </button>

                </form>

            </div>

        </div>
    );
}

export default ChangePassword;