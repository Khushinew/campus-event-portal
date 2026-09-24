import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";

import StudentDashboard from "./pages/StudentDashboard";
import ViewEvents from "./pages/StudentEvents/ViewEvents";
import RegisterEvent from "./pages/StudentEvents/RegisterEvent";
import RegisteredEvents from "./pages/StudentEvents/RegisteredEvents";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Home */}
        <Route path="/" element={<Home />} />

        {/* Login */}
        <Route path="/login" element={<Login />} />

        {/* Registration */}
        <Route path="/register" element={<Register />} />

        {/* Student Dashboard */}
        <Route
          path="/student-dashboard"
          element={<StudentDashboard />}
        />

        {/* Student View Events */}
        <Route
          path="/student/events"
          element={<ViewEvents />}
        />

        {/* Student Register Event */}
        <Route
          path="/student/register-event"
          element={<RegisterEvent />}
        />

        {/* Student Registered Events */}
        <Route
          path="/student/registered-events"
          element={<RegisteredEvents />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;