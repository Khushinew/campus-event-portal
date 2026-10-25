
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import ChangePassword from "./pages/ChangePassword";

// =========================
// Public pages
// =========================
import Home from "./pages/Home";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import OtpVerification from "./pages/OtpVerification";
import ResetPassword from "./pages/ResetPassword";

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
          path="/forgot-password"
          element={<ForgotPassword />}
        />

        <Route
          path="/verify-otp"
          element={<OtpVerification />}
        />

        <Route
          path="/reset-password"
          element={<ResetPassword />}
        />

        <Route
          path="/change-password"
          element={<ChangePassword />}
        />

        <Route path="/events" element={<ViewEvents />} />

        {/* =========================
            STUDENT ROUTES
        ========================= */}

        <Route
          path="/student-dashboard"
          element={<StudentDashboard />}
        />

        <Route
          path="/student/events"
          element={<ViewEvents />}
        />

        <Route
          path="/student/event-details"
          element={<EventDetails />}
        />

        <Route
          path="/student/register-event"
          element={<RegisterEvent />}
        />

        <Route
          path="/student/registered-events"
          element={<RegisteredEvents />}
        />

        <Route
          path="/student/calendar"
          element={<PersonalCalendar />}
        />

        <Route
          path="/student/add-event"
          element={<AddPersonalEvent />}
        />

        <Route
          path="/student/profile"
          element={<StudentProfile />}
        />

        {/* =========================
            FACULTY ROUTES
        ========================= */}

        <Route
          path="/faculty-dashboard"
          element={<FacultyDashboard />}
        />

        <Route
          path="/faculty/create-event"
          element={<CreateEvent />}
        />

        <Route
          path="/faculty/events"
          element={<MyEvents />}
        />

        {/* Event selection page */}
        <Route
          path="/faculty/edit-events"
          element={<EditEventsList />}
        />

        {/* Edit one selected event */}
        <Route
          path="/faculty/edit-events/:eventId"
          element={<EditEvent />}
        />

        <Route
          path="/faculty/registrations"
          element={<MonitorRegistrations />}
        />

        <Route
          path="/faculty/account"
          element={<ManageAccount />}
        />

        <Route
          path="/faculty/profile"
          element={<MyProfile />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
