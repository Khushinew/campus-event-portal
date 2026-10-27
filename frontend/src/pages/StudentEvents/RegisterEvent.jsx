import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { getStoredUser, getSessionToken } from "../../auth";
import {
  formatEventDate,
  getRemainingSeats,
  isPastEvent,
} from "../../eventUtils";
import "./RegisterEvent.css";
import Footer from "../../components/Footer";

function RegisterEvent() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = getStoredUser();
  const token = getSessionToken();
  const [initialSelectedEventId] = useState(
    () => location.state?.event?._id || location.state?.event?.id || ""
  );
  const [event, setEvent] = useState(location.state?.event || null);
  const [selectedEventId, setSelectedEventId] = useState(initialSelectedEventId);
  const [eventOptions, setEventOptions] = useState([]);
  const [registeredEventIds, setRegisteredEventIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [modal, setModal] = useState(null);

  useEffect(() => {
    if (!token || user?.role !== "student") {
      navigate("/login", { replace: true });
      return;
    }

    let cancelled = false;

    async function loadRegistrationState() {
      setLoading(true);
      try {
        const headers = { Authorization: `Bearer ${token}` };
        const [eventsResponse, registrationsResponse] = await Promise.all([
          fetch("http://localhost:5000/api/events"),
          fetch("http://localhost:5000/api/student/registrations", { headers }),
        ]);
        const eventsData = await eventsResponse.json();
        const registrationsData = await registrationsResponse.json();

        if (!eventsResponse.ok) {
          throw new Error(eventsData.message || "Unable to load events.");
        }
        if (!registrationsResponse.ok) {
          throw new Error(
            registrationsData.message || "Unable to check your registrations."
          );
        }

        const upcomingEvents = (Array.isArray(eventsData) ? eventsData : [])
          .filter((candidate) => !isPastEvent(candidate));
        const registeredIds = new Set(
          (Array.isArray(registrationsData) ? registrationsData : [])
            .map((registeredEvent) =>
              String(registeredEvent._id || registeredEvent.id || "")
            )
            .filter(Boolean)
        );
        const selected = upcomingEvents.find(
          (candidate) =>
            String(candidate._id || candidate.id) ===
            String(initialSelectedEventId)
        );

        if (!cancelled) {
          setEventOptions(upcomingEvents);
          setRegisteredEventIds(registeredIds);
          setEvent(selected || null);
          if (selected && registeredIds.has(String(selected._id || selected.id))) {
            setModal({
              title: "Already registered",
              message: "You are already registered for this event.",
              icon: "✓",
              action: "Choose another event",
            });
          } else if (selected && getRemainingSeats(selected) === 0) {
            setModal({
              title: "Ouch, sorry!",
              message: "This event is at full capacity. There are no seats left.",
              icon: "🍩",
              action: "Choose another event",
            });
          }
        }
      } catch (loadError) {
        console.error("Registration page error:", loadError);
        if (!cancelled) {
          setError(loadError.message || "Unable to load registration details.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadRegistrationState();
    return () => {
      cancelled = true;
    };
  }, [initialSelectedEventId, navigate, token, user?.role]);

  function handleEventChange(eventId) {
    const selected = eventOptions.find(
      (candidate) => String(candidate._id || candidate.id) === eventId
    );
    setSelectedEventId(eventId);
    setEvent(selected || null);
    setError("");

    if (selected && registeredEventIds.has(String(selected._id || selected.id))) {
      setModal({
        title: "Already registered",
        message: "You are already registered for this event.",
        icon: "✓",
        action: "Choose another event",
      });
    } else if (selected && getRemainingSeats(selected) === 0) {
      setModal({
        title: "Ouch, sorry!",
        message: "This event is at full capacity. There are no seats left.",
        icon: "🍩",
        action: "Choose another event",
      });
    } else {
      setModal(null);
    }
  }

  async function handleRegister(submitEvent) {
    submitEvent.preventDefault();
    const eventId = event?._id || event?.id;
    if (!eventId || !token || submitting) return;

    if (registeredEventIds.has(String(eventId))) {
      setModal({
        title: "Already registered",
        message: "You are already registered for this event.",
        icon: "✓",
        action: "Choose another event",
      });
      return;
    }

    setError("");
    setSubmitting(true);

    try {
      const response = await fetch(
        `http://localhost:5000/api/events/${eventId}/register`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const result = await response.json();

      if (response.status === 409) {
        const full = /capacity|full/i.test(result.message || "");
        setModal({
          title: full ? "Ouch, sorry!" : "Already registered",
          message: result.message || (full
            ? "This event has reached its registration capacity."
            : "You are already registered for this event."),
          icon: full ? "🍩" : "✓",
          action: "Choose another event",
        });
        return;
      }

      if (!response.ok) {
        throw new Error(result.message || "Registration failed.");
      }

      setRegisteredEventIds((currentIds) => new Set(currentIds).add(String(eventId)));
      setModal({
        title: "Registration successful",
        message: `You are registered for ${event.title}.`,
        icon: "✓",
        action: "View my registered events",
        destination: "/student/registered-events",
      });
    } catch (registerError) {
      console.error("Event registration error:", registerError);
      setError(registerError.message || "Could not register for this event.");
    } finally {
      setSubmitting(false);
    }
  }

  const remainingSeats = getRemainingSeats(event);

  return (
    <div className="register-event-page">
      <div className="register-header">
        <div>
          <h1>Register for Event</h1>
          <p>Review the event and confirm your student details.</p>
        </div>

        <Link to="/student/events" className="back-btn">
          ← Browse Events
        </Link>
      </div>

      {error && <p className="registration-error" role="alert">{error}</p>}

      {loading ? (
        <p className="events-empty-state">Loading event details...</p>
      ) : (
        <div className="register-container">
          <section className="event-summary">
            {event ? (
              <>
                <span className="event-category">{event.category}</span>
                <h2>{event.title}</h2>
                <p className="event-description">{event.description}</p>
                <div className="event-details">
                  <p><strong>Date:</strong> {formatEventDate(event.date)}</p>
                  <p><strong>Time:</strong> {event.time || "Not specified"}</p>
                  <p><strong>Venue:</strong> {event.venue || "Not specified"}</p>
                  <p><strong>Available seats:</strong> {remainingSeats ?? "Not specified"}</p>
                </div>
              </>
            ) : (
              <>
                <span className="event-category">Choose an event</span>
                <h2>Select a campus event</h2>
                <p className="event-description">
                  Choose an upcoming event in the registration form to see its
                  details and available seats.
                </p>
              </>
            )}
          </section>

          <section className="registration-card">
            <h2>Confirm Your Details</h2>
            <p className="form-subtitle">
              Your account information will be used for this registration.
            </p>

            <form onSubmit={handleRegister}>
              <div className="form-group">
                <label htmlFor="registration-event">Select Event</label>
                <select
                  id="registration-event"
                  value={selectedEventId}
                  onChange={(changeEvent) =>
                    handleEventChange(changeEvent.target.value)
                  }
                  required
                >
                  <option value="">Choose an upcoming event</option>
                  {eventOptions.map((option) => {
                    const optionId = String(option._id || option.id);
                    const registered = registeredEventIds.has(optionId);
                    const full = getRemainingSeats(option) === 0;
                    return (
                      <option key={optionId} value={optionId}>
                        {option.title}
                        {registered ? " (Already registered)" : ""}
                        {!registered && full ? " (Full capacity)" : ""}
                      </option>
                    );
                  })}
                </select>
              </div>

              {event && (
                <dl className="student-registration-details">
                  <div><dt>Full name</dt><dd>{user?.name || "Not provided"}</dd></div>
                  <div><dt>Email address</dt><dd>{user?.email || "Not provided"}</dd></div>
                  <div><dt>Enrollment ID</dt><dd>{user?.studentId || "Not provided"}</dd></div>
                  <div><dt>Department</dt><dd>{user?.department || "Not provided"}</dd></div>
                </dl>
              )}

              {!event ? null : registeredEventIds.has(String(event._id || event.id)) ? (
                <button type="button" className="register-btn registered-button" disabled>
                  Registered
                </button>
              ) : remainingSeats === 0 ? (
                <button type="button" className="register-btn" disabled>
                  Full capacity
                </button>
              ) : (
                <button
                  type="submit"
                  className="register-btn"
                  disabled={submitting}
                >
                  {submitting ? "Registering..." : "Register for Event →"}
                </button>
              )}
            </form>
          </section>
        </div>
      )}

      {modal && (
        <div className="registration-modal-backdrop" role="presentation">
          <section
            className="registration-result-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="registration-result-title"
          >
            <span className="registration-result-icon" aria-hidden="true">
              {modal.icon}
            </span>
            <h2 id="registration-result-title">{modal.title}</h2>
            <p>{modal.message}</p>
            <button
              type="button"
              className="register-btn"
              onClick={() => {
                if (modal.destination) {
                  navigate(modal.destination, { replace: true });
                } else {
                  setModal(null);
                  setSelectedEventId("");
                  setEvent(null);
                }
              }}
            >
              {modal.action}
            </button>
          </section>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default RegisterEvent;
