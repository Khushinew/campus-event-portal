import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import FacultySidebar from "./FacultySidebar";
import "./EditEvent.css";

function EditEvent() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  const [eventName, setEventName] = useState("");
  const [category, setCategory] = useState("");
  const [verifyDate, setVerifyDate] = useState("");

  const [verified, setVerified] = useState(false);
  const [verificationError, setVerificationError] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    category: "",
    date: "",
    time: "",
    venue: "",
    description: "",
    max_participants: "",
  });

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  /* =====================================================
     LOAD EVENT
  ===================================================== */

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

    fetch(`http://localhost:5000/api/events/${id}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Unable to load event");
        }

        return response.json();
      })
      .then((data) => {
        const loadedEvent = {
          title: data.title || data.name || "",
          category: data.category || "",
          date: data.date || "",
          time: data.time || "",
          venue: data.venue || data.location || "",
          description: data.description || "",
          max_participants:
            data.max_participants ||
            data.maxParticipants ||
            "",
        };

        setEvent(loadedEvent);
        setFormData(loadedEvent);
      })
      .catch((err) => {
        console.error(err);
        setError("Unable to load this event.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id, navigate]);

  /* =====================================================
     VERIFY EVENT
  ===================================================== */

  const handleVerify = (e) => {
    e.preventDefault();

    setVerificationError("");

    if (!event) {
      return;
    }

    const enteredName = eventName.trim().toLowerCase();
    const actualName = event.title.trim().toLowerCase();

    const enteredCategory = category.trim().toLowerCase();
    const actualCategory = event.category.trim().toLowerCase();

    const enteredDate = verifyDate;

    if (
      enteredName === actualName &&
      enteredCategory === actualCategory &&
      enteredDate === event.date
    ) {
      setVerified(true);
      setVerificationError("");

      setFormData({
        title: event.title,
        category: event.category,
        date: event.date,
        time: event.time,
        venue: event.venue,
        description: event.description,
        max_participants: event.max_participants,
      });
    } else {
      setVerified(false);

      setVerificationError(
        "Event details do not match. Please check the event name, category and date."
      );
    }
  };

  /* =====================================================
     FORM CHANGE
  ===================================================== */

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  /* =====================================================
     SAVE EVENT
  ===================================================== */

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!verified) {
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `http://localhost:5000/api/events/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update event");
      }

      setSuccess("Event updated successfully!");

      setTimeout(() => {
        navigate("/faculty-dashboard");
      }, 1200);
    } catch (err) {
      console.error(err);

      setError(
        "Unable to update the event. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
    return (
      <div className="edit-event-page">

        {/* FACULTY SIDEBAR */}
        <FacultySidebar />

        {/* Decorative Notes */}
        <div className="edit-note edit-note-left"></div>
        <div className="edit-note edit-note-right"></div>

        <div className="edit-loading">
          <div className="loading-icon">
            ✎
          </div>

          <h2>
            Loading Event...
          </h2>

          <p>
            Please wait while we fetch the event details.
          </p>
        </div>

      </div>
    );
  }

  /* =====================================================
     MAIN PAGE
  ===================================================== */

  return (
    <div className="edit-event-page">

      {/* =================================================
          FACULTY SIDEBAR
      ================================================= */}

      <FacultySidebar />

      {/* Decorative Notes */}

      <div className="edit-note edit-note-left"></div>
      <div className="edit-note edit-note-right"></div>

      {/* =================================================
          EDIT EVENT HEADER
      ================================================= */}

      <header className="edit-event-header">

        <button
          className="back-dashboard-btn"
          onClick={() => navigate("/faculty-dashboard")}
        >
          ← Back to Dashboard
        </button>

        <p className="portal-label">
          FACULTY PORTAL
        </p>

        <h1>
          Edit Campus Event
        </h1>

        <div className="header-line"></div>

        <p className="header-description">
          Verify your event details first, then update
          the information you want to change.
        </p>

      </header>

      {/* =================================================
          MAIN CONTENT
      ================================================= */}

      <main className="edit-event-container">

        {/* =================================================
            ERROR / SUCCESS
        ================================================= */}

        {error && (
          <div className="edit-message error-message">
            ⚠ {error}
          </div>
        )}

        {success && (
          <div className="edit-message success-message">
            ✓ {success}
          </div>
        )}

        {/* =================================================
            VERIFICATION CARD
        ================================================= */}

        <section className="verification-card">

          <div className="verification-title">

            <div className="verification-icon">
              01
            </div>

            <div>
              <p>
                EVENT VERIFICATION
              </p>

              <h2>
                Confirm Event Details
              </h2>
            </div>

          </div>

          <p className="verification-description">
            Enter the event name, category and original date
            exactly as they were created. You can edit the
            remaining details after verification.
          </p>

          <form
            className="verification-form"
            onSubmit={handleVerify}
          >

            {/* EVENT NAME */}

            <div className="form-group">

              <label htmlFor="verify-event-name">
                Event Name
              </label>

              <input
                id="verify-event-name"
                type="text"
                value={eventName}
                onChange={(e) =>
                  setEventName(e.target.value)
                }
                placeholder="Enter event name"
                required
              />

            </div>

            {/* CATEGORY */}

            <div className="form-group">

              <label htmlFor="verify-category">
                Category
              </label>

              <input
                id="verify-category"
                type="text"
                value={category}
                onChange={(e) =>
                  setCategory(e.target.value)
                }
                placeholder="Enter category"
                required
              />

            </div>

            {/* DATE */}

            <div className="form-group">

              <label htmlFor="verify-date">
                Original Event Date
              </label>

              <input
                id="verify-date"
                type="date"
                value={verifyDate}
                onChange={(e) =>
                  setVerifyDate(e.target.value)
                }
                required
              />

            </div>

            <button
              type="submit"
              className="verify-btn"
            >
              {verified
                ? "✓ Event Verified"
                : "Verify Event →"}
            </button>

          </form>

          {verificationError && (
            <div className="verification-error">

              <span>⚠</span>

              {verificationError}

            </div>
          )}

          {verified && (
            <div className="verification-success">

              <span>✓</span>

              Event verified successfully. You can now
              edit the event details below.

            </div>
          )}

        </section>

        {/* =================================================
            EDIT FORM
        ================================================= */}

        <section
          className={`edit-details-card ${
            !verified ? "details-locked" : ""
          }`}
        >

          {!verified && (
            <div className="locked-overlay">

              <div className="lock-icon">
                🔒
              </div>

              <h3>
                Details Locked
              </h3>

              <p>
                Verify Event Name, Category and Date above
                to unlock editing.
              </p>

            </div>
          )}

          {/* FORM HEADER */}

          <div className="edit-details-title">

            <div className="details-icon">
              02
            </div>

            <div>

              <p>
                EVENT DETAILS
              </p>

              <h2>
                Update Event Information
              </h2>

            </div>

          </div>

          <form
            className="edit-event-form"
            onSubmit={handleSubmit}
          >

            {/* EVENT NAME */}

            <div className="form-group">

              <label>
                Event Name
              </label>

              <input
                type="text"
                value={formData.title}
                disabled
              />

              <small>
                Event name cannot be changed.
              </small>

            </div>

            {/* CATEGORY */}

            <div className="form-group">

              <label>
                Category
              </label>

              <input
                type="text"
                value={formData.category}
                disabled
              />

              <small>
                Category cannot be changed.
              </small>

            </div>

            {/* DATE */}

            <div className="form-group">

              <label htmlFor="edit-date">
                Event Date
              </label>

              <input
                id="edit-date"
                name="date"
                type="date"
                value={formData.date}
                onChange={handleChange}
                disabled={!verified}
                required
              />

            </div>

            {/* TIME */}

            <div className="form-group">

              <label htmlFor="edit-time">
                Event Time
              </label>

              <input
                id="edit-time"
                name="time"
                type="time"
                value={formData.time}
                onChange={handleChange}
                disabled={!verified}
                required
              />

            </div>

            {/* VENUE */}

            <div className="form-group">

              <label htmlFor="edit-venue">
                Venue
              </label>

              <input
                id="edit-venue"
                name="venue"
                type="text"
                value={formData.venue}
                onChange={handleChange}
                disabled={!verified}
                placeholder="Enter venue"
                required
              />

            </div>

            {/* MAX STUDENTS */}

            <div className="form-group">

              <label htmlFor="edit-capacity">
                Maximum Students
              </label>

              <input
                id="edit-capacity"
                name="max_participants"
                type="number"
                min="1"
                value={formData.max_participants}
                onChange={handleChange}
                disabled={!verified}
                placeholder="Enter maximum students"
                required
              />

            </div>

            {/* DESCRIPTION */}

            <div className="form-group full-width">

              <label htmlFor="edit-description">
                Description
              </label>

              <textarea
                id="edit-description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                disabled={!verified}
                placeholder="Enter event description"
                rows="6"
                required
              />

            </div>

            {/* BUTTONS */}

            <div className="form-actions">

              <button
                type="button"
                className="cancel-btn"
                onClick={() =>
                  navigate("/faculty-dashboard")
                }
              >
                Cancel
              </button>

              <button
                type="submit"
                className="save-event-btn"
                disabled={!verified || saving}
              >

                {saving ? (
                  <>
                    Saving...
                  </>
                ) : (
                  <>
                    ✓ Save Changes
                  </>
                )}

              </button>

            </div>

          </form>

        </section>

      </main>

    </div>
  );
}

export default EditEvent;