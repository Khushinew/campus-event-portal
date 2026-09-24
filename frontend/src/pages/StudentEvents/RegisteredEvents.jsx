import { Link } from "react-router-dom";
import "./RegisteredEvents.css";

function RegisteredEvents() {
  const registeredEvents = [
    {
      id: 1,
      title: "Tech Fest 2026",
      date: "15 October 2026",
      time: "10:00 AM - 4:00 PM",
      venue: "Main Auditorium",
      category: "Technology",
      status: "Registered",
    },
    {
      id: 2,
      title: "AI Workshop",
      date: "20 October 2026",
      time: "11:00 AM - 2:00 PM",
      venue: "Seminar Hall",
      category: "Workshop",
      status: "Registered",
    },
  ];

  return (
    <div className="registered-events-page">

      {/* Header */}
      <div className="registered-header">
        <div>
          <h1>My Registered Events</h1>
          <p>View all the events you have registered for.</p>
        </div>

        <Link to="/student-dashboard" className="back-btn">
          ← Dashboard
        </Link>
      </div>

      {/* Events */}
      <div className="registered-events-container">

        {registeredEvents.length > 0 ? (
          <div className="registered-events-grid">

            {registeredEvents.map((event) => (
              <div className="registered-event-card" key={event.id}>

                <div className="registered-card-top">
                  <span className="event-category">
                    {event.category}
                  </span>

                  <span className="event-status">
                    {event.status}
                  </span>
                </div>

                <h2>{event.title}</h2>

                <div className="event-info">
                  <p>
                    <strong>Date:</strong> {event.date}
                  </p>

                  <p>
                    <strong>Time:</strong> {event.time}
                  </p>

                  <p>
                    <strong>Venue:</strong> {event.venue}
                  </p>
                </div>

                <Link
                  to="/student/event-details"
                  className="details-btn"
                >
                  View Details →
                </Link>

              </div>
            ))}

          </div>
        ) : (
          <div className="no-events">
            <div className="no-events-icon">📅</div>
            <h2>No Registered Events</h2>
            <p>
              You have not registered for any campus events yet.
            </p>

            <Link to="/student/events" className="browse-btn">
              Browse Events
            </Link>
          </div>
        )}

      </div>

    </div>
  );
}

export default RegisteredEvents;