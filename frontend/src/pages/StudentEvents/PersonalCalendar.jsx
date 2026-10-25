
import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import "./PersonalCalendar.css";
import Footer from "../../components/Footer";

const API_URL = "http://localhost:5000/api/events";

function normalizeDate(value) {
  if (!value) return "";

  // Handles both YYYY-MM-DD and ISO datetime strings.
  const match = String(value).match(/^(\d{4})-(\d{2})-(\d{2})/);

  if (!match) return "";

  const [, year, month, day] = match;
  const parsed = new Date(
    Number(year),
    Number(month) - 1,
    Number(day)
  );

  if (
    parsed.getFullYear() !== Number(year) ||
    parsed.getMonth() !== Number(month) - 1 ||
    parsed.getDate() !== Number(day)
  ) {
    return "";
  }

  return `${year}-${month}-${day}`;
}

function formatDate(dateString) {
  const normalized = normalizeDate(dateString);
  if (!normalized) return "Date unavailable";

  const [year, month, day] = normalized.split("-").map(Number);

  return new Date(year, month - 1, day).toLocaleDateString(
    "en-US",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    }
  );
}

function PersonalCalendar() {
  const [personalEvents, setPersonalEvents] = useState([]);
  const [campusEvents, setCampusEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [currentDate, setCurrentDate] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });

  // Fetch real campus events from the backend.
  useEffect(() => {
    const controller = new AbortController();

    async function fetchCampusEvents() {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(API_URL, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(
            `Unable to load campus events (${response.status}).`
          );
        }

        const result = await response.json();

        // Supports either an array or { events: [...] } response.
        const events = Array.isArray(result)
          ? result
          : Array.isArray(result.events)
          ? result.events
          : Array.isArray(result.data)
          ? result.data
          : null;

        if (!events) {
          throw new Error(
            "The campus events API returned an unexpected response."
          );
        }

        const formattedEvents = events
          .map((event) => ({
            id: event._id || event.id,
            title: event.title || "Untitled event",
            date: normalizeDate(event.date),
            time: event.time || "Time not specified",
            location: event.venue || event.location || "",
            description: event.description || "",
            category: event.category || "Campus Event",
            type: "Campus Event",
          }))
          .filter((event) => event.date);

        setCampusEvents(formattedEvents);
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Campus events fetch error:", err);
          setError(
            err.message ||
              "Could not load campus events. Please try again."
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchCampusEvents();

    return () => controller.abort();
  }, []);

  // Load personal events created by AddPersonalEvent.jsx.
  useEffect(() => {
    const loadPersonalEvents = () => {
      try {
        const saved = JSON.parse(
          localStorage.getItem("campusPersonalEvents") || "[]"
        );

        setPersonalEvents(
          Array.isArray(saved)
            ? saved
                .filter((event) => event && normalizeDate(event.date))
                .map((event) => ({
                  ...event,
                  date: normalizeDate(event.date),
                  type: "Personal Event",
                }))
            : []
        );
      } catch (err) {
        console.error("Could not load personal events:", err);
        setPersonalEvents([]);
      }
    };

    loadPersonalEvents();

    // Update if another browser tab changes local storage.
    window.addEventListener("storage", loadPersonalEvents);

    return () => {
      window.removeEventListener("storage", loadPersonalEvents);
    };
  }, []);

  const allEvents = useMemo(
    () => [...campusEvents, ...personalEvents],
    [campusEvents, personalEvents]
  );

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthTitle = currentDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const today = new Date();
  const todayString = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0"),
  ].join("-");

  const goToPreviousMonth = () => {
    setCurrentDate(
      (previous) =>
        new Date(
          previous.getFullYear(),
          previous.getMonth() - 1,
          1
        )
    );
  };

  const goToNextMonth = () => {
    setCurrentDate(
      (previous) =>
        new Date(
          previous.getFullYear(),
          previous.getMonth() + 1,
          1
        )
    );
  };

  const goToToday = () => {
    const now = new Date();
    setCurrentDate(
      new Date(now.getFullYear(), now.getMonth(), 1)
    );
  };

  const getEventsForDay = (day) => {
    const date = new Date(year, month, day);
    const dateString = [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, "0"),
      String(date.getDate()).padStart(2, "0"),
    ].join("-");

    return allEvents.filter((event) => event.date === dateString);
  };

  const upcomingEvents = useMemo(
    () =>
      [...allEvents].sort((a, b) => {
        const dateComparison = a.date.localeCompare(b.date);

        return dateComparison !== 0
          ? dateComparison
          : (a.time || "").localeCompare(b.time || "");
      }),
    [allEvents]
  );

  return (
    <div className="personal-calendar-page">
      {/* HEADER */}
      <div className="calendar-header">
        <div>
          <h1>Personal Calendar</h1>
          <p>
            Keep track of your registered events and personal schedule.
          </p>
        </div>

        <div className="calendar-actions">
          <Link
            to="/student/add-event"
            className="add-event-btn"
          >
            + Add Personal Event
          </Link>

          <Link
            to="/student-dashboard"
            className="back-btn"
          >
            ← Dashboard
          </Link>
        </div>
      </div>

      {/* CALENDAR */}
      <div className="calendar-container">
        <div className="calendar-top">
          <button
            type="button"
            className="calendar-nav"
            onClick={goToPreviousMonth}
            aria-label="Previous month"
            title="Previous month"
          >
            ←
          </button>

          <div className="calendar-month-title">
            <h2>{monthTitle}</h2>
            <button
              type="button"
              className="calendar-today-btn"
              onClick={goToToday}
            >
              Today
            </button>
          </div>

          <button
            type="button"
            className="calendar-nav"
            onClick={goToNextMonth}
            aria-label="Next month"
            title="Next month"
          >
            →
          </button>
        </div>

        {loading && (
          <p className="calendar-status">
            Loading campus events...
          </p>
        )}

        {error && (
          <div className="calendar-error">
            <p>{error}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
            >
              Retry
            </button>
          </div>
        )}

        <div className="calendar-weekdays">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
            (day) => (
              <div key={day}>{day}</div>
            )
          )}
        </div>

        <div className="calendar-grid">
          {Array.from({ length: firstDay }, (_, index) => (
            <div
              className="calendar-day empty"
              key={`empty-${year}-${month}-${index}`}
            />
          ))}

          {Array.from({ length: daysInMonth }, (_, index) => {
            const day = index + 1;
            const dateString = [
              year,
              String(month + 1).padStart(2, "0"),
              String(day).padStart(2, "0"),
            ].join("-");

            const dayEvents = getEventsForDay(day);

            return (
              <div
                key={dateString}
                className={[
                  "calendar-day",
                  dayEvents.length ? "has-event" : "",
                  dateString === todayString ? "is-today" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                <span className="day-number">{day}</span>

                {dayEvents.map((event, index) => (
                  <div
                    className={[
                      "calendar-event",
                      event.type === "Personal Event"
                        ? "personal-calendar-event"
                        : "campus-calendar-event",
                    ].join(" ")}
                    key={event.id || `${dateString}-${index}`}
                    title={`${event.title} - ${event.time}`}
                  >
                    <strong>{event.title}</strong>
                    <span>{event.time}</span>
                  </div>
                ))}
              </div>
            );
          })}
        </div>

        <div className="calendar-legend">
          <span>
            <span className="legend-dot campus-dot" />
            Campus Events
          </span>
          <span>
            <span className="legend-dot personal-dot" />
            Personal Events
          </span>
        </div>
      </div>

      {/* UPCOMING SCHEDULE */}
      <div className="calendar-events-section">
        <div className="section-heading">
          <h2>Upcoming Schedule</h2>
          <p>Your campus events and personal events.</p>
        </div>

        {error && (
          <p className="calendar-status">
            Campus events may be missing because the backend could not
            be reached. Your saved personal events are still shown.
          </p>
        )}

        <div className="calendar-event-list">
          {upcomingEvents.length === 0 ? (
            !loading && (
              <div className="empty-schedule">
                <h3>No events found</h3>
                <p>Add a personal event to start planning your schedule.</p>
                <Link
                  to="/student/add-event"
                  className="add-event-btn"
                >
                  + Add Personal Event
                </Link>
              </div>
            )
          ) : (
            upcomingEvents.map((event, index) => (
              <div
                className="schedule-card"
                key={event.id || `event-${index}`}
              >
                <div className="schedule-date">
                  <span>
                    {new Date(
                      Number(event.date.slice(0, 4)),
                      Number(event.date.slice(5, 7)) - 1,
                      Number(event.date.slice(8, 10))
                    )
                      .toLocaleDateString("en-US", {
                        month: "short",
                      })
                      .toUpperCase()}
                  </span>

                  <strong>
                    {Number(event.date.slice(8, 10))}
                  </strong>
                </div>

                <div className="schedule-info">
                  <h3>{event.title}</h3>
                  <p>{formatDate(event.date)}</p>
                  <p>{event.time || "Time not specified"}</p>
                  <span>{event.type}</span>

                  {event.location && (
                    <small>📍 {event.location}</small>
                  )}

                  {event.description && (
                    <p>{event.description}</p>
                  )}

                  {event.category && (
                    <small>Category: {event.category}</small>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default PersonalCalendar;
