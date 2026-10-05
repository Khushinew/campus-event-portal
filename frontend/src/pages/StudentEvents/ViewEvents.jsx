import { useState } from "react";
import { Link } from "react-router-dom";
import "./ViewEvents.css";

function ViewEvents() {
  const events = [
    {
      id: 1,
      title: "AI Workshop",
      date: "15 October 2026",
      time: "10:00 AM - 1:00 PM",
      venue: "Innovation Lab",
      category: "Technology",
      description:
        "Explore practical AI tools, prompt design, and responsible ways to use machine learning.",
    },
    {
      id: 2,
      title: "Excel Workshop",
      date: "20 October 2026",
      time: "11:00 AM - 2:00 PM",
      venue: "Computer Lab 2",
      category: "Workshop",
      description:
        "Build confidence with formulas, pivot tables, and clear data visualizations in Excel.",
    },
    {
      id: 3,
      title: "Business Workshop",
      date: "25 October 2026",
      time: "9:30 AM - 12:30 PM",
      venue: "Seminar Hall",
      category: "Business",
      description:
        "Turn an early idea into a business plan with guidance on customers, costs, and pitching.",
    },
  ];
  const [expandedEvent, setExpandedEvent] = useState(null);

  return (
    <div className="view-events-page">

      {/* Header */}
      <div className="events-header">
        <div>
          <h1>Explore Campus Events</h1>
          <p>Find a workshop that sparks your next idea.</p>
        </div>

        <Link to="/" className="back-btn">
          Home
        </Link>
      </div>

      {/* Search and Filter */}
      <div className="events-toolbar">
        <input
          type="text"
          placeholder="Search events..."
          className="event-search"
        />

        <select className="event-filter">
          <option value="">All Categories</option>
          <option value="Technology">Technology</option>
          <option value="Workshop">Workshop</option>
          <option value="Competition">Competition</option>
        </select>
      </div>

      {/* Events */}
      <div className="events-grid">
        {events.map((event) => (
          <div className="view-event-card" key={event.id}>

            <div className="event-card-top">
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

            <div className="event-info">
              <p>🕐 {event.time}</p>
              <p>📍 {event.venue}</p>
            </div>

            {expandedEvent === event.id && (
              <div className="event-expanded-info">
                <p><strong>Date:</strong> {event.date}</p>
                <p><strong>Time:</strong> {event.time}</p>
                <p><strong>Location:</strong> {event.venue}</p>
              </div>
            )}

            <div className="event-actions">
              <Link to="/login" className="details-btn">
                Register
              </Link>
              <button
                type="button"
                className="info-event-button"
                aria-expanded={expandedEvent === event.id}
                onClick={() => setExpandedEvent(expandedEvent === event.id ? null : event.id)}
              >
                {expandedEvent === event.id ? "Hide info" : "Info"}
              </button>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}

export default ViewEvents;