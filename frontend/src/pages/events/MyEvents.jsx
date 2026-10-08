import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./MyEvent.css";

function MyEvents() {
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");

    if (!savedUser) {
      navigate("/login");
      return;
    }

    const currentUser = JSON.parse(savedUser);

    if (currentUser.role !== "faculty") {
      navigate("/");
      return;
    }

    fetch(`http://localhost:5000/api/events/faculty/${currentUser.id}`)
      .then((response) => response.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setEvents(data);
        }
      })
      .catch((error) => {
        console.error("Error loading events:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [navigate]);

  if (loading) {
    return (
      <div className="my-events-page">
        <div className="events-loading">
          Loading your events...
        </div>
      </div>
    );
  }

  return (
    <div className="my-events-page">

      <main className="my-events-main">

        <header className="my-events-header">

          <div>
            <p className="events-label">
              FACULTY PORTAL
            </p>

            <h1>
              My Events
            </h1>

            <p>
              View and manage the events created by you.
            </p>
          </div>

          <Link
            to="/faculty-dashboard"
            className="events-back-btn"
          >
            ← Dashboard
          </Link>

        </header>


        {events.length === 0 ? (

          <section className="no-events-card">

            <div className="no-events-icon">
              📅
            </div>

            <p className="events-label">
              YOUR EVENTS
            </p>

            <h2>
              No Events Yet
            </h2>

            <p>
              You haven't created any campus events yet.
            </p>

            <Link
              to="/faculty/create-event"
              className="create-event-link"
            >
              + Create Event
            </Link>

          </section>

        ) : (

          <section className="events-grid">

            {events.map((event, index) => (

              <article
                className="my-event-card"
                key={event.id || event._id || index}
              >

                <div className="event-card-top">

                  <span className="event-tag">
                    {event.category || "Campus Event"}
                  </span>

                  <span className="event-date">
                    {event.date || "Date not set"}
                  </span>

                </div>


                <h2>
                  {event.title || event.name || "Untitled Event"}
                </h2>


                <p className="event-description">
                  {event.description ||
                    "No description available for this event."}
                </p>


                <div className="event-details">

                  <div>
                    <span>VENUE</span>
                    <strong>
                      {event.venue || "Not specified"}
                    </strong>
                  </div>

                  <div>
                    <span>TIME</span>
                    <strong>
                      {event.time || "Not specified"}
                    </strong>
                  </div>

                </div>


                <div className="event-actions">

                  <Link
                    to={`/faculty/events/${event.id || event._id}`}
                    className="view-event-btn"
                  >
                    View
                  </Link>

                  <Link
                    to={`/faculty/events/edit/${event.id || event._id}`}
                    className="edit-event-btn"
                  >
                    Edit Event
                  </Link>

                </div>

              </article>

            ))}

          </section>

        )}

      </main>

    </div>
  );
}

export default MyEvents;