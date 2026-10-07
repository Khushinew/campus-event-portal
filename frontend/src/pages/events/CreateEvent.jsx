import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./CreateEvent.css";


function CreateEvent() {
  const navigate = useNavigate();


  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    venue: "",
    category: "",
    capacity: "",
  });


  const [loading, setLoading] = useState(false);


  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };


  const handleSubmit = async (e) => {
    e.preventDefault();


    const savedUser = localStorage.getItem("user");


    if (!savedUser) {
      navigate("/login");
      return;
    }


    const user = JSON.parse(savedUser);


    setLoading(true);


    try {
      const response = await fetch(
        "http://localhost:5000/api/events",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...formData,
            facultyId: user.id,
            createdBy: user.name,
          }),
        }
      );


      if (response.ok) {
        alert("Event created successfully!");


        setFormData({
          title: "",
          description: "",
          date: "",
          time: "",
          venue: "",
          category: "",
          capacity: "",
        });


        navigate("/faculty/events");
      } else {
        alert("Failed to create event.");
      }
    } catch (error) {
      console.error("Error creating event:", error);
      alert("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="create-event-page">


      {/* Decorative notebook elements */}
      <div className="create-note note-left"></div>
      <div className="create-note note-right"></div>


      <main className="create-event-main">


        {/* Header */}
        <header className="create-event-header">


          <div>
            <Link to="/faculty-dashboard" className="create-back-btn">
              ← Back to Dashboard
            </Link>


            <p className="create-event-label">
              FACULTY PORTAL
            </p>


            <h1>Create Campus Event</h1>


            <p className="create-event-subtitle">
              Add a new event for students and manage your campus activities.
            </p>
          </div>


        </header>


        {/* Form */}
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


            {/* Event Name */}
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


            {/* Description */}
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


            {/* Row */}
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


            {/* Row */}
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


            {/* Capacity */}
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


            {/* Buttons */}
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
                {loading ? "Creating..." : "Create Event →"}
              </button>


            </div>


          </form>


        </section>


      </main>


    </div>
  );
}


export default CreateEvent;

