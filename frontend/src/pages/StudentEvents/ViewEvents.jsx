import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getDashboardPath, getStoredUser } from "../../auth";
import { apiRequest } from "../../api";
import businessImage from "../../assets/buisness.jpg";
import debateImage from "../../assets/debate.jpg";
import dotsImage from "../../assets/dots.jpg";
import "./ViewEvents.css";
import Footer from "../../components/Footer";

function formatEventDate(value) {
  if (!value) return "Date not specified";
  const parsedDate = new Date(`${String(value).slice(0, 10)}T00:00:00`);
  return Number.isNaN(parsedDate.getTime())
    ? value
    : parsedDate.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
}

function getEventImage(category = "") {
  const normalizedCategory = category.toLowerCase();
  if (normalizedCategory.includes("business")) return businessImage;
  if (normalizedCategory.includes("debate")) return debateImage;
  return dotsImage;
}

function ViewEvents() {
  const user = getStoredUser();
  const [events, setEvents] = useState([]);
  const [activeInfo, setActiveInfo] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadEvents() {
      try {
        const response = await apiRequest("/api/events");
        if (!response.ok) throw new Error("Unable to fetch campus events.");
        const data = await response.json();
        if (!Array.isArray(data)) throw new Error("The events response was invalid.");
        if (!cancelled) setEvents(data);
      } catch (loadError) {
        console.error("Error loading campus events:", loadError);
        if (!cancelled) setError("Unable to load events. Please try again.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadEvents();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!activeInfo) return undefined;

    const closeOnEscape = (event) => {
      if (event.key === "Escape") setActiveInfo(null);
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [activeInfo]);

  const categories = [...new Set(events.map((event) => event.category).filter(Boolean))];
  const filteredEvents = events.filter((event) => {
    const searchText = `${event.title || ""} ${event.category || ""} ${event.description || ""}`
      .toLowerCase();
    const matchesSearch = searchText.includes(searchQuery.trim().toLowerCase());
    const matchesCategory = categoryFilter === "All" || event.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <main className="view-events-page">
      <div className="events-header">
        <div>
          <p className="events-eyebrow">CAMPUS CALENDAR</p>
          <h1>Find your next big idea.</h1>
          <p>Explore campus events and register for the ones you want to attend.</p>
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
          {categories.map((category) => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
      </div>

      {loading && <p className="events-empty-state">Loading events...</p>}
      {error && <p className="events-empty-state" role="alert">{error}</p>}

      <div className="events-grid">
        {filteredEvents.map((event) => {
          const eventId = event._id || event.id;
          const image = getEventImage(event.category);
          const isInfoOpen = activeInfo === eventId;

          return (
            <article
              className="view-event-card"
              key={eventId}
              style={{ "--event-image-ratio": "16 / 10" }}
            >
              <div className="event-image-wrap">
                <img
                  src={image}
                  alt={`${event.category || "Campus"} event`}
                  className="event-image"
                />
                <span className="event-category">{event.category || "Campus event"}</span>
              </div>
              <div className="event-card-content">
                <p className="event-date">{formatEventDate(event.date)}</p>
                <h2>{event.title}</h2>
                <p className="event-description">{event.description || "Campus event"}</p>
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
                    aria-expanded={isInfoOpen}
                    aria-controls={`event-info-${eventId}`}
                    onClick={() => setActiveInfo(isInfoOpen ? null : eventId)}
                  >
                    Info
                  </button>
                </div>
              </div>
              {isInfoOpen && (
                <section
                  className="event-info-popover"
                  id={`event-info-${eventId}`}
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
                    <div><dt>Date &amp; time</dt><dd>{formatEventDate(event.date)}<br />{event.time}</dd></div>
                    <div><dt>Venue</dt><dd>{event.venue || "Not specified"}</dd></div>
                    <div><dt>Organizer</dt><dd>{event.organizerName || "Campus faculty"}</dd></div>
                    <div><dt>Total capacity</dt><dd>{event.capacity ?? "Not specified"}</dd></div>
                    <div><dt>Available seats</dt><dd>{Math.max(0, Number(event.capacity || 0) - (event.registrations?.length || 0))}</dd></div>
                  </dl>
                </section>
              )}
            </article>
          );
        })}
      </div>

      {!loading && !error && filteredEvents.length === 0 && (
        <p className="events-empty-state">
          {events.length === 0 ? "No events have been created yet." : "No events match your search."}
        </p>
      )}
      <Footer />
    </main>
  );
}

export default ViewEvents;
