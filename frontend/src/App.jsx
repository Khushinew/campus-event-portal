import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import ChangePassword from "./pages/ChangePassword";

// Public pages
import Home from "./pages/Home";
import Login from "./pages/Login";

// Faculty pages
import FacultyDashboard from "./pages/FacultyDashboard";
import CreateEvent from "./pages/events/CreateEvent";
import EditEvent from "./pages/events/EditEvent";

// Student pages
import StudentDashboard from "./pages/StudentDashboard";
import ViewEvents from "./pages/StudentEvents/ViewEvents";
import EventDetails from "./pages/StudentEvents/EventDetails";
import RegisterEvent from "./pages/StudentEvents/RegisterEvent";
import RegisteredEvents from "./pages/StudentEvents/RegisteredEvents";
import PersonalCalendar from "./pages/StudentEvents/PersonalCalendar";
import AddPersonalEvent from "./pages/StudentEvents/AddPersonalEvent";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* =========================
            PUBLIC ROUTES
        ========================= */}

        <Route
          path="/"
          element={<Home />}
        />


        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/events"
          element={<ViewEvents />}
        />
        <Route
    path="/change-password"
    element={<ChangePassword />}
/>

        


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

        {/* EDIT EVENTS PAGE */}
        <Route
          path="/faculty/edit-events"
          element={<EditEvent />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;