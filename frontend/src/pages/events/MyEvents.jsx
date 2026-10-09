import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./MyEvent.css";
import FacultySidebar from "./FacultySidebar";

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

    let currentUser;

    try {
      currentUser = JSON.parse(savedUser);
    } catch (error) {
      console.error("Invalid user data:", error);
      localStorage.removeItem("user");
      navigate("/login");
      return;
    }

    if (currentUser.role !== "faculty") {
      navigate("/");
      return;
    }

    fetch(
      `http://localhost:5000/api/events/faculty/${currentUser.id}`
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to load events");
        }

        return response.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setEvents(data);
        } else {
          setEvents([]);
        }
      })
      .catch((error) => {
        console.error("Error loading events:", error);
        setEvents([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [navigate]);

  /* ================= LOADING ================= */

  if (loading) {
    return (
      <div className="my-events-page">

        <FacultySidebar />

        <main className="my-events-main">

          <div className="events-loading">
            Loading your events...
          </div>

        </main>

      </div>
    );
  }

  /* ================= PAGE ================= */

  return (
    <div className="my-events-page">

      {/* Faculty Sidebar */}
      <FacultySidebar />


      <main className="my-events-main">

        {/* ================= HEADER ================= */}

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


        {/* ================= NO EVENTS ================= */}

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

          /* ================= EVENTS ================= */

          <section className="events-grid">

            {events.map((event, index) => {

              const eventId =
                event.id || event._id;

              return (
                <article
                  className="my-event-card"
                  key={eventId || index}
                >

                  {/* TOP */}

                  <div className="event-card-top">

                    <span className="event-tag">
                      {event.category || "Campus Event"}
                    </span>

                    <span className="event-date">
                      {event.date || "Date not set"}
                    </span>

                  </div>


                  {/* TITLE */}

                  <h2>
                    {event.title ||
                      event.name ||
                      "Untitled Event"}
                  </h2>


                  {/* DESCRIPTION */}

                  <p className="event-description">

                    {event.description ||
                      "No description available for this event."}

                  </p>


                  {/* DETAILS */}

                  <div className="event-details">

                    <div>

                      <span>
                        VENUE
                      </span>

                      <strong>
                        {event.venue ||
                          event.location ||
                          "Not specified"}
                      </strong>

                    </div>


                    <div>

                      <span>
                        TIME
                      </span>

                      <strong>
                        {event.time ||
                          "Not specified"}
                      </strong>

                    </div>

                  </div>


                  {/* ACTIONS */}

                  <div className="event-actions">

                    <Link
                      to={`/faculty/events/${eventId}`}
                      className="view-event-btn"
                    >
                      View
                    </Link>


                    <Link
                      to={`/faculty/events/edit/${eventId}`}
                      className="edit-event-btn"
                    >
                      Edit Event
                    </Link>

                  </div>

                </article>
              );
            })}

          </section>

        )}

      </main>

    </div>
  );
}

export default MyEvents;