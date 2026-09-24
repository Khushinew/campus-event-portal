import { Link } from "react-router-dom";
import "./PersonalCalendar.css";

function PersonalCalendar() {
  const events = [
    {
      id: 1,
      day: "15",
      month: "OCT",
      title: "Tech Fest 2026",
      time: "10:00 AM - 4:00 PM",
      type: "Campus Event",
    },
    {
      id: 2,
      day: "20",
      month: "OCT",
      title: "AI Workshop",
      time: "11:00 AM - 2:00 PM",
      type: "Campus Event",
    },
    {
      id: 3,
      day: "25",
      month: "OCT",
      title: "Inter-College Hackathon",
      time: "9:00 AM - 6:00 PM",
      type: "Campus Event",
    },
  ];

  return (
    <div className="personal-calendar-page">

      {/* Header */}
      <div className="calendar-header">
        <div>
          <h1>Personal Calendar</h1>
          <p>
            Keep track of your registered events and personal schedule.
          </p>
        </div>

        <div className="calendar-actions">
          <Link to="/student/add-event" className="add-event-btn">
            + Add Personal Event
          </Link>

          <Link to="/student-dashboard" className="back-btn">
            ← Dashboard
          </Link>
        </div>
      </div>

      {/* Calendar */}
      <div className="calendar-container">

        <div className="calendar-top">
          <button className="calendar-nav">←</button>

          <h2>October 2026</h2>

          <button className="calendar-nav">→</button>
        </div>

        <div className="calendar-weekdays">
          <div>Sun</div>
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div>Sat</div>
        </div>

        <div className="calendar-grid">

          <div className="calendar-day empty"></div>
          <div className="calendar-day empty"></div>

          {Array.from({ length: 31 }, (_, index) => {
            const day = index + 1;

            const event = events.find(
              (item) => item.day === String(day)
            );

            return (
              <div
                className={`calendar-day ${
                  event ? "has-event" : ""
                }`}
                key={day}
              >
                <span className="day-number">{day}</span>

                {event && (
                  <div className="calendar-event">
                    <strong>{event.title}</strong>
                    <span>{event.time}</span>
                  </div>
                )}
              </div>
            );
          })}

        </div>
      </div>

      {/* Event List */}
      <div className="calendar-events-section">

        <div className="section-heading">
          <h2>Upcoming Schedule</h2>
          <p>Your registered campus events.</p>
        </div>

        <div className="calendar-event-list">

          {events.map((event) => (
            <div className="schedule-card" key={event.id}>

              <div className="schedule-date">
                <span>{event.month}</span>
                <strong>{event.day}</strong>
              </div>

              <div className="schedule-info">
                <h3>{event.title}</h3>
                <p>{event.time}</p>
                <span>{event.type}</span>
              </div>

            </div>
          ))}

        </div>

      </div>

    </div>
  );
}

export default PersonalCalendar;