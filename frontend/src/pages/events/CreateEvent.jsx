import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./CreateEvent.css";
import FacultySidebar from "./FacultySidebar";
import Footer from "../../components/Footer";

function CreateEvent() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    venue: "",
    category: "",
    domain: "",
    capacity: "",
  });

  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState(null);
const [imagePreview, setImagePreview] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };
  const handleImageChange = (e) => {
  const file = e.target.files[0];

  if (!file) return;

  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
    alert("Please select a JPG, PNG, or WebP image.");
    e.target.value = "";
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    alert("Image must be 5 MB or smaller.");
    e.target.value = "";
    return;
  }

  setImage(file);
  setImagePreview(URL.createObjectURL(file));
};

  const handleSubmit = async (e) => {
  e.preventDefault();

  const savedUser = sessionStorage.getItem("user");
  const token = sessionStorage.getItem("token");

  if (!savedUser || !token) {
    navigate("/login");
    return;
  }

  let user;

  try {
    user = JSON.parse(savedUser);
  } catch {
    alert("Your saved login session is invalid. Please log in again.");
    navigate("/login");
    return;
  }

  if (user.role !== "faculty") {
    alert("Only faculty members can create events.");
    return;
  }

  setLoading(true);

  try {
   const payload = new FormData();

Object.entries(formData).forEach(([key, value]) => {
  payload.append(key, value);
});

payload.set("capacity", String(Number(formData.capacity)));

if (image) {
  payload.append("image", image);
}

const response = await fetch("http://localhost:5000/api/events", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${token}`,
  },
  body: payload,
});

    const result = await response.json();

    if (!response.ok) {
      alert(result.message || "Failed to create event.");
      console.error("Create event failed:", result);
      return;
    }

    alert("Event created successfully!");

    setFormData({
      title: "",
      description: "",
      date: "",
      time: "",
      venue: "",
      category: "",
      domain: "",
      capacity: "",
    });

    navigate("/faculty/events");
  } catch (error) {
    console.error("Error creating event:", error);
    alert("Could not connect to the server. Please try again.");
  } finally {
    setLoading(false);
    setImage(null);
    setImagePreview("");
  }
};

  return (
    <div className="create-event-page">

      {/* =================================================
          FACULTY SIDEBAR
      ================================================= */}

      <FacultySidebar />

      {/* Decorative notebook elements */}

      <div className="create-note note-left"></div>
      <div className="create-note note-right"></div>

      <main className="create-event-main">

        {/* =================================================
            HEADER
        ================================================= */}

        <header className="create-event-header">

          <div>

            <Link
              to="/faculty-dashboard"
              className="create-back-btn"
            >
              ← Back to Dashboard
            </Link>

            <p className="create-event-label">
              FACULTY PORTAL
            </p>

            <h1>
              Create Campus Event
            </h1>

            <p className="create-event-subtitle">
              Add a new event for students and manage your campus activities.
            </p>

          </div>

        </header>

        {/* =================================================
            FORM
        ================================================= */}

        <section className="create-event-card">

          <div className="form-paperclip"></div>

          <div className="form-title-area">

            <div className="form-icon">
              +
            </div>

            <div>

              <p className="form-label">
                NEW EVENT
              </p>

              <h2>
                Event Information
              </h2>

              <p>
                Fill in the details below to create your campus event.
              </p>

            </div>

          </div>

          <form onSubmit={handleSubmit}>

            {/* =================================================
                EVENT NAME
            ================================================= */}

            <div className="form-group">

              <label>
                Event Name
              </label>

              <input
                type="text"
                name="title"
                placeholder="Enter event name"
                value={formData.title}
                onChange={handleChange}
                required
              />

            </div>

            {/* =================================================
                DESCRIPTION
            ================================================= */}

            <div className="form-group">

              <label>
                Description
              </label>

              <textarea
                name="description"
                placeholder="Describe your event..."
                value={formData.description}
                onChange={handleChange}
                rows="5"
                required
              ></textarea>

            </div>

            {/* =================================================
                DATE + TIME
            ================================================= */}

            <div className="form-row">

              <div className="form-group">

                <label>
                  Date
                </label>

                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                />

              </div>

              <div className="form-group">
                <label htmlFor="event-domain">Domain Type</label>
                <select
                  id="event-domain"
                  name="domain"
                  value={formData.domain}
                  onChange={handleChange}
                >
                  <option value="">Select domain (optional)</option>
                  <option value="Campus">Campus</option>
                  <option value="Intercollegiate">Intercollegiate</option>
                  <option value="State">State</option>
                  <option value="National">National</option>
                  <option value="International">International</option>
                </select>
              </div>

              <div className="form-group">

                <label>
                  Time
                </label>

                <input
                  type="time"
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  required
                />

              </div>

            </div>

            {/* =================================================
                VENUE + CATEGORY
            ================================================= */}

            <div className="form-row">

              <div className="form-group">

                <label>
                  Venue
                </label>

                <input
                  type="text"
                  name="venue"
                  placeholder="e.g. Seminar Hall"
                  value={formData.venue}
                  onChange={handleChange}
                  required
                />

              </div>

              <div className="form-group">

                <label>
                  Category
                </label>

                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                >

                  <option value="">
                    Select category
                  </option>

                  <option value="Technical">
                    Technical
                  </option>

                  <option value="Cultural">
                    Cultural
                  </option>

                  <option value="Sports">
                    Sports
                  </option>

                  <option value="Workshop">
                    Workshop
                  </option>

                  <option value="Seminar">
                    Seminar
                  </option>

                  <option value="Other">
                    Other
                  </option>

                </select>

              </div>

            </div>

            
<div className="form-group">
  <label htmlFor="event-image">Event Image (optional)</label>

  <input
    id="event-image"
    type="file"
    accept="image/jpeg,image/png,image/webp"
    onChange={handleImageChange}
  />

  {imagePreview && (
    <img
      src={imagePreview}
      alt="Event preview"
      style={{
        display: "block",
        width: "100%",
        maxWidth: "320px",
        maxHeight: "200px",
        objectFit: "cover",
        marginTop: "12px",
        borderRadius: "8px",
      }}
    />
  )}
</div>


            {/* =================================================
                CAPACITY
            ================================================= */}

            <div className="form-group capacity-group">

              <label>
                Maximum Participants
              </label>

              <input
                type="number"
                name="capacity"
                placeholder="Enter maximum participants"
                min="1"
                value={formData.capacity}
                onChange={handleChange}
                required
              />

            </div>

            {/* =================================================
                BUTTONS
            ================================================= */}

            <div className="form-actions">

              <Link
                to="/faculty-dashboard"
                className="cancel-btn"
              >
                Cancel
              </Link>

              <button
                type="submit"
                className="save-event-btn"
                disabled={loading}
              >
                {loading
                  ? "Creating..."
                  : "Create Event →"}
              </button>

            </div>

          </form>

        </section>

      </main>
      <Footer />

    </div>
  );
}

export default CreateEvent;