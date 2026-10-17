import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getStoredUser } from "../../auth";
import { apiRequest } from "../../api";
import "./PersonalCalendar.css";
import Footer from "../../components/Footer";

function eventDateKey(date) {
  return date ? String(date).slice(0, 10) : "";
}

function formatEventDate(date) {
  if (!date) return "Date not specified";
  const parsedDate = new Date(`${eventDateKey(date)}T00:00:00`);
  return Number.isNaN(parsedDate.getTime())
    ? date
    : parsedDate.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
}

function loadPersonalEvents(storageKey) {
  try {
    const storedEvents = JSON.parse(localStorage.getItem(storageKey) || "[]");
    if (!Array.isArray(storedEvents)) {
      throw new Error("Saved personal events are not in a valid format.");
    }
    return { events: storedEvents, error: "" };
  } catch (error) {
    console.error("Error loading personal calendar events:", error);
    return { events: [], error: "Unable to load your saved personal events." };
  }
}

function PersonalCalendar() {
  const user = getStoredUser();
  const storageKey = `campusPersonalEvents:${user?.id || user?.email}`;
  const [savedPersonalData] = useState(() => loadPersonalEvents(storageKey));
  const [personalEvents] = useState(savedPersonalData.events);
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [calendarDate, setCalendarDate] = useState(() => new Date());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(savedPersonalData.error);

  useEffect(() => {
    let cancelled = false;

    async function loadRegisteredEvents() {
      try {
        const response = await apiRequest("/api/student/registrations");
        if (!response.ok) throw new Error("Unable to load registered events.");
        const data = await response.json();
        if (!Array.isArray(data)) throw new Error("The registered events response was invalid.");
        if (!cancelled) setRegisteredEvents(data);
      } catch (loadError) {
        console.error("Error loading registered events for calendar:", loadError);
        if (!cancelled) setError("Unable to load registered events for your calendar.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadRegisteredEvents();
    return () => {
      cancelled = true;
    };
  }, []);

  const allEvents = useMemo(() => [
    ...registeredEvents.map((event) => ({
      id: `registered-${event._id}`,
      date: event.date,
      title: event.title,
      time: event.time || "Time not specified",
      location: event.venue || "",
      type: "Registered Event",
    })),
    ...personalEvents.map((event) => ({
      ...event,
      id: `personal-${event.id}`,
      type: "Personal Event",
    })),
  ].sort((first, second) => eventDateKey(first.date).localeCompare(eventDateKey(second.date))), [
    personalEvents,
    registeredEvents,
  ]);

  const monthStart = new Date(
    calendarDate.getFullYear(),
    calendarDate.getMonth(),
    1
  );
  const monthDays = new Date(
    calendarDate.getFullYear(),
    calendarDate.getMonth() + 1,
    0
  ).getDate();
  const leadingEmptyDays = monthStart.getDay();
  const monthLabel = calendarDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="personal-calendar-page">
      <div className="calendar-header">
        <div>
          <h1>Personal Calendar</h1>
          <p>Only events you registered for and your personal events appear here.</p>
        </div>
        <div className="calendar-actions">
          <Link to="/student/add-event" className="add-event-btn">
            + Add Personal Event
          </Link>
          <Link to="/student-dashboard" className="back-btn">
            ← Dashboard
          </Link>
        </div>
      </div>

      <div className="calendar-container">
        <div className="calendar-top">
          <button
            className="calendar-nav"
            type="button"
            aria-label="Previous month"
            onClick={() => setCalendarDate(new Date(
              calendarDate.getFullYear(),
              calendarDate.getMonth() - 1,
              1
            ))}
          >
            ←
          </button>
          <h2>{monthLabel}</h2>
          <button
            className="calendar-nav"
            type="button"
            aria-label="Next month"
            onClick={() => setCalendarDate(new Date(
              calendarDate.getFullYear(),
              calendarDate.getMonth() + 1,
              1
            ))}
          >
            →
          </button>
        </div>

        <div className="calendar-weekdays">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day}>{day}</div>
          ))}
        </div>

        <div className="calendar-grid">
          {Array.from({ length: leadingEmptyDays }, (_, index) => (
            <div className="calendar-day empty" key={`empty-${index}`} />
          ))}
          {Array.from({ length: monthDays }, (_, index) => {
            const day = index + 1;
            const dateString = `${calendarDate.getFullYear()}-${String(
              calendarDate.getMonth() + 1
            ).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const dayEvents = allEvents.filter(
              (event) => eventDateKey(event.date) === dateString
            );

            return (
              <div
                className={`calendar-day ${dayEvents.length ? "has-event" : ""}`}
                key={dateString}
              >
                <span className="day-number">{day}</span>
                {dayEvents.map((event) => (
                  <div className="calendar-event" key={event.id}>
                    <strong>{event.title}</strong>
                    <span>{event.time}</span>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>

      <div className="calendar-events-section">
        <div className="section-heading">
          <h2>My Schedule</h2>
          <p>Your registered campus events and personal events.</p>
        </div>

        {loading ? (
          <p>Loading your schedule...</p>
        ) : error ? (
          <p role="alert">{error}</p>
        ) : allEvents.length > 0 ? (
          <div className="calendar-event-list">
            {allEvents.map((event) => (
              <div className="schedule-card" key={event.id}>
                <div className="schedule-date">
                  <span>
                    {new Date(`${eventDateKey(event.date)}T00:00:00`)
                      .toLocaleDateString("en-US", { month: "short" })
                      .toUpperCase()}
                  </span>
                  <strong>
                    {new Date(`${eventDateKey(event.date)}T00:00:00`)
                      .toLocaleDateString("en-US", { day: "numeric" })}
                  </strong>
                </div>
                <div className="schedule-info">
                  <h3>{event.title}</h3>
                  <p>{formatEventDate(event.date)} · {event.time}</p>
                  <span>{event.type}</span>
                  {event.location && <small>📍 {event.location}</small>}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>No registered or personal events are on your schedule yet.</p>
        )}
      </div>
      <Footer />
    </div>
  );
}

export default PersonalCalendar;
