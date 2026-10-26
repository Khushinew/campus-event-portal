import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { apiRequest } from "../../api";
import "./AddPersonalEvent.css";
import Footer from "../../components/Footer";

function AddPersonalEvent() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (
      Number.isNaN(start.getTime()) ||
      Number.isNaN(end.getTime()) ||
      end < start
    ) {
      setError("The end date and time must be on or after the start.");
      return;
    }

    setSaving(true);
    try {
      const response = await apiRequest("/api/personal-events", {
        method: "POST",
        body: JSON.stringify({
          title,
          description,
          startDate: start.toISOString(),
          endDate: end.toISOString(),
          location,
          isPublic,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Unable to add your event.");
      }

      navigate("/student/calendar");
    } catch (submitError) {
      console.error("Error adding personal event:", submitError);
      setError(submitError.message || "Unable to add your event. Please try again.");
    } finally {
      setSaving(false);
    }
  }

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
            <div className="form-group">
              <label htmlFor="eventTitle">Event Title</label>
              <input
                type="text"
                id="eventTitle"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="e.g. Project Meeting"
                maxLength={160}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="eventStartDate">Starts</label>
                <input
                  type="datetime-local"
                  id="eventStartDate"
                  value={startDate}
                  onChange={(event) => setStartDate(event.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="eventEndDate">Ends</label>
                <input
                  type="datetime-local"
                  id="eventEndDate"
                  value={endDate}
                  min={startDate || undefined}
                  onChange={(event) => setEndDate(event.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="eventLocation">Location</label>
              <input
                type="text"
                id="eventLocation"
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                placeholder="e.g. College Library"
                maxLength={200}
              />
            </div>

            <div className="form-group">
              <label htmlFor="eventDescription">Description</label>
              <textarea
                id="eventDescription"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Add some details about your event..."
                rows="4"
              />
            </div>

            <div className="form-group event-visibility">
              <label htmlFor="eventVisibility">
                <input
                  type="checkbox"
                  id="eventVisibility"
                  checked={isPublic}
                  onChange={(event) => setIsPublic(event.target.checked)}
                />
                Share this event with other students
              </label>
            </div>

            {error && <p className="event-form-error" role="alert">{error}</p>}

            <div className="form-actions">
              <Link to="/student/calendar" className="cancel-btn">
                Cancel
              </Link>

              <button
                type="submit"
                className="save-event-btn"
                disabled={saving}
              >
                {saving ? "Adding..." : "Add to Calendar →"}
              </button>
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default AddPersonalEvent;
