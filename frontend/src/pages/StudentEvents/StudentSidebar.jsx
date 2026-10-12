
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./StudentSidebar.css";

function StudentSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  let user = {};

  try {
    user = JSON.parse(localStorage.getItem("user")) || {};
  } catch {
    user = {};
  }

  const name = user.name || user.fullName || "Student";
  const email = user.email || "";
  const initial = name.charAt(0).toUpperCase();

  const closeSidebar = () => setIsOpen(false);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    closeSidebar();
    navigate("/login", { replace: true });
  };

  return (
    <>
      {/* Hamburger button */}
      <button
        type="button"
        className="student-menu-btn"
        onClick={() => setIsOpen(true)}
        aria-label="Open student menu"
      >
        ☰
      </button>

      {/* Background overlay */}
      {isOpen && (
        <div
          className="student-sidebar-overlay"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={`student-sidebar ${
          isOpen ? "student-sidebar-open" : ""
        }`}
        aria-hidden={!isOpen}
      >
        {/* Header */}
        <div className="student-sidebar-header">
          <div>
            <p className="student-sidebar-label">STUDENT PORTAL</p>
            <h2>Campusphere</h2>
          </div>

          <button
            type="button"
            className="student-sidebar-close"
            onClick={closeSidebar}
            aria-label="Close student menu"
          >
            ×
          </button>
        </div>

        {/* Student information */}
        <div className="student-sidebar-profile">
          <div className="student-sidebar-avatar">{initial}</div>

          <div className="student-sidebar-user-info">
            <h3>{name}</h3>
            <p>Student</p>
            {email && <small>{email}</small>}
          </div>
        </div>

        {/* Only two navigation options */}
        <nav className="student-sidebar-nav">
          <Link
            to="/student-dashboard"
            className="student-sidebar-link"
            onClick={closeSidebar}
          >
            <span className="student-sidebar-icon">⌂</span>
            <span>Dashboard</span>
          </Link>

          <Link
            to="/student/profile"
            className="student-sidebar-link"
            onClick={closeSidebar}
          >
            <span className="student-sidebar-icon">♙</span>
            <span>My Profile</span>
          </Link>
        </nav>

        {/* Logout at the bottom */}
        <div className="student-sidebar-footer">
          <button
            type="button"
            className="student-sidebar-logout"
            onClick={handleLogout}
          >
            <span className="student-sidebar-icon">↪</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}

export default StudentSidebar;
