import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../../api";
import "./RegisteredEvents.css";
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

function RegisteredEvents() {
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadRegisteredEvents() {
      try {
        const response = await apiRequest("/api/student/registrations");
        if (!response.ok) {
          throw new Error("Unable to fetch your registered events.");
        }
        const data = await response.json();
        if (!Array.isArray(data)) {
          throw new Error("The registered events response was invalid.");
        }
        if (!cancelled) setRegisteredEvents(data);
      } catch (loadError) {
        console.error("Error loading registered events:", loadError);
        if (!cancelled) setError("Unable to load your registered events. Please try again.");
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
          <p>Events registered by your signed-in student account.</p>
        </div>
        <Link to="/student-dashboard" className="back-btn">
          ← Dashboard
        </Link>
      </div>

      <div className="registered-events-container">
        {loading ? (
          <div className="no-events"><h2>Loading your events...</h2></div>
        ) : error ? (
          <div className="no-events" role="alert"><h2>{error}</h2></div>
        ) : registeredEvents.length > 0 ? (
          <div className="registered-events-grid">
            {registeredEvents.map((event) => (
              <div className="registered-event-card" key={event._id}>
                <div className="registered-card-top">
                  <span className="event-category">{event.category || "Campus event"}</span>
                  <span className="event-status">Registered</span>
                </div>
                <h2>{event.title}</h2>
                <div className="event-info">
                  <p><strong>Date:</strong> {formatEventDate(event.date)}</p>
                  <p><strong>Time:</strong> {event.time || "Not specified"}</p>
                  <p><strong>Venue:</strong> {event.venue || "Not specified"}</p>
                </div>
              </div>
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
