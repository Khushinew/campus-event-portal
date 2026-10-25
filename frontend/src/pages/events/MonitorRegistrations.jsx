
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import FacultySidebar from "./FacultySidebar";
import Footer from "../../components/Footer";
import "./MonitorRegistrations.css";

function MonitorRegistrations() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (!storedUser || !token) {
      navigate("/login");
      return;
    }

    let currentUser;

    try {
      currentUser = JSON.parse(storedUser);
    } catch {
      navigate("/login");
      return;
    }

    if (currentUser.role !== "faculty") {
      navigate("/login");
      return;
    }

    setUser(currentUser);
    fetchFacultyEvents(currentUser.id, token);
  }, [navigate]);

  async function fetchFacultyEvents(facultyId, token) {
    setLoadingEvents(true);
    setError("");

    try {
      const response = await fetch(
        `http://localhost:5000/api/events/faculty/${facultyId}`,
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
    } catch (err) {
      console.error("Error fetching faculty events:", err);
      setError(err.message || "Unable to load your events.");
      setEvents([]);
    } finally {
      setLoadingEvents(false);
    }
  }

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
                  <h3>{event.title}</h3>

                  <p>
                    <strong>Date:</strong>{" "}
                    {event.date
                      ? new Date(event.date).toLocaleDateString()
                      : "Not specified"}
                  </p>

                  <p>
                    <strong>Time:</strong> {event.time || "Not specified"}
                  </p>

                  <p>
                    <strong>Venue:</strong> {event.venue || "Not specified"}
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
