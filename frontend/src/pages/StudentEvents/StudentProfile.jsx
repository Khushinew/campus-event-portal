
import { Link } from "react-router-dom";
import { useState } from "react";
import "./StudentProfile.css";
import Footer from "../../components/Footer";

function StudentProfile() {
  const [user] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || {};
    } catch {
      return {};
    }
  });

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
