import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./MonitorRegistrations.css";
import FacultySidebar from "../events/FacultySidebar";

function MonitorRegistrations() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const [students, setStudents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);

  const [searchEvent, setSearchEvent] = useState("");
  const [error, setError] = useState("");

  // --------------------------------------------------
  // LOAD FACULTY EVENTS
  // --------------------------------------------------

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

    setUser(currentUser);

    fetch(
      `http://localhost:5000/api/events/faculty/${currentUser.id}`
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error("Unable to load events");
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
        console.error(
          "Error loading faculty events:",
          error
        );

        setError(
          "Unable to load your events. Please try again."
        );
      })
      .finally(() => {
        setLoadingEvents(false);
      });
  }, [navigate]);

  // --------------------------------------------------
  // GET STUDENTS FOR SELECTED EVENT
  // --------------------------------------------------

  const handleEventClick = async (event) => {
    const eventId = event.id || event._id;

    setSelectedEvent(event);
    setStudents([]);
    setError("");
    setLoadingStudents(true);

    try {
      const response = await fetch(
        `http://localhost:5000/api/events/${eventId}/registrations`
      );

      if (!response.ok) {
        throw new Error(
          "Unable to load registrations"
        );
      }

      const data = await response.json();

      if (Array.isArray(data)) {
        setStudents(data);
      } else if (Array.isArray(data.registrations)) {
        setStudents(data.registrations);
      } else if (Array.isArray(data.students)) {
        setStudents(data.students);
      } else {
        setStudents([]);
      }
    } catch (error) {
      console.error(
        "Error loading registrations:",
        error
      );

      setError(
        "Unable to load student registrations for this event."
      );

      setStudents([]);
    } finally {
      setLoadingStudents(false);
    }
  };

  // --------------------------------------------------
  // FILTER EVENTS
  // --------------------------------------------------

  const filteredEvents = events.filter((event) => {
    const title =
      event.title ||
      event.name ||
      "";

    return title
      .toLowerCase()
      .includes(searchEvent.toLowerCase());
  });

  // --------------------------------------------------
  // LOADING SCREEN
  // --------------------------------------------------

  if (!user || loadingEvents) {
    return (
      <div className="monitor-page">

        {/* FACULTY SIDEBAR */}
        <FacultySidebar />

        <div className="monitor-loading">
          Loading your events...
        </div>

      </div>
    );
  }

  // --------------------------------------------------
  // MAIN PAGE
  // --------------------------------------------------

  return (
    <div className="monitor-page">

      {/* =================================================
          FACULTY SIDEBAR
      ================================================= */}

      <FacultySidebar />

      <main className="monitor-main">

        {/* =================================================
            HEADER
        ================================================= */}

        <header className="monitor-header">

          <Link
            to="/faculty-dashboard"
            className="monitor-back-btn"
          >
            ← Back to Dashboard
          </Link>

          <p className="monitor-label">
            FACULTY PORTAL
          </p>

          <h1>
            Monitor Registrations
          </h1>

          <div className="title-line"></div>

          <p className="monitor-subtitle">
            Select one of your events to view the students
            registered for that event.
          </p>

        </header>

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div className="monitor-error">
            ⚠ {error}
          </div>
        )}

        {/* =================================================
            EVENT SELECTION
        ================================================= */}

        <section className="events-selection-card">

          <div className="section-heading">

            <div className="section-number">
              01
            </div>

            <div>

              <p className="section-label">
                YOUR EVENTS
              </p>

              <h2>
                Select an Event
              </h2>

              <p className="section-description">
                Choose an event created by you to see its
                registered students.
              </p>

            </div>

          </div>

          {/* =================================================
              SEARCH
          ================================================= */}

          {events.length > 0 && (
            <div className="event-search-wrapper">

              <label>
                Search Event
              </label>

              <div className="event-search">

                <span className="search-icon">
                  ⌕
                </span>

                <input
                  type="text"
                  placeholder="Enter event name..."
                  value={searchEvent}
                  onChange={(e) =>
                    setSearchEvent(e.target.value)
                  }
                />

              </div>

            </div>
          )}

          {/* =================================================
              EVENTS
          ================================================= */}

          {events.length === 0 ? (

            <div className="no-events">

              <div className="no-events-icon">
                📅
              </div>

              <p className="no-events-label">
                YOUR EVENTS
              </p>

              <h2>
                No Events Created Yet
              </h2>

              <p>
                Once you create an event, it will appear
                here and you can monitor its registrations.
              </p>

            </div>

          ) : filteredEvents.length === 0 ? (

            <div className="no-search-result">

              <div>
                🔍
              </div>

              <h3>
                No Matching Event
              </h3>

              <p>
                Try searching with a different event name.
              </p>

            </div>

          ) : (

            <div className="events-list">

              {filteredEvents.map((event, index) => {

                const eventId =
                  event.id || event._id;

                const eventName =
                  event.title ||
                  event.name ||
                  "Untitled Event";

                const isSelected =
                  selectedEvent &&
                  (
                    selectedEvent.id ||
                    selectedEvent._id
                  ) === eventId;

                return (
                  <button
                    key={eventId || index}
                    className={`event-row ${
                      isSelected
                        ? "event-row-selected"
                        : ""
                    }`}
                    onClick={() =>
                      handleEventClick(event)
                    }
                  >

                    {/* NUMBER */}

                    <div className="event-row-number">
                      {String(index + 1).padStart(2, "0")}
                    </div>

                    {/* EVENT INFO */}

                    <div className="event-row-info">

                      <h3>
                        {eventName}
                      </h3>

                      <div className="event-row-meta">

                        <span>
                          {event.category ||
                            "Campus Event"}
                        </span>

                        <span>
                          {event.date ||
                            "Date not set"}
                        </span>

                        <span>
                          {event.venue ||
                            event.location ||
                            "Venue not specified"}
                        </span>

                      </div>

                    </div>

                    {/* ARROW */}

                    <div className="event-row-arrow">
                      {isSelected ? "↓" : "→"}
                    </div>

                  </button>
                );
              })}

            </div>

          )}

        </section>

        {/* =================================================
            STUDENT REGISTRATION SECTION
        ================================================= */}

        {selectedEvent && (

          <section className="students-card">

            <div className="students-header">

              <div className="students-title">

                <div className="section-number purple">
                  02
                </div>

                <div>

                  <p className="section-label">
                    STUDENT REGISTRATIONS
                  </p>

                  <h2>
                    {selectedEvent.title ||
                      selectedEvent.name ||
                      "Selected Event"}
                  </h2>

                </div>

              </div>

              {!loadingStudents && (
                <div className="registration-count">

                  {students.length}

                  <span>
                    {students.length === 1
                      ? " Student"
                      : " Students"}
                  </span>

                </div>
              )}

            </div>

            {/* =================================================
                EVENT INFORMATION
            ================================================= */}

            <div className="selected-event-info">

              <div>
                <span>EVENT</span>

                <strong>
                  {selectedEvent.title ||
                    selectedEvent.name ||
                    "Not specified"}
                </strong>
              </div>

              <div>
                <span>CATEGORY</span>

                <strong>
                  {selectedEvent.category ||
                    "Not specified"}
                </strong>
              </div>

              <div>
                <span>DATE</span>

                <strong>
                  {selectedEvent.date ||
                    "Not specified"}
                </strong>
              </div>

              <div>
                <span>TIME</span>

                <strong>
                  {selectedEvent.time ||
                    "Not specified"}
                </strong>
              </div>

              <div>
                <span>VENUE</span>

                <strong>
                  {selectedEvent.venue ||
                    selectedEvent.location ||
                    "Not specified"}
                </strong>
              </div>

            </div>

            {/* =================================================
                LOADING STUDENTS
            ================================================= */}

            {loadingStudents ? (

              <div className="students-loading">
                Loading registered students...
              </div>

            ) : students.length === 0 ? (

              <div className="no-students">

                <div className="no-students-icon">
                  👥
                </div>

                <p className="no-students-label">
                  REGISTRATIONS
                </p>

                <h3>
                  No Students Registered Yet
                </h3>

                <p>
                  Students who register for this event
                  will appear here.
                </p>

              </div>

            ) : (

              <div className="students-table-wrapper">

                <table className="students-table">

                  <thead>

                    <tr>
                      <th>#</th>
                      <th>Student Name</th>
                      <th>Student ID</th>
                      <th>Email</th>
                      <th>Department</th>
                      <th>Registered On</th>
                    </tr>

                  </thead>

                  <tbody>

                    {students.map((student, index) => (

                      <tr
                        key={
                          student.id ||
                          student._id ||
                          index
                        }
                      >

                        <td className="student-number">
                          {index + 1}
                        </td>

                        <td>

                          <div className="student-name">

                            <div className="student-avatar">
                              {(
                                student.name ||
                                student.studentName ||
                                "S"
                              )
                                .charAt(0)
                                .toUpperCase()}
                            </div>

                            <strong>
                              {student.name ||
                                student.studentName ||
                                "Unknown Student"}
                            </strong>

                          </div>

                        </td>

                        <td>
                          {student.studentId ||
                            student.rollNumber ||
                            student.enrollmentNo ||
                            "—"}
                        </td>

                        <td>
                          {student.email ||
                            student.studentEmail ||
                            "—"}
                        </td>

                        <td>
                          {student.department ||
                            "—"}
                        </td>

                        <td>
                          {student.registeredAt ||
                            student.registrationDate ||
                            student.createdAt ||
                            "—"}
                        </td>

                      </tr>

                    ))}

                  </tbody>

                </table>

              </div>

            )}

          </section>

        )}

      </main>

    </div>
  );
}

export default MonitorRegistrations;