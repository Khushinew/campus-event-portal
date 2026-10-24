
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getDashboardPath, getStoredUser } from "../../auth";
import dotsImage from "../../assets/dots.jpg";
import "./ViewEvents.css";
import Footer from "../../components/Footer";

function ViewEvents() {
  const user = getStoredUser();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
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

  useEffect(() => {
    fetch("http://localhost:5000/api/events")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to load events");
        }

        return response.json();
      })
      .then((data) => {
        setEvents(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error("Error loading events:", err);
        setError("Unable to load events. Please try again.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const filteredEvents = events.filter((event) => {
    const matchesSearch = `${event.title || ""} ${
      event.category || ""
    } ${event.description || ""}`
      .toLowerCase()
      .includes(searchQuery.trim().toLowerCase());

    const matchesCategory =
      categoryFilter === "All" || event.category === categoryFilter;

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

        <Link
          to={user ? getDashboardPath(user.role) : "/"}
          className="back-btn"
        >
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

      {!loading && !error && (
        <div className="events-grid">
          {filteredEvents.map((event) => (
            <article className="view-event-card" key={event._id}>
              <div className="event-image-wrap">
                <img
                  src={
                    event.imageUrl
                      ? `http://localhost:5000${event.imageUrl}`
                      : dotsImage
                  }
                  alt={event.title || "Campus event"}
                  className="event-image"
                />
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
                    aria-expanded={activeInfo === event._id}
                    aria-controls={`event-info-${event._id}`}
                    onClick={() =>
                      setActiveInfo(
                        activeInfo === event._id ? null : event._id
                      )
                    }
                  >
                    Info
                  </button>
                </div>
              </div>

              {activeInfo === event._id && (
                <section
                  className="event-info-popover"
                  id={`event-info-${event._id}`}
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
                    <div>
                      <dt>Date &amp; time</dt>
                      <dd>
                        {event.date || "Not specified"}
                        <br />
                        {event.time || "Not specified"}
                      </dd>
                    </div>

                    <div>
                      <dt>Venue</dt>
                      <dd>{event.venue || "Not specified"}</dd>
                    </div>

                    <div>
                      <dt>Organizer</dt>
                      <dd>{event.createdBy || "Faculty organizer"}</dd>
                    </div>

                    <div>
                      <dt>Total capacity</dt>
                      <dd>
                        {event.capacity ?? "Not specified"}
                        {event.capacity != null ? " people" : ""}
                      </dd>
                    </div>

                    <div>
                      <dt>Charge</dt>
                      <dd>{event.charge || "Free"}</dd>
                    </div>

                    <div>
                      <dt>Attendance registration</dt>
                      <dd>
                        {event.attendanceRegistration ? "Yes" : "No"}
                      </dd>
                    </div>
                  </dl>
                </section>
              )}
            </article>
          ))}
        </div>
      )}

      {loading && (
        <p className="events-empty-state">Loading events...</p>
      )}

      {!loading && error && (
        <p className="events-empty-state">{error}</p>
      )}

      {!loading && !error && filteredEvents.length === 0 && (
        <p className="events-empty-state">
          No events match your search.
        </p>
      )}

      <Footer />
    </main>
  );
}

export default ViewEvents;
