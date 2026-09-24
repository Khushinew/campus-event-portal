import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./FacultyDashboard.css";

function FacultyDashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [eventCount, setEventCount] = useState(0);
  const [loading, setLoading] = useState(true);

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

    // Connection with backend
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
    navigate("/login");
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="faculty-dashboard">

      {/* Sidebar */}
      <aside className="faculty-sidebar">

        <div className="faculty-logo">
          Campusphere
        </div>

        <nav className="faculty-nav">

          <Link to="/faculty-dashboard" className="active">
            Dashboard
          </Link>

          <Link to="/faculty/create-event">
            Create Event
          </Link>

          <Link to="/faculty/events">
            My Events
          </Link>

          <Link to="/faculty/registrations">
            Monitor Registrations
          </Link>

          <Link to="/faculty/students">
            Student List
          </Link>

          <Link to="/faculty/account">
            Manage Account
          </Link>

        </nav>

        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>

      </aside>


      {/* Main Content */}
      <main className="faculty-main">

        {/* Header */}
        <header className="faculty-header">

          <div>
            <p className="dashboard-label">
              FACULTY PORTAL
            </p>

            <h1>
              Welcome, {user.name}
            </h1>

            <p>
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


        {/* Statistics */}
        <section className="faculty-stats">

          <div className="stat-card">
            <h3>My Events</h3>

            <p>
              {loading ? "..." : eventCount}
            </p>

            <span>Events created by you</span>
          </div>


          <div className="stat-card">
            <h3>Registrations</h3>

            <p>0</p>

            <span>Student registrations</span>
          </div>


          <div className="stat-card">
            <h3>Department</h3>

            <p className="department-value">
              {user.department || "Not Set"}
            </p>

            <span>Your department</span>
          </div>


          <div className="stat-card">
            <h3>Role</h3>

            <p className="role-value">
              Faculty
            </p>

            <span>Campusphere account</span>
          </div>

        </section>


        {/* Quick Actions */}
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
              className="action-card"
            >
              <div className="action-icon">＋</div>

              <div>
                <h3>Create Event</h3>
                <p>
                  Create a new campus event.
                </p>
              </div>
            </Link>


            {/* View Created Events */}
            <Link
              to="/faculty/events"
              className="action-card"
            >
              <div className="action-icon">▣</div>

              <div>
                <h3>My Events</h3>
                <p>
                  View events created by you.
                </p>
              </div>
            </Link>


            {/* Monitor Registrations */}
            <Link
              to="/faculty/registrations"
              className="action-card"
            >
              <div className="action-icon">✓</div>

              <div>
                <h3>Monitor Registrations</h3>
                <p>
                  View student registrations.
                </p>
              </div>
            </Link>


            {/* Student List */}
            <Link
              to="/faculty/students"
              className="action-card"
            >
              <div className="action-icon">♙</div>

              <div>
                <h3>Student List</h3>
                <p>
                  View registered students.
                </p>
              </div>
            </Link>


            {/* Manage Account */}
            <Link
              to="/faculty/account"
              className="action-card"
            >
              <div className="action-icon">⚙</div>

              <div>
                <h3>Manage Account</h3>
                <p>
                  Update your faculty profile.
                </p>
              </div>
            </Link>

          </div>

        </section>


        {/* Recent Activity */}
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

            <Link to="/faculty/events">
              View All
            </Link>
          </div>


          <div className="empty-events">

            {loading ? (
              <p>Loading events...</p>
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