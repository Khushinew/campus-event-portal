
import { Link } from "react-router-dom";
import "./Footer.css";

function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-container">

        {/* Brand */}
        <div className="footer-brand">
          <Link to="/" className="footer-logo">
            Campusphere<span>.</span>
          </Link>

          <p className="footer-tagline">
            Bringing campus life together.
            Discover events, connect with your community,
            and make every campus moment count.
          </p>

          <div className="footer-socials">
            <a href="https://www.linkedin.com/" target="_blank" rel="noreferrer">
              LinkedIn
            </a>
            <a href="https://www.instagram.com/" target="_blank" rel="noreferrer">
              Instagram
            </a>
            <a href="https://www.facebook.com/" target="_blank" rel="noreferrer">
              Facebook
            </a>
          </div>
        </div>

        {/* Explore */}
        <div className="footer-column">
          <h3>Explore</h3>
          <Link to="/">Home</Link>
          <Link to="/events">Browse Events</Link>
          <Link to="/login">Sign In</Link>
        </div>

       
        {/* Contact */}
        <div className="footer-contact">
          <h3>Get in Touch</h3>

          <p>
            <span>Email</span>
            <a href="mailto:your-email@example.com">
              campusphere@edu.in
            </a>
          </p>

          <p>
            <span>Phone</span>
            <a href="tel:+910000000000">
              +91 XXXXX XXXXX
            </a>
          </p>

          <p>
            <span>Address</span>
            Your College / University
          </p>

          
        </div>

      </div>

      {/* Bottom bar */}
      <div className="footer-bottom">
        <p>
          © {new Date().getFullYear()} Campusphere.
          All rights reserved.
        </p>

        <p className="footer-bottom-note">
          Built for a connected campus community.
        </p>
      </div>
    </footer>
  );
}

export default Footer;
