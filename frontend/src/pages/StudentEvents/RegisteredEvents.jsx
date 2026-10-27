import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getSessionToken } from "../../auth";
import { formatEventDate, getRemainingSeats } from "../../eventUtils";
import "./RegisteredEvents.css";
import Footer from "../../components/Footer";

function RegisteredEvents() {
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadRegisteredEvents() {
      const token = getSessionToken();
      try {
        const response = await fetch(
          "http://localhost:5000/api/student/registrations",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to load your registrations.");
        }
        if (!Array.isArray(data)) {
          throw new Error("The server returned an unexpected response.");
        }
        if (!cancelled) setRegisteredEvents(data);
      } catch (loadError) {
        console.error("Registered events error:", loadError);
        if (!cancelled) {
          setError(loadError.message || "Unable to load your registrations.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadRegisteredEvents();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="registered-events-page">
      <div className="registered-header">
        <div>
          <h1>My Registered Events</h1>
          <p>View all the events you have registered for.</p>
        </div>

        <Link to="/student-dashboard" className="back-btn">
          ← Dashboard
        </Link>
      </div>

      <div className="registered-events-container">
        {loading ? (
          <p className="no-events">Loading your registrations...</p>
        ) : error ? (
          <p className="no-events" role="alert">{error}</p>
        ) : registeredEvents.length > 0 ? (
          <div className="registered-events-grid">
            {registeredEvents.map((event) => (
              <article className="registered-event-card" key={event._id}>
                <div className="registered-card-top">
                  <span className="event-category">{event.category}</span>
                  <span className="event-status">Registered</span>
                </div>

                <h2>{event.title}</h2>

                <div className="event-info">
                  <p><strong>Date:</strong> {formatEventDate(event.date)}</p>
                  <p><strong>Time:</strong> {event.time || "Not specified"}</p>
                  <p><strong>Venue:</strong> {event.venue || "Not specified"}</p>
                  <p><strong>Seats left:</strong> {getRemainingSeats(event) ?? "—"}</p>
                  <p>
                    <strong>Registered on:</strong>{" "}
                    {event.registrations?.[0]?.registeredAt
                      ? new Date(event.registrations[0].registeredAt).toLocaleDateString()
                      : "—"}
                  </p>
                </div>

                <Link
                  to="/student/event-details"
                  state={{ event }}
                  className="details-btn"
                >
                  View Details →
                </Link>
              </article>
            ))}
          </div>
        ) : (
          <div className="no-events">
            <div className="no-events-icon">📅</div>
            <h2>No Registered Events</h2>
            <p>You have not registered for any campus events yet.</p>
            <Link to="/student/events" className="browse-btn">
              Browse Events
            </Link>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}

export default RegisteredEvents;
