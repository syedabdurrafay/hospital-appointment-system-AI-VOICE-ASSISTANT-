import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-grid">
          <div className="footer-column">
            <div className="footer-logo">
              <span className="logo-icon">🏥</span>
              <span className="logo-text">MediCare Clinic</span>
            </div>
            <p className="footer-description">
              Providing quality healthcare with compassion and expertise.
            </p>
            <div className="social-links">
              <a href="#" className="social-link" aria-label="Facebook">
                <span className="social-icon">📘</span>
              </a>
              <a href="#" className="social-link" aria-label="Twitter">
                <span className="social-icon">🐦</span>
              </a>
              <a href="#" className="social-link" aria-label="Instagram">
                <span className="social-icon">📷</span>
              </a>
            </div>
          </div>

          <div className="footer-column">
            <h3 className="footer-heading">Quick Links</h3>
            <ul className="footer-links">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/doctors">Our Doctors</Link></li>
              <li><Link to="/appointment">Book Appointment</Link></li>
              <li><Link to="/contact">Contact</Link></li>
            </ul>
          </div>

          <div className="footer-column">
            <h3 className="footer-heading">Services</h3>
            <ul className="footer-links">
              <li><Link to="/services">General Consultation</Link></li>
              <li><Link to="/services">Emergency Care</Link></li>
              <li><Link to="/services">Diagnostic Tests</Link></li>
              <li><Link to="/services">Follow-up Care</Link></li>
            </ul>
          </div>

          <div className="footer-column">
            <h3 className="footer-heading">Contact Us</h3>
            <div className="contact-info">
              <div className="contact-item">
                <span className="contact-icon">📍</span>
                <span>123 Healthcare Street, City, State 12345</span>
              </div>
              <div className="contact-item">
                <span className="contact-icon">📞</span>
                <span>(123) 456-7890</span>
              </div>
              <div className="contact-item">
                <span className="contact-icon">✉️</span>
                <span>info@medicareclinic.com</span>
              </div>
              <div className="contact-item">
                <span className="contact-icon">⏰</span>
                <span>Mon-Sat: 9AM-6PM, Emergency: 24/7</span>
              </div>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="copyright">
            © {currentYear} MediCare Clinic. All rights reserved.
          </div>
          <div className="footer-legal">
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;