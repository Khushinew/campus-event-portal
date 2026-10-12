
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./StudentSidebar.css";

function StudentSidebar() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  let user = null;

  try {
    const savedUser = localStorage.getItem("user");
    user = savedUser ? JSON.parse(savedUser) : null;
  } catch (error) {
    console.error("Invalid user data");
  }

  const closeSidebar = () => setSidebarOpen(false);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setSidebarOpen(false);
    navigate("/login");
  };

  const menuItems = [
    { label: "Dashboard", path: "/student-dashboard", icon: "⌂" },
    { label: "View Campus Events", path: "/student/events", icon: "✦" },
    { label: "Registered Events", path: "/student/registered-events", icon: "✓" },
    { label: "Personal Calendar", path: "/student/calendar", icon: "▦" },
    { label: "Add Personal Event", path: "/student/add-event", icon: "+" },
    { label: "My Profile", path: "/student/profile", icon: "♙" },
  ];

  return (
    <>
      <button
        className="student-menu-btn"
        onClick={() => setSidebarOpen(true)}
        aria-label="Open student menu"
        aria-expanded={sidebarOpen}
      >
        <span />
        <span />
        <span />
      </button>

      {sidebarOpen && (
        <div
          className="student-sidebar-overlay"
          onClick={closeSidebar}
        />
      )}

      <aside
        className={`student-sidebar ${
          sidebarOpen ? "student-sidebar-open" : ""
        }`}
      >
        <div className="student-sidebar-header">
          <div>
            <p className="student-sidebar-label">STUDENT PORTAL</p>
            <h2>Campusphere</h2>
          </div>

          <button
            className="student-sidebar-close"
            onClick={closeSidebar}
            aria-label="Close menu"
          >
            ×
          </button>
        </div>

        {user && (
          <div className="student-sidebar-profile">
            <div className="student-profile-circle">
              {user.name ? user.name.charAt(0).toUpperCase() : "S"}
            </div>

            <div className="student-profile-info">
              <strong>{user.name || "Student"}</strong>
              <span>Student</span>
              {user.email && <small>{user.email}</small>}
            </div>
          </div>
        )}

        <nav className="student-sidebar-nav">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="student-sidebar-link"
              onClick={closeSidebar}
            >
              <span className="student-sidebar-icon">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="student-sidebar-bottom">
          <button
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
