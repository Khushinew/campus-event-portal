import { Link } from "react-router-dom";
import "./EventDetails.css";

function EventDetails() {
  const event = {
    title: "Tech Fest 2026",
    category: "Technology",
    date: "15 October 2026",
    time: "10:00 AM - 4:00 PM",
    venue: "Main Auditorium",
    organizer: "Computer Science Department",
    description:
      "Tech Fest 2026 is a campus technology event featuring workshops, technical competitions, interactive sessions and opportunities for students to explore new technologies.",
    eligibility: "Open to all students",
    capacity: "200 students",
  };

  return (
    <div className="event-details-page">

      {/* Header */}
      <div className="event-details-header">
        <div>
          <h1>Event Details</h1>
          <p>View complete information about the selected event.</p>
        </div>

        <Link to="/student/events" className="back-btn">
          ← Back to Events
        </Link>
      </div>

      {/* Main Event Card */}
      <div className="event-details-container">

        {/* Event Overview */}
        <div className="event-main-card">

          <div className="event-details-top">
            <span className="event-category">
              {event.category}
            </span>

            <span className="event-date">
              {event.date}
            </span>
          </div>

          <h2>{event.title}</h2>

          <p className="event-description">
            {event.description}
          </p>

          <div className="event-info-grid">

            <div className="info-item">
              <span className="info-label">Date</span>
              <strong>{event.date}</strong>
            </div>

            <div className="info-item">
              <span className="info-label">Time</span>
              <strong>{event.time}</strong>
            </div>

            <div className="info-item">
              <span className="info-label">Venue</span>
              <strong>{event.venue}</strong>
            </div>

            <div className="info-item">
              <span className="info-label">Organizer</span>
              <strong>{event.organizer}</strong>
            </div>

            <div className="info-item">
              <span className="info-label">Eligibility</span>
              <strong>{event.eligibility}</strong>
            </div>

            <div className="info-item">
              <span className="info-label">Capacity</span>
              <strong>{event.capacity}</strong>
            </div>

          </div>

        </div>

        {/* Registration Card */}
        <div className="event-register-card">

          <div className="register-icon">🎟️</div>

          <h2>Interested in this event?</h2>

          <p>
            Register now to reserve your place at this campus event.
          </p>

          <Link
            to="/student/register-event"
            className="register-event-btn"
          >
            Register for Event →
          </Link>

          <Link
            to="/student/events"
            className="view-events-btn"
          >
            View All Events
          </Link>

        </div>

      </div>

    </div>
  );
}

export default EventDetails;