import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import "./CreateEvent.css";
import FacultySidebar from "./FacultySidebar";
import Footer from "../../components/Footer";

const ATTENDANCE_DEPARTMENTS = [
  "BBA",
  "BTech",
  "BCA",
  "Chemical",
  "MBA",
  "Biotech",
  "MSc",
];
const ATTENDANCE_YEAR_RANGES = [
  "2024-2028",
  "2024-2029",
  "2024-2025",
  "2022-2025",
];

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
    participationFeeRequired: false,
    participationFee: "",
    paymentMode: "",
    attendanceEnabled: false,
    attendanceType: "",
    attendanceDepartments: [],
    attendanceYears: [],
  });

  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [attendanceModalOpen, setAttendanceModalOpen] = useState(false);
  const [attendanceDraft, setAttendanceDraft] = useState({
    attendanceType: "",
    attendanceDepartments: [],
    attendanceYears: [],
  });
  const [attendanceError, setAttendanceError] = useState("");

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

  const openAttendanceSettings = () => {
    setAttendanceDraft({
      attendanceType: formData.attendanceType,
      attendanceDepartments: formData.attendanceDepartments,
      attendanceYears: formData.attendanceYears,
    });
    setAttendanceError("");
    setAttendanceModalOpen(true);
  };

  const saveAttendanceSettings = () => {
    const needsDepartment = ["compulsory", "both"].includes(
      attendanceDraft.attendanceType
    );

    if (!attendanceDraft.attendanceType) {
      setAttendanceError("Choose an attendance option to continue.");
      return;
    }
    if (needsDepartment && !attendanceDraft.attendanceDepartments.length) {
      setAttendanceError(
        "Select at least one student department for attendance tracking."
      );
      return;
    }
    if (
      needsDepartment &&
      !attendanceDraft.attendanceYears.length
    ) {
      setAttendanceError("Select at least one student year range.");
      return;
    }

    setFormData((previous) => ({
      ...previous,
      attendanceEnabled: true,
      attendanceType: attendanceDraft.attendanceType,
      attendanceDepartments: needsDepartment
        ? attendanceDraft.attendanceDepartments
        : [],
      attendanceYears: needsDepartment
        ? attendanceDraft.attendanceYears
        : [],
    }));
    setAttendanceError("");
    setAttendanceModalOpen(false);
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
  payload.append(
    key,
    Array.isArray(value) ? JSON.stringify(value) : value
  );
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
      participationFeeRequired: false,
      participationFee: "",
      paymentMode: "",
      attendanceEnabled: false,
      attendanceType: "",
      attendanceDepartments: [],
      attendanceYears: [],
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

            <fieldset className="form-group participation-fee-group">
              <legend>Participation Fee</legend>
              <label className="fee-checkbox-label">
                <input
                  type="checkbox"
                  name="participationFeeRequired"
                  checked={formData.participationFeeRequired}
                  onChange={(event) =>
                    setFormData((previous) => ({
                      ...previous,
                      participationFeeRequired: event.target.checked,
                      participationFee: event.target.checked
                        ? previous.participationFee
                        : "",
                      paymentMode: event.target.checked
                        ? previous.paymentMode
                        : "",
                    }))
                  }
                />
                Charge a participation fee
              </label>

              {formData.participationFeeRequired && (
                <div className="form-row fee-details-row">
                  <div className="form-group">
                    <label htmlFor="participation-fee-amount">
                      Fee Amount
                    </label>
                    <input
                      id="participation-fee-amount"
                      type="number"
                      name="participationFee"
                      placeholder="Enter fee amount"
                      min="0.01"
                      step="0.01"
                      value={formData.participationFee}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="payment-mode">
                      Payment Method
                    </label>
                    <select
                      id="payment-mode"
                      name="paymentMode"
                      value={formData.paymentMode}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select payment method</option>
                      <option value="Online">Online</option>
                      <option value="Offline">Offline</option>
                    </select>
                  </div>
                </div>
              )}
            </fieldset>

            <fieldset className="form-group participation-fee-group">
              <legend>Attendance</legend>
              <label className="fee-checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.attendanceEnabled}
                  onChange={(event) => {
                    if (event.target.checked) {
                      openAttendanceSettings();
                      return;
                    }

                    setFormData((previous) => ({
                      ...previous,
                      attendanceEnabled: false,
                      attendanceType: "",
                      attendanceDepartments: [],
                      attendanceYears: [],
                    }));
                  }}
                />
                Set attendance requirements
              </label>

              {formData.attendanceEnabled && (
                <p className="attendance-summary">
                  {formData.attendanceType === "compulsory"
                    ? `Compulsory for ${formData.attendanceDepartments.join(", ")}`
                    : formData.attendanceType === "both"
                      ? `Open registration; attendance tracked for ${formData.attendanceDepartments.join(", ")}`
                      : "Open to anyone who registers"}
                  {formData.attendanceYears.length > 0 &&
                    ` · Year ranges: ${formData.attendanceYears.join(", ")}`}
                  <button
                    type="button"
                    className="attendance-edit-button"
                    onClick={openAttendanceSettings}
                  >
                    Edit
                  </button>
                </p>
              )}
            </fieldset>

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

          {attendanceModalOpen && createPortal(
            <div
              className="attendance-modal-backdrop"
              role="presentation"
              onMouseDown={(event) => {
                if (event.target === event.currentTarget) {
                  setAttendanceModalOpen(false);
                }
              }}
            >
              <section
                className="attendance-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="attendance-modal-title"
              >
                <button
                  type="button"
                  className="attendance-modal-close"
                  onClick={() => setAttendanceModalOpen(false)}
                  aria-label="Close attendance settings"
                >
                  ×
                </button>
                <p className="form-label">EVENT ATTENDANCE</p>
                <h2 id="attendance-modal-title">Attendance Requirements</h2>
                <p className="attendance-modal-description">
                  Choose who may register and whether a student department must
                  be tracked.
                </p>

                <div className="attendance-options">
                  <label>
                    <input
                      type="radio"
                      name="attendanceType"
                      value="compulsory"
                      checked={attendanceDraft.attendanceType === "compulsory"}
                      onChange={(event) =>
                        setAttendanceDraft((previous) => ({
                          ...previous,
                          attendanceType: event.target.value,
                        }))
                      }
                    />
                    <span>
                      <strong>Compulsory</strong>
                      <small>Only the selected department can register.</small>
                    </span>
                  </label>

                  <label>
                    <input
                      type="radio"
                      name="attendanceType"
                      value="open"
                      checked={attendanceDraft.attendanceType === "open"}
                      onChange={(event) =>
                        setAttendanceDraft((previous) => ({
                          ...previous,
                          attendanceType: event.target.value,
                          attendanceDepartments: [],
                          attendanceYears: [],
                        }))
                      }
                    />
                    <span>
                      <strong>Anyone with registration</strong>
                      <small>
                        Keep registration open without a required cohort.
                      </small>
                    </span>
                  </label>

                  <label>
                    <input
                      type="radio"
                      name="attendanceType"
                      value="both"
                      checked={attendanceDraft.attendanceType === "both"}
                      onChange={(event) =>
                        setAttendanceDraft((previous) => ({
                          ...previous,
                          attendanceType: event.target.value,
                        }))
                      }
                    />
                    <span>
                      <strong>Both</strong>
                      <small>
                        Anyone may register, and the selected department is
                        tracked as compulsory.
                      </small>
                    </span>
                  </label>
                </div>

                {["compulsory", "both"].includes(
                  attendanceDraft.attendanceType
                ) && (
                  <>
                    <fieldset className="attendance-multi-select">
                      <legend>Required student departments</legend>
                      <div className="attendance-checkbox-grid">
                        {ATTENDANCE_DEPARTMENTS.map((department) => (
                          <label key={department}>
                            <input
                              type="checkbox"
                              checked={attendanceDraft.attendanceDepartments.includes(
                                department
                              )}
                              onChange={(event) =>
                                setAttendanceDraft((previous) => ({
                                  ...previous,
                                  attendanceDepartments: event.target.checked
                                    ? [
                                        ...previous.attendanceDepartments,
                                        department,
                                      ]
                                    : previous.attendanceDepartments.filter(
                                        (item) => item !== department
                                      ),
                                }))
                              }
                            />
                            {department}
                          </label>
                        ))}
                      </div>
                    </fieldset>

                    <fieldset className="attendance-multi-select">
                      <legend>Student year ranges</legend>
                      <div className="attendance-checkbox-grid">
                        {ATTENDANCE_YEAR_RANGES.map((yearRange) => (
                          <label key={yearRange}>
                            <input
                              type="checkbox"
                              checked={attendanceDraft.attendanceYears.includes(
                                yearRange
                              )}
                              onChange={(event) =>
                                setAttendanceDraft((previous) => ({
                                  ...previous,
                                  attendanceYears: event.target.checked
                                    ? [...previous.attendanceYears, yearRange]
                                    : previous.attendanceYears.filter(
                                        (item) => item !== yearRange
                                      ),
                                }))
                              }
                            />
                            {yearRange}
                          </label>
                        ))}
                      </div>
                      <small className="attendance-year-note">
                        Year ranges are saved with the event. Attendance
                        counts currently use department only because student
                        directory records do not identify these ranges.
                      </small>
                    </fieldset>
                  </>
                )}

                {attendanceError && (
                  <p className="attendance-modal-error" role="alert">
                    {attendanceError}
                  </p>
                )}

                <div className="attendance-modal-actions">
                  <button
                    type="button"
                    className="cancel-btn"
                    onClick={() => setAttendanceModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="save-event-btn"
                    onClick={saveAttendanceSettings}
                  >
                    Save Attendance
                  </button>
                </div>
              </section>
            </div>,
            document.body
          )}

        </section>

      </main>
      <Footer />

    </div>
  );
}

export default CreateEvent;