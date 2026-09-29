import { Link } from "react-router-dom";
import "./Home.css";

function Home() {
    return (
        <div className="home">

            {/* Header */}
            <header className="header">
                <div className="logo">
                    Campusphere
                </div>

                <nav className="nav-links">
                    <Link to="/">Home</Link>
                    <Link to="/events">Events</Link>
                    <Link to="/calendar">Calendar</Link>
                    <Link to="/login">Login</Link>
                    <Link to="/register" className="register-btn">
                        Register
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

                        <Link to="/login" className="primary-btn">
                            Explore Events
                        </Link>

                        <Link to="/register" className="secondary-btn">
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

        </div>
    );
}

export default Home;