
import { Link } from "react-router-dom";
import "./Home.css";
import Footer from "../components/Footer";
import { getDashboardPath, getStoredUser } from "../auth";

function Home() {
  const user = getStoredUser();
  const loginTarget = user ? getDashboardPath(user.role) : "/login";

  return (
    <div className="home">
      {/* Header */}
      <header className="header">
        <div className="logo">
          Campusphere
        </div>
        <nav className="nav-links" aria-label="Main navigation">
          <Link to="/">Home</Link>
          <Link to="/events">Events</Link>
          <Link to={loginTarget} className="register-btn">
            {user ? "Dashboard" : "Login"}
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <main className="hero">
        <div className="hero-content">
          <p className="hero-label">
            YOUR CAMPUS. YOUR EVENTS. YOUR SPHERE.
          </p>

          <h1>
            Everything happening on
            <span> your campus.</span>
          </h1>

          <p className="hero-description">
            Discover campus events, register for activities,
            manage your schedule, and stay connected with
            everything happening around you.
          </p>

          <div className="hero-buttons">
            <Link to="/events" className="primary-btn">
              Explore Events
            </Link>
            <Link to={loginTarget} className="secondary-btn">
              {user ? "Open Dashboard" : "Get Started"}
            </Link>
          </div>
        </div>

        <div className="hero-image">
          <img
            src="/images/campus-hero.jpg"
            alt="Students participating in a campus event"
          />
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default Home;
