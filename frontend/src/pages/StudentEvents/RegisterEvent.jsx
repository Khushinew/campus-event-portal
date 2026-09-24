import { Link } from "react-router-dom";
import "./RegisterEvent.css";

function RegisterEvent() {
  const event = {
    title: "Tech Fest 2026",
    date: "15 October 2026",
    time: "10:00 AM - 4:00 PM",
    venue: "Main Auditorium",
    category: "Technology",
    description:
      "A campus technology event featuring workshops, competitions and technical sessions.",
  };

  const handleRegister = (e) => {
    e.preventDefault();
    alert("Registration submitted successfully!");
  };

  return (
    <div className="register-event-page">

      {/* Header */}
      <div className="register-header">
        <div>
          <h1>Register for Event</h1>
          <p>Complete the form below to register for the event.</p>
        </div>

        <Link to="/student-dashboard" className="back-btn">
          ← Dashboard
        </Link>
      </div>

      {/* Main Content */}
      <div className="register-container">

        {/* Event Information */}
        <div className="event-summary">
          <span className="event-category">{event.category}</span>

          <h2>{event.title}</h2>

          <p className="event-description">
            {event.description}
          </p>

          <div className="event-details">
            <p>
              <strong>Date:</strong> {event.date}
            </p>

            <p>
              <strong>Time:</strong> {event.time}
            </p>

            <p>
              <strong>Venue:</strong> {event.venue}
            </p>
          </div>
        </div>

        {/* Registration Form */}
        <div className="registration-card">
          <h2>Registration Form</h2>
          <p className="form-subtitle">
            Enter your details to register for this event.
          </p>

          <form onSubmit={handleRegister}>

            <div className="form-group">
              <label htmlFor="studentName">Full Name</label>
              <input
                type="text"
                id="studentName"
                placeholder="Enter your full name"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="studentEmail">Email Address</label>
              <input
                type="email"
                id="studentEmail"
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="studentId">Student ID</label>
              <input
                type="text"
                id="studentId"
                placeholder="Enter your student ID"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="department">Department</label>

              <select id="department" required>
                <option value="">Select your department</option>
                <option value="Computer Science">
                  Computer Science
                </option>
                <option value="Information Technology">
                  Information Technology
                </option>
                <option value="Electronics">
                  Electronics
                </option>
                <option value="Mechanical">
                  Mechanical
                </option>
                <option value="Civil">
                  Civil
                </option>
                <option value="Other">
                  Other
                </option>
              </select>
            </div>

            <button type="submit" className="register-btn">
              Register for Event →
            </button>

          </form>
        </div>

      </div>

    </div>
  );
}

export default RegisterEvent;