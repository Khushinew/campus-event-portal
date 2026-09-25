import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import "./AddPersonalEvent.css";

function AddPersonalEvent() {
  const navigate = useNavigate();

  const [eventTitle, setEventTitle] = useState("");
  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [hour, setHour] = useState("");
  const [minute, setMinute] = useState("");
  const [ampm, setAmpm] = useState("");
  const [duration, setDuration] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    const monthNumbers = {
      January: "01",
      February: "02",
      March: "03",
      April: "04",
      May: "05",
      June: "06",
      July: "07",
      August: "08",
      September: "09",
      October: "10",
      November: "11",
      December: "12",
    };

    const formattedDate = `${year}-${monthNumbers[month]}-${day.padStart(
      2,
      "0"
    )}`;

    const formattedTime = `${hour}:${minute} ${ampm}`;

    const newEvent = {
      id: Date.now(),
      title: eventTitle,
      date: formattedDate,
      displayDate: `${day} ${month} ${year}`,
      time: formattedTime,
      duration: duration,
      location: location,
      description: description,
      type: "Personal Event",
    };

    const existingEvents =
      JSON.parse(localStorage.getItem("campusPersonalEvents")) || [];

    const updatedEvents = [...existingEvents, newEvent];

    localStorage.setItem(
      "campusPersonalEvents",
      JSON.stringify(updatedEvents)
    );

    alert("Personal event added successfully!");

    navigate("/student/calendar");
  };

  return (
    <div className="add-personal-event-page">

      <div className="add-event-header">
        <div>
          <h1>Add Personal Event</h1>
          <p>Add your own commitments to your personal calendar.</p>
        </div>

        <Link to="/student/calendar" className="back-btn">
          ← Calendar
        </Link>
      </div>

      <div className="add-event-container">

        <div className="add-event-card">

          <div className="form-icon">➕</div>

          <h2>Personal Event Details</h2>

          <p className="form-description">
            Enter the details of your personal commitment or activity.
          </p>

          <form onSubmit={handleSubmit}>

            {/* EVENT TITLE */}
            <div className="form-group">
              <label htmlFor="eventTitle">Event Title</label>

              <input
                type="text"
                id="eventTitle"
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
                placeholder="e.g. Project Meeting"
                required
              />
            </div>

            {/* DATE */}
            <div className="form-group">
              <label>Date</label>

              <div className="date-select-row">

                <select
                  value={day}
                  onChange={(e) => setDay(e.target.value)}
                  required
                >
                  <option value="">Day</option>

                  {Array.from({ length: 31 }, (_, index) => (
                    <option
                      key={index + 1}
                      value={String(index + 1)}
                    >
                      {index + 1}
                    </option>
                  ))}
                </select>

                <select
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  required
                >
                  <option value="">Month</option>
                  <option>January</option>
                  <option>February</option>
                  <option>March</option>
                  <option>April</option>
                  <option>May</option>
                  <option>June</option>
                  <option>July</option>
                  <option>August</option>
                  <option>September</option>
                  <option>October</option>
                  <option>November</option>
                  <option>December</option>
                </select>

                <select
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  required
                >
                  <option value="">Year</option>
                  <option>2026</option>
                  <option>2027</option>
                  <option>2028</option>
                  <option>2029</option>
                  <option>2030</option>
                </select>

              </div>
            </div>

            {/* TIME */}
            <div className="form-group">
              <label>Time</label>

              <div className="time-select-row">

                <select
                  value={hour}
                  onChange={(e) => setHour(e.target.value)}
                  required
                >
                  <option value="">Hour</option>
                  <option>01</option>
                  <option>02</option>
                  <option>03</option>
                  <option>04</option>
                  <option>05</option>
                  <option>06</option>
                  <option>07</option>
                  <option>08</option>
                  <option>09</option>
                  <option>10</option>
                  <option>11</option>
                  <option>12</option>
                </select>

                <select
                  value={minute}
                  onChange={(e) => setMinute(e.target.value)}
                  required
                >
                  <option value="">Minute</option>
                  <option>00</option>
                  <option>15</option>
                  <option>30</option>
                  <option>45</option>
                </select>

                <select
                  value={ampm}
                  onChange={(e) => setAmpm(e.target.value)}
                  required
                >
                  <option value="">AM / PM</option>
                  <option>AM</option>
                  <option>PM</option>
                </select>

              </div>
            </div>

            {/* DURATION */}
            <div className="form-group">
              <label htmlFor="eventDuration">Duration</label>

              <select
                id="eventDuration"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                required
              >
                <option value="">Select duration</option>
                <option>30 minutes</option>
                <option>1 hour</option>
                <option>2 hours</option>
                <option>3 hours</option>
                <option>Half day</option>
                <option>Full day</option>
              </select>
            </div>

            {/* LOCATION */}
            <div className="form-group">
              <label htmlFor="eventLocation">Location</label>

              <input
                type="text"
                id="eventLocation"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. College Library"
              />
            </div>

            {/* DESCRIPTION */}
            <div className="form-group">
              <label htmlFor="eventDescription">Description</label>

              <textarea
                id="eventDescription"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add some details about your event..."
                rows="4"
              ></textarea>
            </div>

            {/* BUTTONS */}
            <div className="form-actions">

              <Link
                to="/student/calendar"
                className="cancel-btn"
              >
                Cancel
              </Link>

              <button
                type="submit"
                className="save-event-btn"
              >
                Add to Calendar →
              </button>

            </div>

          </form>

        </div>

      </div>

    </div>
  );
}

export default AddPersonalEvent;