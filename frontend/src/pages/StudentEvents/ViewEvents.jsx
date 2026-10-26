import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getDashboardPath, getStoredUser } from "../../auth";
import { apiRequest } from "../../api";
import businessImage from "../../assets/buisness.jpg";
import debateImage from "../../assets/debate.jpg";
import dotsImage from "../../assets/dots.jpg";
import { isPastEvent } from "./eventDateUtils";
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

function getEventDomain(event) {
  return event.domainType || event.domain || event.category || "";
}

function getEventType(event) {
  return event.eventType || event.type || event.category || "";
}

function getEventDateKey(event) {
  return String(event.date || "").slice(0, 10);
}

function ViewEvents() {
  const user = getStoredUser();
  const [events, setEvents] = useState([]);
  const [registeredEventIds, setRegisteredEventIds] = useState(new Set());
  const [activeInfo, setActiveInfo] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [pastEventsOpen, setPastEventsOpen] = useState(false);
  const [pastDateFilter, setPastDateFilter] = useState("All");
  const [pastTypeFilter, setPastTypeFilter] = useState("All");
  const [pastDomainFilter, setPastDomainFilter] = useState("All");
  const [selectedPastEvent, setSelectedPastEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [registrationError, setRegistrationError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadEvents() {
      try {
        const eventsResponse = await apiRequest("/api/events");
        if (!eventsResponse.ok) throw new Error("Unable to fetch campus events.");
        const eventData = await eventsResponse.json();
        if (!Array.isArray(eventData)) throw new Error("The events response was invalid.");

        if (!cancelled) setEvents(eventData);

        if (user?.role === "student") {
          try {
            const registrationsResponse = await apiRequest("/api/student/registrations");
            if (!registrationsResponse.ok) {
              throw new Error("Unable to fetch your registered events.");
            }
            const registrationData = await registrationsResponse.json();
            if (!Array.isArray(registrationData)) {
              throw new Error("The registered events response was invalid.");
            }
            if (!cancelled) {
              setRegisteredEventIds(
                new Set(registrationData.map((event) => String(event._id || event.id)))
              );
            }
          } catch (registrationLoadError) {
            console.error("Error loading registered event status:", registrationLoadError);
            if (!cancelled) {
              setRegistrationError("Unable to load your registration status.");
            }
          }
        }
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
  }, [user?.role]);

  useEffect(() => {
    const closeOnEscape = (event) => {
      if (event.key === "Escape") {
        if (selectedPastEvent) setSelectedPastEvent(null);
        else if (pastEventsOpen) setPastEventsOpen(false);
        else setActiveInfo(null);
      }
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [activeInfo, pastEventsOpen, selectedPastEvent]);

  useEffect(() => {
    if (!pastEventsOpen) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [pastEventsOpen]);

  const upcomingEvents = useMemo(
    () => events.filter((event) => !isPastEvent(event)),
    [events]
  );
  const pastEvents = useMemo(
    () => events.filter((event) => isPastEvent(event)).sort((a, b) =>
      getEventDateKey(a).localeCompare(getEventDateKey(b))
    ),
    [events]
  );
  const categories = [...new Set(upcomingEvents.map((event) => event.category).filter(Boolean))];
  const filteredEvents = upcomingEvents.filter((event) => {
    const searchText = `${event.title || ""} ${event.category || ""} ${event.description || ""}`
      .toLowerCase();
    const matchesSearch = searchText.includes(searchQuery.trim().toLowerCase());
    const matchesCategory = categoryFilter === "All" || event.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });
  const pastDates = [...new Set(pastEvents.map(getEventDateKey).filter(Boolean))];
  const pastTypes = [...new Set(pastEvents.map(getEventType).filter(Boolean))];
  const pastDomains = [...new Set(pastEvents.map(getEventDomain).filter(Boolean))];
  const filteredPastEvents = pastEvents.filter((event) =>
    (pastDateFilter === "All" || getEventDateKey(event) === pastDateFilter) &&
    (pastTypeFilter === "All" || getEventType(event) === pastTypeFilter) &&
    (pastDomainFilter === "All" || getEventDomain(event) === pastDomainFilter)
  );
  const groupedPastEvents = filteredPastEvents.reduce((groups, event) => {
    const dateKey = getEventDateKey(event);
    const groupKey = dateKey.slice(0, 7) || "Date not specified";
    if (!groups[groupKey]) groups[groupKey] = [];
    groups[groupKey].push(event);
    return groups;
  }, {});

  return (
    <main className="view-events-page">
      <div className="events-header">
        <div>
          <p className="events-eyebrow">CAMPUS CALENDAR</p>
          <h1>Find your next big idea.</h1>
          <p>Explore campus events and register for the ones you want to attend.</p>
        </div>
        <Link to={user ? getDashboardPath(user.role) : "/login"} className="back-btn">
          {user ? "Dashboard" : "Login"}
        </Link>
      </div>
      <button
        type="button"
        className="past-events-trigger"
        onClick={() => {
          setSelectedPastEvent(null);
          setPastEventsOpen(true);
        }}
      >
        Past events
      </button>

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
      {registrationError && (
        <p className="events-empty-state" role="alert">{registrationError}</p>
      )}

      <div className="events-grid">
        {filteredEvents.map((event) => {
          const eventId = event._id || event.id;
          const image = getEventImage(event.category);
          const isInfoOpen = activeInfo === eventId;
          const isRegistered = registeredEventIds.has(String(eventId));

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
                  {isRegistered ? (
                    <button
                      type="button"
                      className="event-register-button is-registered"
                      disabled
                      aria-label={`Registered for ${event.title}`}
                    >
                      Registered
                    </button>
                  ) : (
                    <Link
                      to="/student/register-event"
                      state={{ event }}
                      className="event-register-button"
                    >
                      Register
                    </Link>
                  )}
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
          {upcomingEvents.length === 0
            ? "No upcoming events have been created yet."
            : "No events match your search."}
        </p>
      )}
      {pastEventsOpen && (
        <div
          className="past-events-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setPastEventsOpen(false);
          }}
        >
          <section
            className="past-events-window"
            role="dialog"
            aria-modal="true"
            aria-labelledby="past-events-title"
          >
            <header className="past-events-header">
              <div>
                <p className="events-eyebrow">CAMPUS ARCHIVE</p>
                <h2 id="past-events-title">Past events</h2>
              </div>
              <button
                type="button"
                className="past-events-close"
                onClick={() => setPastEventsOpen(false)}
                aria-label="Close past events"
              >
                ×
              </button>
            </header>

            <div className="past-events-filters">
              <label>
                Date
                <select value={pastDateFilter} onChange={(event) => setPastDateFilter(event.target.value)}>
                  <option value="All">All dates</option>
                  {pastDates.map((date) => (
                    <option key={date} value={date}>{formatEventDate(date)}</option>
                  ))}
                </select>
              </label>
              <label>
                Event type
                <select value={pastTypeFilter} onChange={(event) => setPastTypeFilter(event.target.value)}>
                  <option value="All">All event types</option>
                  {pastTypes.map((type) => <option key={type} value={type}>{type}</option>)}
                </select>
              </label>
              <label>
                Domain type
                <select value={pastDomainFilter} onChange={(event) => setPastDomainFilter(event.target.value)}>
                  <option value="All">All domain types</option>
                  {pastDomains.map((domain) => <option key={domain} value={domain}>{domain}</option>)}
                </select>
              </label>
            </div>

            {loading ? (
              <p className="past-events-empty">Loading past events...</p>
            ) : error ? (
              <p className="past-events-empty" role="alert">{error}</p>
            ) : pastEvents.length === 0 ? (
              <p className="past-events-empty">There are no past events yet.</p>
            ) : filteredPastEvents.length === 0 ? (
              <p className="past-events-empty">No past events match these filters.</p>
            ) : (
              <div className="past-events-content">
                <div className="past-events-list">
                  {Object.entries(groupedPastEvents).map(([monthKey, monthEvents]) => (
                    <section className="past-events-month" key={monthKey}>
                      <h3>
                        {monthKey === "Date not specified"
                          ? monthKey
                          : new Date(`${monthKey}-01T00:00:00`).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                            })}
                      </h3>
                      {monthEvents.map((pastEvent) => {
                        const eventId = pastEvent._id || pastEvent.id;
                        return (
                          <article className="past-event-row" key={eventId}>
                            <img
                              src={getEventImage(pastEvent.category)}
                              alt=""
                              className="past-event-thumbnail"
                            />
                            <div className="past-event-summary">
                              <time dateTime={getEventDateKey(pastEvent)}>
                                {formatEventDate(pastEvent.date)}
                              </time>
                              <h4>{pastEvent.title}</h4>
                            </div>
                            <button
                              type="button"
                              className="past-event-info-button"
                              onClick={() => setSelectedPastEvent(pastEvent)}
                            >
                              Info
                            </button>
                          </article>
                        );
                      })}
                    </section>
                  ))}
                </div>
                {selectedPastEvent && (
                  <aside className="past-event-details" aria-live="polite">
                    <button
                      type="button"
                      className="past-event-details-close"
                      onClick={() => setSelectedPastEvent(null)}
                      aria-label="Close event information"
                    >
                      ×
                    </button>
                    <img
                      src={getEventImage(selectedPastEvent.category)}
                      alt=""
                      className="past-event-details-image"
                    />
                    <p className="events-eyebrow">EVENT DETAILS</p>
                    <h3>{selectedPastEvent.title}</h3>
                    <dl className="event-info-list">
                      <div><dt>Date</dt><dd>{formatEventDate(selectedPastEvent.date)}</dd></div>
                      <div><dt>Time</dt><dd>{selectedPastEvent.time || "Not specified"}</dd></div>
                      <div><dt>Venue</dt><dd>{selectedPastEvent.venue || "Not specified"}</dd></div>
                      <div><dt>Event type</dt><dd>{getEventType(selectedPastEvent) || "Not specified"}</dd></div>
                      <div><dt>Domain type</dt><dd>{getEventDomain(selectedPastEvent) || "Not specified"}</dd></div>
                      <div><dt>Organizer</dt><dd>{selectedPastEvent.organizerName || "Campus faculty"}</dd></div>
                    </dl>
                    <p className="past-event-description">
                      {selectedPastEvent.description || "No event description is available."}
                    </p>
                  </aside>
                )}
              </div>
            )}
          </section>
        </div>
      )}
      <Footer />
    </main>
  );
}

export default ViewEvents;
