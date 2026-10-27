
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import "./StudentProfile.css";
import Footer from "../../components/Footer";

const PERSONAL_SECURITY_QUESTIONS = [
  "What was the name of your favorite pet?",
  "What was the name of your first school?",
  "Who was your best friend?",
  "What is your favorite memory place?",
  "What was the name of your first company?",
];

function StudentProfile() {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem("user")) || {};
    } catch {
      return {};
    }
  });
  const [securityQuestion, setSecurityQuestion] = useState("");
  const [securityAnswer, setSecurityAnswer] = useState("");
  const [hasSecurityAnswer, setHasSecurityAnswer] = useState(false);
  const [securityMessage, setSecurityMessage] = useState("");
  const [securityError, setSecurityError] = useState("");
  const [loadingSecurityQuestion, setLoadingSecurityQuestion] = useState(true);
  const [savingSecurityQuestion, setSavingSecurityQuestion] = useState(false);

  useEffect(() => {
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
          if (data.email) {
            setUser((previous) => ({ ...previous, ...data }));
          }
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
  }, []);

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
        body: JSON.stringify({ securityQuestion, securityAnswer }),
      });
      const data = await response.json();

      if (!response.ok) {
        if (data.message === "No profile fields were provided to update.") {
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
      console.error("Save student security question error:", error);
      setSecurityError(
        error.message || "Unable to save your personal question."
      );
    } finally {
      setSavingSecurityQuestion(false);
    }
  };

  const name = user.name || user.fullName || "Student";
  const email = user.email || "";
  const initial = name.charAt(0).toUpperCase();
  const role = user.role || "Student";
  const department = user.department || user.branch || "Not provided";
  const semester = user.semester || "Not provided";
  const specialization = user.specialization || "Not provided";

  return (
    <div className="student-profile-page">
      <header className="student-profile-header">
        <div>
          <p className="student-profile-eyebrow">STUDENT PORTAL</p>
          <h1>My Profile</h1>
          <p className="student-profile-subtitle">
            Your student profile and account information.
          </p>
        </div>

        <Link to="/student-dashboard" className="student-profile-back">
          ← Dashboard
        </Link>
      </header>

      <main className="student-profile-main">
        <section className="student-profile-card">
          <div className="student-profile-identity">
            <div className="student-profile-avatar">{initial}</div>

            <div className="student-profile-identity-text">
              <p className="student-profile-eyebrow">STUDENT MEMBER</p>
              <h2>{name}</h2>
              <span className="student-profile-role">{role}</span>
            </div>
          </div>

          <div className="student-profile-details">
            <div className="student-profile-detail">
              <span>FULL NAME</span>
              <p>{name}</p>
            </div>

            <div className="student-profile-detail">
              <span>EMAIL ADDRESS</span>
              <p>{email || "Not provided"}</p>
            </div>

            <div className="student-profile-detail">
              <span>DEPARTMENT</span>
              <p>{department}</p>
            </div>

            <div className="student-profile-detail">
              <span>SEMESTER</span>
              <p>{semester}</p>
            </div>

            <div className="student-profile-detail">
              <span>SPECIALIZATION</span>
              <p>{specialization}</p>
            </div>

            <div className="student-profile-detail">
              <span>ROLE</span>
              <p>{role}</p>
            </div>
          </div>
        </section>

        <section className="student-security-card">
          <p className="student-profile-eyebrow">ACCOUNT RECOVERY</p>
          <h2>Personal Security Question</h2>
          <p className="student-security-description">
            Choose a question and answer to help verify your identity. You can
            change them whenever you need to.
          </p>

          {loadingSecurityQuestion ? (
            <p className="student-security-status">
              Loading your saved question...
            </p>
          ) : (
            <form
              className="student-security-form"
              onSubmit={handleSecurityQuestionSave}
            >
              <div>
                <label htmlFor="student-security-question">
                  Select a personal question
                </label>
                <select
                  id="student-security-question"
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

              <div>
                <label htmlFor="student-security-answer">Your answer</label>
                <input
                  id="student-security-answer"
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
                <p className="student-security-status">
                  An answer is saved for this account. Saving a new answer
                  replaces it.
                </p>
              )}
              {securityError && (
                <p className="student-security-error" role="alert">
                  {securityError}
                </p>
              )}
              {securityMessage && (
                <p className="student-security-success" role="status">
                  {securityMessage}
                </p>
              )}

              <button
                type="submit"
                disabled={savingSecurityQuestion}
              >
                {savingSecurityQuestion ? "Saving..." : "Save Question"}
              </button>
            </form>
          )}
        </section>

        <section className="student-profile-note">
          <p className="student-profile-eyebrow">CAMPUSPHERE NOTE</p>
          <h2>Your profile, your campus journey.</h2>
          <p>
            Keep exploring campus events and managing your personal schedule
            through your student dashboard.
          </p>
        </section>
      </main>
      <Footer />
    </div>
  );
}

export default StudentProfile;
