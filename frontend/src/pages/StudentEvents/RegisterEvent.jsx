import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { getStoredUser } from "../../auth";
import { apiRequest } from "../../api";
import { isPastEvent } from "./eventDateUtils";
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
  const navigate = useNavigate();
  const user = getStoredUser();
  const linkedEvent = location.state?.event;
  const [events, setEvents] = useState([]);
  const [registeredEventIds, setRegisteredEventIds] = useState(new Set());
  const [registrationsLoaded, setRegistrationsLoaded] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState(
    linkedEvent?._id || linkedEvent?.id || ""
  );
  const [department, setDepartment] = useState(user?.department || "");
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [alreadyRegisteredEvent, setAlreadyRegisteredEvent] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function loadEvents() {
      try {
        const [eventsResponse, registrationsResponse] = await Promise.all([
          apiRequest("/api/events"),
          apiRequest("/api/student/registrations"),
        ]);
        if (!eventsResponse.ok) {
          throw new Error("Unable to load events.");
        }
        if (!registrationsResponse.ok) {
          throw new Error("Unable to load your registered events.");
        }

        const [eventData, registrationData] = await Promise.all([
          eventsResponse.json(),
          registrationsResponse.json(),
        ]);
        if (!Array.isArray(eventData) || !Array.isArray(registrationData)) {
          throw new Error("The events response was invalid.");
        }

        if (!cancelled) {
          if (linkedEvent && isPastEvent(linkedEvent)) {
            navigate("/student/events", { replace: true });
          }
          const registrationIds = new Set(
            registrationData.map((registeredEvent) =>
              String(registeredEvent._id || registeredEvent.id)
            )
          );
          setEvents(eventData.filter((availableEvent) => !isPastEvent(availableEvent)));
          setRegisteredEventIds(registrationIds);
          setRegistrationsLoaded(true);
        }
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
  }, [linkedEvent, navigate]);

  const event =
    events.find((item) => (item._id || item.id) === selectedEventId) ||
    linkedEvent ||
    null;

  const returnToEvents = () => {
    navigate("/student/events", { replace: true });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!registrationsLoaded) {
      setError("Unable to verify your existing registrations. Please try again.");
      return;
    }
    if (event?._id && registeredEventIds.has(String(event._id))) {
      setAlreadyRegisteredEvent(event);
      return;
    }
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

      setRegisteredEventIds((currentIds) => new Set(currentIds).add(String(event._id)));
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
                  const nextEventId = e.target.value;
                  setSelectedEventId(nextEventId);
                  setError("");
                  setSuccess("");
                  if (registeredEventIds.has(String(nextEventId))) {
                    setAlreadyRegisteredEvent(
                      events.find((item) => String(item._id || item.id) === nextEventId)
                    );
                  }
                }}
                required
                disabled={
                  loadingEvents ||
                  !registrationsLoaded ||
                  events.length === 0 ||
                  Boolean(success)
                }
              >
                <option value="">
                  {loadingEvents ? "Loading events..." : "Select an event"}
                </option>
                {events.map((availableEvent) => {
                  const availableEventId = availableEvent._id || availableEvent.id;
                  const alreadyRegistered = registeredEventIds.has(String(availableEventId));
                  return (
                    <option key={availableEventId} value={availableEventId}>
                      {alreadyRegistered
                        ? `${availableEvent.title} (Already registered)`
                        : availableEvent.title}
                    </option>
                  );
                })}
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
              disabled={
                loadingEvents ||
                !registrationsLoaded ||
                submitting ||
                !event?._id ||
                Boolean(success)
              }
            >
              {submitting ? "Registering..." : success ? "Registered" : "Register for Event →"}
            </button>
          </form>
        </div>
      </div>
      {alreadyRegisteredEvent && (
        <div className="already-registered-backdrop">
          <section
            className="already-registered-dialog"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="already-registered-title"
            aria-describedby="already-registered-message"
          >
            <h2 id="already-registered-title">Already registered</h2>
            <p id="already-registered-message">
              You have already registered for{" "}
              <strong>{alreadyRegisteredEvent.title || "this event"}</strong>.
            </p>
            <button type="button" onClick={returnToEvents}>
              Return to events
            </button>
          </section>
        </div>
      )}
      <Footer />
    </div>
  );
}

export default RegisterEvent;
