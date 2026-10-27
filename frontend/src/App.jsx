
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import ChangePassword from "./pages/ChangePassword";
import ProtectedRoute from "./components/ProtectedRoute";


// =========================
// Public pages
// =========================
import Home from "./pages/Home";
import Login from "./pages/Login";

// =========================
// Faculty pages
// =========================
import FacultyDashboard from "./pages/FacultyDashboard";
import CreateEvent from "./pages/events/CreateEvent";
import EditEvent from "./pages/events/EditEvent";
import EditEventsList from "./pages/events/EditEventsList";
import MyEvents from "./pages/events/MyEvents";
import MonitorRegistrations from "./pages/events/MonitorRegistrations";
import ManageAccount from "./pages/events/ManageAccount";
import MyProfile from "./pages/events/MyProfile";

// =========================
// Student pages
// =========================
import StudentDashboard from "./pages/StudentDashboard";
import ViewEvents from "./pages/StudentEvents/ViewEvents";
import EventDetails from "./pages/StudentEvents/EventDetails";
import RegisterEvent from "./pages/StudentEvents/RegisterEvent";
import RegisteredEvents from "./pages/StudentEvents/RegisteredEvents";
import PersonalCalendar from "./pages/StudentEvents/PersonalCalendar";
import AddPersonalEvent from "./pages/StudentEvents/AddPersonalEvent";
import StudentProfile from "./pages/StudentEvents/StudentProfile";
import EventRegistrationDetails from "./pages/events/EventRegistrationDetails";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* =========================
            PUBLIC ROUTES
        ========================= */}

        <Route path="/" element={<Home />} />

        <Route path="/login" element={<Login />} />

        <Route
          path="/change-password"
          element={
            <ProtectedRoute roles={["student", "faculty"]}>
              <ChangePassword />
            </ProtectedRoute>
          }
        />

        <Route path="/events" element={<ViewEvents showPastEvents />} />

        {/* =========================
            STUDENT ROUTES
        ========================= */}

        <Route
          path="/student-dashboard"
          element={
            <ProtectedRoute roles={["student"]}>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/events"
          element={
            <ProtectedRoute roles={["student"]}>
              <ViewEvents />
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/event-details"
          element={
            <ProtectedRoute roles={["student"]}>
              <EventDetails />
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/register-event"
          element={
            <ProtectedRoute roles={["student"]}>
              <RegisterEvent />
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/registered-events"
          element={
            <ProtectedRoute roles={["student"]}>
              <RegisteredEvents />
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/calendar"
          element={
            <ProtectedRoute roles={["student"]}>
              <PersonalCalendar />
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/add-event"
          element={
            <ProtectedRoute roles={["student"]}>
              <AddPersonalEvent />
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/profile"
          element={
            <ProtectedRoute roles={["student"]}>
              <StudentProfile />
            </ProtectedRoute>
          }
        />

        {/* =========================
            FACULTY ROUTES
        ========================= */}

        <Route
          path="/faculty-dashboard"
          element={
            <ProtectedRoute roles={["faculty"]}>
              <FacultyDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/faculty/view-events"
          element={
            <ProtectedRoute roles={["faculty"]}>
              <ViewEvents facultyBrowse />
            </ProtectedRoute>
          }
        />

        <Route
          path="/faculty/create-event"
          element={
            <ProtectedRoute roles={["faculty"]}>
              <CreateEvent />
            </ProtectedRoute>
          }
        />

        <Route
          path="/faculty/events"
          element={
            <ProtectedRoute roles={["faculty"]}>
              <MyEvents />
            </ProtectedRoute>
          }
        />

        {/* Event selection page */}
        <Route
          path="/faculty/edit-events"
          element={
            <ProtectedRoute roles={["faculty"]}>
              <EditEventsList />
            </ProtectedRoute>
          }
        />

        {/* Edit one selected event */}
        <Route
          path="/faculty/edit-events/:eventId"
          element={
            <ProtectedRoute roles={["faculty"]}>
              <EditEvent />
            </ProtectedRoute>
          }
        />

        <Route
          path="/faculty/registrations"
          element={
            <ProtectedRoute roles={["faculty"]}>
              <MonitorRegistrations />
            </ProtectedRoute>
          }
        />

        <Route
          path="/faculty/account"
          element={
            <ProtectedRoute roles={["faculty"]}>
              <ManageAccount />
            </ProtectedRoute>
          }
        />
        <Route
  path="/faculty/events/:eventId/registrations"
  element={
    <ProtectedRoute roles={["faculty"]}>
      <EventRegistrationDetails />
    </ProtectedRoute>
  }
/>

        <Route
          path="/faculty/profile"
          element={
            <ProtectedRoute roles={["faculty"]}>
              <MyProfile />
            </ProtectedRoute>
          }
        />
      </Routes>
      
    </BrowserRouter>
  );
}

export default App;
