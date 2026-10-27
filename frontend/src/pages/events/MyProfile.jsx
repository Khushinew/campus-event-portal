import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import FacultySidebar from "../events/FacultySidebar";
import "./MyProfile.css";
import Footer from "../../components/Footer";
import { getStoredUser } from "../../auth";

function MyProfile() {
  const navigate = useNavigate();
  const [user] = useState(() => getStoredUser());

  useEffect(() => {
    if (!user || user.role !== "faculty") navigate("/login");
  }, [navigate, user]);

  if (!user) {
    return (
      <div className="profile-page">
        <FacultySidebar />

        <main className="profile-main">
          <div className="profile-loading">
            Loading profile...
          </div>
        </main>
      </div>
    );
  }

  const initial = user.name
    ? user.name.charAt(0).toUpperCase()
    : "F";

  return (
    <div className="profile-page">

      <FacultySidebar />

      <main className="profile-main">

        {/* Header */}
        <header className="profile-header">

          <div>
            <p className="profile-label">
              FACULTY PORTAL
            </p>

            <h1>My Profile</h1>

            <p className="profile-subtitle">
              Your faculty profile and account information.
            </p>
          </div>

          <button
            className="profile-back-btn"
            onClick={() => navigate("/faculty-dashboard")}
          >
            ← Dashboard
          </button>

        </header>


        {/* Profile Card */}
        <section className="profile-card">

          <div className="profile-top">

            <div className="profile-avatar">
              {initial}
            </div>

            <div className="profile-name-section">

              <p className="profile-small-label">
                FACULTY MEMBER
              </p>

              <h2>
                {user.name || "Faculty Member"}
              </h2>

              <span className="profile-role">
                Faculty
              </span>

            </div>

          </div>


          {/* Information */}
          <div className="profile-information">

            <div className="profile-info-item">
              <span className="info-label">
                FULL NAME
              </span>

              <strong>
                {user.name || "Not available"}
              </strong>
            </div>


            <div className="profile-info-item">
              <span className="info-label">
                EMAIL ADDRESS
              </span>

              <strong>
                {user.email || "Not available"}
              </strong>
            </div>


            <div className="profile-info-item">
              <span className="info-label">
                DEPARTMENT
              </span>

              <strong>
                {user.department || "Not specified"}
              </strong>
            </div>


            <div className="profile-info-item">
              <span className="info-label">
                ROLE
              </span>

              <strong>
                Faculty
              </strong>
            </div>

          </div>


          {/* Profile Actions */}
          <div className="profile-actions">

            <button
              className="profile-edit-btn"
              onClick={() => navigate("/faculty/account")}
            >
              ✎ Edit Account
            </button>

          </div>

        </section>


        {/* Note */}
        <section className="profile-note">

          <div className="note-pin">
            ✦
          </div>

          <div>

            <p className="profile-small-label">
              CAMPUSPHERE NOTE
            </p>

            <h3>
              Your profile, your space.
            </h3>

            <p>
              Keep your faculty information updated so your
              campus event activities remain connected to the
              correct account.
            </p>

          </div>

        </section>

      </main>
      <Footer />

    </div>
  );
}

export default MyProfile;