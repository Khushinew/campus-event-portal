import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import FacultySidebar from "../events/FacultySidebar";
import "./ManageAccount.css";
import { getStoredUser } from "../../auth";

const PERSONAL_SECURITY_QUESTIONS = [
  "What was the name of your favorite pet?",
  "What was the name of your first school?",
  "Who was your best friend?",
  "What is your favorite memory place?",
  "What was the name of your first company?",
];

function ManageAccount() {
  const navigate = useNavigate();

  const [user, setUser] = useState(() => getStoredUser());
  const [formData, setFormData] = useState(() => {
    const currentUser = getStoredUser() || {};
    return {
      name: currentUser.name || "",
      email: currentUser.email || "",
      department: currentUser.department || "",
    };
  });

  const [message, setMessage] = useState("");
  const [securityQuestion, setSecurityQuestion] = useState("");
  const [securityAnswer, setSecurityAnswer] = useState("");
  const [hasSecurityAnswer, setHasSecurityAnswer] = useState(false);
  const [securityMessage, setSecurityMessage] = useState("");
  const [securityError, setSecurityError] = useState("");
  const [loadingSecurityQuestion, setLoadingSecurityQuestion] = useState(true);
  const [savingSecurityQuestion, setSavingSecurityQuestion] = useState(false);

  useEffect(() => {
    if (!user || user.role !== "faculty") navigate("/login");
  }, [navigate, user]);

  useEffect(() => {
    if (!user || user.role !== "faculty") return undefined;

    let cancelled = false;
    async function loadPersonalQuestion() {
      try {
        const token = sessionStorage.getItem("token");
        const response = await fetch("http://localhost:5000/api/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Unable to load your personal question.");
        }

        if (!cancelled) {
          setSecurityQuestion(data.securityQuestion || "");
          setHasSecurityAnswer(Boolean(data.hasSecurityAnswer));
        }
      } catch (error) {
        if (!cancelled) {
          setSecurityError(
            error.message || "Unable to load your personal question."
          );
        }
      } finally {
        if (!cancelled) setLoadingSecurityQuestion(false);
      }
    }

    loadPersonalQuestion();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    setMessage("");
  };

  const handleSave = (e) => {
    e.preventDefault();

    if (!user) return;

    const updatedUser = {
      ...user,
      name: formData.name,
      email: formData.email,
      department: formData.department,
    };

    sessionStorage.setItem("user", JSON.stringify(updatedUser));

    setUser(updatedUser);

    setMessage("Your account details have been updated successfully.");
  };

  const handleSecurityQuestionSave = async (event) => {
    event.preventDefault();
    setSecurityMessage("");
    setSecurityError("");
    setSavingSecurityQuestion(true);

    try {
      const token = sessionStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          securityQuestion,
          securityAnswer,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        if (
          data.message ===
          "No profile fields were provided to update."
        ) {
          throw new Error(
            "The backend is still running older code. Restart the backend server, then try saving again."
          );
        }
        throw new Error(data.message || "Unable to save your personal question.");
      }

      setSecurityQuestion(data.user.securityQuestion);
      setHasSecurityAnswer(Boolean(data.user.hasSecurityAnswer));
      setSecurityAnswer("");
      setSecurityMessage("Your personal question and answer were saved securely.");
    } catch (error) {
      console.error("Save personal security question error:", error);
      setSecurityError(
        error.message || "Unable to save your personal question."
      );
    } finally {
      setSavingSecurityQuestion(false);
    }
  };

  if (!user) {
    return (
      <div className="manage-account-page">
        <FacultySidebar />

        <main className="manage-account-main">
          <div className="account-loading">
            Loading account...
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="manage-account-page">
      <FacultySidebar />

      <main className="manage-account-main">

        {/* Header */}
        <header className="account-header">
          <div>
            <p className="account-label">FACULTY PORTAL</p>

            <h1>Manage Account</h1>

            <p className="account-subtitle">
              Update your account information and keep your faculty profile
              up to date.
            </p>
          </div>

          <button
            className="account-back-btn"
            onClick={() => navigate("/faculty-dashboard")}
          >
            ← Dashboard
          </button>
        </header>

        {/* Account Card */}
        <section className="account-card">

          <div className="account-card-heading">
            <div>
              <p className="small-label">ACCOUNT SETTINGS</p>
              <h2>Personal Information</h2>
            </div>

            <div className="account-avatar">
              {formData.name
                ? formData.name.charAt(0).toUpperCase()
                : "F"}
            </div>
          </div>

          <form onSubmit={handleSave}>

            <div className="account-form-grid">

              {/* Name */}
              <div className="account-field">
                <label htmlFor="name">
                  Full Name
                </label>

                <input
                  id="name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  required
                />
              </div>

              {/* Email */}
              <div className="account-field">
                <label htmlFor="email">
                  Email Address
                </label>

                <input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  required
                />
              </div>

              {/* Department */}
              <div className="account-field">
                <label htmlFor="department">
                  Department
                </label>

                <input
                  id="department"
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  placeholder="Enter your department"
                />
              </div>

              {/* Role */}
              <div className="account-field">
                <label>
                  Account Role
                </label>

                <input
                  type="text"
                  value="Faculty"
                  disabled
                />
              </div>

            </div>

            {message && (
              <div className="account-success">
                ✓ {message}
              </div>
            )}

            <div className="account-actions">

              <button
                type="button"
                className="account-cancel-btn"
                onClick={() => navigate("/faculty-dashboard")}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="account-save-btn"
              >
                Save Changes
              </button>

            </div>

          </form>
        </section>

        <section className="security-question-card">
          <div className="account-card-heading">
            <div>
              <p className="small-label">ACCOUNT RECOVERY</p>
              <h2>Personal Security Question</h2>
            </div>
          </div>

          <p className="security-question-description">
            Choose a question and answer to help verify your identity. You can
            change them whenever you need to.
          </p>

          {loadingSecurityQuestion ? (
            <p className="security-question-status">
              Loading your saved question...
            </p>
          ) : (
            <form
              className="security-question-form"
              onSubmit={handleSecurityQuestionSave}
            >
              <div className="account-field">
                <label htmlFor="personal-security-question">
                  Select a personal question
                </label>
                <select
                  id="personal-security-question"
                  value={securityQuestion}
                  onChange={(event) => {
                    setSecurityQuestion(event.target.value);
                    setSecurityMessage("");
                    setSecurityError("");
                  }}
                  required
                >
                  <option value="">Choose a question</option>
                  {PERSONAL_SECURITY_QUESTIONS.map((question) => (
                    <option key={question} value={question}>
                      {question}
                    </option>
                  ))}
                </select>
              </div>

              <div className="account-field">
                <label htmlFor="personal-security-answer">
                  Your answer
                </label>
                <input
                  id="personal-security-answer"
                  type="text"
                  value={securityAnswer}
                  onChange={(event) => {
                    setSecurityAnswer(event.target.value);
                    setSecurityMessage("");
                    setSecurityError("");
                  }}
                  placeholder={
                    hasSecurityAnswer
                      ? "Enter a new answer to replace the saved one"
                      : "Enter your answer"
                  }
                  autoComplete="off"
                  minLength={2}
                  maxLength={120}
                  required
                />
              </div>

              {hasSecurityAnswer && (
                <p className="security-question-status">
                  An answer is saved for this account. Saving a new answer
                  replaces it.
                </p>
              )}
              {securityError && (
                <p className="security-question-error" role="alert">
                  {securityError}
                </p>
              )}
              {securityMessage && (
                <p className="security-question-success" role="status">
                  {securityMessage}
                </p>
              )}

              <div className="account-actions">
                <button
                  type="submit"
                  className="account-save-btn"
                  disabled={savingSecurityQuestion}
                >
                  {savingSecurityQuestion ? "Saving..." : "Save Question"}
                </button>
              </div>
            </form>
          )}
        </section>

        {/* Security Card */}
        <section className="security-card">

          <div className="security-icon">
            🔒
          </div>

          <div>
            <p className="small-label">
              ACCOUNT SECURITY
            </p>

            <h2>Keep your account secure</h2>

            <p>
              Make sure your account information is accurate and
              only use your Campusphere account on trusted devices.
            </p>
          </div>

        </section>

      </main>
      
    </div>
  );
}

export default ManageAccount;