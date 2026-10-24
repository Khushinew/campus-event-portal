
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

    fetch(
      `http://localhost:5000/api/events/faculty/${currentUser.id}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to load events");
        }

        return response.json();
      })
      .then((data) => {
        setEvents(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error("Error loading events:", err);
        setError("Unable to load your events. Please try again.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [navigate]);

  return (
    <div className="edit-events-list-page">
      <FacultySidebar />

      <main className="edit-events-list-content">
        <p className="edit-events-eyebrow">FACULTY PORTAL</p>
        <h1>Edit Your Events</h1>
        <p className="edit-events-intro">
          Select an event to review its details and make changes.
        </p>

        {loading && <p>Loading your events...</p>}

        {error && <p className="edit-events-error">{error}</p>}

        {!loading && !error && events.length === 0 && (
          <div className="edit-events-empty">
            <h2>No events yet</h2>
            <p>Your created events will appear here.</p>
          </div>
        )}

        {!loading && !error && events.length > 0 && (
          <div className="edit-events-grid">
            {events.map((event) => (
              <article
                className="edit-event-list-card"
                key={event._id}
              >
                <div>
                  <span className="edit-event-category">
                    {event.category || "Campus Event"}
                  </span>

                  <h2>{event.title || event.name || "Untitled Event"}</h2>

                  <p>
                    <strong>Date:</strong>{" "}
                    {event.date
                      ? String(event.date).slice(0, 10)
                      : "Not specified"}
                  </p>

                  <p>
                    <strong>Time:</strong> {event.time || "Not specified"}
                  </p>

                  <p>
                    <strong>Venue:</strong>{" "}
                    {event.venue || event.location || "Not specified"}
                  </p>
                </div>

                <Link
                  to={`/faculty/edit-events/${event._id}`}
                  className="edit-event-list-button"
                >
                  Edit Event →
                </Link>
              </article>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default EditEventsList;
