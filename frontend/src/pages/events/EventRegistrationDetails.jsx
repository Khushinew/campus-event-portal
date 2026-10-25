
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import FacultySidebar from "./FacultySidebar";
import Footer from "../../components/Footer";
import "./EventRegistrationDetails.css";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
const CHART_COLORS = [
  "#6b8fbd",
  "#e5b567",
  "#8eb7a1",
  "#c78f9a",
  "#9b91c6",
  "#d39a70",
];

function EventRegistrationDetails() {
  const { eventId } = useParams();

  const [event, setEvent] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDetails() {
      const token = localStorage.getItem("token");

      if (!token) {
        setError("Please log in again to view registrations.");
        setLoading(false);
        return;
      }

      try {
        const headers = {
          Authorization: `Bearer ${token}`,
        };

        const [eventResponse, registrationResponse] = await Promise.all([
          fetch(`http://localhost:5000/api/events/${eventId}`, {
            headers,
          }),
          fetch(
            `http://localhost:5000/api/events/${eventId}/registrations`,
            { headers }
          ),
        ]);

        const eventData = await eventResponse.json();
        const registrationData = await registrationResponse.json();

        if (!eventResponse.ok) {
          throw new Error(eventData.message || "Unable to load event.");
        }

        if (!registrationResponse.ok) {
          throw new Error(
            registrationData.message || "Unable to load registrations."
          );
        }

        setEvent(eventData);
        setStudents(
          Array.isArray(registrationData)
            ? registrationData
            : registrationData.registrations ||
                registrationData.students ||
                []
        );
      } catch (err) {
        console.error("Registration details error:", err);
        setError(err.message || "Failed to load registration details.");
      } finally {
        setLoading(false);
      }
    }

    loadDetails();
  }, [eventId]);

  const analytics = useMemo(() => {
    const uniqueStudents = new Set(
      students.map((student) => student._id || student.id || student.email)
    ).size;

    const semesterCounts = {};
    const departmentCounts = {};

    students.forEach((student) => {
      const semester = student.semester || "Not specified";
      const department = student.department || "Not specified";

      semesterCounts[semester] = (semesterCounts[semester] || 0) + 1;
      departmentCounts[department] =
        (departmentCounts[department] || 0) + 1;
    });

    const capacity = Number(event?.capacity) || 0;

    return {
      total: students.length,
      unique: uniqueStudents,
      capacity,
      remaining: Math.max(capacity - students.length, 0),
      percentage:
        capacity > 0
          ? Math.min((students.length / capacity) * 100, 100)
          : 0,
      semesters: Object.entries(semesterCounts).sort(([a], [b]) =>
        a.localeCompare(b, undefined, { numeric: true })
      ),
      departments: Object.entries(departmentCounts).sort(
        (a, b) => b[1] - a[1]
      ),
    };
  }, [students, event]);

  function renderSemesterChart(entries) {
  const data = entries.map(([name, value]) => ({
    name: name === "Not specified" ? name : `Semester ${name}`,
    value,
  }));

  return (
    <section className="analytics-panel">
      <h2>Registrations by Semester</h2>

      {data.length === 0 ? (
        <p className="analytics-empty">
          No registration data available yet.
        </p>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={85}
              label={({ name, percent }) =>
                `${name}: ${(percent * 100).toFixed(0)}%`
              }
            >
              {data.map((item, index) => (
                <Cell
                  key={item.name}
                  fill={CHART_COLORS[index % CHART_COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      )}
    </section>
  );
}

function renderDepartmentChart(entries) {
  const data = entries.map(([department, registrations]) => ({
    department,
    registrations,
  }));

  return (
    <section className="analytics-panel">
      <h2>Registrations by Department</h2>

      {data.length === 0 ? (
        <p className="analytics-empty">
          No registration data available yet.
        </p>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="department"
              interval={0}
              angle={-15}
              textAnchor="end"
              height={65}
              tick={{ fontSize: 11 }}
            />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar
              dataKey="registrations"
              name="Registrations"
              fill="#6b8fbd"
              radius={[5, 5, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </section>
  );
}

  return (
    <div className="monitor-page">
      <FacultySidebar />

      <main className="monitor-main registration-details-main">
        <header className="monitor-header">
          
<Link to="/faculty/registrations" className="monitor-back-btn">
  ← Back to Events
</Link>


          <p className="monitor-label">Faculty Dashboard</p>

          <h1>Registration Details</h1>

          <div className="title-line" />

          <p className="monitor-subtitle">
            Review student registrations and understand your event's participation.
          </p>
        </header>

        {loading ? (
          <div className="registration-status">Loading registration details...</div>
        ) : error ? (
          <div className="monitor-error" role="alert">
            {error}
          </div>
        ) : event ? (
          <>
            <section className="registration-event-heading">
              <p className="monitor-label">Selected Event</p>
              <h2>{event.title}</h2>
              <p>
                {event.date
                  ? new Date(event.date).toLocaleDateString()
                  : "Date not specified"}
                {" · "}
                {event.time || "Time not specified"}
                {" · "}
                {event.venue || "Venue not specified"}
              </p>
            </section>

            <section className="registration-analytics">
              <article className="analytics-card">
                <span>Total Registrations</span>
                <strong>{analytics.total}</strong>
              </article>

              <article className="analytics-card">
                <span>Unique Students</span>
                <strong>{analytics.unique}</strong>
              </article>

              <article className="analytics-card">
                <span>Available Seats</span>
                <strong>
                  {analytics.capacity > 0 ? analytics.remaining : "—"}
                </strong>
              </article>

              <article className="analytics-card">
                <span>Capacity Used</span>
                <strong>
                  {analytics.capacity > 0
                    ? `${analytics.percentage.toFixed(0)}%`
                    : "—"}
                </strong>
              </article>
            </section>

            {analytics.capacity > 0 && (
              <section className="capacity-panel">
                <div className="capacity-label">
                  <span>Registration Capacity</span>
                  <strong>
                    {analytics.total} / {analytics.capacity}
                  </strong>
                </div>

                <div
                  className="capacity-track"
                  role="progressbar"
                  aria-valuenow={Math.round(analytics.percentage)}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <div
                    className="capacity-fill"
                    style={{ width: `${analytics.percentage}%` }}
                  />
                </div>
              </section>
            )}

            <section className="registration-breakdowns">
  {renderSemesterChart(analytics.semesters)}
  {renderDepartmentChart(analytics.departments)}
</section>

            <section className="registered-students-panel">
              <div className="registered-students-heading">
                <div>
                  <p className="monitor-label">Participant Directory</p>
                  <h2>Registered Students</h2>
                </div>

                <span className="student-total">
                  {students.length} students
                </span>
              </div>

              {students.length === 0 ? (
                <div className="registration-status">
                  No students have registered for this event yet.
                </div>
              ) : (
                <div className="students-table-wrapper">
                  <table className="students-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Student Name</th>
                        <th>Email</th>
                        <th>Department</th>
                        <th>Semester</th>
                        <th>Student ID</th>
                      </tr>
                    </thead>

                    <tbody>
                      {students.map((student, index) => (
                        <tr key={student._id || student.id || index}>
                          <td className="student-number">{index + 1}</td>
                          <td>
                            <strong>
                              {student.name || "Not provided"}
                            </strong>
                          </td>
                          <td>{student.email || "—"}</td>
                          <td>{student.department || "—"}</td>
                          <td>{student.semester || "—"}</td>
                          <td>
                            {student.studentId ||
                              student.rollNumber ||
                              student.enrollmentNo ||
                              "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        ) : null}
      </main>

      <Footer />
    </div>
  );
}

export default EventRegistrationDetails;
