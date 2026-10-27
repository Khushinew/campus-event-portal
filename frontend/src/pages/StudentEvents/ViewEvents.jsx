import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getDashboardPath, getStoredUser, getSessionToken } from "../../auth";
import {
  formatEventDate,
  getEventDate,
  getRemainingSeats,
  isPastEvent,
} from "../../eventUtils";
import dotsImage from "../../assets/dots.jpg";
import "./ViewEvents.css";
import Footer from "../../components/Footer";

function ViewEvents({ showPastEvents = false, facultyBrowse = false }) {
  const user = getStoredUser();
  const token = getSessionToken();
  const [events, setEvents] = useState([]);
  const [registeredEventIds, setRegisteredEventIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeInfo, setActiveInfo] = useState(null);
  const [pastEventsOpen, setPastEventsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [domainFilter, setDomainFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("");

  useEffect(() => {
    if (!activeInfo && !pastEventsOpen) return undefined;

    const closeOnEscape = (event) => {
      if (event.key === "Escape") {
        setActiveInfo(null);
        setPastEventsOpen(false);
      }
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [activeInfo, pastEventsOpen]);

  useEffect(() => {
    let cancelled = false;

    async function loadEvents() {
      setLoading(true);
      setError("");

      try {
        const response = await fetch("http://localhost:5000/api/events");
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to load events.");
        }

        if (!Array.isArray(data)) {
          throw new Error("The server returned an unexpected events response.");
        }

        let registeredIds = new Set();
        if (user?.role === "student" && token) {
          const registrationResponse = await fetch(
            "http://localhost:5000/api/student/registrations",
            { headers: { Authorization: `Bearer ${token}` } }
          );
          const registrationData = await registrationResponse.json();

          if (!registrationResponse.ok) {
            throw new Error(
              registrationData.message || "Failed to load your registrations."
            );
          }

          registeredIds = new Set(
            (Array.isArray(registrationData) ? registrationData : [])
              .map((event) => String(event._id || event.id || ""))
              .filter(Boolean)
          );
        }

        if (!cancelled) {
          const visibleEvents =
            facultyBrowse && user?.role === "faculty"
              ? data.filter(
                  (event) => String(event.facultyId) !== String(user.id)
                )
              : data;

          setEvents(visibleEvents);
          setRegisteredEventIds(registeredIds);
        }
      } catch (err) {
        console.error("Error loading events:", err);
        if (!cancelled) {
          setError(err.message || "Unable to load events. Please try again.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadEvents();
    return () => {
      cancelled = true;
    };
  }, [facultyBrowse, user?.id, user?.role, token]);

  const categories = useMemo(
    () => [...new Set(events.map((event) => event.category).filter(Boolean))],
    [events]
  );
  const domains = useMemo(
    () => [...new Set(events.map((event) => event.domain).filter(Boolean))],
    [events]
  );

  function matchesFilters(event) {
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !query ||
      `${event.title || ""} ${event.category || ""} ${
        event.domain || ""
      } ${event.description || ""}`
        .toLowerCase()
        .includes(query);
    const matchesCategory =
      categoryFilter === "All" || event.category === categoryFilter;
    const matchesDomain = domainFilter === "All" || event.domain === domainFilter;
    const eventDate = getEventDate(event.date);
    const matchesDate =
      !dateFilter ||
      (eventDate &&
        eventDate.getTime() === getEventDate(dateFilter)?.getTime());

    return matchesSearch && matchesCategory && matchesDomain && matchesDate;
  }

  const upcomingEvents = events.filter(
    (event) => !isPastEvent(event) && matchesFilters(event)
  );
  const pastEvents = events
    .filter((event) => isPastEvent(event) && matchesFilters(event))
    .sort((a, b) => getEventDate(a.date) - getEventDate(b.date));
  const groupedPastEvents = pastEvents.reduce((groups, event) => {
    const date = getEventDate(event.date);
    const month = date
      ? date.toLocaleDateString(undefined, { month: "long", year: "numeric" })
      : "Date not specified";
    groups[month] = groups[month] || [];
    groups[month].push(event);
    return groups;
  }, {});

  const dashboardTarget = user
    ? getDashboardPath(user.role)
    : "/login";

  return (
    <main className="view-events-page">
      <div className="events-header">
        <div>
          <p className="events-eyebrow">CAMPUS CALENDAR / EXPLORE</p>
          <h1>Find your next big idea.</h1>
          <p>Workshops, conversations, and new perspectives, all on campus.</p>
        </div>

        <div className="events-header-actions">
          {showPastEvents && (
            <button
              type="button"
              className="past-events-button"
              onClick={() => setPastEventsOpen(true)}
            >
              Past Events
            </button>
          )}
          <Link to={dashboardTarget} className="back-btn">
            {user ? "Dashboard" : "Login"}
          </Link>
        </div>
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

        <input
          type="date"
          className="event-filter"
          value={dateFilter}
          onChange={(event) => setDateFilter(event.target.value)}
          aria-label="Filter events by date"
        />

        <select
          className="event-filter"
          value={categoryFilter}
          onChange={(event) => setCategoryFilter(event.target.value)}
          aria-label="Filter events by event type"
        >
          <option value="All">All event types</option>
          {categories.map((category) => (
            <option value={category} key={category}>
              {category}
            </option>
          ))}
        </select>

        <select
          className="event-filter"
          value={domainFilter}
          onChange={(event) => setDomainFilter(event.target.value)}
          aria-label="Filter events by domain type"
        >
          <option value="All">All domains</option>
          {domains.map((domain) => (
            <option value={domain} key={domain}>
              {domain}
            </option>
          ))}
        </select>
      </div>

      {!loading && !error && (
        <div className="events-grid">
          {upcomingEvents.map((event) => {
            const full = getRemainingSeats(event) === 0;
            const registered = registeredEventIds.has(String(event._id));
            const eventInfoUrl = event.imageUrl
              ? `http://localhost:5000${event.imageUrl}`
              : dotsImage;

            return (
              <article className="view-event-card" key={event._id}>
                <div className="event-image-wrap">
                  <img
                    src={eventInfoUrl}
                    alt={event.title || "Campus event"}
                    className="event-image"
                  />
                  <span className="event-category">{event.category}</span>
                  {full && <span className="capacity-ribbon">FULLY CAPACITY</span>}
                </div>

                <div className="event-card-content">
                  <p className="event-date">{formatEventDate(event.date)}</p>
                  <h2>{event.title}</h2>
                  <p className="event-description">{event.description}</p>
                  <p className={`seats-remaining${full ? " seats-full" : ""}`}>
                    {full
                      ? "No seats remaining"
                      : `${getRemainingSeats(event)} seats remaining`}
                  </p>

                  <div className="event-actions">
                    {facultyBrowse && user?.role === "faculty" ? null : registered ? (
                      <button
                        type="button"
                        className="event-register-button registered-button"
                        disabled
                      >
                        Registered
                      </button>
                    ) : (
                      <Link
                        to={
                          user?.role === "student"
                            ? "/student/register-event"
                            : "/login"
                        }
                        state={{ event }}
                        className="event-register-button"
                      >
                        Register
                      </Link>
                    )}

                    <button
                      type="button"
                      className="info-event-button"
                      onClick={() => setActiveInfo(event)}
                    >
                      Info
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {loading && <p className="events-empty-state">Loading events...</p>}
      {!loading && error && (
        <p className="events-empty-state" role="alert">{error}</p>
      )}
      {!loading && !error && upcomingEvents.length === 0 && (
        <p className="events-empty-state">No upcoming events match your filters.</p>
      )}

      {pastEventsOpen && (
        <div
          className="events-modal-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setPastEventsOpen(false);
          }}
        >
          <section
            className="past-events-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="past-events-title"
          >
            <header className="modal-heading">
              <div>
                <p className="events-eyebrow">CAMPUS ARCHIVE</p>
                <h2 id="past-events-title">Past Events</h2>
              </div>
              <button
                type="button"
                className="modal-close-button"
                onClick={() => setPastEventsOpen(false)}
                aria-label="Close past events"
              >
                ×
              </button>
            </header>

            <div className="past-events-filters">
              <input
                type="date"
                className="event-filter"
                value={dateFilter}
                onChange={(event) => setDateFilter(event.target.value)}
                aria-label="Filter past events by date"
              />
              <select
                className="event-filter"
                value={categoryFilter}
                onChange={(event) => setCategoryFilter(event.target.value)}
                aria-label="Filter past events by event type"
              >
                <option value="All">All event types</option>
                {categories.map((category) => (
                  <option value={category} key={category}>{category}</option>
                ))}
              </select>
              <select
                className="event-filter"
                value={domainFilter}
                onChange={(event) => setDomainFilter(event.target.value)}
                aria-label="Filter past events by domain type"
              >
                <option value="All">All domains</option>
                {domains.map((domain) => (
                  <option value={domain} key={domain}>{domain}</option>
                ))}
              </select>
            </div>

            {Object.entries(groupedPastEvents).length ? (
              Object.entries(groupedPastEvents).map(([month, monthEvents]) => (
                <section className="past-event-month" key={month}>
                  <h3>{month}</h3>
                  <div className="past-events-grid">
                    {monthEvents.map((event) => (
                      <article className="past-event-card" key={event._id}>
                        <img
                          src={
                            event.imageUrl
                              ? `http://localhost:5000${event.imageUrl}`
                              : dotsImage
                          }
                          alt=""
                        />
                        <div>
                          <p>{formatEventDate(event.date)}</p>
                          <h4>{event.title}</h4>
                          <button
                            type="button"
                            className="info-event-button"
                            onClick={() => setActiveInfo(event)}
                          >
                            Info
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              ))
            ) : (
              <p className="events-empty-state">No past events match your filters.</p>
            )}
          </section>
        </div>
      )}

      {activeInfo && (
        <div
          className="events-modal-backdrop event-info-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setActiveInfo(null);
          }}
        >
          <section
            className="event-info-modal"
            role="dialog"
            aria-modal="true"
            aria-label={`${activeInfo.title} information`}
          >
            <button
              type="button"
              className="modal-close-button"
              onClick={() => setActiveInfo(null)}
              aria-label="Close event information"
            >
              ×
            </button>
            <p className="event-info-kicker">EVENT DETAILS</p>
            <h2>{activeInfo.title}</h2>
            <p>{activeInfo.description || "No description provided."}</p>
            <dl className="event-info-list">
              <div><dt>Date &amp; time</dt><dd>{formatEventDate(activeInfo.date)} · {activeInfo.time || "Not specified"}</dd></div>
              <div><dt>Venue</dt><dd>{activeInfo.venue || "Not specified"}</dd></div>
              <div><dt>Event type</dt><dd>{activeInfo.category || "Not specified"}</dd></div>
              <div><dt>Domain</dt><dd>{activeInfo.domain || "Not specified"}</dd></div>
              <div><dt>Seats remaining</dt><dd>{getRemainingSeats(activeInfo) ?? "Not specified"}</dd></div>
              <div><dt>Organizer</dt><dd>{activeInfo.createdBy || "Faculty organizer"}</dd></div>
            </dl>
          </section>
        </div>
      )}

      <Footer />
    </main>
  );
}

export default ViewEvents;
