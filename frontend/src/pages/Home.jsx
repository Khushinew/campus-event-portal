
import { Link } from "react-router-dom";
import "./Home.css";
import Footer from "../components/Footer";

function Home() {
  return (
    <div className="home">
      {/* Header */}
      <header className="header">
        <div className="logo">
          Campusphere
        </div>
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
            <Link to="/login" className="secondary-btn">
              Get Started
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
