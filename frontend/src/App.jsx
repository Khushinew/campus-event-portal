import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom"; 
import "./App.css";
import Home from "./pages/Home"; 
import Login from "./pages/Login"; 
import FacultyDashboard from "./pages/FacultyDashboard";
import { getDashboardPath, getStoredUser } from "./auth";
import StudentDashboard from "./pages/StudentDashboard"; 
import ViewEvents from "./pages/StudentEvents/ViewEvents"; 
import RegisterEvent from "./pages/StudentEvents/RegisterEvent"; 
import RegisteredEvents from "./pages/StudentEvents/RegisteredEvents"; 
import PersonalCalendar from "./pages/StudentEvents/PersonalCalendar"; 
import EventDetails from "./pages/StudentEvents/EventDetails"; 
import AddPersonalEvent from "./pages/StudentEvents/AddPersonalEvent"; 

function PublicEventsEntry() {
  const user = getStoredUser();

  return user
    ? <Navigate to={getDashboardPath(user.role)} replace />
    : <ViewEvents />;
}

function EventRegistrationRoute() {
  const location = useLocation();
  const user = getStoredUser();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user.role !== "student") {
    return <Navigate to={getDashboardPath(user.role)} replace />;
  }

  return <RegisterEvent />;
}
 
function App() { 
  return ( 
    <BrowserRouter> 
      <Routes> 
 
        {/* Home */} 
        <Route path="/" element={<Home />} /> 
 
        {/* Login */} 
        <Route path="/login" element={<Login />} /> 

        {/* Public event preview for guests */}
        <Route path="/events" element={<PublicEventsEntry />} />

        {/* Faculty Dashboard */}
        <Route path="/faculty-dashboard" element={<FacultyDashboard />} />
 
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
 
        {/* Student Event Details */} 
        <Route 
          path="/student/event-details" 
          element={<EventDetails />} 
        /> 
 
        {/* Student Register Event */} 
        <Route 
          path="/student/register-event" 
          element={<EventRegistrationRoute />} 
        /> 
 
        {/* Student Registered Events */} 
        <Route 
          path="/student/registered-events" 
          element={<RegisteredEvents />} 
        /> 
 
        {/* Student Personal Calendar */} 
        <Route 
          path="/student/calendar" 
          element={<PersonalCalendar />} 
        /> 
 
        {/* Student Add Personal Event */} 
        <Route 
          path="/student/add-event" 
          element={<AddPersonalEvent />} 
        /> 
 
      </Routes> 
    </BrowserRouter> 
  ); 
} 
 
export default App;   
