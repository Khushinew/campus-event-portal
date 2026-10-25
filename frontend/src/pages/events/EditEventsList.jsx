
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import FacultySidebar from "./FacultySidebar";
import Footer from "../../components/Footer";
import "./EditEventsList.css";

function EditEventsList() {
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const savedUser = localStorage.getItem("user");

    if (!savedUser) {
      navigate("/login");
      return;
    }

    let currentUser;

    try {
      currentUser = JSON.parse(savedUser);
    } catch {
      localStorage.removeItem("user");
      navigate("/login");
      return;
    }

    if (currentUser.role !== "faculty") {
      navigate("/");
      return;
    }

    const controller = new AbortController();

    async function fetchEvents() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `http://localhost:5000/api/events/faculty/${currentUser.id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
            },
            signal: controller.signal,
          }
        );

        if (!response.ok) {
          throw new Error(
            response.status === 401
              ? "Your session has expired. Please log in again."
              : "Failed to load your events."
          );
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
          throw new Error("Unexpected response received from the server.");
        }

        setEvents(data);
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Error loading events:", err);
          setError(err.message || "Unable to load your events. Please try again.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchEvents();

    return () => controller.abort();
  }, [navigate]);

  return (
    <div className="edit-events-list-page">
      <FacultySidebar />

      <main className="edit-events-list-content">
        <header className="edit-events-header">
          <p className="edit-events-eyebrow">FACULTY PORTAL</p>

          <h1>Edit Your Events</h1>

          <p className="edit-events-intro">
            Select an event to review its details and make changes.
          </p>
        </header>

        {loading && (
          <div className="edit-events-loading">
            <span className="edit-events-spinner" />
            <p>Loading your events...</p>
          </div>
        )}

        {!loading && error && (
          <div className="edit-events-error" role="alert">
            <p>{error}</p>

            <button
              type="button"
              className="edit-events-retry-button"
              onClick={() => window.location.reload()}
            >
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && events.length === 0 && (
          <div className="edit-events-empty">
            <div className="edit-events-empty-icon">✦</div>
            <h2>No events yet</h2>
            <p>Your created events will appear here.</p>
          </div>
        )}

        {!loading && !error && events.length > 0 && (
          <section className="edit-events-grid" aria-label="Your events">
            {events.map((event) => (
              <article
                className="edit-event-list-card"
                key={event._id}
              >
                <div className="edit-event-card-details">
                  <div className="edit-event-card-heading">
                    <span className="edit-event-category">
                      {event.category || "Campus Event"}
                    </span>

                    <h2>{event.title || event.name || "Untitled Event"}</h2>
                  </div>

                  <div className="edit-event-meta">
                    <p>
                      <strong>Date:</strong>{" "}
                      {event.date
                        ? String(event.date).slice(0, 10)
                        : "Not specified"}
                    </p>

                    <p>
                      <strong>Time:</strong>{" "}
                      {event.time || "Not specified"}
                    </p>

                    <p>
                      <strong>Venue:</strong>{" "}
                      {event.venue || event.location || "Not specified"}
                    </p>
                  </div>
                </div>

                <Link
                  to={`/faculty/edit-events/${event._id}`}
                  className="edit-event-list-button"
                >
                  Edit Event <span aria-hidden="true">→</span>
                </Link>
              </article>
            ))}
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default EditEventsList;
