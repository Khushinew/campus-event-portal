import {Link} from "react-router-dom";
import "./StudentDashboard.css";

function StudentDashboard() {
  return (
    <div className="student-dashboard">

      {/* Header */}
      <header className="student-header">
        <div>
          <h1>Student Dashboard</h1>
          <p>Welcome back! Explore and manage your campus events.</p>
        </div>

        <Link to="/student/profile" className="profile-btn">
          My Profile
        </Link>
      </header>

      {/* Main Content */}
      <main className="student-content">

        <div className="dashboard-title">
          <h2>Campus Events</h2>
          <p>Choose an option to continue</p>
        </div>

        <div className="student-grid">

          {/* View Events */}
          <Link to="/student/events" className="student-card">
            <div className="card-top">
              <div className="card-icon">📅</div>
              <span className="card-number">01</span>
            </div>

            <div className="card-content">
              <h3>View Events</h3>
              <p>
                Explore upcoming events happening across the campus.
              </p>
            </div>

            <span className="arrow">→</span>
          </Link>

          {/* Event Details */}
          <Link to="/student/event-details" className="student-card">
            <div className="card-top">
              <div className="card-icon">📋</div>
              <span className="card-number">02</span>
            </div>

            <div className="card-content">
              <h3>Event Details</h3>
              <p>
                View complete information about campus events.
              </p>
            </div>

            <span className="arrow">→</span>
          </Link>

          {/* Register */}
          <Link to="/student/register-event" className="student-card">
            <div className="card-top">
              <div className="card-icon">🎟️</div>
              <span className="card-number">03</span>
            </div>

            <div className="card-content">
              <h3>Register for Events</h3>
              <p>
                Register and enroll for upcoming campus events.
              </p>
            </div>

            <span className="arrow">→</span>
          </Link>

          {/* Registered Events */}
          <Link to="/student/registered-events" className="student-card">
            <div className="card-top">
              <div className="card-icon">✅</div>
              <span className="card-number">04</span>
            </div>

            <div className="card-content">
              <h3>My Registered Events</h3>
              <p>
                See all the events you have registered for.
              </p>
            </div>

            <span className="arrow">→</span>
          </Link>

          {/* Calendar */}
          <Link to="/student/calendar" className="student-card">
            <div className="card-top">
              <div className="card-icon">🗓️</div>
              <span className="card-number">05</span>
            </div>

            <div className="card-content">
              <h3>Personal Calendar</h3>
              <p>
                View your events and manage your personal schedule.
              </p>
            </div>

            <span className="arrow">→</span>
          </Link>

          {/* Add Personal Event */}
          <Link to="/student/add-event" className="student-card">
            <div className="card-top">
              <div className="card-icon">➕</div>
              <span className="card-number">06</span>
            </div>

            <div className="card-content">
              <h3>Add Personal Event</h3>
              <p>
                Add your own commitments to your personal calendar.
              </p>
            </div>

            <span className="arrow">→</span>
          </Link>

        </div>
      </main>

    </div>
  );
}

export default StudentDashboard;