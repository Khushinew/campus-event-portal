
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import FacultySidebar from "./FacultySidebar";
import "./EditEvent.css";

const API_URL = "http://localhost:5000/api/events";

function EditEvent() {
  const { eventId } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    venue: "",
    category: "",
    capacity: 100,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Load the selected event from MongoDB.
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("token");

        const response = await fetch(`${API_URL}/${eventId}`, {
          headers: {
            Authorization: `Bearer ${token || ""}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Unable to load event.");
        }

        const selectedEvent = data.event || data;

        setEvent({
          title: selectedEvent.title || "",
          description: selectedEvent.description || "",
          date: selectedEvent.date
            ? String(selectedEvent.date).slice(0, 10)
            : "",
          time: selectedEvent.time || "",
          venue: selectedEvent.venue || "",
          category: selectedEvent.category || "",
          capacity: selectedEvent.capacity ?? 100,
        });
      } catch (err) {
        setError(err.message || "Unable to load event details.");
      } finally {
        setLoading(false);
      }
    };

    if (eventId) {
      fetchEvent();
    } else {
      setError("Event ID is missing.");
      setLoading(false);
    }
  }, [eventId]);

  // Handle form changes.
  const handleChange = (e) => {
    const { name, value } = e.target;

    setEvent((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // Save event changes.
  const handleSubmit = async (e) => {
    e.preventDefault();

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Your session has expired. Please log in again.");
      }

      const response = await fetch(`${API_URL}/${eventId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          date: event.date,
          time: event.time,
          venue: event.venue.trim(),
          category: event.category.trim(),
          capacity: Number(event.capacity),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to update event.");
      }

      setSuccess("Event details updated successfully!");

      // Return to the Edit Your Events list after saving.
      setTimeout(() => {
        navigate("/faculty/edit-events");
      }, 1000);
    } catch (err) {
      setError(err.message || "Something went wrong while saving.");
    } finally {
      setSaving(false);
    }
  };

  // Loading screen.
  if (loading) {
    return (
      <div className="edit-event-layout">
        <FacultySidebar />

        <main className="edit-event-page">
          <div className="edit-event-status">
            <span className="loading-spinner" />
            Loading event details...
          </div>
        </main>
      </div>
    );
  }

  // Error screen if the event could not be loaded.
  if (error && !event.title) {
    return (
      <div className="edit-event-layout">
        <FacultySidebar />

        <main className="edit-event-page">
          <section className="edit-event-header">
            <p className="portal-label">Faculty Portal</p>
            <h1>Edit Your Event</h1>
            <div className="header-line" />

            <p className="header-description">
              We could not load the selected event.
            </p>
          </section>

          <div className="edit-event-feedback verification-error">
            {error}
          </div>

          <div className="edit-event-back">
            <button
              type="button"
              className="back-dashboard-btn"
              onClick={() => navigate("/faculty/edit-events")}
            >
              ← Back To Edit Events
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="edit-event-layout">
      <FacultySidebar />

      <main className="edit-event-page">
        {/* Page header */}
        <header className="edit-event-header">
          <p className="portal-label">Faculty Portal</p>

          <h1>Edit Your Event</h1>

          <div className="header-line" />

          <p className="header-description">
            Update your event schedule and arrangements while keeping
            the original event name and description unchanged.
          </p>

          <button
            type="button"
            className="back-dashboard-btn"
            onClick={() => navigate("/faculty/edit-events")}
          >
            ← Back to Edit Events
          </button>
        </header>

        {/* Read-only event information */}
        <section className="edit-details-card">
          <div className="edit-details-title">
            <div className="details-icon">✎</div>

            <div>
              <p>Selected Event</p>
              <h2>Event Information</h2>
            </div>
          </div>

          <div className="edit-event-form">
            <div className="form-group full-width">
              <label htmlFor="event-title">Event Name</label>

              <input
                id="event-title"
                type="text"
                value={event.title}
                readOnly
                aria-readonly="true"
                className="readonly-field"
              />

              <small>Event name cannot be changed here.</small>
            </div>

            <div className="form-group full-width">
              <label htmlFor="event-description">Description</label>

              <textarea
                id="event-description"
                value={event.description}
                readOnly
                aria-readonly="true"
                rows={4}
                className="readonly-field"
              />

              <small>
                Event description cannot be changed here.
              </small>
            </div>
          </div>
        </section>

        {/* Editable event details */}
        <section className="edit-details-card editable-details-card">
          <div className="edit-details-title">
            <div className="details-icon">✎</div>

            <div>
              <p>Make Changes</p>
              <h2>Schedule &amp; Arrangements</h2>
            </div>
          </div>

          {error && (
            <div className="edit-event-feedback verification-error">
              {error}
            </div>
          )}

          {success && (
            <div className="edit-event-feedback verification-success">
              ✓ {success}
            </div>
          )}

          <form className="edit-event-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="date">Event Date</label>

              <input
                id="date"
                type="date"
                name="date"
                value={event.date}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="time">Event Time</label>

              <input
                id="time"
                type="time"
                name="time"
                value={event.time}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group full-width">
              <label htmlFor="venue">Venue</label>

              <input
                id="venue"
                type="text"
                name="venue"
                value={event.venue}
                onChange={handleChange}
                placeholder="Enter event venue"
                maxLength={200}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="category">Event Category</label>

              <select
                id="category"
                name="category"
                value={event.category}
                onChange={handleChange}
                required
              >
                <option value="">Select category</option>

                {[
                  "Cultural",
                  "Technical",
                  "Workshop",
                  "Sports",
                  "Academic",
                  "Seminar",
                  "Other",
                ].map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}

                {![
                  "Cultural",
                  "Technical",
                  "Workshop",
                  "Sports",
                  "Academic",
                  "Seminar",
                  "Other",
                ].includes(event.category) &&
                  event.category && (
                    <option value={event.category}>
                      {event.category}
                    </option>
                  )}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="capacity">Event Capacity</label>

              <input
                id="capacity"
                type="number"
                name="capacity"
                value={event.capacity}
                onChange={handleChange}
                min="1"
                step="1"
                required
              />
            </div>

            <div className="edit-form-note full-width">
              <span className="note-star">✦</span>
              Only the date, time, venue, category, and capacity will
              be updated. The event name and description will remain
              unchanged.
            </div>

            <div className="edit-form-actions full-width">
              <button
                type="button"
                className="cancel-edit-btn"
                onClick={() => navigate("/faculty/edit-events")}
                disabled={saving}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="verify-btn save-event-btn"
                disabled={saving}
              >
                {saving ? "Saving Changes..." : "Save Changes →"}
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}

export default EditEvent;
