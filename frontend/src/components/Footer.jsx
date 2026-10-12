
import { Link } from "react-router-dom";
import "./Footer.css";

function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-content">
        <div className="footer-brand">
          <h2>Campusphere</h2>
          <p>
            Bringing your campus community closer
            through events and experiences.
          </p>
        </div>

        <div className="footer-links">
          <h3>Quick Links</h3>
          <Link to="/">Home</Link>
          <Link to="/events">Events</Link>
          <Link to="/login">Login</Link>
        </div>

        <div className="footer-contact">
          <h3>Campusphere</h3>
          <p>Connecting students and faculty.</p>
        </div>
      </div>

      <div className="footer-bottom">
        <p>
          © {new Date().getFullYear()} Campusphere.
          All rights reserved.
        </p>
      </div>
    </footer>
  );
}

export default Footer;
