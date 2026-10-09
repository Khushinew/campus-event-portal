
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./OtpVerification.css";

function OtpVerification() {
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email || "";

  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!email) {
      setError("Please start the password reset process again.");
      return;
    }

    if (!/^\d{6}$/.test(otp)) {
      setError("Please enter a valid 6-digit OTP.");
      return;
    }

    setLoading(true);

    // Frontend demo only: this does not verify a real OTP.
    setTimeout(() => {
      setLoading(false);
      navigate("/reset-password", {
        state: { email, otp },
      });
    }, 500);
  };

  return (
    <div className="otp-page">
      <div className="otp-box">
        <p className="otp-label">ONE MORE STEP</p>

        <h1>Verify OTP</h1>

        <p className="otp-description">
          Enter the 6-digit verification code sent to your registered
          university email address.
        </p>

        {email && <p className="otp-email">{email}</p>}

        {error && <p className="otp-error">{error}</p>}

        <form onSubmit={handleSubmit}>
          <div className="otp-form-group">
            <label htmlFor="otp">Verification Code</label>

            <input
              id="otp"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChange={(e) =>
                setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
              maxLength={6}
              required
            />
          </div>

          <button type="submit" disabled={loading}>
            {loading ? "Verifying..." : "Verify OTP →"}
          </button>
        </form>

        <p className="otp-back">
          Remember your password? <Link to="/login">Back to Login</Link>
        </p>

        <p className="otp-note">
          Didn't receive a code? Email OTP delivery will be enabled when
          the backend is connected.
        </p>
      </div>
    </div>
  );
}

export default OtpVerification;