import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./FacultySidebar.css";

function FacultySidebar() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const savedUser = localStorage.getItem("user");

  let user = null;

  try {
    user = savedUser ? JSON.parse(savedUser) : null;
  } catch (error) {
    console.error("Invalid user data");
  }

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");

    setSidebarOpen(false);

    navigate("/login");
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <>
      {/* ================= MENU BUTTON ================= */}

      <button
        className="faculty-menu-btn"
        onClick={() => setSidebarOpen(true)}
        aria-label="Open menu"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>


      {/* ================= OVERLAY ================= */}

      {sidebarOpen && (
        <div
          className="faculty-sidebar-overlay"
          onClick={closeSidebar}
        ></div>
      )}


      {/* ================= SIDEBAR ================= */}

      <aside
        className={`faculty-sidebar ${
          sidebarOpen ? "sidebar-open" : ""
        }`}
      >

        {/* HEADER */}

        <div className="sidebar-header">

          <div>
            <p className="sidebar-label">
              FACULTY PORTAL
            </p>

            <h2>
              Campusphere
            </h2>
          </div>

          <button
            className="sidebar-close-btn"
            onClick={closeSidebar}
            aria-label="Close menu"
          >
            ×
          </button>

        </div>


        {/* PROFILE */}

        {user && (
          <div className="sidebar-profile">

            <div className="sidebar-profile-circle">
              {user.name
                ? user.name.charAt(0).toUpperCase()
                : "F"}
            </div>

            <div>

              <strong>
                {user.name || "Faculty"}
              </strong>

              <span>
                Faculty
              </span>

            </div>

          </div>
        )}


        {/* NAVIGATION */}

        <nav className="sidebar-nav">

          {/* Dashboard */}

          <Link
            to="/faculty-dashboard"
            className="sidebar-link"
            onClick={closeSidebar}
          >
            <span className="sidebar-icon">
              ⌂
            </span>

            <span>
              Dashboard
            </span>
          </Link>


          {/* Manage Account */}

          <Link
            to="/faculty/account"
            className="sidebar-link"
            onClick={closeSidebar}
          >
            <span className="sidebar-icon">
              ⚙
            </span>

            <span>
              Manage Account
            </span>
          </Link>


          {/* Profile */}

          <Link
            to="/faculty/profile"
            className="sidebar-link"
            onClick={closeSidebar}
          >
            <span className="sidebar-icon">
              ♙
            </span>

            <span>
              My Profile
            </span>
          </Link>

        </nav>


        {/* LOGOUT */}

        <div className="sidebar-bottom">

          <button
            className="sidebar-logout"
            onClick={handleLogout}
          >
            <span className="sidebar-icon">
              ↪
            </span>

            <span>
              Logout
            </span>
          </button>

        </div>

      </aside>
    </>
  );
}

export default FacultySidebar;