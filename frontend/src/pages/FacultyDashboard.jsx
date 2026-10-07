import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./FacultyDashboard.css";

function FacultyDashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [eventCount, setEventCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");

    if (!savedUser) {
      navigate("/login");
      return;
    }

    const currentUser = JSON.parse(savedUser);

    if (currentUser.role !== "faculty") {
      navigate("/");
      return;
    }

    setUser(currentUser);

    fetch(`http://localhost:5000/api/events/faculty/${currentUser.id}`)
      .then((response) => response.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setEventCount(data.length);
        }
      })
      .catch((error) => {
        console.error("Error loading events:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login");
  };

  if (!user) {
    return <div className="faculty-loading">Loading...</div>;
  }

  return (
    <div className="faculty-dashboard">

      {/* ================= MOBILE / SIDEBAR MENU BUTTON ================= */}
      <button
        className="sidebar-menu-btn"
        onClick={() => setSidebarOpen(true)}
        aria-label="Open sidebar"
      >
        ☰
      </button>

      {/* ================= OVERLAY ================= */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* ================= SIDEBAR ================= */}
      <aside
        className={`faculty-sidebar ${
          sidebarOpen ? "sidebar-open" : ""
        }`}
      >

        {/* Logo + ONE close button */}
        <div className="sidebar-top">

          <div className="faculty-logo">
            Campusphere<span>.</span>
          </div>

          <button
            className="sidebar-close-btn"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            ×
          </button>

        </div>

        {/* Faculty Profile */}
        <div className="sidebar-profile">

          <div className="sidebar-profile-circle">
            {user.name.charAt(0).toUpperCase()}
          </div>

          <div className="sidebar-profile-info">
            <strong>{user.name}</strong>
            <span>Faculty</span>
            <small>
              {user.department || "Department not set"}
            </small>
          </div>

        </div>

        {/* Sidebar Account Section */}
        <div className="sidebar-account">

          <p className="sidebar-section-label">
            ACCOUNT
          </p>

          <Link
            to="/faculty/account"
            className="sidebar-account-link"
            onClick={() => setSidebarOpen(false)}
          >
            <span className="sidebar-link-icon">⚙</span>
            <span>Manage Account</span>
          </Link>

          <button
            className="sidebar-logout-btn"
            onClick={handleLogout}
          >
            <span className="sidebar-link-icon">↪</span>
            <span>Logout</span>
          </button>

        </div>

      </aside>


      {/* ================= MAIN CONTENT ================= */}
      <main className="faculty-main">

        {/* Header */}
        <header className="faculty-header">

          <div className="faculty-header-content">

            <p className="dashboard-label">
              FACULTY PORTAL
            </p>

            <h1>
              Welcome, {user.name}
            </h1>

            <p className="header-description">
              Manage your campus events and student activities.
            </p>

          </div>

          <div className="faculty-profile">

            <div className="profile-circle">
              {user.name.charAt(0).toUpperCase()}
            </div>

            <div>
              <strong>{user.name}</strong>
              <span>Faculty</span>
            </div>

          </div>

        </header>


        {/* ================= STATISTICS ================= */}
        <section className="faculty-stats">

          <div className="stat-card stat-yellow">

            <h3>MY EVENTS</h3>

            <p>
              {loading ? "..." : eventCount}
            </p>

            <span>
              Events created by you
            </span>

          </div>


          <div className="stat-card stat-blue">

            <h3>REGISTRATIONS</h3>

            <p>0</p>

            <span>
              Student registrations
            </span>

          </div>


          <div className="stat-card stat-green">

            <h3>DEPARTMENT</h3>

            <p className="department-value">
              {user.department || "Not Set"}
            </p>

            <span>
              Your department
            </span>

          </div>


          <div className="stat-card stat-purple">

            <h3>ROLE</h3>

            <p className="role-value">
              Faculty
            </p>

            <span>
              Campusphere account
            </span>

          </div>

        </section>


        {/* ================= QUICK ACTIONS ================= */}
        <section className="dashboard-section">

          <div className="section-heading">

            <div>

              <p className="dashboard-label">
                QUICK ACTIONS
              </p>

              <h2>
                Manage Campus Activities
              </h2>

            </div>

          </div>


          <div className="action-grid">

            {/* Create Event */}
            <Link
              to="/faculty/create-event"
              className="action-card action-yellow"
            >

              <div className="action-icon">
                ＋
              </div>

              <div>
                <h3>
                  Create Event
                </h3>

                <p>
                  Create a new campus event.
                </p>
              </div>

              <span className="action-arrow">
                ↗
              </span>

            </Link>


            {/* My Events */}
            <Link
              to="/faculty/events"
              className="action-card action-blue"
            >

              <div className="action-icon">
                ▣
              </div>

              <div>
                <h3>
                  My Events
                </h3>

                <p>
                  View events created by you.
                </p>
              </div>

              <span className="action-arrow">
                ↗
              </span>

            </Link>


            {/* Monitor Registrations */}
            <Link
              to="/faculty/registrations"
              className="action-card action-green"
            >

              <div className="action-icon">
                ✓
              </div>

              <div>
                <h3>
                  Monitor Registrations
                </h3>

                <p>
                  View student registrations.
                </p>
              </div>

              <span className="action-arrow">
                ↗
              </span>

            </Link>


            {/* Student List */}
            <Link
              to="/faculty/students"
              className="action-card action-purple"
            >

              <div className="action-icon">
                ♙
              </div>

              <div>
                <h3>
                  Student List
                </h3>

                <p>
                  View registered students.
                </p>
              </div>

              <span className="action-arrow">
                ↗
              </span>

            </Link>


            {/* Manage Account */}
            <Link
              to="/faculty/account"
              className="action-card action-yellow"
            >

              <div className="action-icon">
                ⚙
              </div>

              <div>
                <h3>
                  Manage Account
                </h3>

                <p>
                  Update your faculty profile.
                </p>
              </div>

              <span className="action-arrow">
                ↗
              </span>

            </Link>

          </div>

        </section>


        {/* ================= RECENT ACTIVITY ================= */}
        <section className="dashboard-section">

          <div className="section-heading">

            <div>

              <p className="dashboard-label">
                ACTIVITY
              </p>

              <h2>
                Recent Events
              </h2>

            </div>

            <Link
              to="/faculty/events"
              className="view-all-link"
            >
              View All ↗
            </Link>

          </div>


          <div className="empty-events">

            {loading ? (

              <p>
                Loading events...
              </p>

            ) : eventCount === 0 ? (

              <>
                <div className="empty-icon">
                  📅
                </div>

                <h3>
                  No events created yet
                </h3>

                <p>
                  Create your first campus event to get started.
                </p>

                <Link
                  to="/faculty/create-event"
                  className="create-event-btn"
                >
                  Create Event
                </Link>
              </>

            ) : (

              <p>
                You have created {eventCount} event(s).
              </p>

            )}

          </div>

        </section>

      </main>

    </div>
  );
}

export default FacultyDashboard;