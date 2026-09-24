import { Link } from "react-router-dom";
import "./ViewEvents.css";

function ViewEvents() {
  const events = [
    {
      id: 1,
      title: "Tech Fest 2026",
      date: "15 October 2026",
      time: "10:00 AM - 4:00 PM",
      venue: "Main Auditorium",
      category: "Technology",
      description:
        "A campus technology event featuring workshops, competitions and technical sessions.",
    },
    {
      id: 2,
      title: "AI Workshop",
      date: "20 October 2026",
      time: "11:00 AM - 2:00 PM",
      venue: "Seminar Hall",
      category: "Workshop",
      description:
        "Learn the fundamentals of artificial intelligence through an interactive workshop.",
    },
    {
      id: 3,
      title: "Inter-College Hackathon",
      date: "25 October 2026",
      time: "9:00 AM - 6:00 PM",
      venue: "Computer Lab",
      category: "Competition",
      description:
        "A coding competition where students work together to build innovative solutions.",
    },
  ];

  return (
    <div className="view-events-page">

      {/* Header */}
      <div className="events-header">
        <div>
          <h1>Upcoming Events</h1>
          <p>Discover events happening across the campus.</p>
        </div>

        <Link to="/student-dashboard" className="back-btn">
          ← Dashboard
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

            <Link
              to="/student/event-details"
              className="details-btn"
            >
              View Details →
            </Link>

          </div>
        ))}
      </div>

    </div>
  );
}

export default ViewEvents;