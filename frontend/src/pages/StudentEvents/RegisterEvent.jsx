import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { getStoredUser } from "../../auth";
import { apiRequest } from "../../api";
import "./RegisterEvent.css";
import Footer from "../../components/Footer";

function formatEventDate(date) {
  if (!date) return "Date not specified";

  const parsedDate = new Date(`${String(date).slice(0, 10)}T00:00:00`);
  return Number.isNaN(parsedDate.getTime())
    ? date
    : parsedDate.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
}

function RegisterEvent() {
  const location = useLocation();
  const user = getStoredUser();
  const linkedEvent = location.state?.event;
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState(
    linkedEvent?._id || linkedEvent?.id || ""
  );
  const [department, setDepartment] = useState(user?.department || "");
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadEvents() {
      try {
        const response = await apiRequest("/api/events");
        if (!response.ok) {
          throw new Error("Unable to load events.");
        }

        const data = await response.json();
        if (!Array.isArray(data)) {
          throw new Error("The events response was invalid.");
        }

        if (!cancelled) setEvents(data);
      } catch (loadError) {
        console.error("Error loading events for registration:", loadError);
        if (!cancelled) setError("Unable to load events. Please try again.");
      } finally {
        if (!cancelled) setLoadingEvents(false);
      }
    }

    loadEvents();
    return () => {
      cancelled = true;
    };
  }, []);

  const event =
    events.find((item) => (item._id || item.id) === selectedEventId) ||
    linkedEvent ||
    null;

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!event?._id) {
      setError("Select an available event before registering.");
      return;
    }

    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const response = await apiRequest(
        `/api/events/${encodeURIComponent(event._id)}/register`,
        { method: "POST", body: JSON.stringify({ department }) }
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed.");
      }

      setSuccess("Registration successful. Your event is now saved.");
    } catch (registrationError) {
      console.error("Event registration error:", registrationError);
      setError(registrationError.message || "Unable to register for this event.");
    } finally {
      setSubmitting(false);
    }
  };

  const studentId =
    user?.studentId || user?.email?.split("@")[0] || "";

  return (
    <div className="register-event-page">
      <div className="register-header">
        <div>
          <h1>Register for Event</h1>
          <p>Choose an event and confirm your student details.</p>
        </div>
        <Link to="/student-dashboard" className="back-btn">
          ← Dashboard
        </Link>
      </div>

      <div className="register-container">
        <section className="event-summary" aria-live="polite">
          {event ? (
            <>
              <span className="event-category">{event.category || "Campus event"}</span>
              <h2>{event.title}</h2>
              <p className="event-description">
                {event.description || "Join this campus event."}
              </p>
              <div className="event-details">
                <p><strong>Date:</strong> {formatEventDate(event.date)}</p>
                <p><strong>Time:</strong> {event.time || "Not specified"}</p>
                <p><strong>Venue:</strong> {event.venue || "Not specified"}</p>
                <p><strong>Available seats:</strong> {
                  Number.isFinite(Number(event.capacity))
                    ? Math.max(0, Number(event.capacity) - (event.registrations?.length || 0))
                    : "Not specified"
                }</p>
              </div>
            </>
          ) : (
            <>
              <span className="event-category">Event information</span>
              <h2>{loadingEvents ? "Loading events..." : "Select an event"}</h2>
              <p className="event-description">
                Choose an event from the form to see its details here.
              </p>
            </>
          )}
        </section>

        <div className="registration-card">
          <h2>Registration Form</h2>
          <p className="form-subtitle">
            Your student information is taken from your signed-in account.
          </p>

          {error && <p className="form-error" role="alert">{error}</p>}
          {success && <p className="form-success" role="status">{success}</p>}

          <form onSubmit={handleRegister}>
            <div className="form-group">
              <label htmlFor="selectedEvent">Event</label>
              <select
                id="selectedEvent"
                value={selectedEventId}
                onChange={(e) => {
                  setSelectedEventId(e.target.value);
                  setError("");
                  setSuccess("");
                }}
                required
                disabled={loadingEvents || events.length === 0 || Boolean(success)}
              >
                <option value="">
                  {loadingEvents ? "Loading events..." : "Select an event"}
                </option>
                {events.map((availableEvent) => (
                  <option key={availableEvent._id} value={availableEvent._id}>
                    {availableEvent.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="studentName">Full Name</label>
              <input id="studentName" value={user?.name || ""} readOnly />
            </div>

            <div className="form-group">
              <label htmlFor="studentEmail">Email Address</label>
              <input id="studentEmail" type="email" value={user?.email || ""} readOnly />
            </div>

            <div className="form-group">
              <label htmlFor="studentId">Student ID</label>
              <input id="studentId" value={studentId} readOnly />
            </div>

            <div className="form-group">
              <label htmlFor="department">Department</label>
              <input
                id="department"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="Enter your department"
                maxLength={120}
                required
              />
            </div>

            <button
              type="submit"
              className="register-btn"
              disabled={loadingEvents || submitting || !event?._id || Boolean(success)}
            >
              {submitting ? "Registering..." : success ? "Registered" : "Register for Event →"}
            </button>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default RegisterEvent;
