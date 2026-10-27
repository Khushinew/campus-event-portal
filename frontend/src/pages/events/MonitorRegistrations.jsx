
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import FacultySidebar from "./FacultySidebar";
import Footer from "../../components/Footer";
import "./MonitorRegistrations.css";
import { formatEventDate } from "../../eventUtils";
import { getStoredUser } from "../../auth";

function MonitorRegistrations() {
  const navigate = useNavigate();

  const [user] = useState(() => getStoredUser());
  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = sessionStorage.getItem("token");

    if (!user || user.role !== "faculty" || !token) {
      navigate("/login");
      return;
    }

    async function loadFacultyEvents() {
      try {
        const response = await fetch(
          `http://localhost:5000/api/events/faculty/${user.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to load events.");
        }
        if (!Array.isArray(data)) {
          throw new Error("The server returned an unexpected events response.");
        }

        setEvents(data);
      } catch (loadError) {
        console.error("Error fetching faculty events:", loadError);
        setError(loadError.message || "Unable to load your events.");
        setEvents([]);
      } finally {
        setLoadingEvents(false);
      }
    }

    loadFacultyEvents();
  }, [navigate, user]);

  function handleEventClick(event) {
    const eventId = event._id || event.id;

    if (!eventId) {
      setError("This event does not have a valid ID.");
      return;
    }

    navigate(`/faculty/events/${eventId}/registrations`);
  }

  return (
    <div className="monitor-page">
      <FacultySidebar />

      <main className="monitor-content">
        <div className="monitor-header">
          <div>
            <h1>Monitor Registrations</h1>
            <p>
              View events you created and the students registered for them.
            </p>
          </div>

          <Link to="/faculty-dashboard" className="back-button">
            Back to Dashboard
          </Link>
        </div>

        {user && (
          <p className="faculty-welcome">
            Welcome, {user.name || "Faculty"}
          </p>
        )}

        {error && (
          <div className="monitor-error" role="alert">
            {error}
          </div>
        )}

        <section className="events-section">
          <h2>Your Events</h2>

          {loadingEvents ? (
            <p>Loading your events...</p>
          ) : events.length === 0 ? (
            <p>
              No events found. Create an event first, or check whether your
              events were saved under your faculty account.
            </p>
          ) : (
            <div className="monitor-events-grid">
              {events.map((event) => (
                <button
                  type="button"
                  key={event._id || event.id}
                  className="monitor-event-card"
                  onClick={() => handleEventClick(event)}
                >
                  {event.isFull && (
                    <span className="monitor-full-label">FULLY CAPACITY</span>
                  )}
                  <h3>{event.title}</h3>

                  <p>
                    <strong>Date:</strong>{" "}
                    {formatEventDate(event.date)}
                  </p>

                  <p>
                    <strong>Time:</strong> {event.time || "Not specified"}
                  </p>

                  <p>
                    <strong>Venue:</strong> {event.venue || "Not specified"}
                  </p>
                  <p>
                    <strong>Registrations:</strong>{" "}
                    {event.registrationCount ?? event.registrations?.length ?? 0}
                    {" / "}
                    {event.capacity ?? "—"}
                  </p>
                  <p>
                    <strong>Seats remaining:</strong>{" "}
                    {event.seatsRemaining ??
                      Math.max(
                        Number(event.capacity || 0) -
                          Number(event.registrationCount || 0),
                        0
                      )}
                  </p>

                  <span className="view-registrations">
                    View Registrations
                  </span>
                </button>
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default MonitorRegistrations;
