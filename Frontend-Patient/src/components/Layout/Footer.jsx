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
              <span className="logo-text">MediCare Pro</span>
            </div>
            <p className="footer-description">
              Delivering exceptional healthcare with compassion, innovation, and excellence since 2005.
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
              <a href="#" className="social-link" aria-label="LinkedIn">
                <span className="social-icon">💼</span>
              </a>
            </div>
          </div>

          <div className="footer-column">
            <h3 className="footer-heading">Quick Links</h3>
            <ul className="footer-links">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/services">Services</Link></li>
              <li><Link to="/doctors">Our Doctors</Link></li>
              <li><Link to="/appointment">Book Appointment</Link></li>
            </ul>
          </div>

          <div className="footer-column">
            <h3 className="footer-heading">Departments</h3>
            <ul className="footer-links">
              <li><Link to="/department/cardiology">Cardiology</Link></li>
              <li><Link to="/department/orthopedics">Orthopedics</Link></li>
              <li><Link to="/department/neurology">Neurology</Link></li>
              <li><Link to="/department/pediatrics">Pediatrics</Link></li>
              <li><Link to="/department/dermatology">Dermatology</Link></li>
            </ul>
          </div>

          <div className="footer-column">
            <h3 className="footer-heading">Contact Us</h3>
            <div className="contact-info">
              <div className="contact-item">
                <span className="contact-icon">📍</span>
                <span>123 Healthcare Street, Medical City, MC 12345</span>
              </div>
              <div className="contact-item">
                <span className="contact-icon">📞</span>
                <span>1-800-MEDICAL (1-800-633-4225)</span>
              </div>
              <div className="contact-item">
                <span className="contact-icon">✉️</span>
                <span>support@medicarepro.com</span>
              </div>
              <div className="contact-item">
                <span className="contact-icon">⏰</span>
                <span>24/7 Emergency Services Available</span>
              </div>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="copyright">
            © {currentYear} MediCare Pro Hospital. All rights reserved.
          </div>
          <div className="footer-legal">
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms">Terms of Service</Link>
            <Link to="/sitemap">Sitemap</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;