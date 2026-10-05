import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getDashboardPath, getStoredUser } from "../../auth";
import businessImage from "../../assets/buisness.jpg";
import debateImage from "../../assets/debate.jpg";
import dotsImage from "../../assets/dots.jpg";
import "./ViewEvents.css";

function ViewEvents() {
  const user = getStoredUser();
  const events = [
    {
      id: "business",
      title: "Business Analytics Workshop",
      date: "18 October 2026",
      time: "10:00 AM - 12:30 PM",
      venue: "School of Business, Room 204",
      guest: "Business faculty guest speaker",
      capacity: 80,
      charge: "Free",
      attendanceRegistration: true,
      category: "Business",
      image: businessImage,
      imageAlt: "Business charts being reviewed during a workshop",
      imageRatio: "4 / 3",
      description:
        "Learn to read business data, make confident decisions, and turn numbers into a clear story.",
    },
    {
      id: "debate",
      title: "Debate: Prepare to Raise Your Voice",
      date: "22 October 2026",
      time: "2:00 PM - 4:00 PM",
      venue: "University Assembly Hall",
      guest: "Debate society coach",
      capacity: 120,
      charge: "Free",
      attendanceRegistration: true,
      category: "Debate",
      image: debateImage,
      imageAlt: "Students gathered in a large debate assembly hall",
      imageRatio: "16 / 10",
      description:
        "Shape a strong argument, listen with purpose, and speak up for the ideas you believe in.",
    },
    {
      id: "dots",
      title: "Dots: Build Your Own AI Agent",
      date: "29 October 2026",
      time: "11:00 AM - 1:30 PM",
      venue: "Innovation Lab",
      guest: "Campus AI workshop facilitator",
      capacity: 40,
      charge: "Free",
      attendanceRegistration: true,
      category: "AI & Technology",
      image: dotsImage,
      imageAlt: "Colorful Dots characters beneath the OpenAI wordmark",
      imageRatio: "1 / 1",
      description:
        "Discover how to create a personal AI agent, shape its instructions, and put it to work on your ideas.",
    },
  ];
  const [activeInfo, setActiveInfo] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  useEffect(() => {
    if (!activeInfo) return undefined;

    const closeOnEscape = (event) => {
      if (event.key === "Escape") setActiveInfo(null);
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [activeInfo]);

  const filteredEvents = events.filter((event) => {
    const matchesSearch = `${event.title} ${event.category} ${event.description}`
      .toLowerCase()
      .includes(searchQuery.trim().toLowerCase());
    const matchesCategory = categoryFilter === "All" || event.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  return (
    <main className="view-events-page">
      <div className="events-header">
        <div>
          <p className="events-eyebrow">CAMPUS CALENDAR / AUTUMN 2026</p>
          <h1>Find your next big idea.</h1>
          <p>Workshops, conversations, and new perspectives, all on campus.</p>
        </div>

        <Link to={user ? getDashboardPath(user.role) : "/"} className="back-btn">
          {user ? "Dashboard" : "Home"}
        </Link>
      </div>

      <div className="events-toolbar">
        <input
          type="text"
          placeholder="Search events..."
          className="event-search"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          aria-label="Search campus events"
        />

        <select
          className="event-filter"
          value={categoryFilter}
          onChange={(event) => setCategoryFilter(event.target.value)}
          aria-label="Filter events by category"
        >
          <option value="All">All categories</option>
          <option value="Business">Business</option>
          <option value="Debate">Debate</option>
          <option value="AI & Technology">AI &amp; Technology</option>
        </select>
      </div>

      <div className="events-grid">
        {filteredEvents.map((event) => (
          <article
            className="view-event-card"
            key={event.id}
            style={{ "--event-image-ratio": event.imageRatio }}
          >
            <div className="event-image-wrap">
              <img src={event.image} alt={event.imageAlt} className="event-image" />
              <span className="event-category">{event.category}</span>
            </div>

            <div className="event-card-content">
              <p className="event-date">{event.date}</p>
              <h2>{event.title}</h2>
              <p className="event-description">{event.description}</p>
              <div className="event-actions">
                <Link
                  to="/student/register-event"
                  state={{ event }}
                  className="event-register-button"
                >
                  Register
                </Link>
                <button
                  type="button"
                  className="info-event-button"
                  aria-expanded={activeInfo === event.id}
                  aria-controls={`event-info-${event.id}`}
                  onClick={() => setActiveInfo(activeInfo === event.id ? null : event.id)}
                >
                  Info
                </button>
              </div>
            </div>

            {activeInfo === event.id && (
              <section
                className="event-info-popover"
                id={`event-info-${event.id}`}
                role="dialog"
                aria-label={`${event.title} information`}
              >
                <button
                  type="button"
                  className="event-info-close"
                  onClick={() => setActiveInfo(null)}
                  aria-label="Close event information"
                >
                  ×
                </button>
                <p className="event-info-kicker">EVENT DETAILS</p>
                <h3>{event.title}</h3>
                <dl className="event-info-list">
                  <div><dt>Date &amp; time</dt><dd>{event.date}<br />{event.time}</dd></div>
                  <div><dt>Venue</dt><dd>{event.venue}</dd></div>
                  <div><dt>Guest</dt><dd>{event.guest}</dd></div>
                  <div><dt>Total capacity</dt><dd>{event.capacity} people</dd></div>
                  <div><dt>Charge</dt><dd>{event.charge || "Free"}</dd></div>
                  <div><dt>Attendance registration</dt><dd>{event.attendanceRegistration ? "Yes" : "No"}</dd></div>
                </dl>
              </section>
            )}
          </article>
        ))}
      </div>

      {filteredEvents.length === 0 && (
        <p className="events-empty-state">No events match your search.</p>
      )}
    </main>
  );
}

export default ViewEvents;